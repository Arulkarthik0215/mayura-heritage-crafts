import nodemailer from 'nodemailer';
import prisma from './prisma';

// Create reusable transporter — configured via env vars
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Fetch the admin contact email from SiteSettings.
 * Falls back to SMTP_USER if settings not found.
 */
async function getAdminEmail(): Promise<string> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
    return settings?.contactEmail || process.env.SMTP_USER || '';
  } catch {
    return process.env.SMTP_USER || '';
  }
}

/**
 * Send an email notification when a new price request is submitted.
 */
export async function sendPriceRequestNotification(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  productId: string;
}): Promise<void> {
  // Don't send if SMTP isn't configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  SMTP not configured — skipping price request email notification');
    return;
  }

  const adminEmail = await getAdminEmail();
  if (!adminEmail) {
    console.log('⚠️  No admin email found — skipping notification');
    return;
  }

  const mailOptions = {
    from: `"Mayura Heritage Crafts" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: `New Price Request — ${data.productName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1412; color: #f5ebe0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #C65D3E, #a04830); padding: 28px 32px;">
          <h1 style="margin: 0; font-size: 22px; color: #fff;">New Price Request</h1>
          <p style="margin: 6px 0 0; font-size: 14px; color: rgba(255,255,255,0.8);">A customer is interested in pricing</p>
        </div>
        <div style="padding: 28px 32px;">
          <h2 style="font-size: 18px; margin: 0 0 20px; color: #C65D3E;">Product Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: rgba(245,235,224,0.6); font-size: 14px; width: 120px;">Product</td>
              <td style="padding: 8px 0; font-size: 14px; font-weight: 600;">${data.productName}</td>
            </tr>
          </table>
          
          <h2 style="font-size: 18px; margin: 24px 0 16px; color: #C65D3E;">Customer Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: rgba(245,235,224,0.6); font-size: 14px; width: 120px;">Name</td>
              <td style="padding: 8px 0; font-size: 14px;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: rgba(245,235,224,0.6); font-size: 14px;">Email</td>
              <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${data.customerEmail}" style="color: #C65D3E;">${data.customerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: rgba(245,235,224,0.6); font-size: 14px;">Phone</td>
              <td style="padding: 8px 0; font-size: 14px;"><a href="tel:${data.customerPhone}" style="color: #C65D3E;">${data.customerPhone}</a></td>
            </tr>
          </table>
          
          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
            <p style="font-size: 12px; color: rgba(245,235,224,0.4); margin: 0;">This email was sent from Mayura Heritage Crafts admin system</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Price request notification sent to ${adminEmail}`);
  } catch (error) {
    console.error('❌ Failed to send price request email:', error);
    // Don't throw — email failure shouldn't break the request
  }
}
