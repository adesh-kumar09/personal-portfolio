$(function() { // Document Ready - jQuery wrapper

    // --- Preloader Logic ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        let windowLoaded = false;
        let preloaderHidden = false;

        // Check sessionStorage for navigation flag
        const wasNavigatingInternally = sessionStorage.getItem('portfolioPageNavigated');

        if (wasNavigatingInternally === 'true') {
            sessionStorage.removeItem('portfolioPageNavigated'); // Clear the flag
            // This is an internal navigation, ensure preloader is not shown
            if (preloader) {
                preloader.style.display = 'none'; // Force hide, no animation needed
                console.log("Internal navigation: Preloader forced display:none.");
            }
            preloaderHidden = true; // Mark as handled to prevent other logic from showing it
            
            // For internal navigation, initialize/refresh AOS as soon as possible after DOM is ready
            // Using a small timeout to ensure DOM has settled after navigation.
            setTimeout(() => {
                if (typeof AOS !== 'undefined') {
                    if (!document.body.classList.contains('aos-initialized')) {
                        AOS.init({
                            duration: 600, // Faster animation for navigation
                            easing: 'ease-out-quad', // Smooth easing
                            once: true,
                            mirror: false,
                            anchorPlacement: 'top-bottom'
                        });
                        console.log("AOS initialized for internal navigation.");
                    } else {
                        AOS.refreshHard(); // If already initialized, refresh for new elements
                        console.log("AOS refreshed for internal navigation.");
                    }
                }
            }, 0); // Execute as soon as possible after current script block
        }

        const hidePreloader = () => {
            if (!preloaderHidden) { // Check if not already handled
                if (preloader) {
                    preloader.classList.remove('show'); // Ensure show class is removed if it was added
                    preloader.classList.add('loaded'); // Start fade out
                    setTimeout(() => {
                        if (preloader) {
                            preloader.style.display = 'none'; // Remove from layout after transition
                        }
                    }, 350); // Match CSS transition (0.3s) + buffer
                }
                preloaderHidden = true; // Mark as handled

                // Initialize AOS after preloader is visually gone (for refresh/initial load)
                if (typeof AOS !== 'undefined' && !document.body.classList.contains('aos-initialized')) {
                    AOS.init({
                        duration: 800, // Standard duration for refresh/initial
                        easing: 'ease-in-out',
                        once: true,
                        mirror: false,
                        anchorPlacement: 'top-bottom'
                    });
                    console.log("AOS initialized after preloader (refresh/initial).");
                }
            }
        };

        // This event listener is primarily for refresh/initial load
        window.addEventListener('load', () => {
            windowLoaded = true;
            if (!wasNavigatingInternally) { // Only run hide logic if it's NOT internal navigation
                hidePreloader();
            } else {
                // For internal navigation, AOS initialization is handled when 'wasNavigatingInternally' is true.
                // We can mark preloader as hidden here as well if it wasn't already (though it should be).
                if (!preloaderHidden && preloader && preloader.style.display !== 'none') {
                     // This is a fallback, preloader should be display:none already
                    preloader.style.opacity = '0';
                    preloader.style.visibility = 'hidden';
                    setTimeout(() => { if (preloader) preloader.style.display = 'none'; }, 0);
                }
                preloaderHidden = true; // Ensure it's marked hidden
            }
            document.body.classList.add('page-loaded-no-transition'); // Class to signal page is ready
        });

        // This event listener is primarily for refresh/initial load
        document.addEventListener('DOMContentLoaded', () => {
            if (!wasNavigatingInternally) { // Show preloader logic for refresh or initial/external load
                setTimeout(() => {
                    if (!windowLoaded && preloader && !preloaderHidden) {
                        preloader.classList.add('show');
                        console.log("Preloader shown (Refresh/Initial/External) because window.load is pending.");
                    }
                }, 75); // Small delay
            } else {
                // Preloader is already set to display:none if wasNavigatingInternally.
                // AOS initialization is also handled in that block.
                if (preloader) { // Redundant check, but safe
                    preloader.style.display = 'none';
                }
            }
        });

        // Failsafe: For REFRESH or INITIAL LOAD - if preloader isn't hidden after 0.8s
        setTimeout(() => {
            if (!wasNavigatingInternally && !preloaderHidden) {
                console.warn('Preloader (Refresh/Initial) was force-hidden by failsafe timeout.');
                hidePreloader();
            }
        }, 800); // 0.8 seconds failsafe

        // Add event listeners to internal links to set the navigation flag
        document.querySelectorAll('a').forEach(link => {
            if (link.hostname === window.location.hostname &&
                !link.getAttribute('href').startsWith('#') &&
                (link.getAttribute('href').endsWith('.html') || !link.getAttribute('href').includes('.'))) {
                link.addEventListener('click', (e) => {
                    sessionStorage.setItem('portfolioPageNavigated', 'true');
                    // document.body.classList.add('page-is-exiting'); // Optional: For CSS exit animation
                });
            }
        });

    } else { // Fallback if preloader element doesn't exist
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof AOS !== 'undefined' && !document.body.classList.contains('aos-initialized')) {
                AOS.init({
                    duration: 800,
                    easing: 'ease-in-out',
                    once: true,
                    mirror: false,
                    anchorPlacement: 'top-bottom',
                });
            }
        });
    }


    // --- Navbar Shrink Function ---
    const navbar = document.body.querySelector('#mainNav');
    if (navbar) {
        const navbarShrink = () => {
            if (!navbar) return;
            if (window.scrollY < 50) {
                navbar.classList.remove('navbar-shrink');
            } else {
                navbar.classList.add('navbar-shrink');
            }
        };
        navbarShrink(); // Initial check
        document.addEventListener('scroll', navbarShrink);

        // Active Nav Link
        const currentPath = window.location.pathname.split("/").pop() || 'index.html';
        $('.navbar-nav .nav-link').each(function() {
            const $this = $(this);
            let linkPath = $this.attr('href');
            if (linkPath) {
                linkPath = linkPath.split("/").pop();
                if (linkPath === "") { // For root path like "domain.com/"
                    linkPath = 'index.html';
                }
            } else {
                linkPath = null;
            }
            $this.removeClass('active');
            $this.closest('.nav-item').removeClass('active'); // Also remove from parent li if needed
            if (linkPath && linkPath === currentPath) {
                $this.addClass('active');
                $this.closest('.nav-item').addClass('active');
            }
        });

        // Navbar Toggler for mobile - close on nav-link click
        const navbarToggler = document.body.querySelector('.navbar-toggler');
        const responsiveNavItems = [].slice.call(
            document.querySelectorAll('#navbarResponsive .nav-link')
        );
        responsiveNavItems.map(function (responsiveNavItem) {
            responsiveNavItem.addEventListener('click', () => {
                if (window.getComputedStyle(navbarToggler).display !== 'none') {
                    const collapseElement = document.getElementById('navbarResponsive');
                    // Check if Bootstrap Collapse instance exists
                    const bsCollapse = bootstrap.Collapse.getInstance(collapseElement);
                    if (bsCollapse) {
                         bsCollapse.hide(); // Use Bootstrap's hide method
                    } else {
                        // Fallback if instance not found (should not happen with Bootstrap 5)
                        navbarToggler.click(); 
                    }
                }
            });
        });
    } else {
        console.warn("Navbar element #mainNav not found.");
    }

    // --- Typed.js Initialization ---
    const typedElement = document.querySelector('.typed-text');
    if (typedElement) {
        let typed_strings = typedElement.getAttribute('data-typed-items');
        if (typed_strings) {
            typed_strings = typed_strings.split(',');
            new Typed('.typed-text', {
                strings: typed_strings,
                loop: true,
                typeSpeed: 70,
                backSpeed: 35,
                backDelay: 2000
            });
        }
    }

    // --- Portfolio Filter ---
    const filterButtons = $('.filter-button');
    const portfolioItems = $('.portfolio-item');

    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.on('click', function(e) {
            e.preventDefault();
            const filterValue = $(this).data('filter');

            filterButtons.removeClass('active');
            $(this).addClass('active');

            portfolioItems.each(function() {
                const $item = $(this);
                // const itemCategories = $item.attr('class').split(' ').filter(cls => cls.startsWith('filter-')); // Not strictly needed for this logic
                
                let shouldShow = false;
                if (filterValue === 'all') {
                    shouldShow = true;
                } else {
                    // Check if item has the current filter class
                    if ($item.hasClass('filter-' + filterValue)) {
                        shouldShow = true;
                    }
                }

                if (shouldShow) {
                    $item.removeClass('hide').css('display', 'block'); // Ensure it's block for layout
                    setTimeout(() => { // Timeout for CSS transition to take effect
                        $item.css({'opacity': '1', 'transform': 'scale(1)'});
                    }, 10); // Small delay
                } else {
                    $item.css({'opacity': '0', 'transform': 'scale(0.9)'});
                    setTimeout(() => { // Delay hiding to allow animation
                        $item.addClass('hide');
                    }, 400); // Match CSS transition duration
                }
            });
        });
    }


    // --- Current Year for Footer ---
    const currentYearSpan = $('#currentYear');
    if (currentYearSpan.length) {
        currentYearSpan.text(new Date().getFullYear());
    }

    // --- Contact Form Submission ---
    const contactForm = $('#contactForm');
    if (contactForm.length > 0) {
        const formAction = contactForm.attr('action');
        const isFormspreeForm = formAction && formAction.includes('formspree.io');

        contactForm.submit(function(event) {
            event.preventDefault(); // Prevent default browser submission
            const form = $(this);
            const submitButton = $('#submitButton');
            const successMessage = $('#submitSuccessMessage');
            const errorMessage = $('#submitErrorMessage');

            // Basic client-side validation
            let isValid = true;
            form.find('[required]').each(function() {
                if (!$(this).val()) {
                    isValid = false;
                    $(this).addClass('is-invalid'); // Bootstrap class for invalid input
                } else {
                    $(this).removeClass('is-invalid');
                }
            });

            if (!isValid) {
                 errorMessage.html('<div class="text-center text-danger mb-3 fw-bold">Please fill out all required fields.</div>').removeClass('d-none');
                 successMessage.addClass('d-none'); // Hide success message if it was visible
                 return; // Stop submission
            }

            // Disable button and show spinner
            submitButton.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...');
            successMessage.addClass('d-none'); // Hide previous messages
            errorMessage.addClass('d-none');

            if (isFormspreeForm && formAction !== "https://formspree.io/f/YOUR_FORMSPREE_ENDPOINT") {
                // Actual Formspree submission
                $.ajax({
                    type: form.attr('method'),
                    url: formAction,
                    data: form.serialize(),
                    dataType: 'json', // Expect JSON response from Formspree
                    accepts: 'application/json' // Tell Formspree we accept JSON
                })
                .done(function(response) {
                    // Formspree successful submission
                    successMessage.html(`
                        <div class="text-center mb-3 text-success">
                            <div class="fw-bolder">Message Sent Successfully!</div>
                            Thank you for reaching out. I'll be in touch soon.<br>
                            Alternatively, feel free to connect via the resources listed below.
                        </div>`).removeClass('d-none');
                    submitButton.prop('disabled', false).text('Send Message');
                    form.trigger("reset"); // Clear the form
                    form.find('.is-invalid').removeClass('is-invalid'); // Clear validation states
                })
                .fail(function(data) {
                    // This will handle actual Formspree errors or network issues
                    errorMessage.html(`
                        <div class="text-center text-danger mb-3 fw-bold">
                            Oops! Something went wrong and your message could not be sent.
                            <br>Please try one of the alternative contact methods below.
                        </div>`).removeClass('d-none');
                    submitButton.prop('disabled', false).text('Send Message');
                    console.error("Form submission error:", data);
                });
            } else {
                // This is a demo or Formspree URL is not correctly set
                // Simulate a "successful" frontend demo submission after a short delay
                setTimeout(function() {
                    successMessage.html(`
                        <div class="text-center mb-3 text-info">
                            <div class="fw-bolder">Message Submitted (Demo)!</div>
                            As a frontend developer, this form demonstrates client-side validation and submission handling.<br>
                            For actual inquiries, please use the contact methods listed below.
                        </div>`).removeClass('d-none');
                    submitButton.prop('disabled', false).text('Send Message');
                    form.trigger("reset");
                    form.find('.is-invalid').removeClass('is-invalid');
                }, 1000); // 1-second delay to simulate sending

                if (formAction === "https://formspree.io/f/YOUR_FORMSPREE_ENDPOINT") {
                     console.warn("Formspree endpoint is not set. Displaying demo message. Please replace 'YOUR_FORMSPREE_ENDPOINT' in contact.html.");
                } else if (!isFormspreeForm) {
                    console.warn("Contact form action URL doesn't look like Formspree. Displaying demo message. Ensure your backend handling is set up if this is not a demo.");
                }
            }
        });
    }

    // --- Back to Top Button ---
    const backToTopButton = document.querySelector('.back-to-top');

    if (backToTopButton) {
        const toggleBackToTop = () => {
            if (window.scrollY > 200) { // Show button after scrolling 200px
                backToTopButton.classList.add('active');
            } else {
                backToTopButton.classList.remove('active');
            }
        };

        window.addEventListener('load', toggleBackToTop); // Check on page load
        document.addEventListener('scroll', toggleBackToTop); // Check on scroll

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

 }); // End of $(function()
