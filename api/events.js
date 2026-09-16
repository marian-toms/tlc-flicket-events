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
    // Llamada 1: GraphQL para eventos
    const graphqlResponse = await fetch('https://api.flicket.co.nz/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'flicket-api-key': apiKey,
        'flicket-org-id': orgId
      },
      body: JSON.stringify({
        query: `query events($where: EventWhereInput, $orderBy: EventOrderByInput) {
          events(where: $where, orderBy: $orderBy) {
            edges {
              node {
                id
                title
                startDate
                endDate
                venue {
                  name
                  address {
                    city
                  }
                }
              }
            }
          }
        }`,
        variables: {
          where: { startDate: new Date().toISOString(), isActive: true },
          orderBy: { startDate: 'ASC' }
        }
      })
    });

    const graphqlData = await graphqlResponse.json();

    if (graphqlData.errors) {
      return res.status(400).json({ error: 'GraphQL Error', details: graphqlData.errors });
    }

    const eventIds = graphqlData.data.events.edges.map(e => e.node.id);

    // Llamada 2: REST para obtener imágenes
    const today = new Date().toISOString();
    const restResponse = await fetch(
      `https://api.flicket.co.nz/api/v1/events/search?limit=50&startDate[gte]=${today}`,
      {
        method: 'GET',
        headers: {
          'flicket-api-key': apiKey,
          'Flicket-Org-Id': orgId
        }
      }
    );

    const restData = await restResponse.json();

    // Crear mapa de imágenes por ID
    const imageMap = {};
    restData.data.forEach(event => {
      imageMap[event.id] = event.imageUrl;
    });

    // Combinar datos de ambas APIs
    const events = graphqlData.data.events.edges.map(edge => {
      const node = edge.node;
      return {
        id: node.id,
        title: node.title || 'Untitled Event',
        date: new Date(node.startDate).toLocaleDateString('en-NZ', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: new Date(node.startDate).toLocaleTimeString('en-NZ', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        location: node.venue?.name || 'Location TBA',
        city: node.venue?.address?.city || '',
        imageUrl: imageMap[node.id] || null,
        url: `https://thelatinclub.flicket.co.nz/event/${node.id}`
      };
    });

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events', message: error.message });
  }
}
