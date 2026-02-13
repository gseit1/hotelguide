# Azure Hotel Booking System - Complete ✅

## System Status
✅ Backend server running on http://localhost:3000  
✅ Database initialized with SQLite (sql.js)  
✅ Authentication system active (JWT + bcrypt)  
✅ 14 venues populated across 4 categories  
✅ Admin panel ready for use  
✅ Guest booking system operational  

---

## Quick Start

### 1. Admin Access
- **URL**: http://localhost:3000/admin.html
- **Login**: admin@azurehotel.com
- **Password**: admin123

**Admin Features:**
- Dashboard with real-time stats
- View and manage all bookings
- Set availability schedules for venues
- Manage booking statuses (pending → confirmed/cancelled)

### 2. Guest Booking
- **URL**: http://localhost:3000/login.html (for registration/login)
- **Then go to any venue page** (nightlife.html, restaurants.html, taverns.html, facilities.html)

**Guest Features:**
- Register and login
- Browse available venues
- Check real-time availability by date/time
- Make reservations
- View booking history

---

## Venues Loaded (14 Total)

### 🎵 Nightlife (3)
1. La Quinta Jazz Lounge - Jazz performances
2. Sunset Rooftop Bar - Cocktails with views
3. Blue Moon Dance Club - Premium nightclub

### 🍽️ Restaurants (3)
1. Azure Fine Dining - Mediterranean cuisine
2. Garden Terrace Restaurant - International dishes
3. Seafood Pier - Fresh seafood

### 🍺 Taverns (3)
1. The Old Harbor Tavern - Traditional Greek
2. Mountain View Tavern - Rustic atmosphere
3. Coastal Breeze Tavern - Beachfront dining

### 💆 Facilities (5)
1. Azure Spa & Wellness
2. Fitness Center
3. Infinity Pool
4. Tennis Courts
5. Kids Club

---

## API Endpoints

### Authentication
- `POST /api/register` - Guest registration
- `POST /api/login` - User login
- `POST /api/logout` - Logout
- `GET /api/me` - Get current user

### Venues
- `GET /api/venues` - List all venues
- `GET /api/venues/:id` - Get venue details

### Availability
- `GET /api/availability/:venue_id` - Check availability
- `POST /api/availability` - Set availability (admin)
- `POST /api/availability/bulk` - Bulk set availability (admin)

### Bookings
- `POST /api/bookings` - Create booking (guest)
- `GET /api/bookings/my` - My bookings (guest)
- `GET /api/bookings` - All bookings (admin)
- `PUT /api/bookings/:id/status` - Update status (admin)
- `DELETE /api/bookings/:id` - Cancel booking (guest)

### Stats
- `GET /api/stats` - Dashboard statistics (admin)

---

## Testing the System

### Test 1: Admin Login
1. Open http://localhost:3000/admin.html
2. Login with admin@azurehotel.com / admin123
3. View the dashboard with stats

### Test 2: Set Availability
1. In admin panel, go to "Availability" tab
2. Select a venue (e.g., "Azure Fine Dining")
3. Set date range (today to next week)
4. Add time slots (e.g., 18:00, 19:00, 20:00) with capacity
5. Click "Set Bulk Availability"

### Test 3: Guest Registration & Booking
1. Open http://localhost:3000/login.html
2. Click "Register" and create an account
3. Go to http://localhost:3000/restaurants.html
4. Click "Book Now" on any restaurant
5. Select date, time, number of guests
6. Submit booking

### Test 4: Admin Booking Management
1. Return to admin panel
2. Go to "Bookings" tab
3. View the new booking
4. Change status to "confirmed"
5. Verify status updates

---

## Technical Details

### Stack
- **Backend**: Node.js + Express.js
- **Database**: SQLite via sql.js (pure JavaScript, no compilation)
- **Authentication**: JWT tokens + bcryptjs hashing
- **Frontend**: Vanilla JavaScript + Tailwind CSS

### Why sql.js?
Switched from better-sqlite3 to sql.js to avoid Python/Visual Studio Build Tools compilation requirements on Windows. sql.js is pure JavaScript and works out of the box.

### Database Schema
- **users** - User accounts (admin/guest roles)
- **venues** - All bookable locations
- **availability** - Time slot availability per venue
- **bookings** - Customer reservations

### Security
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 24h expiration
- Cookie-based authentication
- Role-based access control (admin/guest)
- SQL injection protection via parameterized queries

---

## Files Overview

### Backend
- `server.js` - Express server with all API routes (544 lines)
- `booking.db` - SQLite database file
- `package.json` - Dependencies

### Frontend
- `admin.html` - Admin dashboard
- `login.html` - Guest authentication
- `booking.js` - Booking system logic
- `nightlife.html`, `restaurants.html`, `taverns.html`, `facilities.html` - Venue pages

### Setup
- `populate-venues.js` - Script to populate initial venues
- `SETUP.md` - This file

---

## Next Steps

1. **Customize Venues**: Edit populate-venues.js and rerun to update venues
2. **Add More Features**: 
   - Email confirmations
   - Payment integration
   - Guest reviews
   - Waitlist functionality
3. **Deploy**: 
   - Host on VPS/cloud platform
   - Use PostgreSQL/MySQL for production
   - Add SSL certificate
   - Set up domain name

---

## Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process and restart
node server.js
```

### Database issues
```bash
# Delete and recreate database
rm booking.db
node server.js
node populate-venues.js
```

### Can't login
- Verify you're using correct credentials
- Check browser console for errors
- Ensure cookies are enabled

---

## Development Commands

```bash
# Start server
node server.js

# Populate venues
node populate-venues.js

# Install dependencies
npm install

# Test API
curl http://localhost:3000/api/venues
```

---

**System is ready for bookings!** 🚀
