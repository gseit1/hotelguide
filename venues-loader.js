// Venues Loader - Dynamically fetch and display venues from database
// API_URL is defined in booking.js which loads first

// Venue type mapping for each page
const PAGE_VENUE_TYPES = {
  'nightlife.html': 'nightlife',
  'restaurants.html': 'restaurant',
  'taverns.html': 'tavern',
  'facilities.html': 'facility'
};

// Get image based on venue type and category
function getVenueImage(type, category) {
  const imageMap = {
    'nightlife': {
      'Jazz Club': 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?auto=format&fit=crop&w=800&q=80',
      'Bar': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
      'Club': 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=800&q=80',
      'default': 'https://images.unsplash.com/photo-1571266028243-d220b2e93730?auto=format&fit=crop&w=800&q=80'
    },
    'restaurant': {
      'Fine Dining': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
      'International': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      'Seafood': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
      'default': 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80'
    },
    'tavern': {
      'Traditional': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
      'Rustic': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      'Seaside': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
      'default': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'
    },
    'facility': {
      'Spa': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'Gym': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      'Pool': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      'Sports': 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80',
      'Entertainment': 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=80',
      'default': 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80'
    }
  };
  
  return imageMap[type]?.[category] || imageMap[type]?.['default'] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
}

// Create venue card HTML
function createVenueCard(venue) {
  const image = getVenueImage(venue.type, venue.category);
  
  return `
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all" 
         data-venue-name="${venue.name}" 
         data-venue-type="${venue.category}" 
         data-venue-icon="${venue.icon || 'store'}"
         data-venue-id="${venue.id}">
      <div class="relative h-64">
        <img src="${image}" alt="${venue.name}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div class="absolute bottom-0 left-0 p-6">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-3xl">${venue.icon || '🏪'}</span>
            <h3 class="text-white text-2xl font-bold">${venue.name}</h3>
          </div>
          <p class="text-white/80 text-sm">${venue.category}</p>
        </div>
      </div>
      <div class="p-6 space-y-4">
        ${venue.description ? `<p class="text-slate-600 dark:text-slate-400 text-sm">${venue.description}</p>` : ''}
        <div class="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <span class="material-symbols-outlined text-primary">schedule</span>
          <span class="text-sm">Open: ${venue.opening_time || '09:00'} - ${venue.closing_time || '22:00'}</span>
        </div>
        <div class="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <span class="material-symbols-outlined text-primary">group</span>
          <span class="text-sm">Capacity: ${venue.capacity} guests</span>
        </div>
        <button data-booking-btn class="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:scale-105 transition-transform mt-4" data-lang="reserve-table">
          Book Now
        </button>
      </div>
    </div>
  `;
}

// Group venues by category
function groupVenuesByCategory(venues) {
  const grouped = {};
  venues.forEach(venue => {
    if (!grouped[venue.category]) {
      grouped[venue.category] = [];
    }
    grouped[venue.category].push(venue);
  });
  return grouped;
}

// Create section HTML
function createSection(category, venues, index) {
  const categoryId = category.toLowerCase().replace(/\s+/g, '-');
  const iconMap = {
    'Jazz Club': 'music_note',
    'Bar': 'local_bar',
    'Club': 'nightlife',
    'Fine Dining': 'restaurant',
    'International': 'public',
    'Seafood': 'set_meal',
    'Traditional': 'restaurant',
    'Rustic': 'cabin',
    'Seaside': 'beach_access',
    'Spa': 'spa',
    'Gym': 'fitness_center',
    'Pool': 'pool',
    'Sports': 'sports_tennis',
    'Entertainment': 'celebration'
  };
  
  const icon = iconMap[category] || 'store';
  
  return `
    <section id="${categoryId}" class="scroll-mt-20">
      <div class="flex items-center gap-5 mb-8">
        <span class="material-symbols-outlined text-primary text-4xl">${icon}</span>
        <h2 class="text-3xl lg:text-4xl font-bold tracking-tight">${category}</h2>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        ${venues.map(venue => createVenueCard(venue)).join('')}
      </div>
    </section>
  `;
}

// Load venues for current page
async function loadVenues() {
  // Find the content container first
  const contentContainer = document.getElementById('venuesContent');
  
  if (!contentContainer) {
    console.error('Content container #venuesContent not found - venues will not load');
    return;
  }
  
  // Show loading state
  contentContainer.innerHTML = `
    <div class="text-center py-16">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p class="text-slate-600 dark:text-slate-400">Loading venues from database...</p>
    </div>
  `;
  
  try {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop();
    const venueType = PAGE_VENUE_TYPES[currentPage];
    
    if (!venueType) {
      console.log('No venue type mapping for this page');
      return;
    }
    
    // Fetch venues from API
    const response = await fetch(`${API_URL}/venues`);
    if (!response.ok) {
      throw new Error('Failed to fetch venues');
    }
    
    const data = await response.json();
    
    // Filter venues by type
    const venues = data.venues.filter(v => v.type === venueType);
    
    if (venues.length === 0) {
      console.log('No venues found for type:', venueType);
      return;
    }
    
    // Group by category
    const grouped = groupVenuesByCategory(venues);
    
    // Find the content container by ID
    const contentContainer = document.getElementById('venuesContent');
    
    if (!contentContainer) {
      console.error('Content container #venuesContent not found');
      return;
    }
    
    console.log(`✅ Found content container, replacing with ${venues.length} venues from database...`);
    // Clear existing content
    contentContainer.innerHTML = '';
    
    // Create sections for each category
    Object.entries(grouped).forEach(([category, categoryVenues], index) => {
      const sectionHTML = createSection(category, categoryVenues, index);
      contentContainer.innerHTML += sectionHTML;
    });
    
    // Update sidebar navigation
    updateSidebarNavigation(grouped);
    
    console.log(`✅ Loaded ${venues.length} venues for ${venueType}`);
    
    // Notify booking system that venues are loaded (if it exists)
    if (window.bookingSystem) {
      console.log('Booking system detected, venues are ready');
    }
    
  } catch (error) {
    console.error('Error loading venues:', error);
    
    // Show error message to user
    const contentContainer = document.querySelector('.flex-1 .px-8.py-12, .flex-1 .px-8.lg\\:px-12');
    if (contentContainer) {
      contentContainer.innerHTML = `
        <div class="text-center py-16">
          <span class="material-symbols-outlined text-6xl text-slate-400 mb-4">error</span>
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Failed to Load Venues</h3>
          <p class="text-slate-600 dark:text-slate-400">Please refresh the page or try again later.</p>
          <button onclick="location.reload()" class="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90">
            Refresh Page
          </button>
        </div>
      `;
    }
  }
}

// Update sidebar navigation based on loaded categories
function updateSidebarNavigation(grouped) {
  const sidebar = document.querySelector('aside nav');
  if (!sidebar) return;
  
  const iconMap = {
    'Jazz Club': 'music_note',
    'Bar': 'local_bar',
    'Club': 'nightlife',
    'Fine Dining': 'restaurant',
    'International': 'public',
    'Seafood': 'set_meal',
    'Traditional': 'restaurant',
    'Rustic': 'cabin',
    'Seaside': 'beach_access',
    'Spa': 'spa',
    'Gym': 'fitness_center',
    'Pool': 'pool',
    'Sports': 'sports_tennis',
    'Entertainment': 'celebration'
  };
  
  sidebar.innerHTML = Object.keys(grouped).map(category => {
    const categoryId = category.toLowerCase().replace(/\s+/g, '-');
    const icon = iconMap[category] || 'store';
    return `
      <a href="#${categoryId}" class="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all">
        <span class="material-symbols-outlined text-2xl">${icon}</span>
        <span class="font-semibold">${category}</span>
      </a>
    `;
  }).join('');
  
  // Add active state to sidebar links on scroll
  const links = sidebar.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadVenues);
} else {
  loadVenues();
}
