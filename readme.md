# Marketing Creative Automation Tool

Internal tool for generating ad creatives for Tanganica's marketing campaigns across 11 European markets.

## Stack

-   **GitHub Pages** — frontend form
-   **Cloudflare Worker** — CORS proxy
-   **N8N** — workflow orchestration
-   **Gemini 3.5 Flash** — AI text generation

## How to use

1.  Select a campaign type
2.  Write or AI-generate a headline and button text
3.  Click **Generate banners**

## Setup

-   N8N workflow: import `n8n/workflow.json`, add Gemini API key, activate
-   Cloudflare Worker: deploy `cloudflare/worker.js`, update `_WEBHOOK_URL` in `main.js`

## Notes

-   We use Gemini free tier, which is the only limit ~10–15 requests/minute — if generation fails, wait 30s and retry
-   Banner generation is not yet implemented