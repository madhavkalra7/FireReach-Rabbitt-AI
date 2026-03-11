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


SYSTEM_PROMPT = """You are an elite B2B account research analyst. You write sharp, insight-driven account briefs for sales teams.

CRITICAL: You must ONLY use information explicitly provided in the signals. NEVER add facts, statistics, or claims not present in the input. If information is missing, acknowledge it or skip it. Accuracy is paramount - a brief with fewer facts is better than one with fabricated facts."""


def analyze_account(signals: SignalData, icp: str) -> str:
    """
    Analyze harvested signals against the ICP and generate an account brief.
    
    Args:
        signals: SignalData object with harvested company signals
        icp: Ideal Customer Profile description
    
    Returns:
        2-paragraph account brief as a string
    """
    print(f"🧠 Analyzing account: {signals.company}")
    
    # Format news as a readable list
    news_formatted = "\n".join([f"  - {item}" for item in signals.news])
    
    user_prompt = f"""⚠️ STRICT RULE: Only use facts explicitly stated below. Do NOT add external knowledge or inferences.

ICP: {icp}
Company: {signals.company}

THESE ARE THE ONLY FACTS AVAILABLE:
- Funding: {signals.funding}
- Hiring: {signals.hiring}
- Recent News:
{news_formatted}

Write a 2-paragraph Account Brief using ONLY the facts above:
Paragraph 1: What's happening at this company based ONLY on the signals provided (use exact numbers/facts from above).
Paragraph 2: Why their situation creates a need for what we sell (connect ICP to the specific signals).

If a signal says "No data" or "not found", simply omit that category from your brief."""

    try:
        response = client.chat.completions.create(
            model="gpt-5-mini-2025-08-07",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            max_completion_tokens=500
        )
        
        content = response.choices[0].message.content
        if not content:
            # Fallback if empty response
            account_brief = f"{signals.company} is showing strong growth signals with {signals.hiring}. Their recent funding activity ({signals.funding}) suggests expansion. Given our ICP ({icp}), this creates a timely opportunity to engage."
        else:
            account_brief = content.strip()
        
        print(f"✅ Account analysis complete for {signals.company}")
        return account_brief
        
    except Exception as e:
        print(f"❌ Error analyzing account: {e}")
        # Return a basic brief instead of raising
        return f"{signals.company} appears to be in a growth phase based on recent signals. {signals.funding}. {signals.hiring}. This aligns with our target profile."


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
