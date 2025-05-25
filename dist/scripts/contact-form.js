/**
 * Contact Form Handler using EmailJS
 * Loads EmailJS configuration and contact info from contacts.json
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const contactMethods = document.getElementById('contact-methods');
    
    // Load configuration and initialize
    async function init() {
        try {
            // Show window title bar if the Components API is available
            if (window.Components && window.Components.showWindowTitleBar) {
                window.Components.showWindowTitleBar();
            }
            
            // Load config from JSON
            const response = await fetch('/data/contacts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const configData = await response.json();
            
            // Initialize EmailJS
            if (configData.emailjs?.public_key) {
                emailjs.init(configData.emailjs.public_key);
            } else {
                throw new Error('EmailJS public key not found in configuration');
            }
            
            // Initialize contact info
            if (configData.contact_info) {
                // Generate HTML for contact methods
                if (contactMethods) {
                    let html = '';
                    
                    for (const [key, info] of Object.entries(configData.contact_info)) {
                        const title = key.charAt(0).toUpperCase() + key.slice(1);
                        
                        html += `
                            <div class="contact-method">
                                <div class="method-icon ${key}-icon"></div>
                                <div class="method-details">
                                    <h4>${title}</h4>
                                    <p>${info.link 
                                        ? `<a href="${info.link}" ${key !== 'email' ? 'target="_blank"' : ''}>${info.value}</a>` 
                                        : info.value}
                                    </p>
                                </div>
                            </div>
                        `;
                    }
                    
                    contactMethods.innerHTML = html;
                }
            } else {
                throw new Error('Contact information not found in configuration');
            }
            
            // Set up contact form
            if (contactForm) {
                setupContactForm(configData.emailjs);
            }
            
            return configData;
        } catch (error) {
            console.error('Error initializing:', error);
            showMessage(error.message, 'error');
            
            if (contactMethods) {
                contactMethods.innerHTML = `
                    <div class="error-box">
                        Failed to load contact information
                    </div>
                `;
            }
            return null;
        }
    }
    
    // Set up contact form handlers
    function setupContactForm(emailjsConfig) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Show loading message
            showMessage('Sending message...', 'info');
            
            // Get form data
            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const subject = document.getElementById('subject')?.value || '';
            const message = document.getElementById('message')?.value || '';
            
            // Current time
            const timeString = new Date().toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            });
            
            // Create template parameters
            const templateParams = {
                name,
                email,
                subject,
                message,
                time: timeString,
                to_name: emailjsConfig.recipient_name || 'Recipient',
                reply_to: email,
                from_name: name
            };
            
            // Send email
            emailjs.send(emailjsConfig.service_id, emailjsConfig.template_id, templateParams)
                .then(function(response) {
                    console.log('Email sent successfully:', response);
                    showMessage('Your message has been sent successfully!', 'success');
                    contactForm.reset();
                })
                .catch(function(error) {
                    console.error('Email sending failed:', error);
                    showMessage('Failed to send message. Please try again later.', 'error');
                });
        });
    }
    
    /**
     * Show status message with Windows 95/98 styling
     * @param {string} message - Message to display
     * @param {string} type - Message type (success, error, info)
     */
    function showMessage(message, type) {
        if (!formStatus) return;
        
        // Set message and display
        formStatus.textContent = message;
        
        // Reset classes and add appropriate ones
        formStatus.className = 'form-status';
        formStatus.classList.add(type);
        formStatus.classList.add('form-status-visible');
        
        // Handle specific message types
        switch (type) {
            case 'success':
                // Auto-hide success message after 5 seconds
                setTimeout(() => formStatus.classList.remove('form-status-visible'), 5000);
                break;
                
            case 'error':
                // Disable form on error
                const submitButton = contactForm?.querySelector('button[type="submit"]');
                if (submitButton) submitButton.disabled = true;
                break;
        }
    }
    
    // Initialize everything
    init();
}); 