// Portfolio JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Preloader
    const preloader = document.querySelector('.preloader');
    const body = document.querySelector('body');

    // Prevent scrolling during loading
    body.style.overflow = 'hidden';

    // Remove preloader after content is loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.style.opacity = '0';

            setTimeout(() => {
                preloader.style.display = 'none';
                body.style.overflow = 'auto';

                // Animate hero elements after preloader is gone
                animateHeroElements();
            }, 300);
        }, 800); // Slight delay for a smoother experience
    });    // Hero elements animation
    function animateHeroElements() {
        const heroElements = document.querySelectorAll('.name-text, .typewriter, .hero-description, .cta-buttons');

        // Add specific animation for name text
        const nameText = document.querySelector('.name-text');
        if (nameText) {
            nameText.style.opacity = '0';
            nameText.style.transform = 'translateY(20px)';
            nameText.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            nameText.style.transitionDelay = '0.3s';

            setTimeout(() => {
                nameText.style.opacity = '1';
                nameText.style.transform = 'translateY(0)';
            }, 100);
        }

        // Animate other hero elements
        heroElements.forEach((el, index) => {
            if (!el.classList.contains('name-text')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                el.style.transitionDelay = index * 0.2 + 's';

                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 100);
            }
        });
    }

    // Navbar Scroll Effect
    const header = document.querySelector('header');
    const backToTopButton = document.querySelector('.back-to-top');

    window.addEventListener('scroll', () => {
        // Header scroll effect
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Back to top button visibility
        if (window.scrollY > 500) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }

        // Active navigation link
        const sections = document.querySelectorAll('section');
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // const sectionHeight = section.clientHeight;

            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        const navLinks = document.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });    // Close mobile menu when clicking a nav link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });

    // Simplified text rotation
    function initTextRotation() {
        const elements = document.getElementsByClassName('txt-rotate');
        for (let i = 0; i < elements.length; i++) {
            const toRotate = JSON.parse(elements[i].getAttribute('data-rotate'));
            const period = parseInt(elements[i].getAttribute('data-period'), 10) || 2000;
            if (toRotate) {
                let currentIndex = 0;
                elements[i].innerHTML = toRotate[0];

                setInterval(() => {
                    currentIndex = (currentIndex + 1) % toRotate.length;

                    // Fade out
                    elements[i].style.opacity = 0;
                    elements[i].style.transform = 'translateY(10px)';

                    // Change text and fade in after a delay
                    setTimeout(() => {
                        elements[i].innerHTML = toRotate[currentIndex];
                        elements[i].style.opacity = 1;
                        elements[i].style.transform = 'translateY(0)';
                    }, 500);

                }, period);

                // Add transition to the element
                elements[i].style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                elements[i].style.opacity = 1;
            }
        }
    }

    // Initialize text rotation
    initTextRotation();

    // Project Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(newActiveButton => {
        newActiveButton.addEventListener('click', () => {
            // Remove active class from all buttons
            const filterValue = newActiveButton.getAttribute('data-filter');
            let lastActiveButton = document.querySelector('.filter-btn.active');

            if (lastActiveButton.getAttribute('data-filter') === filterValue) {
                // If the clicked button is already active, do nothing
                return;
            }
            lastActiveButton.classList.remove('active');

            // Add active class to clicked button
            newActiveButton.classList.add('active');

            projectCards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';


            });

            setTimeout(() => {
                projectCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 10);


                    } else {
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 10);
                    }
                });
            }, 350);



            // projectCards.forEach(card => {
            //     if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
            //         card.style.display = 'block';
            //         setTimeout(() => {
            //             card.style.opacity = '1';
            //             card.style.transform = 'scale(1)';
            //         }, 10);
            //     } else {
            //         card.style.opacity = '0';
            //         card.style.transform = 'scale(0.8)';
            //         setTimeout(() => {
            //             card.style.display = 'none';
            //         }, 300);
            //     }
            // });
        });
    });    // Form Submission
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    const sendAnotherBtn = document.querySelector('.send-another-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Show loading state
            showLoadingState();

            try {
                // Prepare form data for Netlify
                const formData = new FormData(contactForm);

                // Submit to Netlify
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (response.ok) {
                    showSuccessMessage();
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showErrorMessage();
            }
        });
    }

    // Show another message button handler
    if (sendAnotherBtn) {
        sendAnotherBtn.addEventListener('click', () => {
            hideStatusMessage();
            contactForm.reset();
        });
    }

    function showLoadingState() {
        // Disable form
        submitBtn.disabled = true;
        contactForm.classList.add('form-submitting');

        // Update button state
        btnText.classList.add('hidden');
        btnIcon.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        submitBtn.classList.add('loading');

        // Hide any previous status messages
        formStatus.classList.add('hidden');
        formStatus.classList.remove('success', 'error');
    }

    function showSuccessMessage() {
        // Reset button state
        resetButtonState();

        // Hide form and show success message
        contactForm.style.display = 'none';

        // Update status message
        const statusTitle = formStatus.querySelector('.status-title');
        const statusText = formStatus.querySelector('.status-text');

        statusTitle.textContent = 'Message Sent Successfully!';
        statusText.textContent = 'Thank you for reaching out. I\'ll get back to you as soon as possible.';

        formStatus.classList.remove('hidden', 'error');
        formStatus.classList.add('success');

        // Scroll to status message
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function showErrorMessage() {
        // Reset button state
        resetButtonState();

        // Update status message
        const statusTitle = formStatus.querySelector('.status-title');
        const statusText = formStatus.querySelector('.status-text');

        statusTitle.textContent = 'Message Failed to Send';
        statusText.textContent = 'Sorry, there was an error sending your message. Please try again or contact me directly via email.';

        formStatus.classList.remove('hidden', 'success');
        formStatus.classList.add('error');

        // Scroll to status message
        formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function resetButtonState() {
        submitBtn.disabled = false;
        contactForm.classList.remove('form-submitting');

        btnText.classList.remove('hidden');
        btnIcon.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        submitBtn.classList.remove('loading');
    }

    function hideStatusMessage() {
        formStatus.classList.add('hidden');
        formStatus.classList.remove('success', 'error');
        contactForm.style.display = 'block';
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });    // Animation on scroll (reveal animations)
    const revealElements = document.querySelectorAll('.section-header, .about-content, .skills-category, .project-card, .contact-content');

    function checkReveal() {
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;

            if (elementTop < triggerBottom) {
                element.classList.add('revealed');
            }
        });
    }

    window.addEventListener('scroll', checkReveal);

    // Check for elements to reveal on initial load after a short delay
    setTimeout(checkReveal, 300);

    // Add a subtle parallax effect to the hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                heroSection.style.backgroundPositionY = -scrolled * 0.15 + 'px';
            }
        });
    }

    // Add scroll-triggered animations to skill items
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        item.style.transitionDelay = (index % 6) * 0.1 + 's';
    });

    function animateSkills() {
        const skillsSection = document.querySelector('#skills');
        if (skillsSection) {
            const sectionTop = skillsSection.getBoundingClientRect().top;
            const triggerBottom = window.innerHeight * 0.8;

            if (sectionTop < triggerBottom) {
                skillItems.forEach(item => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                });
                // Remove the event listener once animation is triggered
                window.removeEventListener('scroll', animateSkills);
            }
        }
    }

    window.addEventListener('scroll', animateSkills);
    setTimeout(animateSkills, 500); // Check on initial load after a short delay

    // Skills Tab Animation and Switching
    function initSkillsTabs() {
        const tabButtons = document.querySelectorAll('.skill-tab-btn');
        const tabContents = document.querySelectorAll('.skills-category');

        // Function to show a specific tab
        function showTab(tabId) {
            // Hide all tabs
            tabContents.forEach(content => {
                content.classList.remove('active');

                // Remove any existing animation classes
                content.classList.remove('tab-animation-in');
                content.querySelectorAll('.skill-item').forEach(item => {
                    item.style.animation = 'none';
                    item.offsetHeight; // Trigger reflow
                });
            });

            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to the selected button
            const activeButton = document.querySelector(`.skill-tab-btn[data-tab="${tabId}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }

            // Show the selected tab with animation
            const activeContent = document.querySelector(`.skills-category[data-tab-content="${tabId}"]`);
            if (activeContent) {
                // Add classes to trigger animations
                activeContent.classList.add('active');
                activeContent.classList.add('revealed');
                // Reset animation for skill items
                const skillItems = activeContent.querySelectorAll('.skill-item');
                skillItems.forEach(item => {
                    // Clear any existing inline styles from previous animations
                    item.removeAttribute('style');

                    // Let the CSS animations take over (defined in the CSS)
                    item.style.animationPlayState = 'running';
                });
            }
        }

        // Add click event listeners to tab buttons
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = button.getAttribute('data-tab');
                showTab(tabId);

                // Create ripple effect on button click
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                button.appendChild(ripple);

                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Show first tab by default
        if (tabButtons.length > 0) {
            const firstTabId = tabButtons[0].getAttribute('data-tab');
            showTab(firstTabId);
        }
    }
    // Initialize skills tabs
    initSkillsTabs();
});
