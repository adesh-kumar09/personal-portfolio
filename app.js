$(function() { // Document Ready

    // --- Preloader ---
    $(window).on('load', function() {
        $('#preloader').fadeOut('slow', function() {
            $(this).remove();
        });
        // Trigger AOS animations after preloader is gone
        AOS.init({
            duration: 800, // Slightly faster duration
            easing: 'ease-in-out',
            once: true,
            mirror: false,
            anchorPlacement: 'top-bottom',
        });
    });

    // --- Navbar Shrink Function ---
    const navbar = document.body.querySelector('#mainNav');
    if (navbar) {
        const navbarShrink = () => {
            if (!navbar) return;
            // Add shrink class if not at top, remove if at top
            if (window.scrollY < 50) { // Shrink a bit later than 0
                navbar.classList.remove('navbar-shrink');
            } else {
                navbar.classList.add('navbar-shrink');
            }
        };
        // Initial check
        navbarShrink();
        // Listen for scroll events
        document.addEventListener('scroll', navbarShrink);

        // --- Navbar Active State ---
        // Get current page URL path
        const currentPath = window.location.pathname.split("/").pop() || 'index.html'; // Get filename or default to index.html
        $('.navbar-nav .nav-link').each(function() {
            const $this = $(this);
            // Get the filename from the href attribute
            let linkPath = $this.attr('href');
            // Handle cases where href might be undefined or empty
            if (linkPath) {
                linkPath = linkPath.split("/").pop();
                 // If linkPath is empty string (like href="/"), treat it as index.html
                if (linkPath === "") {
                    linkPath = 'index.html';
                }
            } else {
                linkPath = null; // Set to null if href is missing
            }


            // Remove existing active class from all links first
            $this.removeClass('active');
            $this.closest('.nav-item').removeClass('active'); // Also remove from parent li

            // Add active class if the link's href matches the current page filename
            if (linkPath && linkPath === currentPath) {
                $this.addClass('active');
                // Optional: Add active class to parent li if needed for styling
                $this.closest('.nav-item').addClass('active');
            }
        });

         // --- Collapse responsive navbar when toggler is visible and a link is clicked ---
        const navbarToggler = document.body.querySelector('.navbar-toggler');
        const responsiveNavItems = [].slice.call(
            document.querySelectorAll('#navbarResponsive .nav-link')
        );
        responsiveNavItems.map(function (responsiveNavItem) {
            responsiveNavItem.addEventListener('click', () => {
                if (window.getComputedStyle(navbarToggler).display !== 'none') {
                    // Check if the Bootstrap collapse instance exists before trying to hide
                    const collapseElement = document.getElementById('navbarResponsive');
                    const bsCollapse = bootstrap.Collapse.getInstance(collapseElement);
                    if (bsCollapse) {
                         bsCollapse.hide();
                    } else {
                        // Fallback if instance not found (less ideal)
                        navbarToggler.click();
                    }
                }
            });
        });
    } else {
        console.warn("Navbar element #mainNav not found.");
    }


    // --- Typed.js Initialization (for Home Page Hero) ---
    const typed = document.querySelector('.typed-text');
    if (typed) {
        let typed_strings = typed.getAttribute('data-typed-items');
        if (typed_strings) { // Check if attribute exists
            typed_strings = typed_strings.split(',');
            new Typed('.typed-text', {
                strings: typed_strings,
                loop: true,
                typeSpeed: 70, // Slightly faster
                backSpeed: 35, // Slightly faster
                backDelay: 2000
            });
        }
    }

    // --- Portfolio Page Filtering ---
    const filterButtons = $('.filter-button');
    const portfolioItems = $('.portfolio-item');

    if (filterButtons.length > 0 && portfolioItems.length > 0) {
        filterButtons.on('click', function(e) {
            e.preventDefault();
            const filterValue = $(this).data('filter');

            // Update active button state
            filterButtons.removeClass('active');
            $(this).addClass('active');

            portfolioItems.each(function() {
                const $item = $(this);
                const shouldShow = filterValue === 'all' || $item.hasClass('filter-' + filterValue);

                if (shouldShow) {
                    // Use a small delay to allow CSS transition to catch up if display was none
                    $item.removeClass('hide').css('display', 'block'); // Ensure display is block before animating
                    setTimeout(() => {
                        $item.css({'opacity': '1', 'transform': 'scale(1)'});
                    }, 10); // Minimal delay
                } else {
                    $item.addClass('hide');
                    // The 'hide' class in CSS handles the transition and eventual collapsing
                }
            });

             // Optional: Refresh AOS if elements change position significantly after filtering
             // setTimeout(() => { AOS.refresh(); }, 450); // Refresh after transition
        });
    }


    // --- Footer Current Year ---
    const currentYearSpan = $('#currentYear');
    if (currentYearSpan.length) {
        currentYearSpan.text(new Date().getFullYear());
    }


    // --- Contact Form Handling (Using Formspree Example) ---
    const contactForm = $('#contactForm');
    if (contactForm.length > 0 && contactForm.attr('action') && contactForm.attr('action').includes('formspree')) {
        contactForm.submit(function(event) {
            event.preventDefault(); // Prevent default submission

            const form = $(this);
            const submitButton = $('#submitButton');
            const successMessage = $('#submitSuccessMessage');
            const errorMessage = $('#submitErrorMessage');

            // Basic client-side validation check (Formspree does server-side)
            let isValid = true;
            form.find('[required]').each(function() {
                if (!$(this).val()) {
                    isValid = false;
                    // Optionally add visual feedback here
                    $(this).addClass('is-invalid'); // Example using Bootstrap's validation classes
                } else {
                    $(this).removeClass('is-invalid');
                }
            });

            if (!isValid) {
                 errorMessage.text('Please fill out all required fields.').removeClass('d-none'); // Update error message
                 // Re-enable button immediately if client validation fails
                 // submitButton.prop('disabled', false).text('Send Message');
                 return; // Stop submission
            }


            // Disable button and show loading state
            submitButton.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...');
            successMessage.addClass('d-none');
            errorMessage.addClass('d-none'); // Hide previous errors

            $.ajax({
                type: form.attr('method'),
                url: form.attr('action'),
                data: form.serialize(),
                dataType: 'json',
                accepts: 'application/json'
            })
            .done(function(response) {
                // Success
                successMessage.removeClass('d-none');
                submitButton.prop('disabled', false).text('Send Message'); // Re-enable button
                form.trigger("reset"); // Clear the form
                form.find('.is-invalid').removeClass('is-invalid'); // Clear validation classes
            })
            .fail(function(data) {
                // Error
                errorMessage.text('Error sending message! Please try again later.').removeClass('d-none'); // Generic error
                submitButton.prop('disabled', false).text('Send Message'); // Re-enable button
                console.error("Form submission error:", data);
            });
        });
    } else if (contactForm.length > 0) {
        console.warn("Contact form found, but action URL doesn't look like Formspree or is missing. Ensure your backend handling is set up.");
        // Add logic here if using SB Forms or a custom backend
    }

    // --- Dark Mode Toggle ---
    // const darkModeToggle = document.getElementById('darkModeToggle');
    // const darkModeIcon = document.getElementById('darkModeIcon');
    // const body = document.body;

    // Function to set mode and icon
    // function setMode(mode) {
    //     if (mode === 'dark') {
    //         body.classList.add('dark-mode');
    //         body.classList.remove('light-mode');
    //         darkModeIcon.classList.remove('fa-sun');
    //         darkModeIcon.classList.add('fa-moon');
    //     } else {
    //         body.classList.add('light-mode');
    //         body.classList.remove('dark-mode');
    //         darkModeIcon.classList.remove('fa-moon');
    //         darkModeIcon.classList.add('fa-sun');
    //     }
    //     localStorage.setItem('theme', mode);
    // }

    // On page load, set mode from localStorage or default to light
    // const savedTheme = localStorage.getItem('theme');
//     if (savedTheme === 'dark') {
//         setMode('dark');
//     } else {
//         setMode('light');
//     }

//     // Toggle on button click
//     if (darkModeToggle) {
//         darkModeToggle.addEventListener('click', () => {
//             if (body.classList.contains('dark-mode')) {
//                 setMode('light');
//             } else {
//                 setMode('dark');
//             }
//         });
//     }

 }); // End of $(function()
