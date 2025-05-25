/**
 * Projects Data Loader
 */

class ProjectsLoader {
    constructor() {
        // Get the base path from meta tag if available
        const basePath = document.querySelector('meta[name="base-path"]')?.getAttribute('content') || '';
        const origin = window.location.origin;
        
        // Use absolute paths from root
        this.jsonPath = `${origin}${basePath}/data/projects.json`;
        this.projectsData = null;
    }

    /**
     * Load projects data and render all sections
     */
    async init() {
        try {
            // Show window title bar if the Components API is available
            if (window.Components && window.Components.showWindowTitleBar) {
                window.Components.showWindowTitleBar();
            }
            
            // Load projects data using the full path
            const response = await fetch(this.jsonPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.projectsData = await response.json();
            
            // Render projects
            this.renderProjects();
            
            return true;
        } catch (error) {
            console.error('Error loading or parsing data:', error);
            this.showError(`Failed to load projects data: ${error.message}`);
            return false;
        }
    }

    /**
     * Display error message
     */
    showError(message) {
        const errorContainer = document.getElementById('error-message');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-box">
                    ${message}
                    <p>Please make sure the file exists at: ${this.jsonPath}</p>
                    <p>Remember that you need to be running a local server to avoid CORS issues.</p>
                </div>
            `;
        }
    }

    /**
     * Render projects from the JSON data
     */
    renderProjects() {
        const projectsContainer = document.getElementById('projects-container');
        
        if (!projectsContainer) {
            console.error('Projects container not found');
            return;
        }
        
        // Clear loading message
        projectsContainer.innerHTML = '';
        
        // Check if we have projects
        if (!this.projectsData || !this.projectsData.projects || this.projectsData.projects.length === 0) {
            projectsContainer.innerHTML = '<p>No projects found.</p>';
            return;
        }
        
        // Render each project
        this.projectsData.projects.forEach(project => {
            const projectCard = this.createProjectCard(project);
            projectsContainer.appendChild(projectCard);
        });
    }

    /**
     * Create a project card element from project data
     */
    createProjectCard(project) {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        // Title bar without icon
        const titleBar = document.createElement('div');
        titleBar.className = 'project-title-bar dynamic-title-bar';
        
        const title = document.createElement('h3');
        title.textContent = project.title;
        title.className = 'dynamic-title';
        titleBar.appendChild(title);
        
        // Add the title bar to the project card
        projectCard.appendChild(titleBar);
        
        // Only add screenshot container if a screenshot is specified
        if (project.screenshot) {
            // Thumbnail container with styled image
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.className = 'project-thumbnail-container dynamic-thumbnail-container';
            
            // Create inner container for the image
            const innerContainer = document.createElement('div');
            innerContainer.className = 'dynamic-inner-container';
            
            // Add screenshot image
            const img = document.createElement('img');
            img.src = project.screenshot;
            img.alt = `${project.title} screenshot`;
            img.className = 'dynamic-project-image';
            
            // Add error handling for images - completely remove container if image fails
            img.onerror = function() {
                console.error(`Failed to load image: ${project.screenshot}`);
                // Remove the entire thumbnail container from the project card
                if (thumbnailContainer.parentNode) {
                    thumbnailContainer.parentNode.removeChild(thumbnailContainer);
                }
            };
            
            innerContainer.appendChild(img);
            thumbnailContainer.appendChild(innerContainer);
            
            // Add the screenshot container to the project card
            projectCard.appendChild(thumbnailContainer);
        }
        
        // Description section
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'project-description';
        
        const descriptionText = document.createElement('p');
        descriptionText.textContent = project.description;
        
        // Tech stack tags
        const techStackDiv = document.createElement('div');
        techStackDiv.className = 'tech-stack';
        
        if (project.techStack && project.techStack.length > 0) {
            project.techStack.forEach(tech => {
                const techTag = document.createElement('span');
                techTag.className = 'tech-tag';
                techTag.textContent = tech;
                techStackDiv.appendChild(techTag);
            });
        }
        
        // Project links
        const linksDiv = document.createElement('div');
        linksDiv.className = 'project-links';
        
        if (project.links) {
            for (const [linkType, linkUrl] of Object.entries(project.links)) {
                // Create a link button for any link that exists in the JSON
                const linkButton = document.createElement('a');
                linkButton.href = linkUrl;
                linkButton.className = 'link-button';
                linkButton.textContent = linkType;
                linksDiv.appendChild(linkButton);
            }
        }
        
        // Assemble the description section
        descriptionDiv.appendChild(descriptionText);
        descriptionDiv.appendChild(techStackDiv);
        descriptionDiv.appendChild(linksDiv);
        
        // Add the description section
        projectCard.appendChild(descriptionDiv);
        
        return projectCard;
    }
}

// Initialize the projects loader when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const projectsLoader = new ProjectsLoader();
    projectsLoader.init();
}); 
