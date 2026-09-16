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
      `https://api.flicket.co.nz/api/v1/events/search?limit=50&startDate[gte]=${today}`,
      {
        method: 'GET',
        headers: {
          'flicket-api-key': apiKey,
          'Flicket-Org-Id': orgId
        }
      }
    );

    const data = await response.json();

    if (!data.data) {
      return res.status(400).json({ error: 'No events found' });
    }

    const events = data.data.map(event => ({
      id: event.id,
      title: event.name || 'Untitled Event',
      date: new Date(event.startDate).toLocaleDateString('en-NZ', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: new Date(event.startDate).toLocaleTimeString('en-NZ', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      location: event.venue?.name || 'Location TBA',
      city: event.venue?.city || '',
      imageUrl: event.imageUrl || null,
      url: `https://thelatinclub.flicket.co.nz/event/${event.id}`
    }));

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events', message: error.message });
  }
}
