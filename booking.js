// Booking System JavaScript
// API URL auto-configuration (works with both local and production)
const API_URL = window.API_CONFIG?.API_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api'
);

class BookingSystem {
    constructor() {
        this.currentVenue = null;
        this.currentVenueId = null;
        this.userToken = localStorage.getItem('userToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.availableSlots = [];
        this.currentStep = 1;
        this.bookingData = {
            date: null,
            timeSlot: null,
            guests: null,
            phone: '',
            specialRequests: ''
        };
        this.init();
    }

    init() {
        // Create booking modal if it doesn't exist
        if (!document.getElementById('bookingModal')) {
            this.createModal();
        }
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Add user menu to header
        this.addUserMenu();
    }

    createModal() {
        const modalHTML = `
        <!-- Booking Modal - Bottom Sheet Style -->
        <div id="bookingModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] hidden items-end lg:items-center lg:justify-center">
            <div id="modalSheet" class="bg-white dark:bg-slate-900 rounded-t-3xl lg:rounded-3xl shadow-2xl w-full lg:max-w-2xl h-[75vh] lg:h-[65vh] overflow-hidden flex flex-col transform transition-transform duration-300 translate-y-full lg:translate-y-0 lg:scale-95 lg:opacity-0">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-gradient-to-r from-primary to-blue-600 px-4 sm:px-6 py-4 flex items-center justify-between text-white">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-3xl">event_available</span>
                        <div>
                            <h3 class="text-lg sm:text-xl font-bold">Make a Reservation</h3>
                            <p class="text-xs sm:text-sm opacity-90" id="venueName">Venue Name</p>
                        </div>
                    </div>
                    <button id="closeModal" class="p-2 hover:bg-white/20 rounded-lg transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Progress Steps -->
                <div class="bg-white dark:bg-slate-900 px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <div class="flex items-center justify-between max-w-md mx-auto">
                        <!-- Step 1 -->
                        <div class="flex flex-col items-center gap-2 flex-1">
                            <div id="step1Indicator" class="size-8 sm:size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm sm:text-base transition-all">
                                1
                            </div>
                            <span id="step1Label" class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">Date</span>
                        </div>
                        <div class="h-0.5 bg-slate-200 dark:bg-slate-700 flex-1 mx-2" id="progress1to2"></div>
                        
                        <!-- Step 2 -->
                        <div class="flex flex-col items-center gap-2 flex-1">
                            <div id="step2Indicator" class="size-8 sm:size-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm sm:text-base transition-all">
                                2
                            </div>
                            <span id="step2Label" class="text-xs sm:text-sm font-semibold text-slate-400 transition-colors">Time</span>
                        </div>
                        <div class="h-0.5 bg-slate-200 dark:bg-slate-700 flex-1 mx-2" id="progress2to3"></div>
                        
                        <!-- Step 3 -->
                        <div class="flex flex-col items-center gap-2 flex-1">
                            <div id="step3Indicator" class="size-8 sm:size-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center font-bold text-sm sm:text-base transition-all">
                                3
                            </div>
                            <span id="step3Label" class="text-xs sm:text-sm font-semibold text-slate-400 transition-colors">Details</span>
                        </div>
                    </div>
                </div>

                <!-- Login Required Message -->
                <div id="loginRequired" class="hidden flex-1 flex items-center justify-center p-6">
                    <div class="text-center">
                        <div class="size-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span class="material-symbols-outlined text-yellow-600 text-4xl">lock</span>
                        </div>
                        <p class="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Login Required</p>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Please login to make a reservation</p>
                        <a href="login.html" class="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform">
                            Login / Register
                        </a>
                    </div>
                </div>

                <!-- Modal Body - Scrollable Content -->
                <div id="modalBody" class="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                    
                    <!-- STEP 1: Date Selection -->
                    <div id="step1Content" class="h-full">
                        <h4 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3">Select a Date</h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">Choose your preferred date for the reservation</p>
                        
                        <div class="space-y-4">
                            <input type="date" id="bookingDate" required 
                                class="w-full px-4 py-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                            
                            <!-- Quick Date Selection -->
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <button type="button" class="quick-date-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all font-semibold text-sm" data-days="0">
                                    Today
                                </button>
                                <button type="button" class="quick-date-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all font-semibold text-sm" data-days="1">
                                    Tomorrow
                                </button>
                                <button type="button" class="quick-date-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all font-semibold text-sm" data-days="7">
                                    Next Week
                                </button>
                                <button type="button" class="quick-date-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all font-semibold text-sm" data-days="14">
                                    In 2 Weeks
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 2: Time Selection -->
                    <div id="step2Content" class="h-full hidden">
                        <h4 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3">Select Time & Guests</h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Choose your preferred time slot</p>
                        
                        <div class="space-y-6">
                            <!-- Time Slots Grid -->
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Available Time Slots</label>
                                <div id="timeSlotsGrid" class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[30vh] overflow-y-auto p-1">
                                    <!-- Dynamic time slots will be inserted here -->
                                </div>
                            </div>

                            <!-- Number of Guests -->
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Number of Guests</label>
                                <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    ${[1, 2, 3, 4, 5, 6, 7, 8, 10].map(num => `
                                        <button type="button" class="guest-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all font-semibold" data-guests="${num}">
                                            ${num}${num === 10 ? '+' : ''}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 3: Contact Details -->
                    <div id="step3Content" class="h-full hidden">
                        <h4 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3">Contact Details</h4>
                        <p class="text-sm text-slate-600 dark:text-slate-400 mb-6">Provide your contact information</p>
                        
                        <div class="space-y-4">
                            <!-- Summary Card -->
                            <div class="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
                                <div class="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span class="text-slate-600 dark:text-slate-400">Date</span>
                                        <p class="font-bold text-slate-900 dark:text-white" id="summaryDate">-</p>
                                    </div>
                                    <div>
                                        <span class="text-slate-600 dark:text-slate-400">Time</span>
                                        <p class="font-bold text-slate-900 dark:text-white" id="summaryTime">-</p>
                                    </div>
                                    <div>
                                        <span class="text-slate-600 dark:text-slate-400">Guests</span>
                                        <p class="font-bold text-slate-900 dark:text-white" id="summaryGuests">-</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Name -->
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Full Name <span class="text-red-500">*</span>
                                </label>
                                <input type="text" id="customerName" required 
                                    class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="John Doe">
                            </div>

                            <!-- Email -->
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Email Address <span class="text-red-500">*</span>
                                </label>
                                <input type="email" id="customerEmail" required 
                                    class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="john@example.com">
                            </div>

                            <!-- Phone -->
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Phone Number <span class="text-red-500">*</span>
                                </label>
                                <input type="tel" id="customerPhone" required 
                                    class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                    placeholder="+30 123 456 7890">
                            </div>

                            <!-- Special Requests -->
                            <div>
                                <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Special Requests <span class="text-slate-400">(Optional)</span>
                                </label>
                                <textarea id="specialRequests" rows="3" 
                                    class="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    placeholder="Dietary restrictions, special occasions, preferences..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer - Navigation Buttons -->
                <div class="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4">
                    <div class="flex gap-3">
                        <button type="button" id="prevStepBtn" class="hidden px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            ← Previous
                        </button>
                        <button type="button" id="nextStepBtn" class="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                            Next →
                        </button>
                        <button type="button" id="confirmBookingBtn" class="hidden flex-1 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 hover:scale-105 transition-all shadow-lg">
                            Confirm Reservation
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Message -->
        <div id="bookingSuccess" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] hidden items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                <div class="size-20 mb-6 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
                </div>
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Reservation Confirmed!</h3>
                <p class="text-slate-600 dark:text-slate-400 mb-6">Your reservation has been successfully submitted. You will receive a confirmation email shortly.</p>
                <button id="closeSuccess" 
                    class="w-full px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 hover:scale-105 transition-all">
                    Close
                </button>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    attachEventListeners() {
        // Set minimum date to today
        const dateInput = document.getElementById('bookingDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
            
            // Update booking data when date changes
            dateInput.addEventListener('change', (e) => {
                this.bookingData.date = e.target.value;
            });
        }

        // Quick date buttons
        document.querySelectorAll('.quick-date-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const days = parseInt(e.currentTarget.getAttribute('data-days'));
                const date = new Date();
                date.setDate(date.getDate() + days);
                const dateStr = date.toISOString().split('T')[0];
                dateInput.value = dateStr;
                this.bookingData.date = dateStr;
            });
        });

        // Time slot selection (will be populated dynamically)
        document.getElementById('timeSlotsGrid')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-slot-btn')) {
                // Remove active from all
                document.querySelectorAll('.time-slot-btn').forEach(btn => {
                    btn.classList.remove('border-primary', 'bg-primary/10', 'text-primary');
                    btn.classList.add('border-slate-200', 'dark:border-slate-700');
                });
                // Add active to clicked
                e.target.classList.add('border-primary', 'bg-primary/10', 'text-primary');
                e.target.classList.remove('border-slate-200', 'dark:border-slate-700');
                this.bookingData.timeSlot = e.target.getAttribute('data-time');
            }
        });

        // Guest selection
        document.querySelectorAll('.guest-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active from all
                document.querySelectorAll('.guest-btn').forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/10', 'text-primary');
                    b.classList.add('border-slate-200', 'dark:border-slate-700');
                });
                // Add active to clicked
                e.currentTarget.classList.add('border-primary', 'bg-primary/10', 'text-primary');
                e.currentTarget.classList.remove('border-slate-200', 'dark:border-slate-700');
                this.bookingData.guests = e.currentTarget.getAttribute('data-guests');
            });
        });

        // Close modal buttons
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('closeSuccess')?.addEventListener('click', () => this.closeSuccess());

        // Step navigation
        document.getElementById('nextStepBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prevStepBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('confirmBookingBtn')?.addEventListener('click', () => this.submitBooking());

        // Close on backdrop click
        document.getElementById('bookingModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'bookingModal') {
                this.closeModal();
            }
        });

        document.getElementById('bookingSuccess')?.addEventListener('click', (e) => {
            if (e.target.id === 'bookingSuccess') {
                this.closeSuccess();
            }
        });

        // Update contact info
        document.getElementById('customerName')?.addEventListener('input', (e) => {
            this.bookingData.name = e.target.value;
        });

        document.getElementById('customerEmail')?.addEventListener('input', (e) => {
            this.bookingData.email = e.target.value;
        });

        document.getElementById('customerPhone')?.addEventListener('input', (e) => {
            this.bookingData.phone = e.target.value;
        });

        document.getElementById('specialRequests')?.addEventListener('input', (e) => {
            this.bookingData.specialRequests = e.target.value;
        });

        // Attach to all booking buttons
        this.attachBookingButtons();
    }

    attachBookingButtons() {
        // Use event delegation to handle dynamically loaded buttons
        document.body.addEventListener('click', async (e) => {
            // Check if clicked element or parent is a booking button
            const btn = e.target.closest('[data-booking-btn]');
            if (!btn) return;
            
            const card = btn.closest('[data-venue-name]');
            if (card) {
                const venueName = card.getAttribute('data-venue-name');
                const venueId = card.getAttribute('data-venue-id');
                
                // Set venue ID if available
                if (venueId) {
                    this.currentVenueId = parseInt(venueId);
                } else {
                    // Fallback: try to find venue ID from backend
                    await this.findVenueId(venueName);
                }
                
                this.openModal({
                    name: venueName,
                    type: card.getAttribute('data-venue-type'),
                    icon: card.getAttribute('data-venue-icon') || 'store'
                });
            }
        });
    }

    async findVenueId(venueName) {
        try {
            const response = await fetch(`${API_URL}/venues`);
            const data = await response.json();
            const venue = data.venues.find(v => v.name === venueName);
            if (venue) {
                this.currentVenueId = venue.id;
            } else {
                // Create venue if it doesn't exist (will fail without admin auth, that's ok)
                console.log('Venue not found in database, ID will be null');
                this.currentVenueId = null;
            }
        } catch (error) {
            console.error('Failed to find venue:', error);
            this.currentVenueId = null;
        }
    }

    async loadAvailability() {
        const date = document.getElementById('bookingDate').value;
        const timeSelect = document.getElementById('bookingTime');

        if (!this.currentVenueId || !date) {
            timeSelect.innerHTML = '<option value="">Select date first</option>';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/availability/${this.currentVenueId}?date=${date}`);
            const data = await response.json();
            
            this.availableSlots = data.availability.filter(slot => slot.is_available && slot.available_slots > 0);

            if (this.availableSlots.length === 0) {
                timeSelect.innerHTML = '<option value="">No availability for this date</option>';
            } else {
                timeSelect.innerHTML = '<option value="">Select time slot</option>' +
                    this.availableSlots.map(slot => 
                        `<option value="${slot.time_slot}">${slot.time_slot} (${slot.available_slots} slots available)</option>`
                    ).join('');
            }
        } catch (error) {
            console.error('Failed to load availability:', error);
            timeSelect.innerHTML = '<option value="">Error loading availability</option>';
        }
    }

    addUserMenu() {
        // If navbar component is loaded, it handles the user menu
        if (window.azureNavbar) {
            window.azureNavbar.updateUserMenu();
            return;
        }
        
        // Add user menu to header if user is logged in (fallback for pages without navbar.js)
        const headers = document.querySelectorAll('header .flex.items-center.gap-4');
        headers.forEach(header => {
            if (!header.querySelector('#userMenu')) {
                if (this.user) {
                    const userMenuHTML = `
                        <div id="userMenu" class="flex items-center gap-2 sm:gap-3">
                            <span class="hidden md:inline text-sm text-slate-600 dark:text-slate-400">Welcome, ${this.user.name.split(' ')[0]}</span>
                            <a href="profile.html" class="flex items-center gap-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all">
                                <span class="material-symbols-outlined text-[18px]">person</span>
                                <span class="hidden sm:inline">Profile</span>
                            </a>
                            <button onclick="window.bookingSystem.logout()" class="flex items-center gap-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all">
                                <span class="material-symbols-outlined text-[18px]">logout</span>
                                <span class="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    `;
                    header.insertAdjacentHTML('beforeend', userMenuHTML);
                } else {
                    const loginHTML = `
                        <div id="userMenu">
                            <a href="login.html" class="flex items-center gap-1 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-primary/90 transition-all">
                                <span class="material-symbols-outlined text-[18px]">login</span>
                                <span>Login</span>
                            </a>
                        </div>
                    `;
                    header.insertAdjacentHTML('beforeend', loginHTML);
                }
            }
        });
    }

    logout() {
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        window.location.reload();
    }

    openModal(venueData) {
        this.currentVenue = venueData;
        this.currentStep = 1;
        
        // Reset booking data
        this.bookingData = {
            date: null,
            timeSlot: null,
            guests: null,
            phone: '',
            specialRequests: ''
        };
        
        // Update venue info
        document.getElementById('venueName').textContent = venueData.name;

        // Always show booking form (no auth required)
        document.getElementById('modalBody').classList.remove('hidden');
        document.getElementById('loginRequired').classList.add('hidden');
        document.querySelector('#bookingModal .border-b').classList.remove('hidden');
        document.querySelector('#bookingModal .sticky.bottom-0').classList.remove('hidden');

        // Show modal with animation
        const modal = document.getElementById('bookingModal');
        const sheet = document.getElementById('modalSheet');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
        
        // Animation based on screen size
        setTimeout(() => {
            // Mobile: slide up animation
            sheet.classList.remove('translate-y-full');
            // Desktop: scale and fade in
            sheet.classList.remove('lg:scale-95', 'lg:opacity-0');
            sheet.classList.add('lg:scale-100', 'lg:opacity-100');
        }, 10);
        
        // Show step 1
        this.updateStepUI();
    }

    closeModal() {
        const modal = document.getElementById('bookingModal');
        const sheet = document.getElementById('modalSheet');
        
        // Animation based on screen size
        // Mobile: slide down
        sheet.classList.add('translate-y-full');
        // Desktop: scale down and fade out
        sheet.classList.remove('lg:scale-100', 'lg:opacity-100');
        sheet.classList.add('lg:scale-95', 'lg:opacity-0');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
            
            // Reset to step 1
            this.currentStep = 1;
            this.updateStepUI();
        }, 300);
    }

    nextStep() {
        // Validate current step
        if (this.currentStep === 1) {
            if (!this.bookingData.date) {
                alert('Please select a date');
                return;
            }
            // Load availability for step 2
            this.loadAvailability();
        } else if (this.currentStep === 2) {
            if (!this.bookingData.timeSlot) {
                alert('Please select a time slot');
                return;
            }
            if (!this.bookingData.guests) {
                alert('Please select number of guests');
                return;
            }
            // Update summary in step 3
            this.updateSummary();
        }
        
        this.currentStep++;
        this.updateStepUI();
    }

    prevStep() {
        this.currentStep--;
        this.updateStepUI();
    }

    updateStepUI() {
        // Hide all steps
        document.getElementById('step1Content').classList.add('hidden');
        document.getElementById('step2Content').classList.add('hidden');
        document.getElementById('step3Content').classList.add('hidden');
        
        // Show current step
        document.getElementById(`step${this.currentStep}Content`).classList.remove('hidden');
        
        // Update step indicators
        for (let i = 1; i <= 3; i++) {
            const indicator = document.getElementById(`step${i}Indicator`);
            const label = document.getElementById(`step${i}Label`);
            const progress = document.getElementById(`progress${i}to${i+1}`);
            
            if (i < this.currentStep) {
                // Completed steps
                indicator.classList.remove('bg-slate-200', 'dark:bg-slate-700', 'text-slate-500');
                indicator.classList.add('bg-green-500', 'text-white');
                indicator.innerHTML = '<span class="material-symbols-outlined text-lg">check</span>';
                label?.classList.remove('text-slate-400');
                label?.classList.add('text-green-600', 'dark:text-green-400');
            } else if (i === this.currentStep) {
                // Current step
                indicator.classList.remove('bg-slate-200', 'dark:bg-slate-700', 'text-slate-500', 'bg-green-500');
                indicator.classList.add('bg-primary', 'text-white');
                indicator.textContent = i;
                label?.classList.remove('text-slate-400', 'text-green-600', 'dark:text-green-400');
                label?.classList.add('text-slate-700', 'dark:text-slate-300');
            } else {
                // Future steps
                indicator.classList.remove('bg-primary', 'bg-green-500', 'text-white');
                indicator.classList.add('bg-slate-200', 'dark:bg-slate-700', 'text-slate-500');
                indicator.textContent = i;
                label?.classList.remove('text-slate-700', 'dark:text-slate-300', 'text-green-600', 'dark:text-green-400');
                label?.classList.add('text-slate-400');
            }
            
            // Update progress lines
            if (progress && i < this.currentStep) {
                progress.classList.remove('bg-slate-200', 'dark:bg-slate-700');
                progress.classList.add('bg-green-500');
            } else if (progress) {
                progress.classList.remove('bg-green-500');
                progress.classList.add('bg-slate-200', 'dark:bg-slate-700');
            }
        }
        
        // Update buttons
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const confirmBtn = document.getElementById('confirmBookingBtn');
        
        if (this.currentStep === 1) {
            prevBtn.classList.add('hidden');
            nextBtn.classList.remove('hidden');
            confirmBtn.classList.add('hidden');
            nextBtn.disabled = false;
        } else if (this.currentStep === 2) {
            prevBtn.classList.remove('hidden');
            nextBtn.classList.remove('hidden');
            confirmBtn.classList.add('hidden');
            nextBtn.disabled = false;
        } else if (this.currentStep === 3) {
            prevBtn.classList.remove('hidden');
            nextBtn.classList.add('hidden');
            confirmBtn.classList.remove('hidden');
        }
    }

    updateSummary() {
        const dateObj = new Date(this.bookingData.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        document.getElementById('summaryDate').textContent = dateStr;
        document.getElementById('summaryTime').textContent = this.bookingData.timeSlot;
        document.getElementById('summaryGuests').textContent = `${this.bookingData.guests} ${parseInt(this.bookingData.guests) === 1 ? 'Guest' : 'Guests'}`;
    }

    async loadAvailability() {
        const date = this.bookingData.date;
        const timeSlotsGrid = document.getElementById('timeSlotsGrid');

        if (!this.currentVenueId || !date) {
            timeSlotsGrid.innerHTML = '<p class="text-sm text-slate-500 col-span-full text-center py-4">Please select a date first</p>';
            return;
        }

        timeSlotsGrid.innerHTML = '<p class="text-sm text-slate-500 col-span-full text-center py-4">Loading availability...</p>';

        try {
            const response = await fetch(`${API_URL}/availability/${this.currentVenueId}?date=${date}`);
            const data = await response.json();
            
            this.availableSlots = data.availability.filter(slot => slot.is_available && slot.available_slots > 0);

            if (this.availableSlots.length === 0) {
                timeSlotsGrid.innerHTML = '<p class="text-sm text-slate-500 col-span-full text-center py-4">No availability for this date</p>';
            } else {
                timeSlotsGrid.innerHTML = this.availableSlots.map(slot => 
                    `<button type="button" class="time-slot-btn px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all font-semibold text-sm" data-time="${slot.time_slot}">
                        ${slot.time_slot}
                        <span class="block text-xs text-slate-500 mt-1">${slot.available_slots} slots</span>
                    </button>`
                ).join('');
            }
        } catch (error) {
            console.error('Failed to load availability:', error);
            timeSlotsGrid.innerHTML = '<p class="text-sm text-red-500 col-span-full text-center py-4">Error loading availability</p>';
        }
    }

    closeSuccess() {
        const success = document.getElementById('bookingSuccess');
        success.classList.add('hidden');
        success.classList.remove('flex');
        document.body.style.overflow = '';
    }

    async submitBooking() {
        if (!this.currentVenueId) {
            alert('Venue information not available. Please contact admin.');
            return;
        }

        // Get contact details from form
        this.bookingData.name = document.getElementById('customerName').value;
        this.bookingData.email = document.getElementById('customerEmail').value;
        this.bookingData.phone = document.getElementById('customerPhone').value;
        this.bookingData.specialRequests = document.getElementById('specialRequests').value;

        // Validate required fields
        if (!this.bookingData.name) {
            alert('Please enter your name');
            return;
        }
        if (!this.bookingData.email) {
            alert('Please enter your email');
            return;
        }
        if (!this.bookingData.phone) {
            alert('Please enter your phone number');
            return;
        }

        // Prepare form data
        const formData = {
            venue_id: this.currentVenueId,
            booking_date: this.bookingData.date,
            booking_time: this.bookingData.timeSlot,
            num_guests: parseInt(this.bookingData.guests),
            customer_name: this.bookingData.name,
            customer_email: this.bookingData.email,
            customer_phone: this.bookingData.phone,
            special_requests: this.bookingData.specialRequests
        };

        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Add auth token if user is logged in
            if (this.userToken) {
                headers['Authorization'] = `Bearer ${this.userToken}`;
            }

            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Close booking modal
                this.closeModal();
                
                // Show success message
                const success = document.getElementById('bookingSuccess');
                success.classList.remove('hidden');
                success.classList.add('flex');
            } else {
                alert(data.error || 'Booking failed. Please try again.');
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to submit booking. Please try again.');
        }
    }
}

// Initialize booking system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.bookingSystem = new BookingSystem();
    });
} else {
    window.bookingSystem = new BookingSystem();
}
