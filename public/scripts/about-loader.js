/**
 * Simple Profile Data Loader
 */

class ProfileLoader {
    constructor() {
        // Get the base path from meta tag if available
        const basePath = document.querySelector('meta[name="base-path"]')?.getAttribute('content') || '';
        const origin = window.location.origin;
        
        // Use absolute paths from root
        this.jsonPath = `${origin}${basePath}/data/about.json`;
        this.configPath = `${origin}${basePath}/data/config.json`;
        this.profileData = null;
        this.configData = null;
    }

    /**
     * Load profile data and render all sections
     */
    async init() {
        try {
            // Show window title bar if the Components API is available
            if (window.Components && window.Components.showWindowTitleBar) {
                window.Components.showWindowTitleBar();
            }
            
            // Load profile data
            console.log('Loading profile data from:', this.jsonPath);
            const profileResponse = await fetch(this.jsonPath);
            
            if (!profileResponse.ok) {
                throw new Error(`HTTP error! Status: ${profileResponse.status}`);
            }
            
            this.profileData = await profileResponse.json();
            console.log('Profile data loaded successfully');
            
            // Load config data
            console.log('Loading config data from:', this.configPath);
            const configResponse = await fetch(this.configPath);
            
            if (!configResponse.ok) {
                throw new Error(`HTTP error! Status: ${configResponse.status}`);
            }
            
            this.configData = await configResponse.json();
            console.log('Config data loaded successfully');
            
            // Render all sections
            this.renderAllSections();
            return true;
        } catch (error) {
            console.error('Error loading or parsing data:', error);
            this.showError(`Failed to load data: ${error.message}`);
            return false;
        }
    }

    /**
     * Display an error message on the page
     */
    showError(message) {
        const errorContainer = document.getElementById('error-message');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-box">
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * Render all profile sections
     */
    renderAllSections() {
        this.renderAbout();
        this.renderEducation();
        this.renderCertifications();
        this.renderSkills();
        this.initProfilePicture();
        this.addResumeLink();
    }

    /**
     * Render the About section
     */
    renderAbout() {
        if (!this.profileData?.about) return;
        
        const about = this.profileData.about;
        const aboutText = document.getElementById('about-text');
        
        if (aboutText) {
            aboutText.innerHTML = `
                <p>${about.summary || ''}</p>
                <p>${about.specialization || ''}</p>
                <p>${about.portfolio_description || ''}</p>
                <p>${about.journey || ''}</p>
            `;
        }
    }

    /**
     * Render the Education section
     */
    renderEducation() {
        const education = this.profileData?.education || [];
        const container = document.getElementById('education-container');
        
        if (!container) return;
        
        if (education.length === 0) {
            container.innerHTML = '<p>No education information available.</p>';
            return;
        }
        
        const html = education.map(edu => `
            <div class="education-item">
                <div class="education-details">
                    <h4>${edu.degree || 'Degree'}</h4>
                    <div class="education-meta">
                        <span class="institution">${edu.institution || 'Institution'}</span>
                        <span class="education-date">${edu.from || ''} - ${edu.to || 'Present'}</span>
                    </div>
                    <p>${edu.description || ''}</p>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }

    /**
     * Render the Certifications section
     */
    renderCertifications() {
        const certifications = this.profileData?.certifications || [];
        const container = document.getElementById('certifications-container');
        
        if (!container) return;
        
        if (certifications.length === 0) {
            container.innerHTML = '<p>No certification information available.</p>';
            return;
        }
        
        const html = certifications.map(cert => `            <div class="certification-item">
                <div class="certification-logo"></div>
                <div class="certification-details">
                    <h4>${cert.title || 'Certification'}</h4>
                    <p>Issued: ${cert.issued || 'N/A'} - Expires: ${cert.expires || 'N/A'}</p>
                    ${cert.link ? `<p><a href="${cert.link}" target="_blank">View Certificate</a></p>` : ''}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }

    /**
     * Render the Skills section
     */
    renderSkills() {
        const skills = this.profileData?.skills || {};
        const container = document.getElementById('skills-container');
        
        if (!container) return;
        
        if (Object.keys(skills).length === 0) {
            container.innerHTML = '<p>No skills information available.</p>';
            return;
        }
        
        const html = Object.entries(skills).map(([category, skillList]) => {
            if (!skillList || skillList.length === 0) return '';
            
            return `
                <div class="skill-category">
                    <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <ul>
                        ${skillList.map(skill => `<li>${skill}</li>`).join('')}
                    </ul>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html || '<p>No skills information available.</p>';
    }

    /**
     * Initialize the profile picture
     */
    initProfilePicture() {
        if (!this.profileData?.profile?.picture) return;
        
        const container = document.querySelector('.profile-picture-container');
        if (!container) {
            return;
        }
        
        // Clear the container completely
        container.innerHTML = '';
        
        // Apply classes instead of inline styles
        container.className = 'profile-picture-container dynamic-profile-container';
        
        // Create an inner container for consistent symmetry
        const innerContainer = document.createElement('div');
        innerContainer.className = 'dynamic-profile-inner';
        
        // Add actual image inside inner container
        const img = document.createElement('img');
        img.src = this.profileData.profile.picture;
        img.alt = `${this.configData?.metadata?.name || 'Profile'} picture`;
        img.className = 'dynamic-profile-image';
        
        // Add the image to the inner container
        innerContainer.appendChild(img);
        
        // Add the inner container to the main container
        container.appendChild(innerContainer);
    }

    /**
     * Add resume download link
     */
    addResumeLink() {
        if (!this.profileData?.profile?.resume) return;
        
        const container = document.querySelector('.about-grid');
        if (!container) return;
        
        const resumeLink = document.createElement('div');
        resumeLink.className = 'resume-link';
        resumeLink.innerHTML = `
            <a href="${this.profileData.profile.resume}" download class="download-resume">
                <span>Download Resume</span>
            </a>
        `;
        container.appendChild(resumeLink);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing profile loader');
    
    // Don't initialize components here - main.js already does this
    // and calling it twice causes the animation issues
    
    // Load and render profile data
    const loader = new ProfileLoader();
    await loader.init();
});

