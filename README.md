# ☕ Brewed & Co. — Backend API

Node.js + Express + MongoDB backend for the Brewed & Co. café website.

---

## 🗂️ Project Structure

```
cafe-backend/
├── server.js              # Entry point
├── package.json
├── .env.example           # Copy to .env and fill in values
├── config/
│   ├── db.js              # MongoDB connection
│   └── email.js           # Nodemailer (welcome + order emails)
├── middleware/
│   └── auth.js            # JWT protect + adminOnly
├── models/
│   ├── User.js            # User schema (bcrypt hashed passwords)
│   ├── MenuItem.js        # Menu item schema
│   └── Order.js           # Order schema
└── routes/
    ├── auth.js            # /api/auth/register, login, me
    ├── menu.js            # /api/menu  (public read, admin write)
    └── orders.js          # /api/orders (place + manage)
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values (MongoDB URI, JWT secret, Gmail credentials)
```

### 3. Start MongoDB
```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas (free tier at https://cloud.mongodb.com)
# Just paste your connection string into MONGO_URI in .env
```

### 4. Run the server
```bash
npm run dev    # development (auto-restarts with nodemon)
npm start      # production
```

Server starts at: **http://localhost:5000**

---

## 📮 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/me` | Get current user (🔒 JWT) |

**Register body:**
```json
{ "name": "Jane", "email": "jane@email.com", "password": "secret123", "phone": "555-0000" }
```

**Login body:**
```json
{ "email": "jane@email.com", "password": "secret123" }
```

**Response includes JWT token** — store in `localStorage` and send as:
```
Authorization: Bearer <token>
```

---

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/menu` | Get all menu items |
| GET    | `/api/menu?category=coffee` | Filter by category |
| GET    | `/api/menu/:id` | Single item |
| POST   | `/api/menu` | Add item (🔒 admin) |
| PUT    | `/api/menu/:id` | Update item (🔒 admin) |
| DELETE | `/api/menu/:id` | Remove item (🔒 admin) |
| POST   | `/api/menu/seed/default` | Seed 12 default items (🔒 admin) |

---

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/orders` | Place an order (guest or logged-in) |
| GET    | `/api/orders/my` | My order history (🔒 JWT) |
| GET    | `/api/orders` | All orders (🔒 admin) |
| PATCH  | `/api/orders/:id/status` | Update status (🔒 admin) |

**Place order body:**
```json
{
  "items": [
    { "menuItemId": "<id>", "quantity": 2 },
    { "menuItemId": "<id>", "quantity": 1 }
  ],
  "orderType": "Pickup",
  "preferredTime": "10:30",
  "paymentMethod": "Pay at Counter",
  "specialInstructions": "Extra oat milk please",
  "guestName": "Jane",       // required if not logged in
  "guestEmail": "j@mail.com" // required if not logged in
}
```

---

## 📧 Email Setup (Gmail)

1. Enable **2-Step Verification** on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate a password for "Mail"
4. Paste it into `EMAIL_PASS` in your `.env`

Emails sent automatically:
- **Welcome email** on registration
- **Order confirmation** with itemized receipt after every order

---

## 🔐 Making a User Admin

Via MongoDB Compass or the Mongo shell:
```js
db.users.updateOne({ email: "admin@brewedandco.com" }, { $set: { role: "admin" } })
```

---

## 🌐 Connecting to the Frontend

In the frontend HTML, replace the hardcoded menu with API calls:
```js
const res = await fetch('http://localhost:5000/api/menu');
const { items } = await res.json();
```

For authenticated requests:
```js
fetch('/api/orders/my', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});
```
