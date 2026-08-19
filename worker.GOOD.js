export default {
  async fetch(request, env) {
    // Hanya izinkan method POST
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      const { imageBase64 } = await request.json();
      const token = env.GITHUB_TOKEN; // Diambil aman dari server environment
      const repoOwner = "tryout-gratis";
      const repoName = "lion";

      // Logika upload ke GitHub API dilakukan di sini (server-to-server)
      const res = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/photos/photo_1.jpg`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "Cloudflare-Worker"
        },
        body: JSON.stringify({
          message: "Auto update photo via Worker [skip ci]",
          content: imageBase64
        })
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
};
