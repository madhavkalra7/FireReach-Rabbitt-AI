"""
Outreach Sender Tool
Writes hyper-personalized emails using OpenAI and sends via Gmail SMTP.
"""
import smtplib
import ssl
import json
import sys
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from openai import OpenAI
from config import OPENAI_API_KEY, SENDER_EMAIL, SENDER_EMAIL_APP_PASSWORD
from schemas import SignalData


# Initialize OpenAI client with timeout
client = OpenAI(
    api_key=OPENAI_API_KEY,
    timeout=30.0,
    max_retries=1
)


EMAIL_WRITER_SYSTEM_PROMPT = """You are an elite B2B sales development representative who writes highly personalized cold emails.

CRITICAL RULE: You must ONLY use information explicitly provided in the signals. NEVER infer, assume, or add facts not present in the input. If something isn't in the signals, don't mention it. Accuracy is more important than impressiveness.

Your emails:
- Feel genuinely human and conversational
- Lead with EXACT facts from the provided signals only
- Never fabricate or assume information
- Sound like a peer who did their research"""


def _generate_email(signals: SignalData, account_brief: str, icp: str) -> dict:
    """
    Generate a personalized cold outreach email using OpenAI.
    
    Args:
        signals: SignalData object with company signals
        account_brief: The account brief from research analyst
        icp: Ideal Customer Profile description
    
    Returns:
        Dictionary with 'subject' and 'body' keys
    """
    print(f"📝 Generating email for {signals.company}...")
    
    news_formatted = "\n".join([f"- {item}" for item in signals.news[:3]])
    
    user_prompt = f"""Write a cold outreach email using ONLY the signals provided below.

⚠️ STRICT ACCURACY RULE: You may ONLY reference facts explicitly stated in the signals below. Do NOT add, infer, or assume any information not present. If you're unsure about something, leave it out. Fabricating details will make the email worse, not better.

**Our ICP (Ideal Customer Profile):**
{icp}

**Target Company:** {signals.company}

**Account Research Brief:**
{account_brief}

**THESE ARE THE ONLY FACTS YOU CAN USE:**
- Funding: {signals.funding}
- Hiring Activity: {signals.hiring}
- Recent News:
{news_formatted}

**Email Structure:**

1. **Opening Hook (1-2 sentences):** Reference ONE specific fact from signals above. Use exact numbers if present.

2. **Context Bridge (2-3 sentences):** Connect their growth to potential challenges. ONLY reference things mentioned in signals.

3. **Pain Point Connection (2-3 sentences):** Link their situation to our ICP's value prop.

4. **Value Proposition (1-2 sentences):** What we offer and why it's relevant now.

5. **Soft CTA (1 sentence):** Low-pressure ask.

**Rules:**
- ONLY use facts from the signals above - no external knowledge
- If a signal says "No data" or "not found", don't reference that category
- Peer-to-peer tone, not salesy
- 200-300 words
- No phrases like "I hope this finds you well"

**Subject Line:** Must reference a specific signal fact.

Return ONLY valid JSON:
{{
  "subject": "your subject line here",
  "body": "your full email body here"
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-5-mini-2025-08-07",
            messages=[
                {"role": "system", "content": EMAIL_WRITER_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            max_completion_tokens=1000
        )
        
        content = response.choices[0].message.content
        print(f"📨 Raw LLM response length: {len(content) if content else 0}")
        
        # Handle empty or None response
        if not content or len(content.strip()) < 50:
            print(f"⚠️ Response too short or empty, generating structured fallback")
            return _generate_structured_fallback(signals, icp)
        
        # Try to parse JSON from response
        try:
            # Clean the response - sometimes models add markdown code blocks
            clean_content = content.strip()
            if clean_content.startswith("```json"):
                clean_content = clean_content[7:]
            if clean_content.startswith("```"):
                clean_content = clean_content[3:]
            if clean_content.endswith("```"):
                clean_content = clean_content[:-3]
            clean_content = clean_content.strip()
            
            result = json.loads(clean_content)
            
            # Validate result has proper content
            if not result.get("body") or len(result.get("body", "")) < 100:
                print(f"⚠️ Parsed email too short, using fallback")
                return _generate_structured_fallback(signals, icp)
            
            print(f"✅ Email generated successfully ({len(result.get('body', ''))} chars)")
            return result
        except json.JSONDecodeError as je:
            print(f"⚠️ JSON parse failed: {je}")
            # If content looks like an email, try to use it
            if len(content) > 200 and ('Hi' in content or 'Hello' in content):
                return {
                    "subject": f"Re: {signals.company}'s recent growth",
                    "body": content
                }
            return _generate_structured_fallback(signals, icp)
        
    except Exception as e:
        print(f"❌ Error generating email: {e}")
        return _generate_structured_fallback(signals, icp)


def _generate_structured_fallback(signals: SignalData, icp: str) -> dict:
    """
    Generate a structured fallback email when LLM fails.
    Uses actual signal data to create a meaningful email.
    """
    company = signals.company
    
    # Extract key facts from signals
    funding_fact = signals.funding if signals.funding and "No " not in signals.funding else None
    hiring_fact = signals.hiring if signals.hiring and "No " not in signals.hiring else None
    news_fact = signals.news[0] if signals.news and "No " not in signals.news[0] else None
    
    # Build opening based on available data
    if funding_fact and len(funding_fact) > 20:
        opening = f"I noticed {company} has been making moves - {funding_fact[:150]}."
        subject = f"{company}'s funding momentum"
    elif hiring_fact and len(hiring_fact) > 20:
        opening = f"Saw that {company} is actively growing the team - {hiring_fact[:150]}."
        subject = f"{company}'s team expansion"
    elif news_fact and len(news_fact) > 20:
        opening = f"Came across some recent news about {company} - {news_fact[:150]}."
        subject = f"Quick note about {company}"
    else:
        opening = f"I've been following {company}'s trajectory in the market."
        subject = f"Quick question for {company}"
    
    # Extract ICP value prop
    icp_short = icp[:100] if len(icp) > 100 else icp
    
    body = f"""Hi,

{opening}

That kind of growth typically brings interesting challenges - especially around {icp_short.lower() if icp_short else 'scaling operations'}.

We work with companies at similar inflection points, helping them navigate the complexity that comes with rapid expansion. Not saying you need help - just that the timing often makes these conversations useful.

Would it make sense to connect for 15 minutes? Happy to share what we're seeing work for similar companies.

Best,"""
    
    return {"subject": subject, "body": body}


def _send_email_smtp(recipient_email: str, subject: str, body: str) -> bool:
    """
    Send email via Gmail SMTP.
    
    Args:
        recipient_email: Recipient's email address
        subject: Email subject line
        body: Email body text
    
    Returns:
        True if sent successfully, False otherwise
    """
    print(f"📧 Sending email to {recipient_email}...")
    
    # Create HTML version of the email
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    {body.replace(chr(10), '<br>')}
    </body>
    </html>
    """
    
    # Create message
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = SENDER_EMAIL
    message["To"] = recipient_email
    
    # Add plain text and HTML versions
    part1 = MIMEText(body, "plain")
    part2 = MIMEText(html_body, "html")
    message.attach(part1)
    message.attach(part2)
    
    # Send via Gmail SMTP with SSL
    context = ssl.create_default_context()
    
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(SENDER_EMAIL, SENDER_EMAIL_APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, message.as_string())
        
        print(f"✅ Email sent successfully to {recipient_email}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ SMTP Authentication failed. Check SENDER_EMAIL and SENDER_EMAIL_APP_PASSWORD: {e}")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ SMTP Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error sending email: {e}")
        return False


def write_and_send_email(
    signals: SignalData, 
    account_brief: str, 
    icp: str, 
    recipient_email: str
) -> dict:
    """
    Write a personalized email and send it via Gmail SMTP.
    
    Args:
        signals: SignalData object with company signals
        account_brief: The account brief from research analyst
        icp: Ideal Customer Profile description
        recipient_email: Recipient's email address
    
    Returns:
        Dictionary with subject, body, sent status, and recipient
    """
    print(f"🚀 Starting outreach process for {signals.company} -> {recipient_email}")
    
    # Step 1: Generate the email using OpenAI
    email_content = _generate_email(signals, account_brief, icp)
    subject = email_content.get("subject", "")
    body = email_content.get("body", "")
    
    # Step 2: Send via Gmail SMTP
    sent = _send_email_smtp(recipient_email, subject, body)
    
    result = {
        "subject": subject,
        "body": body,
        "sent": sent,
        "recipient": recipient_email
    }
    
    if sent:
        print(f"✅ Outreach complete! Email sent to {recipient_email}")
    else:
        print(f"⚠️ Email generated but failed to send to {recipient_email}")
    
    return result


if __name__ == "__main__":
    # Test with sample data
    test_signals = SignalData(
        company="Vercel",
        funding="Vercel raised $150M Series D at $2.5B valuation in May 2024",
        hiring="Actively hiring 50+ engineers across frontend, platform, and AI teams",
        news=[
            "Vercel launches v0 AI product for developers",
            "Next.js 15 released with major performance improvements"
        ],
        tech_stack=["Next.js", "React", "TypeScript"]
    )
    
    test_brief = "Vercel is experiencing massive growth with their recent $150M raise..."
    test_icp = "We sell high-end cybersecurity training to Series B startups"
    test_recipient = "test@example.com"
    
    # This will fail without proper SMTP credentials
    result = write_and_send_email(test_signals, test_brief, test_icp, test_recipient)
    print("\n--- Result ---")
    print(json.dumps(result, indent=2))
