import asyncio
import logging
from firecrawl import FirecrawlApp

logger = logging.getLogger("scraper")
logger.setLevel(logging.INFO)

async def scrape_vinted_country(url: str, country_name: str) -> str:
    """Scrape a single Vinted country catalog"""
    logger.info(f"Scraping Vinted {country_name} at {url}")
    
    # Initialize FirecrawlApp (assumes FIRECRAWL_API_KEY env var is set)
    app = FirecrawlApp()
    
    # Run the scraping in a thread pool since FirecrawlApp might be synchronous
    try:
        result = await asyncio.to_thread(
            app.scrape_url,
            url,
            params={"formats": ["markdown"], "timeout": 30000, "waitFor": 5000}
        )
        
        # Handle different response structures
        markdown = ""
        if hasattr(result, "markdown"):
            markdown = result.markdown
        elif isinstance(result, dict):
            markdown = result.get("markdown", "")
            
        logger.info(f"Scraped successfully {country_name}, chars={len(markdown)}")
        return markdown
    except Exception as e:
        logger.error(f"Error scraping {country_name}: {e}")
        return ""

async def scrape_all_countries() -> dict[str, str]:
    """Scrape Vinted catalogs from Italy, France, and Germany"""
    logger.info("Scraping Vinted in 3 countries")
    
    countries = {
        "Italy": "https://www.vinted.it/catalog",
        "France": "https://www.vinted.fr/catalog",
        "Germany": "https://www.vinted.de/catalog"
    }
    
    # Scrape all countries concurrently
    tasks = [scrape_vinted_country(url, country) for country, url in countries.items()]
    results = await asyncio.gather(*tasks)
    
    # Return dict mapping country to markdown
    return {country: markdown for country, markdown in zip(countries.keys(), results)}
