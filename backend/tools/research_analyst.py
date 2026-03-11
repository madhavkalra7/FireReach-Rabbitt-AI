"""
Research Analyst Tool
Analyzes harvested signals and generates account briefs using OpenAI.
"""
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from openai import OpenAI
from config import OPENAI_API_KEY
from schemas import SignalData


# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)


def analyze_account(signals: SignalData, icp: str) -> str:
    """
    Analyze harvested signals against the ICP and generate an account brief.
    """
    print(f"🧠 Analyzing account: {signals.company}")
    
    news_text = ", ".join(signals.news[:2]) if signals.news else "No news"
    
    messages = [
        {
            "role": "system",
            "content": "You are a B2B account research analyst. Write concise account briefs using only the provided facts."
        },
        {
            "role": "user",
            "content": f"""Write a 2-paragraph brief for {signals.company}:

Facts:
- Funding: {signals.funding}
- Hiring: {signals.hiring}
- News: {news_text}

ICP: {icp}

Para 1: Their growth situation
Para 2: Why they need our help"""
        }
    ]
    
    response = client.chat.completions.create(
        model="gpt-5-mini-2025-08-07",
        messages=messages,
        max_completion_tokens=500
    )
    
    content = response.choices[0].message.content.strip()
    print(f"✅ Account analysis complete: {len(content)} chars")
    return content


if __name__ == "__main__":
    # Test with sample data
    test_signals = SignalData(
        company="Vercel",
        funding="Vercel raised $150M Series D at $2.5B valuation in May 2024",
        hiring="Actively hiring 50+ engineers across frontend, platform, and AI teams",
        news=[
            "Vercel launches v0 AI product for developers",
            "Next.js 15 released with major performance improvements",
            "Partnership announced with major enterprise clients"
        ],
        tech_stack=["Next.js", "React", "TypeScript", "Vercel Edge", "Turborepo"]
    )
    
    test_icp = "We sell high-end cybersecurity training to Series B startups"
    
    brief = analyze_account(test_signals, test_icp)
    print("\n--- Account Brief ---")
    print(brief)
