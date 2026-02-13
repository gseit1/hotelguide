const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Database
let db;
const DB_FILE = 'booking.db';

async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(DB_FILE)) {
    const buffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  return db;
}

// Helper to save database to disk
function saveDatabase() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  }
}

// Wrapper functions to match better-sqlite3 API
const dbWrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        db.run(sql, params);
        saveDatabase();
        return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0 };
      },
      get: (...params) => {
        const result = db.exec(sql, params);
        if (result.length === 0) return null;
        const columns = result[0].columns;
        const values = result[0].values[0];
        if (!values) return null;
        const row = {};
        columns.forEach((col, i) => row[col] = values[i]);
        return row;
      },
      all: (...params) => {
        const result = db.exec(sql, params);
        if (result.length === 0) return [];
        const columns = result[0].columns;
        return result[0].values.map(values => {
          const row = {};
          columns.forEach((col, i) => row[col] = values[i]);
          return row;
        });
      }
    };
  },
  exec: (sql) => {
    db.run(sql);
    saveDatabase();
  }
};

// Initialize database schema
function initSchema() {
  // Create tables
  dbWrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'guest')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      icon TEXT,
      description TEXT,
      capacity INTEGER DEFAULT 50,
      opening_time TEXT,
      closing_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venue_id INTEGER NOT NULL,
      date DATE NOT NULL,
      time_slot TEXT NOT NULL,
      available_slots INTEGER NOT NULL,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY (venue_id) REFERENCES venues(id),
      UNIQUE(venue_id, date, time_slot)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      venue_id INTEGER NOT NULL,
      booking_date DATE NOT NULL,
      booking_time TEXT NOT NULL,
      num_guests INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      special_requests TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (venue_id) REFERENCES venues(id)
    );

    CREATE INDEX IF NOT EXISTS idx_availability_venue_date ON availability(venue_id, date);
    CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_venue ON bookings(venue_id);
  `);

  // Create default admin if not exists
  const adminExists = dbWrapper.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    dbWrapper.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(
      'admin@azurehotel.com',
      hashedPassword,
      'Admin',
      'admin'
    );
    console.log('✅ Default admin created: admin@azurehotel.com / admin123');
  }
}

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  FRONTEND_URL,
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = dbWrapper.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = dbWrapper.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(
      email,
      hashedPassword,
      name,
      'guest'
    );

    const token = jwt.sign({ id: result.lastInsertRowid, email, role: 'guest' }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ message: 'Registration successful', token, user: { id: result.lastInsertRowid, email, name, role: 'guest' } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = dbWrapper.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ 
      message: 'Login successful', 
      token, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = dbWrapper.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

// ==================== VENUE ROUTES ====================

// Get all venues
app.get('/api/venues', (req, res) => {
  const venues = dbWrapper.prepare('SELECT * FROM venues ORDER BY category, name').all();
  res.json({ venues });
});

// Get venue by ID
app.get('/api/venues/:id', (req, res) => {
  const venue = dbWrapper.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id);
  if (!venue) {
    return res.status(404).json({ error: 'Venue not found' });
  }
  res.json({ venue });
});

// Create venue (admin only)
app.post('/api/venues', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, type, category, icon, description, capacity, opening_time, closing_time } = req.body;
    
    const result = dbWrapper.prepare(
      'INSERT INTO venues (name, type, category, icon, description, capacity, opening_time, closing_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, type, category, icon, description, capacity || 50, opening_time, closing_time);

    res.json({ message: 'Venue created', venueId: result.lastInsertRowid });
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({ error: 'Failed to create venue' });
  }
});

// Update venue (admin only)
app.put('/api/venues/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, type, category, icon, description, capacity, opening_time, closing_time } = req.body;
    
    dbWrapper.prepare(
      'UPDATE venues SET name = ?, type = ?, category = ?, icon = ?, description = ?, capacity = ?, opening_time = ?, closing_time = ? WHERE id = ?'
    ).run(name, type, category, icon, description, capacity, opening_time, closing_time, req.params.id);

    res.json({ message: 'Venue updated' });
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({ error: 'Failed to update venue' });
  }
});

// ==================== AVAILABILITY ROUTES ====================

// Get availability for a venue
app.get('/api/availability/:venueId', (req, res) => {
  const { date } = req.query;
  
  let availability;
  if (date) {
    availability = dbWrapper.prepare(
      'SELECT * FROM availability WHERE venue_id = ? AND date = ? ORDER BY time_slot'
    ).all(req.params.venueId, date);
  } else {
    availability = dbWrapper.prepare(
      'SELECT * FROM availability WHERE venue_id = ? AND date >= date("now") ORDER BY date, time_slot'
    ).all(req.params.venueId);
  }

  res.json({ availability });
});

// Set availability (admin only)
app.post('/api/availability', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { venue_id, date, time_slot, available_slots, is_available } = req.body;
    
    const stmt = dbWrapper.prepare(
      'INSERT INTO availability (venue_id, date, time_slot, available_slots, is_available) VALUES (?, ?, ?, ?, ?) ON CONFLICT(venue_id, date, time_slot) DO UPDATE SET available_slots = ?, is_available = ?'
    );
    
    stmt.run(venue_id, date, time_slot, available_slots, is_available ? 1 : 0, available_slots, is_available ? 1 : 0);

    res.json({ message: 'Availability updated' });
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({ error: 'Failed to set availability' });
  }
});

// Bulk set availability for date range (admin only)
app.post('/api/availability/bulk', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { venue_id, start_date, end_date, time_slots } = req.body;
    
    const stmt = dbWrapper.prepare(
      'INSERT INTO availability (venue_id, date, time_slot, available_slots, is_available) VALUES (?, ?, ?, ?, ?) ON CONFLICT(venue_id, date, time_slot) DO UPDATE SET available_slots = ?, is_available = ?'
    );

    const start = new Date(start_date);
    const end = new Date(end_date);
    
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      time_slots.forEach(slot => {
        stmt.run(
          venue_id,
          dateStr,
          slot.time,
          slot.capacity,
          1,
          slot.capacity,
          1
        );
      });
    }
    res.json({ message: 'Bulk availability set successfully' });
  } catch (error) {
    console.error('Bulk availability error:', error);
    res.status(500).json({ error: 'Failed to set bulk availability' });
  }
});

// ==================== BOOKING ROUTES ====================

// Create booking (no auth required - allows guest bookings)
app.post('/api/bookings', (req, res) => {
  try {
    const { venue_id, booking_date, booking_time, num_guests, customer_name, customer_email, customer_phone, special_requests } = req.body;
    
    // Try to get user_id if authenticated (optional)
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Token invalid or expired - continue as guest
        userId = null;
      }
    }
    
    // Check availability
    const availability = dbWrapper.prepare(
      'SELECT * FROM availability WHERE venue_id = ? AND date = ? AND time_slot = ? AND is_available = 1'
    ).get(venue_id, booking_date, booking_time);

    if (!availability || availability.available_slots < 1) {
      return res.status(400).json({ error: 'No availability for selected time' });
    }

    // Create booking (user_id can be null for guest bookings)
    const result = dbWrapper.prepare(
      'INSERT INTO bookings (user_id, venue_id, booking_date, booking_time, num_guests, customer_name, customer_email, customer_phone, special_requests, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(userId, venue_id, booking_date, booking_time, num_guests, customer_name, customer_email, customer_phone, special_requests, 'pending');

    // Decrease available slots
    dbWrapper.prepare(
      'UPDATE availability SET available_slots = available_slots - 1 WHERE venue_id = ? AND date = ? AND time_slot = ?'
    ).run(venue_id, booking_date, booking_time);

    res.json({ message: 'Booking created successfully', bookingId: result.lastInsertRowid });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get user bookings
app.get('/api/bookings/my', authMiddleware, (req, res) => {
  const bookings = dbWrapper.prepare(`
    SELECT b.*, v.name as venue_name, v.type as venue_type, v.category
    FROM bookings b
    JOIN venues v ON b.venue_id = v.id
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC, b.booking_time DESC
  `).all(req.user.id);

  res.json({ bookings });
});

// Get all bookings (admin only)
app.get('/api/bookings', authMiddleware, adminMiddleware, (req, res) => {
  const { venue_id, date, status } = req.query;
  
  let query = `
    SELECT b.*, v.name as venue_name, v.type as venue_type, v.category, u.name as user_name, u.email as user_email
    FROM bookings b
    JOIN venues v ON b.venue_id = v.id
    LEFT JOIN users u ON b.user_id = u.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (venue_id) {
    query += ' AND b.venue_id = ?';
    params.push(venue_id);
  }
  
  if (date) {
    query += ' AND b.booking_date = ?';
    params.push(date);
  }
  
  if (status) {
    query += ' AND b.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY b.booking_date DESC, b.booking_time DESC';
  
  const bookings = dbWrapper.prepare(query).all(...params);
  res.json({ bookings });
});

// Update booking status (admin only)
app.put('/api/bookings/:id/status', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = dbWrapper.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // If cancelling, restore availability
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      dbWrapper.prepare(
        'UPDATE availability SET available_slots = available_slots + 1 WHERE venue_id = ? AND date = ? AND time_slot = ?'
      ).run(booking.venue_id, booking.booking_date, booking.booking_time);
    }

    dbWrapper.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ message: 'Booking status updated' });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Cancel booking (user)
app.delete('/api/bookings/:id', authMiddleware, (req, res) => {
  try {
    const booking = dbWrapper.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    // Restore availability
    dbWrapper.prepare(
      'UPDATE availability SET available_slots = available_slots + 1 WHERE venue_id = ? AND date = ? AND time_slot = ?'
    ).run(booking.venue_id, booking.booking_date, booking.booking_time);

    dbWrapper.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('cancelled', req.params.id);
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// ==================== STATS ROUTES (Admin) ====================

app.get('/api/stats', authMiddleware, adminMiddleware, (req, res) => {
  const totalBookings = dbWrapper.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  const pendingBookings = dbWrapper.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('pending').count;
  const confirmedBookings = dbWrapper.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('confirmed').count;
  const totalUsers = dbWrapper.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('guest').count;
  const totalVenues = dbWrapper.prepare('SELECT COUNT(*) as count FROM venues').get().count;

  res.json({
    stats: {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalUsers,
      totalVenues
    }
  });
});

// Initialize app
async function initApp() {
  await initDatabase();
  initSchema();
  migrateBookingsTable();
  console.log('✅ Database initialized successfully');
}

// Migration: Update bookings table to allow NULL user_id for guest bookings
function migrateBookingsTable() {
  try {
    // Check if we need to migrate by trying to get table info
    const tableInfo = dbWrapper.prepare("PRAGMA table_info(bookings)").all();
    const userIdColumn = tableInfo.find(col => col.name === 'user_id');
    
    // If user_id is NOT NULL (notnull = 1), we need to migrate
    if (userIdColumn && userIdColumn.notnull === 1) {
      console.log('🔄 Migrating bookings table to allow guest bookings...');
      
      // Backup existing bookings
      const existingBookings = dbWrapper.prepare('SELECT * FROM bookings').all();
      
      // Drop and recreate table
      dbWrapper.exec('DROP TABLE IF EXISTS bookings');
      dbWrapper.exec(`
        CREATE TABLE bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          venue_id INTEGER NOT NULL,
          booking_date DATE NOT NULL,
          booking_time TEXT NOT NULL,
          num_guests INTEGER NOT NULL,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          special_requests TEXT,
          status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (venue_id) REFERENCES venues(id)
        )
      `);
      
      // Restore bookings if any existed
      if (existingBookings.length > 0) {
        const insertStmt = dbWrapper.prepare(
          'INSERT INTO bookings (id, user_id, venue_id, booking_date, booking_time, num_guests, customer_name, customer_email, customer_phone, special_requests, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        existingBookings.forEach(booking => {
          insertStmt.run(
            booking.id,
            booking.user_id,
            booking.venue_id,
            booking.booking_date,
            booking.booking_time,
            booking.num_guests,
            booking.customer_name,
            booking.customer_email,
            booking.customer_phone,
            booking.special_requests,
            booking.status,
            booking.created_at
          );
        });
        console.log(`✅ Migrated ${existingBookings.length} existing bookings`);
      }
      
      console.log('✅ Bookings table migration complete');
    }
  } catch (error) {
    console.log('Migration check skipped or completed:', error.message);
  }
}

// Start server
initApp().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin login: admin@azurehotel.com / admin123`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

