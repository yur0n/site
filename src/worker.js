export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/send-message') {
      return handleContact(request, env);
    }

    if (url.pathname === '/CV_Yuri_Bilyk_Backend_Developer.pdf') {
      return serveCv(env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleContact(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid JSON' }, 400);
  }

  const { subject, email, message } = body;
  if (!email || !message) {
    return json({ ok: false, error: 'All fields are required' }, 400);
  }

  const text = `Email: ${email} | Subject: ${subject ?? 'empty'} | Message: ${message}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${env.WEBSITE_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.WEBSITE_CHAT_ID, text }),
    });
    const data = await r.json();
    return json({ ok: data.ok });
  } catch {
    return json({ ok: false }, 500);
  }
}

async function serveCv(env) {
  const object = await env.R2.get('CV_Yuri_Bilyk_Backend_Developer.pdf');
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="CV_Yuri_Bilyk_Backend_Developer.pdf"',
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
