import { Resend } from 'resend';
import { Order } from '@/types/ticket';

export async function sendTicketEmail(order: Order): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.TICKET_FROM_EMAIL || 'tickets@resend.dev';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ticketUrl = `${baseUrl}/ticket/${order.id}`;

  if (!apiKey) {
    console.log(`[Email Simulated] E-ticket email for Order ${order.id} would be sent to: ${order.customer.email}`);
    console.log(`[Email Simulated] Ticket URL: ${ticketUrl}`);
    return { success: true };
  }

  try {
    const resend = new Resend(apiKey);

    const seatBadgesHtml = order.items
      .map(
        (it) => `
        <span style="display:inline-block; background-color:#FAF6ED; border:1px solid #0F1C30; border-radius:6px; padding:4px 8px; margin:2px; font-weight:bold; font-size:12px; color:#C1272D;">
          ${it.seatLabel} (${it.category})
        </span>
      `
      )
      .join(' ');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Official E-Ticket - Musical Theater LSPR COMM30-6SP</title>
    </head>
    <body style="font-family:'Helvetica Neue', Arial, sans-serif; background-color:#F8F5EE; margin:0; padding:20px; color:#182B49;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff; border:3px solid #0F1C30; border-radius:16px; overflow:hidden; box-shadow:0 6px 0 #0F1C30;">
        
        <!-- Header -->
        <tr>
          <td style="background-color:#182B49; padding:24px; text-align:center; border-bottom:4px solid #F4B32A;">
            <div style="display:inline-block; background-color:#C1272D; color:#ffffff; font-weight:900; font-size:20px; padding:4px 12px; border-radius:8px; border:2px solid #F4B32A; margin-bottom:8px;">
              COMM30-6SP
            </div>
            <h1 style="color:#FAF6ED; margin:0; font-size:24px; text-transform:uppercase; letter-spacing:1px;">
              CHORDS OF COMFORT
            </h1>
            <p style="color:#F4B32A; margin:4px 0 0; font-size:12px; font-weight:bold; text-transform:uppercase; letter-spacing:2px;">
              The 35th LSPR Theater Festival • LSPR Bekasi
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 24px;">
            <h2 style="color:#182B49; margin:0 0 8px; font-size:18px;">
              Hello, ${order.customer.fullName}! 👋
            </h2>
            <p style="color:#4B5563; font-size:14px; line-height:1.5; margin:0 0 20px;">
              Thank you! Your payment has been received and verified. Below is your official reservation details and E-Ticket for <strong>Chords of Comfort</strong> presented by COMM30-6SP.
            </p>

            <!-- Ticket Card Box -->
            <table width="100%" style="background-color:#FAF6ED; border:2px dashed #182B49; border-radius:12px; padding:16px; margin-bottom:24px;">
              <tr>
                <td>
                  <table width="100%" style="font-size:13px; color:#182B49;">
                    <tr>
                      <td style="padding:4px 0; color:#6B7280; font-size:11px; text-transform:uppercase; font-weight:bold;">Order ID:</td>
                      <td style="padding:4px 0; font-family:monospace; font-weight:900; font-size:14px; text-align:right; color:#182B49;">${order.id}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; color:#6B7280; font-size:11px; text-transform:uppercase; font-weight:bold;">Schedule:</td>
                      <td style="padding:4px 0; font-weight:bold; text-align:right;">January 2027 • Showtime TBA</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; color:#6B7280; font-size:11px; text-transform:uppercase; font-weight:bold;">Venue:</td>
                      <td style="padding:4px 0; font-weight:bold; text-align:right;">Amani Palladium Theatre, LSPR Bekasi</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; color:#6B7280; font-size:11px; text-transform:uppercase; font-weight:bold;">Seat Numbers:</td>
                      <td style="padding:4px 0; text-align:right;">${seatBadgesHtml}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0 0; color:#6B7280; font-size:11px; text-transform:uppercase; font-weight:bold; border-top:1px dashed #D1D5DB;">Total Paid:</td>
                      <td style="padding:8px 0 0; font-weight:900; font-size:16px; text-align:right; color:#C1272D; border-top:1px dashed #D1D5DB;">Rp ${order.totalAmount.toLocaleString('id-ID')}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Button CTA -->
            <table width="100%">
              <tr>
                <td align="center">
                  <a href="${ticketUrl}" target="_blank" style="display:inline-block; background-color:#C1272D; color:#ffffff; font-size:16px; font-weight:bold; text-decoration:none; padding:14px 28px; border-radius:10px; border:2px solid #0F1C30; box-shadow:0 4px 0 #0F1C30;">
                    🎟️ VIEW & PRINT OFFICIAL E-TICKET
                  </a>
                </td>
              </tr>
            </table>

            <p style="color:#6B7280; font-size:12px; margin:24px 0 0; line-height:1.4; text-align:center;">
              ⚠️ <em>Please present the QR Code on your E-Ticket upon check-in at the theatre entrance. Do not share your QR Code with unauthorized persons.</em>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#FAF6ED; padding:16px; text-align:center; font-size:11px; color:#6B7280; border-top:1px solid #E5E7EB;">
            © 2027 LSPR COMM30-6SP Musical Theater Production. All rights reserved.
          </td>
        </tr>

      </table>
    </body>
    </html>
    `;

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: order.customer.email,
      subject: `[CONFIRMED] Your Official E-Ticket for Chords of Comfort (#${order.id})`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Email sending exception:', err);
    return { success: false, error: (err as Error).message };
  }
}
