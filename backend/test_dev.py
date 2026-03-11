from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

# Test with developer role
response = client.chat.completions.create(
    model="gpt-5-mini-2025-08-07",
    messages=[
        {"role": "developer", "content": "You write cold emails. Return JSON with subject and body keys."},
        {"role": "user", "content": 'Write email for Stripe. Funding: 6.5B. Return JSON: {"subject":"...","body":"..."}'}
    ],
    max_completion_tokens=500
)

content = response.choices[0].message.content
print(f"Length: {len(content) if content else 0}")
print(f"Content: {content[:300] if content else 'EMPTY'}")
