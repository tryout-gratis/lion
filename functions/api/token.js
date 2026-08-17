// File: functions/api/token.js
export async function onRequest(context) {
  // Membaca variabel dari settingan Cloudflare Pages
  const token = context.env.GITHUB_PAT || 
                context.env.GH_TOKEN || 
                context.env.GITHUB_TOKEN || 
                context.env.TOKEN || 
                context.env.PAT || "";

  return new Response(JSON.stringify({ token: token }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
