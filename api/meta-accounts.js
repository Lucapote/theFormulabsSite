// api/meta-accounts.js
export default async function handler(req, res) {
  // Solo permitimos método GET para garantizar lectura estricta
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Solo GET.' });
  }

  // Tomamos el User Token de 60 días desde variables de entorno o parámetro de prueba
  const userAccessToken = process.env.META_USER_ACCESS_TOKEN || req.query.token;

  if (!userAccessToken) {
    return res.status(400).json({
      error: 'Falta el User Access Token. Configura META_USER_ACCESS_TOKEN en tu .env o pásalo como ?token=...'
    });
  }

  try {
    // Exactamente la llamada que probaste en Graph API Explorer, 
    // sumándole instagram_business_account para obtener ambos IDs en una sola pasada
    const url = new URL('https://graph.facebook.com/v26.0/me/accounts');
    url.searchParams.append('fields', 'id,name,access_token,instagram_business_account{id,username}');
    url.searchParams.append('access_token', userAccessToken);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const metaData = await response.json();

    if (!response.ok || metaData.error) {
      return res.status(response.status || 500).json({
        ok: false,
        source: 'Meta Graph API Error',
        error: metaData.error
      });
    }

    // Devolvemos la data limpia y procesada para inspección
    return res.status(200).json({
      ok: true,
      total_cuentas: metaData.data?.length || 0,
      cuentas: metaData.data.map((page) => ({
        nombre: page.name,
        facebook_page_id: page.id,
        instagram_business_account: page.instagram_business_account || null,
        page_access_token_disponible: Boolean(page.access_token),
        token_preview: page.access_token ? `${page.access_token.substring(0, 15)}...` : null,
        // Devolvemos el token completo solo si se solicita para copiarlo fácilmente
        page_access_token_completo: page.access_token
      }))
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}