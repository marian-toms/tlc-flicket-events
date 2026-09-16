export default async function handler(req, res) {
  const apiKey = '655f625f65824a5e7ac3eb7964e75792';
  const orgId = 'bbddf092-5863-497c-8708-88d0d2322a94';

  try {
    const response = await fetch('https://api.flicket.co.nz/graphql', {
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
                  address { city }
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

    const data = await response.json();
    if (data.errors) return res.status(400).json({ error: data.errors });

    const events = data.data.events.edges.map(edge => ({
      title: edge.node.title,
      date: new Date(edge.node.startDate).toLocaleDateString('en-NZ', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
      time: new Date(edge.node.startDate).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' }),
      location: edge.node.venue?.name || 'Location TBA',
      city: edge.node.venue?.address?.city || '',
      url: `https://thelatinclub.flicket.co.nz/event/${edge.node.id}`
    }));

    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
