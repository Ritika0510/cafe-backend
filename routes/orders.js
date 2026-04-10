const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/auth');
const { sendOrderConfirmation } = require('../config/email');

// ── POST /api/orders  — place an order (guest or logged-in) ──────────────────
router.post('/', async (req, res) => {
  const {
    items,
    orderType,
    preferredTime,
    paymentMethod,
    specialInstructions,
    guestName,
    guestEmail,
    guestPhone,
  } = req.body;

  // Accept JWT if available but don't require it
  let userId = null;
  try {
    const jwt = require('jsonwebtoken');
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      userId = decoded.id;
    }
  } catch { /* guest order */ }

  if (!items?.length) {
    return res.status(400).json({ success: false, message: 'No items in order.' });
  }
  if (!orderType) {
    return res.status(400).json({ success: false, message: 'Order type is required.' });
  }

  try {
    const orderItems = [];
    let totalAmount = 0;

    for (const { menuItemId, quantity } of items) {
      const menuItem = await MenuItem.findById(menuItemId);
      if (!menuItem || !menuItem.available) {
        return res.status(400).json({ success: false, message: `Item not available: ${menuItemId}` });
      }
      orderItems.push({ menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity });
      totalAmount += menuItem.price * quantity;
    }

    const orderData = {
      items: orderItems,
      totalAmount,
      orderType,
      preferredTime,
      paymentMethod,
      specialInstructions,
    };

    if (userId) {
      orderData.user = userId;
    } else {
      if (!guestName || !guestEmail) {
        return res.status(400).json({ success: false, message: 'Guest name and email are required.' });
      }
      orderData.guestName = guestName;
      orderData.guestEmail = guestEmail;
      orderData.guestPhone = guestPhone;
    }

    const order = await Order.create(orderData);

    // Send confirmation email (non-blocking, safe to fail)
    try {
      const UserModel = require('../models/User');
      const emailTo   = userId ? (await UserModel.findById(userId))?.email : guestEmail;
      const emailName = userId ? (await UserModel.findById(userId))?.name  : guestName;
      if (emailTo) sendOrderConfirmation(emailTo, emailName, order).catch(console.error);
    } catch (emailErr) {
      console.error('Email error (non-fatal):', emailErr.message);
    }

    res.status(201).json({ success: true, orderId: order._id, status: order.status, totalAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Could not place order.' });
  }
});

// ── GET /api/orders/my  — logged-in user's orders ────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/orders  — all orders (admin) ────────────────────────────────────
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PATCH /api/orders/:id/status  — update status (admin) ────────────────────
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
