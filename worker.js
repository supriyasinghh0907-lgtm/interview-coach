// Cloudflare Worker for Interview Coach (optional, free).
// It keeps your Gemini API key secret so visitors don't need their own.
// Settings, added in the Cloudflare dashboard under the worker's Settings > Variables and Secrets:
//   GEMINI_API_KEY  (Secret)    your key from Google AI Studio
//   ALLOWED_ORIGIN  (Variable)  your site, e.g. https://yourname.github.io
// The model is chosen here, not by the page, so nobody can use your key for other models.

const MODELS = { default: 'gemini-flash-latest', quick: 'gemini-flash-lite-latest' };

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
    const ok = allowed.length === 0 || allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': ok ? origin || '*' : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    const reply = (obj, status) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (!ok) return reply({ error: { message: 'This site is not allowed to use this worker.' } }, 403);
    if (request.method !== 'POST') return reply({ error: { message: 'Use POST.' } }, 405);
    if (!env.GEMINI_API_KEY) return reply({ error: { message: 'GEMINI_API_KEY is not set on the worker.' } }, 500);

    let body;
    try { body = await request.json(); } catch { return reply({ error: { message: 'Bad request.' } }, 400); }
    const prompt = String(body.prompt || '');
    if (!prompt) return reply({ error: { message: 'Empty prompt.' } }, 400);
    if (prompt.length > 60000) return reply({ error: { message: 'Prompt too large.' } }, 413);
    const tier = body.tier === 'quick' ? 'quick' : 'default';

    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELS[tier]}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: tier === 'quick' ? 0.7 : 0.4 },
      }),
    });
    return new Response(await upstream.text(), { status: upstream.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
