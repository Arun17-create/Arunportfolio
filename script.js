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

    // Hangman Game Logic
    const hangmanModal = document.getElementById('hangman-modal');
    const playBtn = document.querySelector('.play-game-btn');
    const gameInput = document.getElementById('game-input');
    const wordDisplay = document.getElementById('game-word-display');
    const statusMsg = document.getElementById('game-status-msg');
    const turnsDisplay = document.getElementById('game-turns');
    const guessedDisplay = document.getElementById('game-guessed');
    const asciiDisplay = document.getElementById('game-ascii');
    const restartBtn = document.getElementById('btn-restart');
    const controls = document.getElementById('game-controls');

    const words = ["computer", "laptop", "windows", "desktop","keyboard", "mouse", "monitor", "printer", "scanner", "speaker"];
    const asciiStates = [
        `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`,
        `  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
        `  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
        `  +---+
  |   |
      |
      |
      |
      |
=========`,
    ];

    let currentWord = "";
    let guesses = "";
    let turns = 3;
    let isGameOver = false;

    function initGame() {
        currentWord = words[Math.floor(Math.random() * words.length)];
        guesses = "";
        turns = 3;
        isGameOver = false;
        updateDisplay();
        statusMsg.textContent = "Guess the characters: ";
        controls.classList.add('hidden');
        gameInput.disabled = false;
        gameInput.value = "";
        gameInput.focus();
    }

    function updateDisplay() {
        let display = "";
        let failed = 0;
        for (const char of currentWord) {
            if (guesses.includes(char)) {
                display += char + " ";
            } else {
                display += "_ ";
                failed++;
            }
        }
        wordDisplay.textContent = display.trim();
        turnsDisplay.textContent = `Turns remaining: ${turns}`;
        guessedDisplay.textContent = `Guessed: ${guesses.split('').join(', ')}`;
        asciiDisplay.textContent = asciiStates[turns];

        if (failed === 0) {
            statusMsg.textContent = "YOU WIN! The word was: " + currentWord.toUpperCase();
            endGame();
        } else if (turns === 0) {
            statusMsg.textContent = "GAME OVER. The word was: " + currentWord.toUpperCase();
            endGame();
        }
    }

    function endGame() {
        isGameOver = true;
        gameInput.disabled = true;
        controls.classList.remove('hidden');
    }

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            hangmanModal.style.display = 'block';
            initGame();
        });
    }

    if (gameInput) {
        gameInput.addEventListener('input', (e) => {
            if (isGameOver) return;
            const val = e.target.value.toLowerCase();
            if (val && /^[a-z]$/.test(val)) {
                if (guesses.includes(val)) {
                    statusMsg.textContent = "You already guessed that letter!";
                } else {
                    guesses += val;
                    if (!currentWord.includes(val)) {
                        turns--;
                        statusMsg.textContent = "Wrong guess!";
                    } else {
                        statusMsg.textContent = "Good guess!";
                    }
                }
                updateDisplay();
            }
            e.target.value = "";
        });

        // Close modal logic
        const closeModals = document.querySelectorAll('.close-modal');
        closeModals.forEach(btn => {
            btn.addEventListener('click', () => {
                hangmanModal.style.display = 'none';
                modal.style.display = 'none';
            });
        });

        // Window click to close
        window.onclick = (event) => {
            if (event.target == hangmanModal) {
                hangmanModal.style.display = 'none';
            } else if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', initGame);
    }
});
