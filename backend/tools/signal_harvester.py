"""
Signal Harvester Tool
Fetches real-time signals about a target company using SerpAPI.
"""
import requests
from typing import Optional
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import SERP_API_KEY
from schemas import SignalData


SERP_API_BASE_URL = "https://serpapi.com/search"


def _search_google(query: str, num_results: int = 5) -> list[dict]:
    """
    Execute a Google search using SerpAPI.
    
    Args:
        query: The search query string
        num_results: Number of results to fetch
    
    Returns:
        List of search result dictionaries
    """
    params = {
        "q": query,
        "api_key": SERP_API_KEY,
        "engine": "google",
        "num": num_results
    }
    
    try:
        response = requests.get(SERP_API_BASE_URL, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("organic_results", [])
    except requests.RequestException as e:
        print(f"SerpAPI request failed for query '{query}': {e}")
        return []


def _extract_funding_info(results: list[dict]) -> str:
    """Extract funding information from search results."""
    if not results:
        return "No recent funding information found"
    
    funding_keywords = ["raised", "funding", "series", "million", "billion", "valuation", "investment"]
    
    for result in results:
        snippet = result.get("snippet", "").lower()
        title = result.get("title", "").lower()
        
        for keyword in funding_keywords:
            if keyword in snippet or keyword in title:
                return result.get("snippet", "No details available")
    
    # Return first result if no specific funding match
    return results[0].get("snippet", "No recent funding information found")


def _extract_hiring_info(results: list[dict]) -> str:
    """Extract hiring/jobs information from search results."""
    if not results:
        return "No current hiring signals found"
    
    hiring_keywords = ["hiring", "jobs", "positions", "openings", "engineers", "team", "growing"]
    
    for result in results:
        snippet = result.get("snippet", "").lower()
        title = result.get("title", "").lower()
        
        for keyword in hiring_keywords:
            if keyword in snippet or keyword in title:
                return result.get("snippet", "No details available")
    
    return results[0].get("snippet", "No current hiring signals found")


def _extract_news(results: list[dict]) -> list[str]:
    """Extract recent news headlines/snippets."""
    if not results:
        return ["No recent news found"]
    
    news_items = []
    for result in results[:3]:  # Get top 3 news items
        title = result.get("title", "")
        snippet = result.get("snippet", "")
        if title:
            news_items.append(f"{title}: {snippet[:150]}..." if len(snippet) > 150 else f"{title}: {snippet}")
    
    return news_items if news_items else ["No recent news found"]


def _extract_tech_stack(results: list[dict]) -> list[str]:
    """Extract tech stack information from search results."""
    if not results:
        return ["Unknown tech stack"]
    
    tech_keywords = [
        "react", "python", "node", "typescript", "javascript", "aws", "gcp", "azure",
        "kubernetes", "docker", "postgres", "mongodb", "redis", "graphql", "rest",
        "go", "rust", "java", "scala", "vercel", "next.js", "vue", "angular",
        "terraform", "datadog", "elasticsearch", "kafka", "rabbitmq"
    ]
    
    found_tech = set()
    
    for result in results:
        snippet = result.get("snippet", "").lower()
        title = result.get("title", "").lower()
        combined = f"{snippet} {title}"
        
        for tech in tech_keywords:
            if tech in combined:
                found_tech.add(tech.capitalize() if not tech.isupper() else tech)
    
    return list(found_tech)[:8] if found_tech else ["Tech stack details not found in public data"]


def harvest_signals(company: str) -> SignalData:
    """
    Harvest live signals about a target company using real SerpAPI searches.
    
    Args:
        company: Name of the target company
    
    Returns:
        SignalData object containing harvested information
    """
    print(f"🔍 Harvesting signals for: {company}")
    
    # Execute real SerpAPI searches
    funding_query = f"{company} funding 2024 2025"
    hiring_query = f"{company} hiring jobs site:linkedin.com OR site:greenhouse.io"
    news_query = f"{company} news announcement 2025"
    tech_query = f"{company} tech stack"
    
    print(f"  → Searching: {funding_query}")
    funding_results = _search_google(funding_query)
    
    print(f"  → Searching: {hiring_query}")
    hiring_results = _search_google(hiring_query)
    
    print(f"  → Searching: {news_query}")
    news_results = _search_google(news_query)
    
    print(f"  → Searching: {tech_query}")
    tech_results = _search_google(tech_query)
    
    # Parse and structure the results
    signals = SignalData(
        company=company,
        funding=_extract_funding_info(funding_results),
        hiring=_extract_hiring_info(hiring_results),
        news=_extract_news(news_results),
        tech_stack=_extract_tech_stack(tech_results)
    )
    
    print(f"✅ Signal harvesting complete for {company}")
    return signals


if __name__ == "__main__":
    # Test the signal harvester
    test_signals = harvest_signals("Vercel")
    print("\n--- Harvested Signals ---")
    print(f"Company: {test_signals.company}")
    print(f"Funding: {test_signals.funding}")
    print(f"Hiring: {test_signals.hiring}")
    print(f"News: {test_signals.news}")
    print(f"Tech Stack: {test_signals.tech_stack}")
