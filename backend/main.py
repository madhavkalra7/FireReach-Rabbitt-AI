"""
FireReach API
FastAPI application for the autonomous outreach engine.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from schemas import OutreachRequest, OutreachResponse
from agent import run_agent_fast  # Use fast mode
from config import validate_config


# Create FastAPI app
app = FastAPI(
    title="FireReach API",
    description="Autonomous B2B Outreach Engine - Harvest signals, analyze accounts, send personalized emails",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "https://*.vercel.app",   # Vercel deployments
        "*"  # Allow all origins (configure stricter in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/api/outreach", response_model=OutreachResponse)
async def run_outreach(request: OutreachRequest):
    """
    Execute the full outreach pipeline.
    
    1. Harvest signals about the target company (real API calls)
    2. Analyze signals and generate account brief
    3. Write and send personalized email
    
    Args:
        request: OutreachRequest with ICP, company, and recipient email
    
    Returns:
        OutreachResponse with all results and steps
    """
    try:
        # Validate configuration before running
        validate_config()
        
        # Run the agent in FAST mode (bypasses agentic loop overhead)
        result = run_agent_fast(request)
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error running outreach: {e}")
        raise HTTPException(status_code=500, detail=f"Agent execution failed: {str(e)}")


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": "FireReach API",
        "version": "1.0.0",
        "description": "Autonomous B2B Outreach Engine",
        "endpoints": {
            "health": "GET /api/health",
            "outreach": "POST /api/outreach"
        }
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
