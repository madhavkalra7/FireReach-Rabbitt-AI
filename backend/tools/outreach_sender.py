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


def _generate_email(signals: SignalData, account_brief: str, icp: str) -> dict:
    """
    Generate a personalized cold outreach email using OpenAI.
    """
    print(f"📝 Generating email for {signals.company}...")
    
    news_text = ", ".join(signals.news[:2]) if signals.news else "No recent news"
    
    messages = [
        {
            "role": "system",
            "content": "You are an expert B2B sales copywriter. Write personalized cold emails. Use ONLY the provided facts. Return valid JSON with subject and body keys."
        },
        {
            "role": "user", 
            "content": f"""Write a cold email for {signals.company}.

FACTS (use only these):
- Funding: {signals.funding}
- Hiring: {signals.hiring}
- News: {news_text}

ICP: {icp}

Requirements:
- 150-200 words
- Reference specific facts above
- Professional tone
- Soft call-to-action

Return JSON: {{"subject": "...", "body": "..."}}"""
        }
    ]
    
    response = client.chat.completions.create(
        model="gpt-5-mini-2025-08-07",
        messages=messages,
        max_completion_tokens=1500
    )
    
    content = response.choices[0].message.content.strip()
    print(f"📨 Got response: {len(content)} chars")
    
    # Clean markdown if present
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()
    
    result = json.loads(content)
    print(f"✅ Email generated: {result.get('subject', 'No subject')}")
    return result


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
