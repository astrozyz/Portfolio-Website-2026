/**
 * Cloudflare Worker — Roblox Stats Proxy
 *
 * Deploy for free at https://workers.cloudflare.com
 *
 * Steps:
 *  1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
 *  2. Paste this entire file into the editor
 *  3. Click "Deploy"
 *  4. Copy the worker URL (e.g. https://roblox-stats.YOUR-SUBDOMAIN.workers.dev)
 *  5. Paste it into SITE_CONFIG.workerUrl in js/data.js
 */

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const universeIds = url.searchParams.get("universeIds");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    if (!universeIds) {
      return json({ error: "Missing universeIds parameter" }, 400);
    }

    try {
      const res = await fetch(
        `https://games.roblox.com/v1/games?universeIds=${universeIds}`
      );
      const data = await res.json();
      return json(data, 200);
    } catch (err) {
      return json({ error: "Failed to fetch from Roblox API" }, 502);
    }
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
