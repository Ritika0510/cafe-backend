const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/auth');

// ── GET /api/menu  — public, supports ?category=coffee ───────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = { available: true };
    if (req.query.category) filter.category = req.query.category;

    const items = await MenuItem.find(filter).sort('category name');
    res.json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/menu/:id ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, item });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── POST /api/menu  — admin only ──────────────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/menu/:id  — admin only ──────────────────────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/menu/:id  — admin only (soft delete) ─────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await MenuItem.findByIdAndUpdate(req.params.id, { available: false });
    res.json({ success: true, message: 'Item removed from menu.' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── POST /api/menu/seed  — admin only: seed default menu ─────────────────────
router.post('/seed/default', protect, adminOnly, async (req, res) => {
  const defaultMenu = [
    { name:'Signature Espresso', category:'coffee', price:3.50, emoji:'☕', description:'Double shot, velvety crema, single-origin Yirgacheffe beans.' },
    { name:'Caramel Latte',      category:'coffee', price:5.25, emoji:'🥛', description:'House-made caramel syrup & steamed oat milk.' },
    { name:'Cold Brew Tonic',    category:'coffee', price:5.75, emoji:'🧊', description:'20-hour cold brew over tonic water.' },
    { name:'Flat White',         category:'coffee', price:4.50, emoji:'☕', description:'Ristretto shots with velvety micro-foam.' },
    { name:'Matcha Latte',       category:'tea',    price:5.00, emoji:'🍵', description:'Ceremonial grade matcha, oat milk, hint of honey.' },
    { name:'Hibiscus Iced Tea',  category:'tea',    price:4.00, emoji:'🌺', description:'Cold-steeped hibiscus, lightly sweetened.' },
    { name:'Golden Milk',        category:'tea',    price:4.75, emoji:'✨', description:'Turmeric, ginger, oat milk, cinnamon.' },
    { name:'Avocado Toast',      category:'food',   price:9.50, emoji:'🥑', description:'Sourdough, smashed avo, poached egg.' },
    { name:'Granola Bowl',       category:'food',   price:8.00, emoji:'🥣', description:'House granola, seasonal fruit, Greek yogurt.' },
    { name:'Smoked Salmon Bagel',category:'food',   price:12.50,emoji:'🐟', description:'Cream cheese, capers, dill, red onion.' },
    { name:'Butter Croissant',   category:'pastry', price:3.75, emoji:'🥐', description:'Laminated dough, 72-hour ferment.' },
    { name:'Cardamom Morning Bun',category:'pastry',price:4.25, emoji:'🌀', description:'Citrus zest, cardamom sugar, brioche dough.' },
  ];
  await MenuItem.insertMany(defaultMenu);
  res.json({ success: true, message: `${defaultMenu.length} items seeded.` });
});

module.exports = router;
