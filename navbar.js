// Responsive Navbar Component
class ResponsiveNavbar {
    constructor() {
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        this.createNavbar();
        this.attachEventListeners();
        this.updateUserMenu();
    }

    createNavbar() {
        // Check if navbar already exists
        if (document.querySelector('#azureNavbar')) return;

        const navbarHTML = `
        <nav id="azureNavbar" class="sticky top-0 z-50 bg-white/95 dark:bg-card-dark/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16 sm:h-20">
                    <!-- Logo/Brand -->
                    <div class="flex items-center gap-3 sm:gap-5">
                        <a href="index.html" class="flex items-center gap-3 text-slate-900 dark:text-white hover:opacity-80 transition-opacity">
                            <div class="size-8 sm:size-10 text-primary flex items-center justify-center">
                                <span class="material-symbols-outlined text-3xl sm:text-4xl">diamond</span>
                            </div>
                            <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight tracking-tight hidden xs:block">Azure Hotel</h1>
                        </a>
                    </div>

                    <!-- Desktop Navigation -->
                    <div class="hidden lg:flex items-center gap-1">
                        <a href="index.html" class="nav-link px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[20px]">home</span>
                                Home
                            </span>
                        </a>
                        <a href="nightlife.html" class="nav-link px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[20px]">nightlife</span>
                                Nightlife
                            </span>
                        </a>
                        <a href="restaurants.html" class="nav-link px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[20px]">restaurant</span>
                                Restaurants
                            </span>
                        </a>
                        <a href="taverns.html" class="nav-link px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[20px]">liquor</span>
                                Taverns
                            </span>
                        </a>
                        <a href="facilities.html" class="nav-link px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                            <span class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-[20px]">spa</span>
                                Facilities
                            </span>
                        </a>
                    </div>

                    <!-- Right Section -->
                    <div class="flex items-center gap-2 sm:gap-3">
                        <!-- User Menu Placeholder -->
                        <div id="navUserMenu" class="flex items-center gap-2"></div>

                        <!-- Mobile Menu Button -->
                        <button id="mobileMenuBtn" class="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            <span class="material-symbols-outlined text-slate-700 dark:text-slate-300">menu</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div id="mobileMenu" class="hidden lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark">
                <div class="px-4 py-4 space-y-1">
                    <a href="index.html" class="mobile-nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                        <span class="material-symbols-outlined text-[24px]">home</span>
                        Home
                    </a>
                    <a href="nightlife.html" class="mobile-nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                        <span class="material-symbols-outlined text-[24px]">nightlife</span>
                        Nightlife
                    </a>
                    <a href="restaurants.html" class="mobile-nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                        <span class="material-symbols-outlined text-[24px]">restaurant</span>
                        Restaurants
                    </a>
                    <a href="taverns.html" class="mobile-nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                        <span class="material-symbols-outlined text-[24px]">liquor</span>
                        Taverns
                    </a>
                    <a href="facilities.html" class="mobile-nav-link flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                        <span class="material-symbols-outlined text-[24px]">spa</span>
                        Facilities
                    </a>
                    
                    <!-- Mobile User Actions -->
                    <div id="mobileUserMenu" class="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800"></div>
                </div>
            </div>
        </nav>
        `;

        // Insert navbar at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
        
        // Set active link
        this.setActiveLink();
    }

    attachEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                this.mobileMenuOpen = !this.mobileMenuOpen;
                
                if (this.mobileMenuOpen) {
                    mobileMenu.classList.remove('hidden');
                    mobileMenuBtn.querySelector('.material-symbols-outlined').textContent = 'close';
                } else {
                    mobileMenu.classList.add('hidden');
                    mobileMenuBtn.querySelector('.material-symbols-outlined').textContent = 'menu';
                }
            });
        }

        // Close mobile menu on link click
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close mobile menu on window resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                this.closeMobileMenu();
            }
        });
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (mobileMenu && mobileMenuBtn) {
            mobileMenu.classList.add('hidden');
            mobileMenuBtn.querySelector('.material-symbols-outlined').textContent = 'menu';
            this.mobileMenuOpen = false;
        }
    }

    setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Set active for desktop nav
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('bg-primary/10', 'text-primary');
            }
        });

        // Set active for mobile nav
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('bg-primary/10', 'text-primary');
            }
        });
    }

    updateUserMenu() {
        const userToken = localStorage.getItem('userToken');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        const navUserMenu = document.getElementById('navUserMenu');
        const mobileUserMenu = document.getElementById('mobileUserMenu');
        
        if (!navUserMenu) return;

        if (user && userToken) {
            // Logged in user menu
            const userMenuHTML = `
                <span class="hidden md:inline text-sm text-slate-600 dark:text-slate-400">Welcome, ${user.name.split(' ')[0]}</span>
                <a href="profile.html" class="flex items-center gap-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all">
                    <span class="material-symbols-outlined text-[18px]">person</span>
                    <span class="hidden sm:inline">Profile</span>
                </a>
                <button onclick="window.azureNavbar.logout()" class="flex items-center gap-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all">
                    <span class="material-symbols-outlined text-[18px]">logout</span>
                    <span class="hidden sm:inline">Logout</span>
                </button>
            `;
            
            navUserMenu.innerHTML = userMenuHTML;
            
            // Mobile user menu
            if (mobileUserMenu) {
                mobileUserMenu.innerHTML = `
                    <div class="text-sm text-slate-600 dark:text-slate-400 mb-3 px-4">Signed in as <strong>${user.name}</strong></div>
                    <a href="profile.html" class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold">
                        <span class="material-symbols-outlined text-[24px]">person</span>
                        My Profile
                    </a>
                    <button onclick="window.azureNavbar.logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all font-semibold text-left">
                        <span class="material-symbols-outlined text-[24px]">logout</span>
                        Logout
                    </button>
                `;
            }
        } else {
            // Guest menu
            const guestMenuHTML = `
                <a href="login.html" class="flex items-center gap-1 px-3 sm:px-4 py-2 bg-primary text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-primary/90 transition-all">
                    <span class="material-symbols-outlined text-[18px]">login</span>
                    <span>Login</span>
                </a>
            `;
            
            navUserMenu.innerHTML = guestMenuHTML;
            
            // Mobile guest menu
            if (mobileUserMenu) {
                mobileUserMenu.innerHTML = `
                    <a href="login.html" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all font-semibold justify-center">
                        <span class="material-symbols-outlined text-[24px]">login</span>
                        Login / Register
                    </a>
                `;
            }
        }
    }

    logout() {
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// Initialize navbar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.azureNavbar = new ResponsiveNavbar();
    });
} else {
    window.azureNavbar = new ResponsiveNavbar();
}
