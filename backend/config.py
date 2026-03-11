"""
FireReach Configuration
Loads API keys and credentials from environment variables.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# OpenAI API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# SerpAPI Configuration for real-time search
SERP_API_KEY = os.getenv("SERP_API_KEY")

# Gmail SMTP Configuration
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_EMAIL_APP_PASSWORD = os.getenv("SENDER_EMAIL_APP_PASSWORD")

# Validate required environment variables
def validate_config():
    """Validate that all required environment variables are set."""
    missing = []
    
    if not OPENAI_API_KEY:
        missing.append("OPENAI_API_KEY")
    if not SERP_API_KEY:
        missing.append("SERP_API_KEY")
    if not SENDER_EMAIL:
        missing.append("SENDER_EMAIL")
    if not SENDER_EMAIL_APP_PASSWORD:
        missing.append("SENDER_EMAIL_APP_PASSWORD")
    
    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    return True
