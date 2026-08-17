// File: functions/api/token.js

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};

// 1. Menangani Preflight Request (OPTIONS) dari browser
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

// 2. Menangani Request GET token
export async function onRequestGet(context) {
  const token = context.env.GITHUB_PAT || 
                context.env.GH_TOKEN || 
                context.env.GITHUB_TOKEN || 
                context.env.TOKEN || 
                context.env.PAT || "";

  return new Response(JSON.stringify({ token: token }), {
    status: 200,
    headers: corsHeaders
  });
}
