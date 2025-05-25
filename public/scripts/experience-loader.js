/**
 * Experience Data Loader
 */

class ExperienceLoader {
    constructor() {
        // Get the base path from meta tag if available
        const basePath = document.querySelector('meta[name="base-path"]')?.getAttribute('content') || '';
        const origin = window.location.origin;
        
        // Use absolute paths from root
        this.jsonPath = `${origin}${basePath}/data/experience.json`;
        this.experienceData = null;
    }

    /**
     * Load experience data and render all sections
     */
    async init() {
        try {
            // Show window title bar if the Components API is available
            if (window.Components && window.Components.showWindowTitleBar) {
                window.Components.showWindowTitleBar();
            }
            
            // Load experience data using the full path
            const response = await fetch(this.jsonPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.experienceData = await response.json();
            
            // Render all sections
            this.renderProfessionalExperience();
            this.renderInternships();
            this.renderAchievements();
            
            return true;
        } catch (error) {
            console.error('Error loading or parsing data:', error);
            this.showError(`Failed to load experience data: ${error.message}`);
            return false;
        }
    }

    /**
     * Display error message
     */
    showError(message) {
        const errorContainer = document.createElement('div');
        errorContainer.id = 'error-message';
        errorContainer.innerHTML = `
            <div class="error-box">
                ${message}
                <p>Please make sure the file exists at: ${this.jsonPath}</p>
                <p>Remember that you need to be running a local server to avoid CORS issues.</p>
            </div>
        `;
        
        // Find the content area and insert error at the top
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.insertBefore(errorContainer, contentArea.firstChild);
        }
    }

    /**
     * Render professional experience from JSON data
     */
    renderProfessionalExperience() {
        // Use the explicit ID selector
        const container = document.getElementById('professional-experience');
        
        if (!container) {
            console.error('Professional experience container not found');
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Check if we have professional experience data
        if (!this.experienceData || !this.experienceData.professionalExperience || this.experienceData.professionalExperience.length === 0) {
            container.innerHTML = '<p>No professional experience found.</p>';
            return;
        }
        
        // Render each professional experience item
        this.experienceData.professionalExperience.forEach(exp => {
            const expItem = this.createExperienceItem(exp);
            container.appendChild(expItem);
        });
    }

    /**
     * Render internships from JSON data
     */
    renderInternships() {
        // Use the explicit ID selector
        const container = document.getElementById('internships');
        
        if (!container) {
            console.error('Internships container not found');
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Check if we have internship data
        if (!this.experienceData || !this.experienceData.internships || this.experienceData.internships.length === 0) {
            container.innerHTML = '<p>No internships found.</p>';
            return;
        }
        
        // Render each internship item
        this.experienceData.internships.forEach(internship => {
            const internshipItem = this.createExperienceItem(internship);
            container.appendChild(internshipItem);
        });
    }

    /**
     * Render achievements from JSON data
     */
    renderAchievements() {
        // Use the explicit ID selector
        const container = document.getElementById('achievements');
        
        if (!container) {
            console.error('Achievements container not found');
            return;
        }
        
        // Clear container
        container.innerHTML = '';
        
        // Check if we have achievement data
        if (!this.experienceData || !this.experienceData.achievements || this.experienceData.achievements.length === 0) {
            container.innerHTML = '<p>No achievements found.</p>';
            return;
        }
        
        // Render each achievement item
        this.experienceData.achievements.forEach(achievement => {
            const achievementItem = this.createAchievementItem(achievement);
            container.appendChild(achievementItem);
        });
    }

    /**
     * Create an experience item element from experience data
     */
    createExperienceItem(exp) {
        const experienceItem = document.createElement('div');
        experienceItem.className = 'experience-item';
        
        // Create header section
        const expHeader = document.createElement('div');
        expHeader.className = 'exp-header';
        
        const title = document.createElement('h3');
        title.textContent = exp.title;
        
        const companyDate = document.createElement('div');
        companyDate.className = 'company-date';
        
        const company = document.createElement('h4');
        company.textContent = exp.company;
        
        const date = document.createElement('span');
        date.className = 'date';
        date.textContent = exp.period;
        
        companyDate.appendChild(company);
        companyDate.appendChild(date);
        
        expHeader.appendChild(title);
        expHeader.appendChild(companyDate);
        
        // Create content section
        const expContent = document.createElement('div');
        expContent.className = 'exp-content';
        
        const responsibilitiesList = document.createElement('ul');
        
        if (exp.responsibilities && exp.responsibilities.length > 0) {
            exp.responsibilities.forEach(responsibility => {
                const item = document.createElement('li');
                item.textContent = responsibility;
                responsibilitiesList.appendChild(item);
            });
        }
        
        expContent.appendChild(responsibilitiesList);
        
        // Assemble the experience item
        experienceItem.appendChild(expHeader);
        experienceItem.appendChild(expContent);
        
        return experienceItem;
    }

    /**
     * Create an achievement item element from achievement data
     */
    createAchievementItem(achievement) {
        const achievementItem = document.createElement('div');
        achievementItem.className = 'achievement-item';
        
        // Create badge
        const badge = document.createElement('div');
        badge.className = 'achievement-badge';
        badge.textContent = achievement.badge;
        
        // Create details
        const details = document.createElement('div');
        details.className = 'achievement-details';
        
        const title = document.createElement('h4');
        title.textContent = achievement.title;
        
        const description = document.createElement('p');
        description.textContent = achievement.description;
        
        details.appendChild(title);
        details.appendChild(description);
        
        // Assemble the achievement item
        achievementItem.appendChild(badge);
        achievementItem.appendChild(details);
        
        return achievementItem;
    }
}

// Add a custom :contains selector
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Document.prototype.querySelector.toString().includes(':contains')) {
    // Define a new contains pseudo-selector
    document._querySelector = document.querySelector;
    document._querySelectorAll = document.querySelectorAll;
    
    Document.prototype.querySelector = function(selector) {
        if (selector.includes(':contains(')) {
            return findWithContains(this, selector, true);
        }
        return document._querySelector.call(this, selector);
    };

    Document.prototype.querySelectorAll = function(selector) {
        if (selector.includes(':contains(')) {
            return findWithContains(this, selector, false);
        }
        return document._querySelectorAll.call(this, selector);
    };
    
    function findWithContains(doc, selector, firstOnly) {
        const containsMatch = /:contains\((['"])(.*?)\1\)/.exec(selector);
        if (!containsMatch) return [];
        
        const textToMatch = containsMatch[2];
        const cleanSelector = selector.replace(/:contains\((['"])(.*?)\1\)/, '');
        
        const elements = doc._querySelectorAll.call(doc, cleanSelector);
        const result = [];
        
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].textContent.includes(textToMatch)) {
                if (firstOnly) return elements[i];
                result.push(elements[i]);
            }
        }
        
        return firstOnly ? null : result;
    }
}

// Initialize the experience loader when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const experienceLoader = new ExperienceLoader();
    experienceLoader.init();
}); 
