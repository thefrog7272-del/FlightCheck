export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers });

    try {
      if (pathname === '/api/planes' && request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM planes ORDER BY sort_order').all();
        return new Response(JSON.stringify(results), { headers });
      }

      if (pathname.startsWith('/api/checklists/') && request.method === 'GET') {
        const planeId = pathname.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM checklists WHERE plane_id = ?'
        ).bind(planeId).all();
        return new Response(JSON.stringify(results), { headers });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  },
};
