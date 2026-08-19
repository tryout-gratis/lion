export default {
  async fetch(request, env) {
    // Header CORS standar
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // 1. Tangani Preflight Request (OPTIONS) dari Browser
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 2. Hanya izinkan method POST
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const { imageBase64, fileName } = await request.json();

      if (!imageBase64) {
        return new Response(JSON.stringify({ error: "imageBase64 is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const token = env.GITHUB_TOKEN;
      const repoOwner = "tryout-gratis";
      const repoName = "lion";

      // Gunakan nama file dari request, atau buat otomatis berdasarkan timestamp
      const targetPath = fileName || `photos/photo_${Date.now()}.jpg`;
      const githubUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${targetPath}`;

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Cloudflare-Worker",
      };

      // 3. Cek apakah file sudah ada di GitHub untuk mendapatkan SHA (diperlukan jika ingin meng-overwrite file)
      let sha = null;
      const getFileRes = await fetch(githubUrl, { headers });
      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        sha = fileData.sha;
      }

      // 4. Upload / Update file ke GitHub API
      const payload = {
        message: `Auto upload photo via Worker [skip ci]`,
        content: imageBase64.replace(/^data:image\/\w+;base64,/, ""), // Bersihkan prefix data URL jika ada
      };

      if (sha) {
        payload.sha = sha; // Menyertakan sha agar file lama di-replace
      }

      const res = await fetch(githubUrl, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};
