// api/meta-callback.js

export default async function handler(req, res) {
  // Soporte universal para Vercel Serverless (req.query) y Vite Dev Server (URL searchParams)
  let query = req.query;
  if (!query) {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host || "localhost:8080"}`);
      query = Object.fromEntries(urlObj.searchParams.entries());
    } catch {
      query = {};
    }
  }

  const { code, state, error, error_description } = query;

  if (error) {
    console.error("Meta OAuth error:", error, error_description);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(400).send(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Error de Autorización — The Formulab</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f87171; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { background: #111827; border: 1px solid #1f2937; padding: 32px; border-radius: 16px; max-width: 420px; text-align: center; }
            h2 { color: #ef4444; margin: 0 0 12px; font-size: 18px; }
            p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 16px; }
            button { background: #1f2937; color: white; border: none; padding: 8px 16px; border-radius: 9999px; font-size: 12px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>Error de autorización en Meta</h2>
            <p>${error_description || error || "La solicitud fue cancelada o rechazada en Meta."}</p>
            <button onclick="window.close()">Cerrar ventana</button>
          </div>
        </body>
      </html>
    `);
  }

  if (!code || !state) {
    return res.status(400).send("Faltan parámetros requeridos (code o state).");
  }

  const clientId = state;
  const appId = process.env.VITE_META_APP_ID || process.env.META_APP_ID || "1988387095189436";
  const appSecret = process.env.META_APP_SECRET || process.env.META_SECRET || "";

  if (!appSecret) {
    console.error("META_APP_SECRET no está configurado en las variables de entorno.");
    return res.status(500).send("Falta configuración de META_APP_SECRET en el servidor.");
  }

  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:8080";
  const redirectUri = `${protocol}://${host}/api/meta-callback`;

  try {
    // 1. Canjear code por Short-Lived Token
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${appSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(`Paso 1 (Code Exchange): ${tokenData.error.message}`);

    const shortToken = tokenData.access_token;

    // 2. Canjear por Long-Lived Token (60 días)
    const longTokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`;
    const longTokenRes = await fetch(longTokenUrl);
    const longTokenData = await longTokenRes.json();
    if (longTokenData.error) throw new Error(`Paso 2 (Long-Lived Exchange): ${longTokenData.error.message}`);

    const longLivedUserToken = longTokenData.access_token;

    // 3. Consultar /me/accounts para obtener los tokens permanentes de todas las páginas
    let accountsUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&limit=100&access_token=${longLivedUserToken}`;
    const allPages = [];
    let iterations = 0;

    while (accountsUrl && iterations < 5) {
      iterations++;
      const accountsRes = await fetch(accountsUrl);
      const accountsData = await accountsRes.json();
      if (accountsData.error) throw new Error(`Paso 3 (Accounts Fetch): ${accountsData.error.message}`);

      const data = accountsData.data || [];
      allPages.push(...data);
      accountsUrl = accountsData.paging?.next || null;
    }

    if (allPages.length === 0) {
      throw new Error("No se encontraron páginas de Facebook administradas con los permisos otorgados.");
    }

    // Mapear todas las páginas disponibles con sus credenciales permanentes
    const availablePages = allPages.map((p) => ({
      pageId: p.id,
      pageName: p.name,
      pageAccessToken: p.access_token, // Token permanente de la página
      instagramId: p.instagram_business_account?.id || null,
      instagramUsername: p.instagram_business_account?.username || null,
    }));

    // 4. Enviar la lista de páginas a la ventana padre (React) y cerrar popup
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Meta Conectado — The Formulab</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #0b0f19;
              color: white;
            }
            .card {
              background: #111827;
              border: 1px solid #1f2937;
              border-radius: 20px;
              padding: 28px 24px;
              text-align: center;
              max-width: 380px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
            }
            .badge-check {
              width: 48px;
              height: 48px;
              background: rgba(16, 185, 129, 0.15);
              border: 1px solid rgba(16, 185, 129, 0.3);
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
              color: #10b981;
              margin-bottom: 14px;
            }
            h2 { color: #10b981; margin: 0 0 8px; font-size: 18px; font-weight: 700; }
            p { font-size: 13px; color: #cbd5e1; margin: 0 0 6px; }
            .closing { color: #64748b; font-size: 11px; margin-top: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge-check">✓</div>
            <h2>Cuentas Sincronizadas</h2>
            <p>Se detectaron <strong>${availablePages.length}</strong> páginas administradas.</p>
            <p class="closing">Transfiriendo opciones al cliente y cerrando ventana...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'META_PAGES_LOADED',
                  clientId: '${clientId}',
                  pages: ${JSON.stringify(availablePages)}
                }, '*');
              }
            } catch (e) {
              console.error('Error enviando postMessage:', e);
            }
            setTimeout(function() {
              window.close();
            }, 700);
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Error en /api/meta-callback:", err);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Error al conectar con Meta — The Formulab</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f87171; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #111827; border: 1px solid #1f2937; padding: 28px; border-radius: 16px; max-width: 440px; text-align: center; }
            h2 { color: #ef4444; margin: 0 0 10px; font-size: 18px; }
            pre { background: #1e293b; color: #fca5a5; padding: 12px; border-radius: 8px; font-size: 11px; overflow-x: auto; text-align: left; }
            button { background: #1f2937; color: white; border: none; padding: 8px 16px; border-radius: 9999px; font-size: 12px; cursor: pointer; margin-top: 14px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Error al conectar con Meta</h2>
            <pre>${err.message}</pre>
            <button onclick="window.close()">Cerrar ventana</button>
          </div>
        </body>
      </html>
    `);
  }
}
