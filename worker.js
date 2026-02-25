/**
 * Cloudflare Worker — Roblox Stats Proxy
 *
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to https://dash.cloudflare.com → Workers & Pages → Create
 * 2. Click "Create Worker"
 * 3. Name it something like "roblox-stats"
 * 4. Paste this entire file into the editor
 * 5. Click "Deploy"
 * 6. Your Worker URL will be: https://roblox-stats.<your-subdomain>.workers.dev
 * 7. Copy that URL into data.js → SITE_CONFIG.workerUrl
 *
 * FREE TIER: 100,000 requests/day — more than enough for a portfolio site.
 */

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    const url = new URL(request.url);
    const universeIds = url.searchParams.get("universeIds");

    if (!universeIds) {
      return jsonResponse({ error: "Missing universeIds parameter" }, 400);
    }

    // Validate: only allow numeric, comma-separated IDs
    if (!/^[\d,]+$/.test(universeIds)) {
      return jsonResponse({ error: "Invalid universeIds format" }, 400);
    }

    try {
      const response = await fetch(
        `https://games.roblox.com/v1/games?universeIds=${universeIds}`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        return jsonResponse(
          { error: "Roblox API returned an error" },
          response.status
        );
      }

      const data = await response.json();
      return jsonResponse(data);
    } catch (err) {
      return jsonResponse({ error: "Failed to fetch from Roblox API" }, 502);
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
