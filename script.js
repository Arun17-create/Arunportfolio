document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const messageInput = document.getElementById('message');

    // Create Toast Container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    function showToast(name, message) {
        const toast = document.createElement('div');
        toast.className = 'toast';

        // Truncate message for preview
        const preview = message.length > 100 ? message.substring(0, 100) + '...' : message;

        toast.innerHTML = `
            <div class="toast-header">
                <i class="fas fa-paper-plane"></i>
                <span>Message Sent Successfully</span>
            </div>
            <div class="toast-body">
                <div class="toast-user">From: ${name}</div>
                <div class="toast-content">${preview}</div>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                toast.remove();
            }, 500);
        }, 5000);
    }

    if (contactForm && messageInput) {
        // Handle "Enter" key in textarea
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('Enter pressed, submitting form...');

                // Use requestSubmit if available to trigger the 'submit' event correctly
                if (typeof contactForm.requestSubmit === 'function') {
                    contactForm.requestSubmit();
                } else {
                    contactForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
            }
        });

        // Handle form submission
        contactForm.addEventListener('submit', (e) => {
            // CRITICAL: Prevent the default form submission (reload)
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = messageInput.value;

            console.log('Submission attempt:', { name, email, message });

            if (name && email && message) {
                const submitBtn = contactForm.querySelector('.btn-send');
                const originalBtnText = submitBtn.textContent;

                // Show loading state
                submitBtn.disabled = true;
                submitBtn.textContent = 'SENDING...';

                // Send to Formspree
                fetch('https://formspree.io/f/mnjblrko', {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                    .then(response => {
                        if (response.ok) {
                            // Show custom toast notification
                            showToast(name, message);
                            // Clear the form
                            contactForm.reset();
                        } else {
                            response.json().then(data => {
                                if (Object.hasOwn(data, 'errors')) {
                                    alert(data["errors"].map(error => error["message"]).join(", "));
                                } else {
                                    alert("Oops! There was a problem submitting your form");
                                }
                            })
                        }
                    })
                    .catch(error => {
                        alert("Oops! There was a problem submitting your form");
                        console.error('Form error:', error);
                    })
                    .finally(() => {
                        // Reset button state
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    });
            } else {
                console.warn('Form validation failed: missing fields.');
            }
        });
    }

    // Modal functionality (based on HTML structure)
    const modal = document.getElementById('cert-modal');
    const modalImg = document.getElementById('modal-img');
    const captionText = document.getElementById('caption');
    const closeBtn = document.querySelector('.close-modal');

    document.querySelectorAll('.certificate-card img').forEach(img => {
        img.addEventListener('click', () => {
            modal.style.display = 'block';
            modalImg.src = img.src;
            captionText.innerHTML = img.alt;
        });
    });

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        }
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Mobile menu (based on HTML structure)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }
});
