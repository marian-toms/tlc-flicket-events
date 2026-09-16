export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = '655f625f65824a5e7ac3eb7964e75792';
  const orgId = 'bbddf092-5863-497c-8708-88d0d2322a94';

  try {
    const today = new Date().toISOString();
    const response = await fetch(
      `https://api.flicket.co.nz/api/v1/events/search?limit=5`,
      {
        method: 'GET',
        headers: {
          'flicket-api-key': apiKey,
          'Flicket-Org-Id': orgId
        }
      }
    );

    const data = await response.json();
    
    // Retorna TODOS los campos del primer evento para ver qué tiene
    res.status(200).json(data.data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
