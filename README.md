# Avena — Campus Marketplace

Avena is a full‑stack campus marketplace where students can buy, sell, offer services, and organize events.  
Built with vanilla HTML/CSS/JS on the frontend and Express + PostgreSQL on the backend.

---

## 🚀 Live Demo

- **Frontend (Vercel)**: [https://avena-frontend.vercel.app](https://avena-frontend.vercel.app)
- **Backend API (Render)**: [https://avena-backend.onrender.com](https://avena-backend.onrender.com)

---

## 📁 Project Structure

### Frontend (`avena-frontend`)

avena/
├── index.html
├── assets/
│ ├── css/
│ │ └── global.css
│ ├── js/
│ │ ├── modules/
│ │ │ ├── auth.js
│ │ │ ├── product.js
│ │ │ ├── service.js
│ │ │ ├── event.js
│ │ │ └── messaging.js
│ │ ├── components/
│ │ │ ├── avenna-header.js
│ │ │ ├── avenna-footer.js
│ │ │ └── avenna-modal.js
│ │ └── components-loader.js
│ └── images/
├── components/
│ ├── header.html
│ └── footer.html
├── pages/
│ ├── auth/
│ │ ├── login.html
│ │ ├── register.html
│ │ ├── verify-email.html
│ │ └── ...
│ ├── messaging/
│ │ ├── inbox.html
│ │ ├── conversation.html
│ │ └── ...
│ ├── dashboard.html
│ ├── product.html
│ ├── service.html
│ ├── event.html
│ ├── sell.html
│ ├── service-create.html
│ └── event-create.html
└── README.md


### Backend (`avena-backend`)
avena-backend/
├── server.js
├── package.json
├── .env
├── config/
│ └── db.js
├── models/
│ ├── User.js
│ ├── Product.js
│ ├── Service.js
│ ├── Event.js
│ └── Message.js
├── controllers/
│ ├── authController.js
│ ├── productController.js
│ ├── serviceController.js
│ ├── eventController.js
│ └── userController.js
├── routes/
│ ├── auth.js
│ ├── products.js
│ ├── services.js
│ ├── events.js
│ ├── messages.js
│ └── users.js
├── middleware/
│ ├── auth.js
│ ├── upload.js
│ └── validation.js
├── utils/
│ ├── jwt.js
│ ├── email.js
│ └── helpers.js
├── uploads/
│ ├── avatars/
│ ├── products/
│ ├── services/
│ └── events/
└── init.sql

text

---

## 🛠️ Tech Stack

### Frontend
- HTML5 / CSS3
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Web Components (custom elements)
- Fetch API

### Backend
- Node.js / Express
- PostgreSQL
- JWT authentication
- Multer (file uploads)
- Socket.io (real‑time chat)
- Nodemailer (email simulation)

### Deployment
- Frontend: **Vercel** (static hosting)
- Backend: **Render** (Node.js + PostgreSQL)

---

## ✨ Features

### Authentication
- Student registration with university email validation
- Email verification (6‑digit code)
- Login / Logout
- JWT token storage (localStorage)
- Password reset (email link)
- 2‑Factor Authentication (2FA)

### Marketplace
- Product listing (sell)
- Product browsing (grid view)
- Product detail page with image gallery
- Contact seller via chat

### Services
- Offer services (IT, medicine, finance, arts, etc.)
- Browse services with category filters
- Service detail page
- Contact provider

### Events
- Create campus events (free / paid)
- Event listing (upcoming events)
- Event detail page
- Register for events (free events only)

### Messaging & Chat
- Inbox / Sent messages
- Real‑time chat (Socket.io)
- Conversation view
- New message notifications

### Dashboard
- User statistics (products, services, events, unread messages)
- Manage personal listings (edit / delete)
- Profile management
- Avatar upload

### Mega Menu
- Dynamic categories loaded from API
- Subcategories and links from database

---

## 📦 Installation (Local Development)

### 1. Clone the repositories

```bash
git clone https://github.com/christianfonkoue-maker/avena-frontend.git
git clone https://github.com/christianfonkoue-maker/avena-backend.git
2. Backend setup
bash
cd avena-backend
npm install
cp .env.example .env   # and fill in your values
createdb avena_db
psql -d avena_db -f init.sql
npm run dev
3. Frontend setup
bash
cd ../avena-frontend
# Just serve with Live Server (VS Code extension)
# Right‑click index.html → "Open with Live Server"
🌍 Environment Variables (Backend)
Variable	Description
PORT	Server port (default: 5000)
DB_HOST	PostgreSQL host
DB_PORT	PostgreSQL port
DB_NAME	Database name
DB_USER	Database user
DB_PASSWORD	Database password
JWT_SECRET	Secret for JWT signing
FRONTEND_URL	Frontend URL (for CORS)
🧪 Testing the API (Postman)
After starting the backend, test these endpoints:

Method	Endpoint	Description
POST	/api/auth/register	Create an account
POST	/api/auth/login	Log in (returns JWT)
GET	/api/products	List all products
POST	/api/products	Create a product (authenticated)
GET	/api/services	List all services
POST	/api/events	Create an event
GET	/api/messages/conversations	Get conversations
🚢 Deployment
Backend (Render)
Push avena-backend to GitHub

Create a Web Service on Render

Connect your repository

Set environment variables

Deploy

Frontend (Vercel)
Push avena-frontend to GitHub

Import the repository to Vercel

Deploy (no build step needed)

👨‍💻 Author
Christian Fonkoue
GitHub: christianfonkoue-maker

📄 License
MIT

🙏 Acknowledgements
Font Awesome for icons

Google Fonts (Sora, DM Sans)

PostgreSQL community

Render & Vercel for free hosting

📧 Contact
For questions or contributions, reach out via Christian.fonkoue@acity.edu.gh

text

---

## ✅ Next steps

1. Copy this content into your `README.md`
2. Adjust the **Live Demo URLs** after deployment
3. Push to GitHub


