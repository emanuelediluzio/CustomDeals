from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

app = FastAPI(
    title="Vinted Deal Finder API",
    description="Backend for finding deals on Vinted",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
async def get_status():
    return {"status": "ok", "service": "Vinted Deal Finder", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

class DealRequest(BaseModel):
    recipient_email: str
    max_results: int = 20
    filters: dict = {}

@app.post("/api/run")
async def run_deals_finder(request: DealRequest):
    """Run the deal finder algorithm"""
    from api.scraper import scrape_all_countries
    from api.analyzer import analyze_all_deals
    from api.notifier import send_email
    
    # 1. Scrape
    country_data = await scrape_all_countries()
    
    # 2. Analyze
    all_deals = await analyze_all_deals(country_data)
    
    # 3. Filter & Sort
    # Basic filtering if needed, for now just sort by score
    all_deals.sort(key=lambda x: getattr(x, 'deal_score', 0), reverse=True)
    top_deals = all_deals[:request.max_results]
    
    # 4. Notify
    html_summary = ""
    if top_deals:
        html_summary = await send_email(request.recipient_email, top_deals)
        
    return {
        "status": "success",
        "deals_found": len(all_deals),
        "deals_sent": len(top_deals),
        "preview_html": html_summary
    }
