"""Quick test for email generation"""
from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)

# Test 1: Simple JSON request
print("=== Test 1: Simple JSON ===")
r = client.chat.completions.create(
    model='gpt-5-mini-2025-08-07',
    messages=[{'role':'user','content':'Write a short email. Return as JSON with subject and body keys.'}],
    max_completion_tokens=500
)
print('Finish:', r.choices[0].finish_reason)
print('Content:', r.choices[0].message.content)

# Test 2: With system prompt
print("\n=== Test 2: With System Prompt ===")
r2 = client.chat.completions.create(
    model='gpt-5-mini-2025-08-07',
    messages=[
        {'role':'system','content':'You write emails. Return JSON only.'},
        {'role':'user','content':'Write an email to TestCo about their funding. JSON: {"subject":"...", "body":"..."}'}
    ],
    max_completion_tokens=500
)
print('Finish:', r2.choices[0].finish_reason)
print('Content:', r2.choices[0].message.content)

# Test 3: Full prompt
print("\n=== Test 3: Full Prompt ===")
full_prompt = """Write a personalized cold email for TestCo.

ICP: B2B SaaS companies

Facts to use:
- Funding: Raised 5M Series A
- Hiring: Hiring 10 engineers
- News: Launched new product

Requirements:
- 150-250 words
- Reference specific facts from above
- Professional but conversational tone
- End with soft CTA

Return JSON only:
{"subject": "...", "body": "..."}"""

r3 = client.chat.completions.create(
    model='gpt-5-mini-2025-08-07',
    messages=[
        {'role':'system','content':'You are a B2B sales rep who writes personalized cold emails. Use ONLY the facts provided. Never invent information. Return valid JSON with subject and body keys.'},
        {'role':'user','content': full_prompt}
    ],
    max_completion_tokens=2000
)
print('Finish:', r3.choices[0].finish_reason)
print('Content length:', len(r3.choices[0].message.content) if r3.choices[0].message.content else 0)
print('Content:', r3.choices[0].message.content)
