import { ReservationFormDataType } from '../types/ReservationFormData';


export async function sendReservationConfirmationEmail(data: ReservationFormDataType) {
  try {
    const Mailgun = (await import('mailgun.js')).default;
    const formData = (await import('form-data')).default;

    const DOMAIN = process.env.MAILGUN_DOMAIN!;
    const API_KEY = process.env.MAILGUN_API_KEY!;
    const FROM = process.env.MAILGUN_FROM_EMAIL!;
    const TO_ADMIN = process.env.ADMIN_EMAI_TABLE_BOOK!; 

    const mg = new Mailgun(formData);
    const client = mg.client({
      username: 'api',
      key: API_KEY,
      url: 'https://api.eu.mailgun.net',
    });

    const html = `
      <h3>Reservation Details:</h3>
      <p><b>Name:</b> ${data.firstName} ${data.lastName}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Phone:</b> ${data.phone}</p>
      <p><b>Number of Persons:</b> ${data.numberOfPersons}</p>
      <p><b>Reservation Date:</b> ${data.reservationDate}</p>
      <p><b>Reservation Time:</b> ${data.reservationTime}</p>
      <p><b>Message:</b> ${data.message || 'No message provided.'}</p>
    `;

    const businessResponse = await client.messages.create(DOMAIN, {
      from: FROM,
      to: TO_ADMIN,
      subject: 'New Reservation Received',
      html,
    });

    if (!businessResponse?.id) {
      return { success: false, message: 'Failed to send business email' };
    }

    try {
      await client.messages.create(DOMAIN, {
        from: FROM,
        to: data.email,
        subject: 'Reservation Confirmation',
        html,
      });
    } catch (err) {
      console.warn('Customer email failed but business email was sent.', err);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Internal error while sending emails' };
  }
}
