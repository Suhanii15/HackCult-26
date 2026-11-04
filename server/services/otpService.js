const crypto = require('crypto');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch {
  // nodemailer will be resolved if installed
}

// 5 minutes expiry
const OTP_EXPIRY_MS = 5 * 60 * 1000;
// 60 seconds minimum interval between resends
const RESEND_INTERVAL_MS = 60 * 1000;
// Maximum verification attempts per OTP
const MAX_OTP_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit numerical OTP.
 */
function generateOtp() {
  // crypto.randomInt is cryptographically strong
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Compute SHA-256 hash of an OTP using app secret salt.
 * Plaintext OTPs are NEVER stored in the database.
 */
function hashOtp(otp) {
  const salt = process.env.JWT_SECRET || 'ecopulse_otp_secure_salt_2026';
  return crypto
    .createHash('sha256')
    .update(`${otp}:${salt}`)
    .digest('hex');
}

/**
 * Constant-time comparison between entered OTP hash and stored OTP hash.
 */
function verifyOtpHash(enteredOtp, storedHash) {
  if (!enteredOtp || !storedHash) return false;
  const candidateHash = hashOtp(enteredOtp);
  try {
    const candidateBuf = Buffer.from(candidateHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (candidateBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(candidateBuf, storedBuf);
  } catch {
    return false;
  }
}

/**
 * Send OTP via Email using Nodemailer (SMTP).
 */
async function sendEmailOtp(email, otp) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const from = process.env.EMAIL_FROM || 'EcoPulse <noreply@ecopulse.gov.in>';

  if (host && user && pass && nodemailer) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const mailOptions = {
        from,
        to: email,
        subject: 'Your EcoPulse Verification Code 🌱',
        text: `Your EcoPulse verification code is: ${otp}\n\nThis code will expire in 5 minutes. Do not share this code with anyone.\n\nEcoPulse | Mission LiFE Gujarat`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #F8FAF9; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #064E3B; margin: 0; font-size: 26px;">Eco<span style="color: #10B981;">Pulse</span> 🌱</h1>
              <p style="color: #047857; margin-top: 4px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px;">GUJARAT ENERGY DEVELOPMENT AGENCY (GEDA)</p>
            </div>
            <div style="background: #FFFFFF; padding: 24px; border-radius: 12px; border: 1px solid #D1FAE5; text-align: center;">
              <h2 style="color: #0F172A; font-size: 18px; margin-top: 0;">One last step, bestie!</h2>
              <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">Enter this 6-digit code to verify your EcoPulse account and unlock your green journey:</p>
              <div style="display: inline-block; background: #D9F5A5; padding: 14px 28px; border-radius: 12px; letter-spacing: 8px; font-size: 32px; font-weight: 900; color: #14532D; margin-bottom: 20px;">
                ${otp}
              </div>
              <p style="color: #64748B; font-size: 12px; margin: 0;">⏱️ This code expires in <b>5 minutes</b>. Never share your verification code with anyone.</p>
            </div>
            <p style="text-align: center; color: #94A3B8; font-size: 11px; margin-top: 20px;">EcoPulse • Lifestyle for Environment • HackCult '26</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`📧 [EcoPulse OTP] Verification email dispatched to ${email} (MessageID: ${info.messageId}, Response: ${info.response})`);
      return { sent: true, channel: 'email', messageId: info.messageId };
    } catch (err) {
      console.error(`❌ [EcoPulse OTP] Failed to send email via SMTP: ${err.message}`);
    }
  }

  // Fallback when SMTP is not configured
  console.warn(
    `\n⚠️  [EcoPulse OTP Notification] SMTP credentials not fully configured.` +
    `\n   To enable real email dispatch, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM in server/.env.`
  );

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `\n🌱 [DEV OTP SIMULATOR] Generated OTP for email: ${email} -> [ ${otp} ] (Valid 5m)\n`
    );
  }

  return { sent: false, channel: 'email', reason: 'smtp_not_configured' };
}

/**
 * Send OTP via SMS.
 */
async function sendSmsOtp(phone, otp) {
  const provider = process.env.SMS_PROVIDER;
  const apiKey = process.env.SMS_API_KEY;

  const digits = String(phone).replace(/\D/g, '');
  // Default to India (+91) for 10-digit numbers
  const e164 = digits.length === 10 ? `+91${digits}` : `+${digits}`;
  const message = `Your EcoPulse verification code is ${otp}. Valid for 5 minutes. Do not share it with anyone.`;
  const p = (provider || '').toLowerCase();

  try {
    if (p === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const body = new URLSearchParams({ To: e164, Body: message });
      if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
        body.set('MessagingServiceSid', process.env.TWILIO_MESSAGING_SERVICE_SID);
      } else {
        body.set('From', process.env.TWILIO_FROM_NUMBER || '');
      }
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization:
            'Basic ' + Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
      if (!res.ok) throw new Error(`Twilio HTTP ${res.status}: ${await res.text()}`);
      console.log(`📱 [EcoPulse OTP] SMS dispatched to ${e164} via Twilio`);
      return { sent: true, channel: 'sms' };
    }

    if (p === 'fast2sms' && apiKey) {
      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: { authorization: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: digits.slice(-10),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.return === false) throw new Error(`Fast2SMS: ${JSON.stringify(data)}`);
      console.log(`📱 [EcoPulse OTP] SMS dispatched to ${digits.slice(-10)} via Fast2SMS`);
      return { sent: true, channel: 'sms' };
    }

    if (p === 'msg91' && apiKey && process.env.MSG91_TEMPLATE_ID) {
      const res = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: { authkey: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: digits.length === 10 ? `91${digits}` : digits,
          otp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.type === 'error') throw new Error(`MSG91: ${JSON.stringify(data)}`);
      console.log(`📱 [EcoPulse OTP] SMS dispatched to ${digits} via MSG91`);
      return { sent: true, channel: 'sms' };
    }
  } catch (err) {
    console.error(`❌ [EcoPulse OTP] SMS dispatch failed: ${err.message}`);
    return { sent: false, channel: 'sms', reason: 'sms_send_failed' };
  }

  console.warn(
    `\n⚠️  [EcoPulse OTP Notification] SMS provider not configured.` +
    `\n   To enable real SMS delivery, configure SMS_PROVIDER, SMS_API_KEY, SMS_SENDER_ID in server/.env.`
  );

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `\n🌱 [DEV OTP SIMULATOR] Generated OTP for mobile: ${phone} -> [ ${otp} ] (Valid 5m)\n`
    );
  }

  return { sent: false, channel: 'sms', reason: 'sms_not_configured' };
}

/**
 * Unified dispatch for email or phone OTP.
 */
async function dispatchOtp(identifier, otp) {
  const isEmail = identifier.includes('@');
  if (isEmail) {
    return await sendEmailOtp(identifier, otp);
  } else {
    return await sendSmsOtp(identifier, otp);
  }
}

module.exports = {
  OTP_EXPIRY_MS,
  RESEND_INTERVAL_MS,
  MAX_OTP_ATTEMPTS,
  generateOtp,
  hashOtp,
  verifyOtpHash,
  dispatchOtp,
};
