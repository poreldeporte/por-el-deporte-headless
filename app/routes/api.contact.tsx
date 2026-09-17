import type {Route} from './+types/api.contact';

type ContactResult = {ok: boolean; message: string};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DEFAULT_TO = 'contact@poreldeporte.com';
const DEFAULT_FROM = 'Por El Deporte Website <website@poreldeporte.com>';
// One constant, so the honeypot's fake success and a real send cannot drift apart.
const SUCCESS_MESSAGE =
  'Thanks. We’ll write back from contact@poreldeporte.com within a day.';

export function loader() {
  return Response.json(
    {
      ok: false,
      message: 'POST the contact form to send a message.',
    } satisfies ContactResult,
    {status: 405, headers: {Allow: 'POST'}},
  );
}

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return Response.json(
      {ok: false, message: 'Method not allowed.'} satisfies ContactResult,
      {status: 405},
    );
  }

  // This is a public form, but a browser on another origin should not be able
  // to use it as a general-purpose email relay.
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json(
      {ok: false, message: 'Forbidden.'} satisfies ContactResult,
      {status: 403},
    );
  }

  const form = await request.formData();

  // Bots tend to fill every field. Return the same success shape so the trap
  // does not teach them how to bypass it, but do not send anything.
  if (cleanMultiline(form.get('website'), 200)) {
    return Response.json({
      ok: true,
      message: SUCCESS_MESSAGE,
    } satisfies ContactResult);
  }

  const name = cleanSingleLine(form.get('name'), 80);
  const email = cleanSingleLine(form.get('email'), 254).toLowerCase();
  const community = cleanSingleLine(form.get('community'), 120);
  const cadence = cleanSingleLine(form.get('cadence'), 160);

  if (name.length < 2) {
    return invalid('Please enter your name.');
  }
  if (!EMAIL_RE.test(email)) {
    return invalid('Please enter a valid email address.');
  }
  if (community.length < 2) {
    return invalid('Please tell us which community you play with.');
  }
  if (cadence.length < 2) {
    return invalid('Please tell us how many play, and how often.');
  }

  const apiKey = context.env.PRIVATE_RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      'App contact form failed: PRIVATE_RESEND_API_KEY is not configured.',
    );
    return Response.json(
      {
        ok: false,
        message:
          'The form is unavailable right now. Please email contact@poreldeporte.com.',
      } satisfies ContactResult,
      {status: 503},
    );
  }

  const to = context.env.PRIVATE_CONTACT_TO_EMAIL?.trim() || DEFAULT_TO;
  const from = context.env.PRIVATE_CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const subjectName = name.replace(/[\r\n]+/g, ' ');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
        'User-Agent': 'Por-El-Deporte-Storefront/1.0',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `App inquiry from ${subjectName} — ${community}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Community: ${community}`,
          `How many play, and how often: ${cadence}`,
        ].join('\n'),
        html: contactEmailHtml({name, email, community, cadence}),
        tags: [{name: 'source', value: 'app-landing-page'}],
      }),
    });

    if (!response.ok) {
      console.error(`App contact email failed with status ${response.status}.`);
      return Response.json(
        {
          ok: false,
          message:
            'Your message could not be sent. Please try again or email us directly.',
        } satisfies ContactResult,
        {status: 502},
      );
    }

    return Response.json({
      ok: true,
      message: SUCCESS_MESSAGE,
    } satisfies ContactResult);
  } catch (error) {
    console.error('App contact email failed:', error);
    return Response.json(
      {
        ok: false,
        message:
          'Your message could not be sent. Please try again or email us directly.',
      } satisfies ContactResult,
      {status: 502},
    );
  }
}

function invalid(message: string) {
  return Response.json({ok: false, message} satisfies ContactResult, {
    status: 400,
  });
}

function cleanSingleLine(value: FormDataEntryValue | null, max: number) {
  return String(value ?? '')
    .split('')
    .map((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127 ? ' ' : character;
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function cleanMultiline(value: FormDataEntryValue | null, max: number) {
  const normalized = String(value ?? '')
    .split('\r\n')
    .join('\n')
    .split('\r')
    .join('\n');

  return normalized
    .split('')
    .map((character) => {
      const code = character.charCodeAt(0);
      return code === 10 || (code >= 32 && code !== 127) ? character : ' ';
    })
    .join('')
    .trim()
    .slice(0, max);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return entities[character];
  });
}

function contactEmailHtml({
  name,
  email,
  community,
  cadence,
}: {
  name: string;
  email: string;
  community: string;
  cadence: string;
}) {
  return `
    <div style="background:#f7f0de;color:#171717;font-family:Arial,sans-serif;padding:32px">
      <div style="margin:0 auto;max-width:620px;border:1px solid #171717;border-radius:18px;background:#fff;padding:32px">
        <p style="margin:0 0 8px;color:#a55032;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Por El Deporte App</p>
        <h1 style="margin:0 0 28px;font-size:28px;line-height:1.15">New website inquiry</h1>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.5">
          <tr><td style="width:150px;padding:8px 0;border-top:1px solid #ddd;font-weight:700">Name</td><td style="padding:8px 0;border-top:1px solid #ddd">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:8px 0;border-top:1px solid #ddd;font-weight:700">Email</td><td style="padding:8px 0;border-top:1px solid #ddd"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:8px 0;border-top:1px solid #ddd;font-weight:700">Community</td><td style="padding:8px 0;border-top:1px solid #ddd">${escapeHtml(community)}</td></tr>
          <tr><td style="padding:8px 0;border-top:1px solid #ddd;font-weight:700">How many play</td><td style="padding:8px 0;border-top:1px solid #ddd">${escapeHtml(cadence)}</td></tr>
        </table>
      </div>
    </div>
  `;
}
