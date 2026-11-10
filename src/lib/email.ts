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
      <title>E-Ticket Musical Theater LSPR COMM30-6SP</title>
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
              THEATER PRODUCTION
            </h1>
            <p style="color:#F4B32A; margin:4px 0 0; font-size:12px; font-weight:bold; text-transform:uppercase; letter-spacing:2px;">
              LSPR Institute of Communication & Business
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 24px;">
            <h2 style="color:#182B49; margin:0 0 8px; font-size:18px;">
              Halo, ${order.customer.fullName}! 👋
            </h2>
            <p style="color:#4B5563; font-size:14px; line-height:1.5; margin:0 0 20px;">
              Terima kasih! Pembayaran Anda telah kami terima dan diverifikasi. Berikut adalah bukti reservasi dan E-Ticket resmi Anda untuk pementasan <strong>Musical Theater LSPR COMM30-6SP</strong>.
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
                      <td style="padding:4px 0; color:#6B7280; font-size:11px; text-transform:uppercase; font-weight:bold;">Jadwal:</td>
                      <td style="padding:4px 0; font-weight:bold; text-align:right;">Sabtu, 19 Des 2026 • 18:30 WIB</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; color:#6B7280; font-size:11px; text-transform:uppercase; font-weight:bold;">Lokasi Venue:</td>
                      <td style="padding:4px 0; font-weight:bold; text-align:right;">Auditorium LSPR Sudirman Park Lt. 2</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; color:#6B7280; font-size:11px; text-transform:uppercase; font-weight:bold;">Nomor Kursi:</td>
                      <td style="padding:4px 0; text-align:right;">${seatBadgesHtml}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0 0; color:#6B7280; font-size:11px; text-transform:uppercase; font-weight:bold; border-top:1px dashed #D1D5DB;">Total Bayar:</td>
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
                    🎟️ BUKA & CETAK E-TICKET LENGKAP
                  </a>
                </td>
              </tr>
            </table>

            <p style="color:#6B7280; font-size:12px; margin:24px 0 0; line-height:1.4; text-align:center;">
              ⚠️ <em>Harap tunjukkan kode QR pada E-Ticket saat registrasi masuk di venue. Jangan berikan kode QR kepada orang lain.</em>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#FAF6ED; padding:16px; text-align:center; font-size:11px; color:#6B7280; border-top:1px solid #E5E7EB;">
            © 2026 LSPR COMM30-6SP Musical Theater Production. All rights reserved.
          </td>
        </tr>

      </table>
    </body>
    </html>
    `;

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: order.customer.email,
      subject: `🎟️ E-Ticket Musical Theater LSPR COMM30-6SP [${order.id}]`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to trigger email:', err);
    return { success: false, error: (err as Error).message };
  }
}
