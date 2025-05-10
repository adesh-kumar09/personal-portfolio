$(function() { // Document Ready

    // --- Preloader ---
    $(window).on('load', function() {
        $('#preloader').fadeOut('slow', function() {
            $(this).remove();
        });
        AOS.init({
            duration: 800,
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
            if (window.scrollY < 50) {
                navbar.classList.remove('navbar-shrink');
            } else {
                navbar.classList.add('navbar-shrink');
            }
        };
        navbarShrink();
        document.addEventListener('scroll', navbarShrink);

        const currentPath = window.location.pathname.split("/").pop() || 'index.html';
        $('.navbar-nav .nav-link').each(function() {
            const $this = $(this);
            let linkPath = $this.attr('href');
            if (linkPath) {
                linkPath = linkPath.split("/").pop();
                if (linkPath === "") {
                    linkPath = 'index.html';
                }
            } else {
                linkPath = null;
            }
            $this.removeClass('active');
            $this.closest('.nav-item').removeClass('active');
            if (linkPath && linkPath === currentPath) {
                $this.addClass('active');
                $this.closest('.nav-item').addClass('active');
            }
        });

        const navbarToggler = document.body.querySelector('.navbar-toggler');
        const responsiveNavItems = [].slice.call(
            document.querySelectorAll('#navbarResponsive .nav-link')
        );
        responsiveNavItems.map(function (responsiveNavItem) {
            responsiveNavItem.addEventListener('click', () => {
                if (window.getComputedStyle(navbarToggler).display !== 'none') {
                    const collapseElement = document.getElementById('navbarResponsive');
                    const bsCollapse = bootstrap.Collapse.getInstance(collapseElement);
                    if (bsCollapse) {
                         bsCollapse.hide();
                    } else {
                        navbarToggler.click();
                    }
                }
            });
        });
    } else {
        console.warn("Navbar element #mainNav not found.");
    }

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
                const shouldShow = filterValue === 'all' || $item.hasClass('filter-' + filterValue);
                if (shouldShow) {
                    $item.removeClass('hide').css('display', 'block');
                    setTimeout(() => {
                        $item.css({'opacity': '1', 'transform': 'scale(1)'});
                    }, 10);
                } else {
                    $item.addClass('hide');
                }
            });
        });
    }

    const currentYearSpan = $('#currentYear');
    if (currentYearSpan.length) {
        currentYearSpan.text(new Date().getFullYear());
    }

    const contactForm = $('#contactForm');
    if (contactForm.length > 0) {
        const formAction = contactForm.attr('action');
        const isFormspreeForm = formAction && formAction.includes('formspree.io');

        contactForm.submit(function(event) {
            event.preventDefault();
            const form = $(this);
            const submitButton = $('#submitButton');
            const successMessage = $('#submitSuccessMessage');
            const errorMessage = $('#submitErrorMessage');

            let isValid = true;
            form.find('[required]').each(function() {
                if (!$(this).val()) {
                    isValid = false;
                    $(this).addClass('is-invalid');
                } else {
                    $(this).removeClass('is-invalid');
                }
            });

            if (!isValid) {
                 errorMessage.html('<div class="text-center text-danger mb-3 fw-bold">Please fill out all required fields.</div>').removeClass('d-none');
                 successMessage.addClass('d-none'); // Hide success message if it was visible
                 return;
            }

            submitButton.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...');
            successMessage.addClass('d-none');
            errorMessage.addClass('d-none');

            if (isFormspreeForm && formAction !== "https://formspree.io/f/YOUR_FORMSPREE_ENDPOINT") {
                // Actual Formspree submission
                $.ajax({
                    type: form.attr('method'),
                    url: formAction,
                    data: form.serialize(),
                    dataType: 'json',
                    accepts: 'application/json'
                })
                .done(function(response) {
                    successMessage.html(`
                        <div class="text-center mb-3 text-success">
                            <div class="fw-bolder">Message Sent Successfully!</div>
                            Thank you for reaching out. I'll be in touch soon.<br>
                            Alternatively, feel free to connect via the resources listed below.
                        </div>`).removeClass('d-none');
                    submitButton.prop('disabled', false).text('Send Message');
                    form.trigger("reset");
                    form.find('.is-invalid').removeClass('is-invalid');
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
                        <div class="text-center mb-3 text-info"> {/* Changed to text-info for demo */}
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

 }); // End of $(function()
