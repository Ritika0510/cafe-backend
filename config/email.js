const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Welcome email after registration ─────────────────────────────────────────
const sendWelcomeEmail = async (to, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: '☕ Welcome to Brewed & Co.!',
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:auto;background:#fdf8f2;padding:32px;border-radius:16px;color:#2c1a0e">
        <h1 style="color:#c8843a;font-size:2rem;margin-bottom:4px">Brewed & Co.</h1>
        <p style="color:#7a4f2d;font-size:.85rem;margin-top:0">Artisan Café</p>
        <hr style="border:none;border-top:1px solid #e8d5bf;margin:20px 0">
        <h2>Hello, ${name}! 👋</h2>
        <p>Your account has been created successfully. We're so glad you're here.</p>
        <p>You can now:</p>
        <ul>
          <li>Place online orders for pickup or delivery</li>
          <li>Track your order history</li>
          <li>Save your favourite items</li>
        </ul>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;margin-top:16px;background:#c8843a;color:white;padding:10px 24px;border-radius:24px;text-decoration:none;font-size:.95rem">
          Visit Our Café →
        </a>
        <p style="margin-top:32px;font-size:.8rem;color:#7a4f2d">See you soon,<br><strong>The Brewed & Co. Team</strong></p>
      </div>
    `,
  });
};

// ── Order confirmation email ──────────────────────────────────────────────────
const sendOrderConfirmation = async (to, name, order) => {
  const itemRows = order.items.map(i =>
    `<tr>
       <td style="padding:6px 0">${i.name} ×${i.quantity}</td>
       <td style="text-align:right;padding:6px 0">$${(i.price * i.quantity).toFixed(2)}</td>
     </tr>`
  ).join('');

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `☕ Order #${order._id.toString().slice(-6).toUpperCase()} Confirmed!`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:auto;background:#fdf8f2;padding:32px;border-radius:16px;color:#2c1a0e">
        <h1 style="color:#c8843a;font-size:2rem;margin-bottom:4px">Brewed & Co.</h1>
        <p style="color:#7a4f2d;font-size:.85rem;margin-top:0">Order Confirmation</p>
        <hr style="border:none;border-top:1px solid #e8d5bf;margin:20px 0">
        <h2>Thanks, ${name}! Your order is confirmed ✅</h2>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-6).toUpperCase()}</p>
        <p><strong>Type:</strong> ${order.orderType} &nbsp;|&nbsp; <strong>Time:</strong> ${order.preferredTime}</p>
        <table style="width:100%;margin-top:16px;border-collapse:collapse">
          <thead>
            <tr style="border-bottom:1px solid #e8d5bf">
              <th style="text-align:left;padding-bottom:8px">Item</th>
              <th style="text-align:right;padding-bottom:8px">Price</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr style="border-top:2px solid #c8843a;font-weight:bold">
              <td style="padding-top:8px">Total</td>
              <td style="text-align:right;padding-top:8px;color:#c8843a">$${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        ${order.specialInstructions ? `<p style="margin-top:16px;font-size:.9rem"><strong>Notes:</strong> ${order.specialInstructions}</p>` : ''}
        <p style="margin-top:24px;font-size:.85rem;color:#7a4f2d">We'll see you soon!<br><strong>Brewed & Co.</strong></p>
      </div>
    `,
  });
};

module.exports = { sendWelcomeEmail, sendOrderConfirmation };
