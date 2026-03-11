"""
FireReach Agent
Agentic loop using OpenAI function calling for autonomous outreach.
"""
import json
import time
from openai import OpenAI

from config import OPENAI_API_KEY
from schemas import OutreachRequest, OutreachResponse, SignalData, AgentStep
from tools.signal_harvester import harvest_signals
from tools.research_analyst import analyze_account
from tools.outreach_sender import write_and_send_email


# Initialize OpenAI client with timeout
client = OpenAI(
    api_key=OPENAI_API_KEY,
    timeout=30.0,  # 30 second timeout for API calls
    max_retries=1  # Only 1 retry to avoid long waits
)


# Agent system prompt
AGENT_SYSTEM_PROMPT = """You are FireReach, an autonomous B2B outreach agent. You operate with precision and always ground your outreach in real, harvested data.

Your persona: Strategic, efficient, data-driven. You never guess — you research first.

Your constraints:
1. ALWAYS call tool_signal_harvester first before any analysis
2. ALWAYS call tool_research_analyst before writing any email
3. ALWAYS call tool_outreach_automated_sender to send — never just draft
4. Never fabricate signals — only use what tool_signal_harvester returns
5. The email MUST reference specific signals (numbers, facts, names)
6. Complete all 3 tool calls sequentially — never skip steps"""


# Tool definitions in OpenAI function calling format
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "tool_signal_harvester",
            "description": "Harvest real-time signals about a target company including funding, hiring activity, recent news, and tech stack. This tool makes real API calls to search engines to get live data. MUST be called first before any analysis.",
            "parameters": {
                "type": "object",
                "properties": {
                    "company": {
                        "type": "string",
                        "description": "The name of the target company to research (e.g., 'Vercel', 'Stripe', 'Notion')"
                    }
                },
                "required": ["company"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "tool_research_analyst",
            "description": "Analyze harvested signals against the ICP and generate a 2-paragraph account brief. MUST be called after signal harvesting and before writing the email.",
            "parameters": {
                "type": "object",
                "properties": {
                    "signals": {
                        "type": "object",
                        "description": "The SignalData object returned from tool_signal_harvester",
                        "properties": {
                            "company": {"type": "string"},
                            "funding": {"type": "string"},
                            "hiring": {"type": "string"},
                            "news": {"type": "array", "items": {"type": "string"}},
                            "tech_stack": {"type": "array", "items": {"type": "string"}}
                        },
                        "required": ["company", "funding", "hiring", "news", "tech_stack"]
                    },
                    "icp": {
                        "type": "string",
                        "description": "The Ideal Customer Profile description"
                    }
                },
                "required": ["signals", "icp"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "tool_outreach_automated_sender",
            "description": "Write a hyper-personalized cold outreach email based on signals and account brief, then automatically send it via email. This tool both generates AND sends the email.",
            "parameters": {
                "type": "object",
                "properties": {
                    "signals": {
                        "type": "object",
                        "description": "The SignalData object from tool_signal_harvester",
                        "properties": {
                            "company": {"type": "string"},
                            "funding": {"type": "string"},
                            "hiring": {"type": "string"},
                            "news": {"type": "array", "items": {"type": "string"}},
                            "tech_stack": {"type": "array", "items": {"type": "string"}}
                        },
                        "required": ["company", "funding", "hiring", "news", "tech_stack"]
                    },
                    "account_brief": {
                        "type": "string",
                        "description": "The account brief from tool_research_analyst"
                    },
                    "icp": {
                        "type": "string",
                        "description": "The Ideal Customer Profile description"
                    },
                    "recipient_email": {
                        "type": "string",
                        "description": "The email address to send the outreach to"
                    }
                },
                "required": ["signals", "account_brief", "icp", "recipient_email"]
            }
        }
    }
]


def execute_tool(tool_name: str, arguments: dict) -> dict:
    """
    Execute a tool by name with the given arguments.
    
    Args:
        tool_name: Name of the tool to execute
        arguments: Dictionary of arguments for the tool
    
    Returns:
        Dictionary containing the tool result
    """
    print(f"🔧 Executing tool: {tool_name}")
    
    if tool_name == "tool_signal_harvester":
        company = arguments.get("company")
        signals = harvest_signals(company)
        return signals.model_dump()
    
    elif tool_name == "tool_research_analyst":
        signals_dict = arguments.get("signals")
        icp = arguments.get("icp")
        signals = SignalData(**signals_dict)
        account_brief = analyze_account(signals, icp)
        return {"account_brief": account_brief}
    
    elif tool_name == "tool_outreach_automated_sender":
        signals_dict = arguments.get("signals")
        account_brief = arguments.get("account_brief")
        icp = arguments.get("icp")
        recipient_email = arguments.get("recipient_email")
        signals = SignalData(**signals_dict)
        result = write_and_send_email(signals, account_brief, icp, recipient_email)
        return result
    
    else:
        raise ValueError(f"Unknown tool: {tool_name}")


def run_agent_fast(request: OutreachRequest) -> OutreachResponse:
    """
    FAST direct execution mode - bypasses agentic loop overhead.
    Runs all 3 tools sequentially without OpenAI decision-making.
    """
    total_start = time.time()
    
    print(f"\n{'='*60}")
    print(f"⚡ FireReach FAST Mode")
    print(f"   Company: {request.company}")
    print(f"   Recipient: {request.recipient_email}")
    print(f"{'='*60}\n")
    
    steps = []
    
    # Step 1: Harvest signals
    print("\n[1/3] Harvesting signals...")
    step1 = AgentStep(tool_name="tool_signal_harvester", status="running", result={})
    signals_data = harvest_signals(request.company)
    step1.status = "completed"
    step1.result = signals_data.model_dump()
    steps.append(step1)
    print(f"   ✅ Signals harvested")
    
    # Step 2: Analyze account
    print("\n[2/3] Analyzing account...")
    step2 = AgentStep(tool_name="tool_research_analyst", status="running", result={})
    account_brief = analyze_account(signals_data, request.icp)
    step2.status = "completed"
    step2.result = {"account_brief": account_brief}
    steps.append(step2)
    print(f"   ✅ Account analyzed")
    
    # Step 3: Write and send email
    print("\n[3/3] Writing and sending email...")
    step3 = AgentStep(tool_name="tool_outreach_automated_sender", status="running", result={})
    email_result = write_and_send_email(
        signals_data, 
        account_brief, 
        request.icp, 
        request.recipient_email
    )
    step3.status = "completed"
    step3.result = email_result
    steps.append(step3)
    print(f"   ✅ Email generated")
    
    total_time = time.time() - total_start
    
    response = OutreachResponse(
        signals=signals_data,
        account_brief=account_brief,
        email_subject=email_result.get("subject", ""),
        email_body=email_result.get("body", ""),
        sent=email_result.get("sent", False),
        steps=steps
    )
    
    print(f"\n{'='*60}")
    print(f"⚡ FireReach Complete in {total_time:.1f}s")
    print(f"{'='*60}\n")
    
    return response


def run_agent(request: OutreachRequest) -> OutreachResponse:
    """
    Run the FireReach agentic loop.
    
    Args:
        request: OutreachRequest with ICP, company, and recipient email
    
    Returns:
        OutreachResponse with all results and steps
    """
    print(f"\n{'='*60}")
    print(f"🚀 FireReach Agent Starting")
    print(f"   Company: {request.company}")
    print(f"   ICP: {request.icp[:50]}...")
    print(f"   Recipient: {request.recipient_email}")
    print(f"{'='*60}\n")
    
    # Initialize conversation
    messages = [
        {"role": "system", "content": AGENT_SYSTEM_PROMPT},
        {
            "role": "user", 
            "content": f"""Execute the full outreach pipeline for:
- Target Company: {request.company}
- ICP: {request.icp}
- Recipient Email: {request.recipient_email}

Follow the exact sequence:
1. First call tool_signal_harvester to get real data about {request.company}
2. Then call tool_research_analyst with the signals and ICP
3. Finally call tool_outreach_automated_sender to write and send the email

Begin now."""
        }
    ]
    
    # Track agent steps and results
    steps = []
    signals_data = None
    account_brief = ""
    email_subject = ""
    email_body = ""
    sent = False
    
    # Agentic loop
    max_iterations = 5  # Safety limit - 3 tools + 2 buffer
    iteration = 0
    
    while iteration < max_iterations:
        iteration += 1
        print(f"\n--- Agent Iteration {iteration} ---")
        
        # Call OpenAI with function calling
        response = client.chat.completions.create(
            model="gpt-5-mini-2025-08-07",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto"
        )
        
        assistant_message = response.choices[0].message
        
        # Check if there are tool calls
        if assistant_message.tool_calls:
            # Add assistant message to conversation
            messages.append(assistant_message)
            
            # Process each tool call
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                
                print(f"\n🎯 Tool call: {tool_name}")
                print(f"   Arguments: {json.dumps(arguments, indent=2)[:200]}...")
                
                # Record step as running
                step = AgentStep(
                    tool_name=tool_name,
                    status="running",
                    result={}
                )
                
                try:
                    # Execute the tool
                    result = execute_tool(tool_name, arguments)
                    
                    # Update step status
                    step.status = "completed"
                    step.result = result
                    
                    # Store important results
                    if tool_name == "tool_signal_harvester":
                        signals_data = SignalData(**result)
                    elif tool_name == "tool_research_analyst":
                        account_brief = result.get("account_brief", "")
                    elif tool_name == "tool_outreach_automated_sender":
                        email_subject = result.get("subject", "")
                        email_body = result.get("body", "")
                        sent = result.get("sent", False)
                    
                    # Add tool result to conversation
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(result)
                    })
                    
                except Exception as e:
                    print(f"❌ Tool execution error: {e}")
                    step.status = "failed"
                    step.result = {"error": str(e)}
                    
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps({"error": str(e)})
                    })
                
                steps.append(step)
        
        else:
            # No more tool calls - agent is done
            print(f"\n✅ Agent completed all tool calls")
            if assistant_message.content:
                print(f"Final message: {assistant_message.content[:200]}...")
            break
    
    # Build response
    if signals_data is None:
        # Fallback if signals weren't harvested (shouldn't happen)
        signals_data = SignalData(
            company=request.company,
            funding="No data harvested",
            hiring="No data harvested",
            news=["No data harvested"],
            tech_stack=["No data harvested"]
        )
    
    response = OutreachResponse(
        signals=signals_data,
        account_brief=account_brief,
        email_subject=email_subject,
        email_body=email_body,
        sent=sent,
        steps=steps
    )
    
    print(f"\n{'='*60}")
    print(f"🏁 FireReach Agent Complete")
    print(f"   Steps completed: {len(steps)}")
    print(f"   Email sent: {sent}")
    print(f"{'='*60}\n")
    
    return response


if __name__ == "__main__":
    # Test the agent
    test_request = OutreachRequest(
        icp="We sell high-end cybersecurity training to Series B startups",
        company="Vercel",
        recipient_email="test@example.com"
    )
    
    result = run_agent(test_request)
    print("\n--- Full Response ---")
    print(f"Signals: {result.signals}")
    print(f"\nAccount Brief: {result.account_brief}")
    print(f"\nEmail Subject: {result.email_subject}")
    print(f"\nEmail Body: {result.email_body}")
    print(f"\nSent: {result.sent}")
    print(f"\nSteps: {len(result.steps)}")
