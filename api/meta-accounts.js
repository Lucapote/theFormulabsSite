// api/meta-accounts.js

export default async function handler(req, res) {
  // 1. Seguridad: Solo permitimos peticiones GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método HTTP no permitido. Utiliza GET.' });
  }

  // 2. Leer la llave maestra desde el entorno seguro del servidor (.env.local / Vercel)
  const token = process.env.META_USER_ACCESS_TOKEN;
  
  if (!token) {
    console.error("Falta META_USER_ACCESS_TOKEN en las variables de entorno.");
    return res.status(500).json({ error: 'El servidor no tiene configurado el token de Meta.' });
  }

  try {
    // 3. Consultar a la Graph API de Meta
    // Solicitamos específicamente el ID de la página, su token propio y los datos del Instagram vinculado.
    const url = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${token}`;
    
    const response = await fetch(url);
    const data = await response.json();

    // Si Meta rechaza la petición (ej. token expirado o permisos faltantes)
    if (data.error) {
      throw new Error(data.error.message);
    }

    // 4. Mapear y limpiar los datos
    // Transformamos la respuesta cruda de Meta en un array limpio y fácil de digerir para tu frontend.
    const pages = (data.data || []).map((page) => ({
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: page.access_token,
      instagramId: page.instagram_business_account?.id || null,
      instagramUsername: page.instagram_business_account?.username || null
    }));

    // 5. Enviar la respuesta exitosa a la webapp
    return res.status(200).json({ pages });
    
  } catch (error) {
    console.error("Error de integración con Meta API:", error.message);
    return res.status(500).json({ error: `Fallo al comunicarse con Meta: ${error.message}` });
  }
}
