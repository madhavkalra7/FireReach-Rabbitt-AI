"""
FireReach Pydantic Models
Data models for the outreach engine.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


class OutreachRequest(BaseModel):
    """Input model for outreach requests."""
    icp: str  # Ideal Customer Profile description
    company: str  # Target company name
    recipient_email: str  # Email address to send outreach to


class SignalData(BaseModel):
    """Harvested signals about a target company."""
    company: str
    funding: str
    hiring: str
    news: list[str]
    tech_stack: list[str]


class AgentStep(BaseModel):
    """Represents a single step in the agent's execution."""
    tool_name: str
    status: str  # "pending", "running", "completed", "failed"
    result: dict


class OutreachResponse(BaseModel):
    """Full response from the outreach agent."""
    signals: SignalData
    account_brief: str
    email_subject: str
    email_body: str
    sent: bool
    steps: list[AgentStep]
