import os

from openai import OpenAI


def generate_completion(
    prompt: str,
    system_prompt: str = "You are a sales intelligence assistant.",
    temperature: float = 0.7,
    max_tokens: int = 500,
    max_completion_tokens: int | None = None,
) -> str:
    api_key = str(os.getenv("OPENAI_API_KEY", "")).strip() or str(os.getenv("OPENAI_KEY", "")).strip()
    if not api_key:
        raise ValueError("OPENAI_API_KEY is not configured. Please set a valid key in backend .env.")

    model = str(os.getenv("OPENAI_MODEL", "gpt-5.4-mini-2026-03-17")).strip() or "gpt-5.4-mini-2026-03-17"
    token_limit = int(max_completion_tokens if max_completion_tokens is not None else max_tokens)

    client = OpenAI(api_key=api_key)
    chat_completion = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=temperature,
        max_completion_tokens=token_limit,
    )

    message = chat_completion.choices[0].message
    content = message.content if message else ""
    if isinstance(content, list):
        return "".join(part.get("text", "") for part in content if isinstance(part, dict))
    return str(content or "")
