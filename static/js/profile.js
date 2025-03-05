        // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true,
            mirror: false
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
                navbar.style.backgroundColor = 'rgba(44, 62, 80, 1)';
            } else {
                navbar.classList.remove('scrolled');
                navbar.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
            }
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const hero = document.querySelector('.hero');
            const scrollPosition = window.pageYOffset;
            hero.style.backgroundPositionY = scrollPosition * 0.7 + 'px';
        });

        // Lazy loading images
        document.addEventListener("DOMContentLoaded", function() {
            var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

            if ("IntersectionObserver" in window) {
                let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            let lazyImage = entry.target;
                            lazyImage.src = lazyImage.dataset.src;
                            lazyImage.classList.remove("lazy");
                            lazyImageObserver.unobserve(lazyImage);
                        }
                    });
                });

                lazyImages.forEach(function(lazyImage) {
                    lazyImageObserver.observe(lazyImage);
                });
            }
        });

         // New JavaScript code for the advanced profile dropdown
         document.addEventListener('DOMContentLoaded', function() {
            const profileIcon = document.getElementById('profileIcon');
            const profileMenu = document.getElementById('profileMenu');
            const darkModeToggle = document.getElementById('darkModeToggle');
            let isDarkMode = false;

            function toggleMenu() {
                profileMenu.classList.toggle('show');
                if (profileMenu.classList.contains('show')) {
                    profileIcon.classList.add('pulse');
                    animateMenuItems();
                    adjustMenuPosition();
                } else {
                    profileIcon.classList.remove('pulse');
                }
            }

            function animateMenuItems() {
                const menuItems = document.querySelectorAll('.menu-item');
                gsap.fromTo(menuItems, 
                    {opacity: 0, x: 20},
                    {opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out"}
                );
            }

            const popperInstance = Popper.createPopper(profileIcon, profileMenu, {
                placement: 'bottom-end',
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 10],
                        },
                    },
                ],
            });

            profileIcon.addEventListener('click', function(event) {
                event.stopPropagation();
                toggleMenu();
                popperInstance.update();
            });

            document.addEventListener('click', function(event) {
                if (!profileMenu.contains(event.target) && !profileIcon.contains(event.target)) {
                    profileMenu.classList.remove('show');
                    profileIcon.classList.remove('pulse');
                }
            });

            // Keyboard accessibility
            profileIcon.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggleMenu();
                    popperInstance.update();
                }
            });

            profileMenu.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    profileMenu.classList.remove('show');
                    profileIcon.classList.remove('pulse');
                    profileIcon.focus();
                }
            });

            // Focus trap
            const focusableElements = profileMenu.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstFocusableElement = focusableElements[0];
            const lastFocusableElement = focusableElements[focusableElements.length - 1];

            profileMenu.addEventListener('keydown', function(event) {
                if (event.key === 'Tab') {
                    if (event.shiftKey) {
                        if (document.activeElement === firstFocusableElement) {
                            event.preventDefault();
                            lastFocusableElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastFocusableElement) {
                            event.preventDefault();
                            firstFocusableElement.focus();
                        }
                    }
                }
            });

            // Hover effect for menu items
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    gsap.to(item, {x: 5, duration: 0.2, ease: "power2.out"});
                });
                item.addEventListener('mouseleave', () => {
                    gsap.to(item, {x: 0, duration: 0.2, ease: "power2.out"});
                });
            });

            // Dark mode toggle
            darkModeToggle.addEventListener('click', function(event) {
                event.preventDefault();
                isDarkMode = !isDarkMode;
                document.body.classList.toggle('dark-mode');
                this.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode';
            });
        });

function adjustMenuPosition() {
    const menuRect = profileMenu.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    if (menuRect.bottom > viewportHeight) {
        const overflowY = menuRect.bottom - viewportHeight;
        profileMenu.style.top = `calc(100% - ${overflowY}px)`;
    } else {
        profileMenu.style.top = '100%';
    }
}
 // Initialize AOS
 AOS.init();

// Back to top button
const backToTopButton = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

backToTopButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Newsletter subscription
const subscribeButton = document.getElementById('button-addon2');
const emailInput = document.querySelector('.form-control');

subscribeButton.addEventListener('click', () => {
    if (emailInput.value.trim() !== '' && isValidEmail(emailInput.value)) {
        alert('Thank you for subscribing!');
        emailInput.value = '';
    } else {
        alert('Please enter a valid email address.');
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Smooth scroll for footer links
document.querySelectorAll('.footer-links a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});