/**
 * Multi-Step Form Handler with Exit Intent
 * For Concept In Concrete Landing Page
 */

(function() {
    'use strict';

    // ============================================
    // Configuration
    // ============================================
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // Replace with actual endpoint
    const EXIT_FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_EXIT_FORM_ID'; // Replace with actual endpoint

    // ============================================
    // Multi-Step Form Logic
    // ============================================

    let currentStep = 1;
    const totalSteps = 3;
    const formData = {};

    // DOM Elements
    const form = document.getElementById('flooring-form');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressPercentage = document.getElementById('progress-percentage');
    const serviceCards = document.querySelectorAll('.service-card');
    const serviceInput = document.getElementById('service-type');
    const serviceError = document.getElementById('service-error');
    const showNotesBtn = document.getElementById('show-notes');
    const notesField = document.getElementById('notes-field');

    /**
     * Update progress bar and text
     */
    function updateProgress() {
        const percentage = (currentStep / totalSteps) * 100;
        progressBar.style.width = percentage + '%';
        progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
        progressPercentage.textContent = Math.round(percentage) + '%';
    }

    /**
     * Show specific step
     */
    function showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        currentStep = stepNumber;
        updateProgress();

        // Scroll to form
        document.getElementById('form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /**
     * Validate Step 1 (Service Selection)
     */
    function validateStep1() {
        if (!serviceInput.value) {
            serviceError.classList.remove('hidden');
            return false;
        }
        serviceError.classList.add('hidden');
        return true;
    }

    /**
     * Validate Step 2 (Project Details)
     */
    function validateStep2() {
        const jobCity = document.getElementById('job-city');
        const facilitySize = document.getElementById('facility-size');
        const timeline = document.getElementById('timeline');

        if (!jobCity.value || !facilitySize.value || !timeline.value) {
            alert('Please fill in all required fields');
            return false;
        }

        return true;
    }

    /**
     * Validate Step 3 (Contact Info)
     */
    function validateStep3() {
        const firstName = document.getElementById('first-name');
        const lastName = document.getElementById('last-name');
        const email = document.getElementById('email');

        if (!firstName.value || !lastName.value || !email.value) {
            alert('Please fill in all required fields');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            alert('Please enter a valid email address');
            return false;
        }

        return true;
    }

    /**
     * Handle service card selection
     */
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            serviceCards.forEach(c => c.classList.remove('selected'));

            // Add selected class to clicked card
            this.classList.add('selected');

            // Set hidden input value
            const serviceType = this.getAttribute('data-service');
            serviceInput.value = serviceType;
            serviceError.classList.add('hidden');

            // Store in form data
            formData.service_type = serviceType;

            // Auto-advance to next step after short delay
            setTimeout(() => {
                if (validateStep1()) {
                    showStep(2);
                }
            }, 300);
        });
    });

    /**
     * Handle Back buttons
     */
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentStep > 1) {
                showStep(currentStep - 1);
            }
        });
    });

    /**
     * Handle Next buttons
     */
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', function() {
            let isValid = false;

            if (currentStep === 1) {
                isValid = validateStep1();
            } else if (currentStep === 2) {
                isValid = validateStep2();
            }

            if (isValid && currentStep < totalSteps) {
                showStep(currentStep + 1);
            }
        });
    });

    /**
     * Handle expandable notes field
     */
    if (showNotesBtn) {
        showNotesBtn.addEventListener('click', function() {
            notesField.classList.toggle('hidden');
            if (!notesField.classList.contains('hidden')) {
                document.getElementById('notes').focus();
            }
        });
    }

    /**
     * Capture UTM parameters and gclid from URL
     */
    function captureTrackingParams() {
        const urlParams = new URLSearchParams(window.location.search);

        const gclid = urlParams.get('gclid');
        const utmSource = urlParams.get('utm_source');
        const utmMedium = urlParams.get('utm_medium');
        const utmCampaign = urlParams.get('utm_campaign');

        if (gclid) document.getElementById('gclid').value = gclid;
        if (utmSource) document.getElementById('utm_source').value = utmSource;
        if (utmMedium) document.getElementById('utm_medium').value = utmMedium;
        if (utmCampaign) document.getElementById('utm_campaign').value = utmCampaign;
    }

    /**
     * Handle form submission
     */
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!validateStep3()) {
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        const submitText = document.getElementById('submit-text');
        const submitSpinner = document.getElementById('submit-spinner');

        // Show loading state
        submitText.classList.add('hidden');
        submitSpinner.classList.remove('hidden');
        submitBtn.disabled = true;

        // Gather all form data
        const formDataToSend = new FormData(form);

        // Submit to Formspree
        fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            body: formDataToSend,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Track conversion in GTM
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'form_submission',
                    'form_name': 'main_assessment_form',
                    'service_type': document.getElementById('service-type').value,
                    'facility_size': document.getElementById('facility-size').value,
                    'timeline': document.getElementById('timeline').value
                });

                // Get email for pre-filling on thank you page
                const email = document.getElementById('email').value;

                // Redirect to thank you page
                window.location.href = 'thank-you.html?email=' + encodeURIComponent(email);
            } else {
                throw new Error('Form submission failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);

            // Still redirect to thank you page even on error
            const email = document.getElementById('email').value;
            window.location.href = 'thank-you.html?email=' + encodeURIComponent(email);
        });
    });

    /**
     * Save form progress to localStorage
     */
    function saveFormProgress() {
        const formFields = form.querySelectorAll('input, select, textarea');
        const progress = {};

        formFields.forEach(field => {
            if (field.name && field.value) {
                progress[field.name] = field.value;
            }
        });

        localStorage.setItem('formProgress', JSON.stringify(progress));
    }

    /**
     * Restore form progress from localStorage
     */
    function restoreFormProgress() {
        const savedProgress = localStorage.getItem('formProgress');

        if (savedProgress) {
            try {
                const progress = JSON.parse(savedProgress);

                Object.keys(progress).forEach(name => {
                    const field = form.querySelector(`[name="${name}"]`);
                    if (field) {
                        field.value = progress[name];

                        // If service type is saved, update the card selection
                        if (name === 'service_type') {
                            const selectedCard = document.querySelector(`.service-card[data-service="${progress[name]}"]`);
                            if (selectedCard) {
                                selectedCard.classList.add('selected');
                            }
                        }
                    }
                });
            } catch (e) {
                console.error('Error restoring form progress:', e);
            }
        }
    }

    /**
     * Auto-save form progress on input change
     */
    form.addEventListener('input', saveFormProgress);

    // ============================================
    // Exit Intent Popup Logic
    // ============================================

    const exitPopup = document.getElementById('exit-popup');
    const closePopupBtn = document.getElementById('close-popup');
    const exitForm = document.getElementById('exit-form');
    let exitIntentShown = false;

    /**
     * Check if exit intent has been shown in this session
     */
    function hasShownExitIntent() {
        return sessionStorage.getItem('exitIntentShown') === 'true';
    }

    /**
     * Show exit intent popup
     */
    function showExitPopup() {
        if (!hasShownExitIntent() && !exitIntentShown) {
            exitPopup.classList.remove('hidden');
            exitIntentShown = true;
            sessionStorage.setItem('exitIntentShown', 'true');

            // Track in GTM
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'exit_intent_shown'
            });
        }
    }

    /**
     * Hide exit intent popup
     */
    function hideExitPopup() {
        exitPopup.classList.add('hidden');
    }

    /**
     * Detect mouse leaving viewport
     */
    document.addEventListener('mouseleave', function(e) {
        // Only trigger if mouse is leaving from the top
        if (e.clientY < 10) {
            showExitPopup();
        }
    });

    /**
     * Close popup on X button click
     */
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', hideExitPopup);
    }

    /**
     * Close popup when clicking outside
     */
    exitPopup.addEventListener('click', function(e) {
        if (e.target === exitPopup) {
            hideExitPopup();
        }
    });

    /**
     * Handle exit form submission
     */
    if (exitForm) {
        exitForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = document.getElementById('exit-email');
            const formData = new FormData(exitForm);

            // Add lead magnet identifier
            formData.append('lead_magnet', 'flooring_comparison_chart');

            fetch(EXIT_FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                // Track in GTM
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    'event': 'lead_magnet_signup',
                    'lead_magnet_name': 'flooring_comparison_chart'
                });

                // Show success message
                exitForm.innerHTML = '<div class="text-center py-6"><div class="text-5xl mb-4">✅</div><h3 class="text-xl font-bold text-gray-900 mb-2">Check Your Email!</h3><p class="text-gray-600">We\'ve sent you the Commercial Flooring Comparison Chart.</p></div>';

                // Close popup after delay
                setTimeout(hideExitPopup, 3000);
            })
            .catch(error => {
                console.error('Error:', error);

                // Still show success message
                exitForm.innerHTML = '<div class="text-center py-6"><div class="text-5xl mb-4">✅</div><h3 class="text-xl font-bold text-gray-900 mb-2">Check Your Email!</h3><p class="text-gray-600">We\'ve sent you the Commercial Flooring Comparison Chart.</p></div>';

                setTimeout(hideExitPopup, 3000);
            });
        });
    }

    // ============================================
    // Initialize
    // ============================================

    // Capture tracking parameters on page load
    captureTrackingParams();

    // Restore any saved form progress
    restoreFormProgress();

    // Clear saved progress on successful submission
    form.addEventListener('submit', function() {
        localStorage.removeItem('formProgress');
    });

    // Track page view
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'landing_page_view'
    });

})();
