export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Ambal token yang sudah Anda deklarasikan
    const token = env.GITHUB_TOKEN;

    // 2. Setup CORS agar hanya domain Anda yang bisa memanggil worker ini
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://seelion.pages.dev", // Sesuaikan domain Anda
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 3. Endpoint untuk Menerima Foto dari Browser
    if (url.pathname === "/api/upload" && request.method === "POST") {
      try {
        const { imageBase64, slot } = await request.json();

        // VALIDASI 1: Cek slot valid (1-4)
        if (!imageBase64 || slot < 1 || slot > 4) {
          return new Response(JSON.stringify({ error: "Slot tidak valid" }), { status: 400, headers: corsHeaders });
        }

        // VALIDASI 2: Batasi Ukuran Payload (Contoh: Max ~4MB)
        if (imageBase64.length > 4 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: "Ukuran gambar terlalu besar" }), { status: 413, headers: corsHeaders });
        }

        const filename = `photo_${slot}.jpg`;
        const ghUrl = `https://api.github.com/repos/${env.REPO_OWNER}/${env.REPO_NAME}/contents/photos/${filename}`;

        // Cek SHA file lama jika sudah ada di GitHub
        const getRes = await fetch(ghUrl, {
          headers: { 
            "Authorization": `Bearer ${token}`, 
            "User-Agent": "Cloudflare-Worker" 
          }
        });
        const getData = getRes.ok ? await getRes.json() : null;

        // Upload/Overwrite file ke GitHub
        const putRes = await fetch(ghUrl, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "Cloudflare-Worker"
          },
          body: JSON.stringify({
            message: `Upload photo_${slot}.jpg dari Worker`,
            content: imageBase64,
            sha: getData ? getData.sha : undefined
          })
        });

        if (!putRes.ok) throw new Error("Gagal mengunggah ke GitHub");

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
