/**
 * Home Loader
 * 
 * A simple script that loads the name and roles from config.json
 * and updates the homepage elements.
 */

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Show window title bar if the Components API is available
        if (window.Components && window.Components.showWindowTitleBar) {
            window.Components.showWindowTitleBar();
        }
        
        // Fetch config.json data
        const response = await fetch('./data/config.json');
        if (!response.ok) {
            throw new Error(`Failed to load config.json: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update name in the homepage heading
        const nameHeading = document.getElementById('profile-name');
        if (nameHeading) {
            const cursor = nameHeading.querySelector('.cursor');
            
            // Save the cursor element
            nameHeading.textContent = data.metadata.name;
            
            // Re-append the cursor after updating the text
            if (cursor) {
                nameHeading.appendChild(cursor);
            } else {
                // If cursor doesn't exist, create it
                const newCursor = document.createElement('span');
                newCursor.className = 'cursor';
                newCursor.textContent = '_';
                nameHeading.appendChild(newCursor);
            }
        }
        
        // Update roles rotation
        const roles = data.metadata.roles;
        if (roles && roles.length) {
            const roleText = document.getElementById('role-text');
            if (roleText) {
                roleText.textContent = roles[0];
                
                let roleIndex = 0;
                setInterval(() => {
                    roleIndex = (roleIndex + 1) % roles.length;
                    roleText.textContent = roles[roleIndex];
                }, 2000);
            }
        }
        
        // Update copyright text dynamically with current year
        const copyrightElement = document.querySelector('.copyright-footer');
        if (copyrightElement) {
            const currentYear = new Date().getFullYear();
            copyrightElement.textContent = `© Copyright ${currentYear} ${data.metadata.name}`;
        }
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}); 