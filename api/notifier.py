import logging
import os
from datetime import datetime
import httpx
from pydantic import BaseModel

logger = logging.getLogger("notifier")
logger.setLevel(logging.INFO)

async def send_email(recipient: str, deals: list, subject_prefix: str = "🎯 Top Vinted Deals"):
    """Send deals via email using Pipedream or SMTP/Resend"""
    logger.info(f"Sending email to {recipient} with {len(deals)} deals")
    
    # Generate HTML content
    html = generate_email_html(deals)
    
    # 1. Try Pipedream/Codewords proxy if available (Legacy/User's existing way)
    if "CODEWORDS_RUNTIME_URI" in os.environ and "PIPEDREAM_GMAIL_ACCESS" in os.environ:
         # Simplified reproduction of user's logic if they gave key
         # But usually we might just use a direct webhook if user provided one.
         # For now, let's implement a generic Webhook/Resend/SMTP approach.
         pass

    # 2. Generic Email (e.g. Resend, SendGrid)
    # If RESEND_API_KEY is present
    if "RESEND_API_KEY" in os.environ:
        return await send_with_resend(recipient, subject_prefix, html)
    
    # 3. Fallback: Log it (Development mode)
    logger.info("No email service configured. Logging email content.")
    logger.info(f"Subject: {subject_prefix}")
    # logger.info(html[:500] + "...")
    return html

async def send_with_resend(recipient: str, subject: str, html_content: str):
    import resend # Assumes resend package or use httpx
    # Using httpx for no extra dependency if possible, or assume user installs package.
    # We didn't add resend to requirements. Let's use httpx.
    
    api_key = os.environ["RESEND_API_KEY"]
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "from": "Vinted Deals <onboarding@resend.dev>", # Use verified domain in prod
        "to": [recipient],
        "subject": f"{subject} - {datetime.now().strftime('%d/%m/%Y')}",
        "html": html_content
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers)
        if resp.status_code >= 400:
            logger.error(f"Resend error: {resp.text}")
        else:
            logger.info("Email sent via Resend")
            
    return html_content

def generate_email_html(deals: list) -> str:
    # Same HTML logic as user script
    html = f"""<html>
<head>
<style>
    body {{ font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }}
    .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }}
    h1 {{ color: #09b1ba; text-align: center; }}
    .deal {{ background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #09b1ba; border-radius: 5px; }}
    .deal-title {{ font-size: 18px; font-weight: bold; color: #333; }}
    .price {{ font-size: 24px; color: #09b1ba; font-weight: bold; }}
    .score {{ background: #09b1ba; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; }}
    .reason {{ color: #444; margin-top: 10px; font-style: italic; }}
    a {{ color: #09b1ba; text-decoration: none; }}
</style>
</head>
<body>
<div class="container">
    <h1>🎯 Top {len(deals)} Vinted Deals (IT/FR/DE) - {datetime.now().strftime('%d %B %Y')}</h1>
"""
    for i, deal in enumerate(deals, 1):
        # Handle dict or object safely
        def get_val(obj, key, default=''):
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)

        d_title = get_val(deal, 'title')
        d_price = get_val(deal, 'price', 0)
        d_score = get_val(deal, 'deal_score', 0)
        d_cond = get_val(deal, 'condition')
        d_brand = get_val(deal, 'brand')
        d_url = get_val(deal, 'url', '#')
        d_country = get_val(deal, 'country')
        d_reason = get_val(deal, 'deal_reason')
        
        brand_text = f" • {d_brand}" if d_brand else ""
        html += f"""
    <div class="deal">
        <div class="deal-title">{i}. {d_title}</div>
        <div style="margin: 10px 0;">
            <span class="price">€{d_price:.2f}</span>
            <span class="score">Score: {d_score:.0f}/100</span>
        </div>
        <div style="color: #666; font-size: 14px;">Condizioni: {d_cond}{brand_text} • 🌍 {d_country}</div>
        <div class="reason">💡 {d_reason}</div>
        <div style="margin-top: 10px;"><a href="{d_url}" target="_blank">Vedi su Vinted →</a></div>
    </div>
"""
    html += "</div></body></html>"
    return html
