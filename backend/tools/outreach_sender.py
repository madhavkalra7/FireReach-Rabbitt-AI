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


# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)


EMAIL_WRITER_SYSTEM_PROMPT = """You are a world-class B2B sales copywriter. Write emails that feel human, warm, and ultra-specific. Never use templates. Every sentence must earn its place."""


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
    
    news_formatted = ", ".join(signals.news[:2])  # Use top 2 news items
    
    user_prompt = f"""Write a cold outreach email based on:
ICP: {icp}
Account Brief: {account_brief}
Signals: funding={signals.funding}, hiring={signals.hiring}, news={news_formatted}

Rules:
- Subject line: clever, specific, references one signal
- Opening: reference ONE specific signal immediately (hiring numbers, funding amount, etc.)
- Middle: connect their growth moment to the pain point our ICP solves
- CTA: one simple ask, no pressure
- Tone: peer-to-peer, not salesy
- Length: 150-200 words max
- NO generic phrases like 'I hope this finds you well'

Return JSON only:
{{
  "subject": "...",
  "body": "..."
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-5-mini-2025-08-07",
            messages=[
                {"role": "system", "content": EMAIL_WRITER_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            max_completion_tokens=600
        )
        
        content = response.choices[0].message.content
        
        # Handle empty or None response
        if not content:
            print(f"⚠️ Empty response from OpenAI, using fallback")
            return {
                "subject": f"Quick question about {signals.company}'s growth",
                "body": f"Hi,\n\nI noticed {signals.company} recently {signals.funding[:100] if signals.funding else 'made some exciting moves'}. Given your growth trajectory, I'd love to explore how we might help.\n\nWould you be open to a brief conversation?\n\nBest regards"
            }
        
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
            print(f"✅ Email generated successfully")
            return result
        except json.JSONDecodeError as je:
            print(f"⚠️ JSON parse failed, extracting from text")
            # Try to extract subject and body from plain text
            lines = content.split('\n')
            subject = f"Quick question about {signals.company}"
            body = content
            
            for line in lines:
                if 'subject' in line.lower() and ':' in line:
                    subject = line.split(':', 1)[1].strip().strip('"').strip("'")
                    break
            
            return {"subject": subject, "body": body}
        
    except Exception as e:
        print(f"❌ Error generating email: {e}")
        raise


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
