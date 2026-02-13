// Script to populate initial venues
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_FILE = 'booking.db';

const venues = [
  // Nightlife
  {
    name: 'La Quinta Jazz Lounge',
    type: 'nightlife',
    category: 'Jazz Club',
    icon: '🎵',
    description: 'Sophisticated jazz performances in an intimate setting',
    capacity: 80,
    opening_time: '20:00',
    closing_time: '02:00'
  },
  {
    name: 'Sunset Rooftop Bar',
    type: 'nightlife',
    category: 'Bar',
    icon: '🌅',
    description: 'Panoramic views with signature cocktails',
    capacity: 120,
    opening_time: '18:00',
    closing_time: '01:00'
  },
  {
    name: 'Blue Moon Dance Club',
    type: 'nightlife',
    category: 'Club',
    icon: '💃',
    description: 'Premium nightclub with international DJs',
    capacity: 200,
    opening_time: '22:00',
    closing_time: '04:00'
  },
  
  // Restaurants - Fine Dining
  {
    name: 'Azure Fine Dining',
    type: 'restaurant',
    category: 'Fine Dining',
    icon: '🍽️',
    description: 'Michelin-star quality Mediterranean cuisine',
    capacity: 60,
    opening_time: '18:00',
    closing_time: '23:00'
  },
  {
    name: 'Le Jardin',
    type: 'restaurant',
    category: 'Fine Dining',
    icon: '🌿',
    description: 'French haute cuisine in an elegant garden setting',
    capacity: 50,
    opening_time: '19:00',
    closing_time: '23:30'
  },
  {
    name: 'Seafood Pier',
    type: 'restaurant',
    category: 'Fine Dining',
    icon: '🦞',
    description: 'Fresh catch of the day with ocean views',
    capacity: 70,
    opening_time: '12:00',
    closing_time: '22:30'
  },
  
  // Restaurants - Fast Food
  {
    name: 'Azure Burgers & Grill',
    type: 'restaurant',
    category: 'Fast Food',
    icon: '🍔',
    description: 'Gourmet burgers and quick bites',
    capacity: 40,
    opening_time: '11:00',
    closing_time: '23:00'
  },
  {
    name: 'Poolside Snack Bar',
    type: 'restaurant',
    category: 'Fast Food',
    icon: '🌭',
    description: 'Quick meals and refreshments by the pool',
    capacity: 30,
    opening_time: '10:00',
    closing_time: '20:00'
  },
  
  // Restaurants - Desserts
  {
    name: 'Sweet Paradise',
    type: 'restaurant',
    category: 'Desserts',
    icon: '🍰',
    description: 'Artisan pastries and decadent desserts',
    capacity: 35,
    opening_time: '09:00',
    closing_time: '22:00'
  },
  {
    name: 'Gelato & More',
    type: 'restaurant',
    category: 'Desserts',
    icon: '🍨',
    description: 'Italian gelato and ice cream specialties',
    capacity: 25,
    opening_time: '10:00',
    closing_time: '23:00'
  },
  
  // Taverns
  {
    name: 'The Old Harbor Tavern',
    type: 'tavern',
    category: 'Traditional',
    icon: '🍺',
    description: 'Authentic local cuisine and craft beers',
    capacity: 90,
    opening_time: '11:00',
    closing_time: '00:00'
  },
  {
    name: 'Mountain View Tavern',
    type: 'tavern',
    category: 'Rustic',
    icon: '⛰️',
    description: 'Cozy atmosphere with traditional Greek dishes',
    capacity: 65,
    opening_time: '12:00',
    closing_time: '23:00'
  },
  {
    name: 'Coastal Breeze Tavern',
    type: 'tavern',
    category: 'Seaside',
    icon: '🌊',
    description: 'Beachfront tavern with fresh grilled specialties',
    capacity: 100,
    opening_time: '10:00',
    closing_time: '23:00'
  },
  
  // Facilities
  {
    name: 'Azure Spa & Wellness',
    type: 'facility',
    category: 'Spa',
    icon: '💆',
    description: 'Luxury spa treatments and wellness programs',
    capacity: 20,
    opening_time: '09:00',
    closing_time: '21:00'
  },
  {
    name: 'Fitness Center',
    type: 'facility',
    category: 'Gym',
    icon: '💪',
    description: 'State-of-the-art gym equipment and personal training',
    capacity: 50,
    opening_time: '06:00',
    closing_time: '22:00'
  },
  {
    name: 'Infinity Pool',
    type: 'facility',
    category: 'Pool',
    icon: '🏊',
    description: 'Olympic-size infinity pool with poolside service',
    capacity: 100,
    opening_time: '07:00',
    closing_time: '20:00'
  },
  {
    name: 'Tennis Courts',
    type: 'facility',
    category: 'Sports',
    icon: '🎾',
    description: 'Professional tennis courts with equipment rental',
    capacity: 16,
    opening_time: '08:00',
    closing_time: '20:00'
  },
  {
    name: 'Kids Club',
    type: 'facility',
    category: 'Entertainment',
    icon: '🎈',
    description: 'Supervised activities and entertainment for children',
    capacity: 40,
    opening_time: '09:00',
    closing_time: '18:00'
  }
];

async function populateVenues() {
  try {
    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(DB_FILE);
    const db = new SQL.Database(buffer);

    // Clear existing venues
    const existingVenues = db.exec('SELECT COUNT(*) as count FROM venues')[0].values[0][0];
    
    if (existingVenues > 0) {
      console.log(`⚠️  Clearing ${existingVenues} existing venues...`);
      db.run('DELETE FROM venues');
      db.run('DELETE FROM availability');
      db.run('DELETE FROM bookings WHERE id > 0');
      console.log('✓ Database cleared');
    }

    // Insert venues
    venues.forEach(venue => {
      db.run(
        'INSERT INTO venues (name, type, category, icon, description, capacity, opening_time, closing_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [venue.name, venue.type, venue.category, venue.icon, venue.description, venue.capacity, venue.opening_time, venue.closing_time]
      );
    });

    // Save database
    const data = db.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
    
    console.log(`✅ Successfully populated ${venues.length} venues`);
    
    // Print summary
    const counts = {
      nightlife: venues.filter(v => v.type === 'nightlife').length,
      restaurant: venues.filter(v => v.type === 'restaurant').length,
      tavern: venues.filter(v => v.type === 'tavern').length,
      facility: venues.filter(v => v.type === 'facility').length
    };
    
    console.log('\nVenues by category:');
    console.log(`  🎵 Nightlife: ${counts.nightlife}`);
    console.log(`  🍽️  Restaurants: ${counts.restaurant}`);
    console.log(`  🍺 Taverns: ${counts.tavern}`);
    console.log(`  💆 Facilities: ${counts.facility}`);
    
    db.close();
  } catch (error) {
    console.error('❌ Error populating venues:', error);
    process.exit(1);
  }
}

populateVenues();
