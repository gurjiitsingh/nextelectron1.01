export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  try {
    const Mailgun = (await import('mailgun.js')).default;
    const formData = (await import('form-data')).default;

    const DOMAIN = process.env.MAILGUN_DOMAIN!;
    const API_KEY = process.env.MAILGUN_API_KEY!;
    const FROM = process.env.MAILGUN_FROM_EMAIL!;

    const mg = new Mailgun(formData);
    const client = mg.client({
      username: 'api',
      key: API_KEY,
      url: 'https://api.eu.mailgun.net', // keep it consistent
    });

    const html = `
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your password. If this was you, please click the link below:</p>
      <p><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `;

    const response = await client.messages.create(DOMAIN, {
      from: FROM,
      to: email,
      subject: "Password Reset Instructions",
      html,
    });

    return { success: true, id: response.id };
  } catch (error) {
    console.error("Mailgun Reset Email Error:", error);
    return { success: false, message: "Email send failed." };
  }
}
