// Interview Coach worker, runs on Cloudflare's free plan.
// It answers the app using Cloudflare Workers AI, so no API key is needed anywhere.
//
// Setup (see SETUP.md):
//   1. Settings > Bindings > Add > Workers AI, variable name: AI
//   2. Settings > Variables and Secrets > ALLOWED_ORIGIN = https://YOURNAME.github.io

const MODELS = {
  default: '@cf/meta/llama-3.3-70b-instruct-fp8-fast', // questions, scoring, reports
  quick: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',    // follow-up questions (the small 8B model wrote confusing follow-ups)
};

const SYSTEM = 'You are the engine of an interview practice app. Reply with ONE valid JSON object and nothing else: no markdown, no code fences, no explanation.';

// Models sometimes put real line breaks inside JSON strings, which JSON.parse rejects.
function escapeNewlinesInStrings(t) {
  let out = '', inStr = false, esc = false;
  for (const ch of t) {
    if (inStr) {
      if (esc) { esc = false; out += ch; continue; }
      if (ch === '\\') { esc = true; out += ch; continue; }
      if (ch === '"') { inStr = false; out += ch; continue; }
      if (ch === '\n') { out += '\\n'; continue; }
      if (ch === '\r') continue;
      if (ch === '\t') { out += '\\t'; continue; }
      out += ch;
    } else { if (ch === '"') inStr = true; out += ch; }
  }
  return out;
}

function tryParse(t) {
  try { return JSON.parse(t); } catch {}
  try { return JSON.parse(escapeNewlinesInStrings(t)); } catch {}
  return null;
}

function extractJson(out) {
  if (out && typeof out === 'object') return out;
  const text = String(out || '').replace(/```json|```/g, '').trim();
  const whole = tryParse(text); if (whole) return whole;
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  if (a >= 0 && b > a) return tryParse(text.slice(a, b + 1));
  return null;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
    const ok = allowed.length === 0 || allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': ok ? (origin || '*') : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    const reply = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (!ok) return reply({ error: { code: 'origin', message: 'This site is not allowed to use this worker.' } }, 403);
    if (request.method !== 'POST') return reply({ error: { code: 'method', message: 'Use POST.' } }, 405);
    if (!env.AI) return reply({ error: { code: 'setup', message: 'Add the Workers AI binding named AI.' } }, 500);

    let body;
    try { body = await request.json(); } catch { return reply({ error: { code: 'bad_request' } }, 400); }
    const prompt = String(body.prompt || '');
    if (!prompt) return reply({ error: { code: 'bad_request' } }, 400);
    if (prompt.length > 40000) return reply({ error: { code: 'too_large' } }, 413);
    const tier = body.tier === 'quick' ? 'quick' : 'default';

    const run = model => env.AI.run(model, {
      messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: tier === 'quick' ? 0.7 : 0.3,
    });

    let out;
    try {
      out = await run(MODELS[tier]);
    } catch (e) {
      const msg = String((e && e.message) || e);
      // Free daily allocation used up, or too many requests at once
      if (/limit|quota|neuron|429|capacity/i.test(msg)) return reply({ error: { code: 'daily_limit', message: msg } }, 429);
      return reply({ error: { code: 'model', message: msg } }, 502);
    }

    let json = extractJson(out && out.response);
    if (!json) {
      // One retry: small models sometimes add text around the JSON
      try { out = await run(MODELS[tier]); json = extractJson(out && out.response); } catch {}
    }
    if (!json) return reply({ error: { code: 'bad_json' } }, 502);
    return reply({ json });
  },
};
