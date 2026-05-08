const express    = require('express');
const nodemailer = require('nodemailer');
const cors       = require('cors');
const path       = require('path');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── MIDDLEWARE ── */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../'))); // serves your portfolio HTML

/* ── RATE LIMIT (simple — 5 submissions per IP per hour) ── */
const submits = new Map();
function rateLimit(req, res, next) {
  const ip  = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const key = `${ip}`;

  if (!submits.has(key)) {
    submits.set(key, { count: 1, first: now });
    return next();
  }
  const entry = submits.get(key);
  if (now - entry.first > 60 * 60 * 1000) {
    submits.set(key, { count: 1, first: now }); // reset after 1 hour
    return next();
  }
  if (entry.count >= 5) {
    return res.status(429).json({ success: false, error: 'Too many submissions. Try again later.' });
  }
  entry.count++;
  next();
}

/* ── EMAIL TRANSPORTER ── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // Gmail App Password (NOT your real password)
  },
});

/* ── CONTACT ENDPOINT ── */
app.post('/api/contact', rateLimit, async (req, res) => {
  const { name, email, projectType, budget, message } = req.body;

  /* server-side validation */
  if (!name || !email || !projectType || !message) {
    return res.status(400).json({ success: false, error: 'Please fill in all required fields.' });
  }
  if (!email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }
  if (message.length > 1000) {
    return res.status(400).json({ success: false, error: 'Message too long.' });
  }

  /* ── EMAIL TO TIFE (notification) ── */
  const toTife = {
    from:    `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to:      'boluwatifeafolayan82@gmail.com',
    replyTo: email,
    subject: `🚀 New Project Inquiry — ${projectType}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050810;color:#f0f4ff;padding:32px;border-radius:12px;border:1px solid rgba(59,130,246,0.2)">
        <div style="margin-bottom:24px">
          <span style="font-family:monospace;font-size:11px;color:#3b82f6;letter-spacing:0.1em;text-transform:uppercase">New Inquiry — Portfolio</span>
          <h1 style="font-size:22px;font-weight:700;margin:8px 0 0;color:#f0f4ff">You've got a new message, Tife.</h1>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="padding:10px 12px;border:1px solid rgba(59,130,246,0.12);font-size:12px;font-family:monospace;color:#7a85a3;text-transform:uppercase;letter-spacing:0.08em;width:30%">Name</td>
            <td style="padding:10px 12px;border:1px solid rgba(59,130,246,0.12);font-size:14px;color:#f0f4ff;font-weight:500">${escHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid rgba(59,130,246,0.12);font-size:12px;font-family:monospace;color:#7a85a3;text-transform:uppercase;letter-spacing:0.08em">Email</td>
            <td style="padding:10px 12px;border:1px solid rgba(59,130,246,0.12);font-size:14px;color:#3b82f6"><a href="mailto:${escHtml(email)}" style="color:#3b82f6">${escHtml(email)}</a></td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid rgba(59,130,246,0.12);font-size:12px;font-family:monospace;color:#7a85a3;text-transform:uppercase;letter-spacing:0.08em">Project</td>
            <td style="padding:10px 12px;border:1px solid rgba(59,130,246,0.12);font-size:14px;color:#f0f4ff">${escHtml(projectType)}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;border:1px solid rgba(59,130,246,0.12);font-size:12px;font-family:monospace;color:#7a85a3;text-transform:uppercase;letter-spacing:0.08em">Budget</td>
            <td style="padding:10px 12px;border:1px solid rgba(59,130,246,0.12);font-size:14px;color:#10b981;font-weight:600">${escHtml(budget)}</td>
          </tr>
        </table>

        <div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.15);border-radius:8px;padding:16px;margin-bottom:24px">
          <div style="font-family:monospace;font-size:11px;color:#7a85a3;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px">Message</div>
          <p style="font-size:14px;color:#f0f4ff;line-height:1.7;margin:0">${escHtml(message).replace(/\n/g,'<br>')}</p>
        </div>

        <a href="mailto:${escHtml(email)}?subject=Re: Your project inquiry" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500">Reply to ${escHtml(name)} →</a>

        <p style="font-size:11px;color:#3d4a6b;margin-top:24px;font-family:monospace">Sent from your portfolio contact form · boluwatifeafolayan82@gmail.com</p>
      </div>
    `,
  };

  /* ── AUTO-REPLY TO SENDER ── */
  const toSender = {
    from:    `"Tife — Developer" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: `Got your message — I'll be in touch soon`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#050810;color:#f0f4ff;padding:32px;border-radius:12px;border:1px solid rgba(59,130,246,0.2)">
        <span style="font-family:monospace;font-size:11px;color:#06b6d4;letter-spacing:0.1em;text-transform:uppercase">Tife — Full-Stack Developer</span>
        <h1 style="font-size:20px;font-weight:700;margin:12px 0 8px;color:#f0f4ff">Hey ${escHtml(name)}, got your message.</h1>
        <p style="font-size:14px;color:#7a85a3;line-height:1.7;margin-bottom:20px">
          Thanks for reaching out. I've received your project inquiry and I'll personally review it and get back to you within <strong style="color:#f0f4ff">24 hours</strong>.
        </p>
        <div style="background:rgba(59,130,246,0.05);border:1px solid rgba(59,130,246,0.15);border-radius:8px;padding:16px;margin-bottom:24px">
          <div style="font-family:monospace;font-size:11px;color:#7a85a3;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px">Your Inquiry Summary</div>
          <p style="font-size:13px;color:#f0f4ff;margin:0"><strong>Project type:</strong> ${escHtml(projectType)}</p>
          <p style="font-size:13px;color:#f0f4ff;margin:6px 0 0"><strong>Budget:</strong> ${escHtml(budget)}</p>
        </div>
        <p style="font-size:13px;color:#7a85a3;line-height:1.7">
          While you wait, feel free to browse the full portfolio and case studies at the site you came from. The FixAm platform, hospital rebuild, and restaurant build are all there in detail.
        </p>
        <p style="font-size:13px;color:#7a85a3;margin-top:16px">Talk soon,<br><strong style="color:#f0f4ff">Tife</strong></p>
        <p style="font-size:11px;color:#3d4a6b;margin-top:24px;font-family:monospace">This is an automated confirmation — replies go directly to Tife.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(toTife);
    await transporter.sendMail(toSender);
    res.json({ success: true, message: 'Message sent successfully.' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: 'Failed to send email. Please try again.' });
  }
});

/* ── HTML ESCAPE ── */
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

/* ── CATCH-ALL — serve portfolio ── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Tife's portfolio server running on http://localhost:${PORT}`);
});
