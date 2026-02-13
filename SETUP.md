# 🏨 Azure Hotel Booking System - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

Server runs on: **http://localhost:3000**

### 3. Access Pages

- **Guest Pages**: http://localhost:3000/nightlife.html (or restaurants.html, taverns.html, facilities.html)
- **Guest Login**: http://localhost:3000/login.html
- **Admin Panel**: http://localhost:3000/admin.html

### Default Admin Login
- Email: **admin@azurehotel.com**
- Password: **admin123**

---

## 📋 How to Use

### For Admins (IMPORTANT - Do This First!)

1. **Login** to admin panel at http://localhost:3000/admin.html
2. **Set Availability**:
   - Go to "Availability" tab
   - Select a venue
   - Choose date range
   - Set capacity (e.g., 10 slots per time)
   - Add time slots:
     ```
     18:00
     19:00
     20:00
     21:00
     22:00
     ```
   - Click "Set Availability"

3. **Manage Bookings**:
   - View all bookings in "Bookings" tab
   - Confirm or cancel with one click

### For Guests

1. **Register/Login** at http://localhost:3000/login.html
2. **Browse** any venue page
3. **Click** "Reserve Table" button
4. **Select** date to see available time slots
5. **Complete** booking form
6. **Get** instant confirmation!

---

## 🎯 Key Features

✅ Real-time availability checking
✅ JWT authentication
✅ Admin dashboard with statistics
✅ Bulk availability management
✅ Beautiful responsive UI
✅ SQLite database (no setup needed!)

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite
- **Auth**: JWT + bcrypt
- **Frontend**: Tailwind CSS

---

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get all (admin)
- `GET /api/bookings/my` - Get user's bookings
- `PUT /api/bookings/:id/status` - Update status (admin)

### Availability
- `GET /api/availability/:venueId` - Get availability
- `POST /api/availability/bulk` - Set bulk (admin)

---

## 🔧 Troubleshooting

**"Port in use"**: Change PORT in server.js
**CORS errors**: Access via http://localhost:3000 (not file://)
**No availability**: Admin must set availability first!

---

## 🔒 Security Notes

⚠️ **For Production**:
- Change JWT_SECRET
- Change admin password
- Use HTTPS
- Add rate limiting
