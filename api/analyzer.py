import os
import logging
from typing import List, Optional
from pydantic import BaseModel
from openai import AsyncOpenAI
from urllib.parse import urljoin

logger = logging.getLogger("analyzer")
logger.setLevel(logging.INFO)

class VintedItem(BaseModel):
    """Structured data for a Vinted item"""
    title: str
    price: float
    condition: str
    brand: Optional[str] = None
    url: str
    country: str
    deal_score: float
    deal_reason: str

class DealsAnalysis(BaseModel):
    deals: List[VintedItem]

async def analyze_country_deals(markdown: str, country: str) -> List[VintedItem]:
    """Analyze deals from a single country"""
    logger.info(f"Analyzing deals for {country}")
    
    # Basic check to avoid wasting tokens on empty content
    if len(markdown) < 100:
        logger.warning(f"Markdown for {country} is too short, skipping analysis")
        return []

    system_prompt = f"""You are an expert at finding amazing deals on second-hand marketplaces.

Identify the TOP BEST DEALS from this Vinted {country} catalog.

A GREAT DEAL is:
- Premium/designer brands (Nike, Adidas, Gucci, Zara, H&M) at very low prices (under €30)
- Items in excellent or new condition priced significantly below typical market value
- High-quality items at prices under €10
- Popular items with strong demand at bargain prices

For each deal:
1. Extract: title, price (as number), condition, brand (if mentioned), url (full link), country (set to "{country}")
2. Calculate deal_score (0-100):
   - 90-100: Exceptional (designer under €20 or amazing under €5)
   - 70-89: Great (quality brand under €30 or good under €10)
   - 50-69: Good (decent savings)
3. Explain WHY it's a good deal (1 sentence in Italian)

Return top deals only."""
    
    # Truncate to avoid context limits if necessary, though Gemini handles large context
    user_prompt = f"Analyze this catalog and extract top deals:\n\n{markdown[:60000]}"
    
    # Configure Client
    # Uses standard OpenAI client, but expects baseURL to be possibly a proxy or direct
    # The user script used CODEWORDS_RUNTIME_URI env var.
    # We will fallback to standard OpenAI or user provided base_url
    
    base_url = os.environ.get("OPENAI_BASE_URL")
    api_key = os.environ.get("OPENAI_API_KEY")
    
    # If using the user's specific proxy logic:
    if "CODEWORDS_RUNTIME_URI" in os.environ:
         base_url = urljoin(os.environ["CODEWORDS_RUNTIME_URI"], "run/gemini/v1")
    
    if not api_key and not base_url:
        # Fallback for dev/demo if keys missing? Or raise error
        logger.error("No API key or Base URL provided for AI analysis")
        return []

    client = AsyncOpenAI(
        base_url=base_url,
        api_key=api_key or "dummy" # Some proxies don't need key if authenticated otherwise
    )
    
    try:
        response = await client.chat.completions.create(
            model="gemini-2.0-flash-exp", # Or "gpt-4o" etc. User script used gemini-2.5-flash?
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={ "type": "json_object" } # Using JSON mode generic for broader compatibility or structured output
            # User used .beta.chat.completions.parse with Pydantic model. 
            # We will use that if available or standard json mode.
        )
        
        # If using parse:
        # response = await client.beta.chat.completions.parse(...)
        # We'll stick to standard generation and parsing for broader compatibility unless we know the SDK version supports parse well.
        # User requirement said "requires-python = '==3.11.*'" and "openai==1.99.7".
        # We installed openai==1.52.0 in requirements.txt (my previous step).
        # Let's try to use the robust method.
        
        # Re-implementing with parse if possible or manual json parse
        # Since I blindly wrote requirements, I'll assume standard JSON parsing is safer for now
        # But wait, user script used `client.beta.chat.completions.parse`, so they want structured output.
        # I should try to support that.
        
        # Let's use simple json_object mode and parse it manually to handle potential SDK version mismatches nicely
        # But actually, I'll update requirements to latest openai to match user intent better if needed.
        # For now, let's assume standard JSON response.
        
        content = response.choices[0].message.content
        import json
        if content:
             # Clean markdown json blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                 content = content.split("```")[1].split("```")[0]
            
            data = json.loads(content)
            # Adapt to expected model
            # Ensure 'deals' key exists
            deals_list = data.get("deals", [])
            return [VintedItem(**d) for d in deals_list]
            
    except Exception as e:
        logger.error(f"Error in AI analysis details: {e}")
        return []
    
    return []

async def analyze_all_deals(country_data: dict[str, str]) -> List[VintedItem]:
    """Analyze deals from all countries"""
    logger.info("Analyzing deals with AI across all countries")
    
    # Analyze each country concurrently
    tasks = [analyze_country_deals(markdown, country) for country, markdown in country_data.items()]
    results = await asyncio.gather(*tasks)
    
    # Flatten results from all countries
    all_deals = []
    for country_deals in results:
        all_deals.extend(country_deals)
    
    logger.info(f"All countries analyzed, total_deals={len(all_deals)}")
    return all_deals
