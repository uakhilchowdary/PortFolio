/**
 * Windows 95/98 Portfolio - Component System
 * Astro Version - Modified to work with Astro routing
 */

// Global cache for site configuration
let siteConfig = null;

// DOM element selection helper - use existing helpers if available
if (typeof $ === 'undefined') {
    window.$ = (selector, parent = document) => parent.querySelector(selector);
}
if (typeof $$ === 'undefined') {
    window.$$ = (selector, parent = document) => parent.querySelectorAll(selector);
}

function insertHTML(element, position, html) {
    if (!element) return;
    element.insertAdjacentHTML(position, html);
}

/**
 * Load the site configuration from config.json
 * In Astro version, we can also access this via import, but keeping this
 * method for compatibility with existing code.
 */
async function loadSiteConfig() {
    if (siteConfig) return siteConfig;
    
    try {
        // Get the base path from meta tag if available
        const basePath = document.querySelector('meta[name="base-path"]')?.getAttribute('content') || '';
        
        // Use relative path with ./ prefix for better compatibility
        const response = await fetch('./data/config.json');
        if (!response.ok) {
            throw new Error(`Failed to load config.json: ${response.status}`);
        }
        
        siteConfig = await response.json();
        return siteConfig;
    } catch (error) {
        console.error('Failed to load site configuration:', error);
        return {
            pages: {
                'index': {
                    pageName: "Portfolio",
                    statusText: "Welcome to my portfolio!",
                    activePage: "index"
                }
            }
        };
    }
}

/**
 * Create the content page navigation
 * @param {string} activePage - The currently active page
 */
function createMainNavigation(activePage) {
    if (activePage === 'index') return;
    
    const navigationLinks = [
        { name: "HOME", url: "/" },
        { name: "ABOUT", url: "/about" },
        { name: "EXPERIENCE", url: "/experience" },
        { name: "PROJECTS", url: "/projects" },
        { name: "BLOG", url: "/blogs" },
        { name: "CONTACT", url: "/contact" }
    ];
    
    const navigationHTML = `<div class="main-nav">${
        navigationLinks.map(link => {
            const isActivePage = link.url.includes(activePage) || 
                                (activePage === 'blogs' && link.url.includes('blog'));
            return `<a href="${link.url}" class="${isActivePage ? 'active-page' : ''}">${link.name}</a>`;
        }).join('')
    }</div>`;
    
    document.querySelectorAll('.content-area').forEach(contentArea => {
        const oldHomeLink = contentArea.querySelector('.corner-home-link');
        if (oldHomeLink) oldHomeLink.remove();
        
        const existingNav = contentArea.querySelector('.main-nav');
        if (existingNav) existingNav.remove();
        
        contentArea.insertAdjacentHTML('afterbegin', navigationHTML);
    });
}

/**
 * Setup content page fullscreen and transitions
 * @param {string} activePage - The currently active page
 */
function setupContentPageFullscreen(activePage) {
    if (activePage === "index") {
        document.body.classList.remove('content-page');
        const portfolioWindow = document.querySelector('.portfolio-window');
        if (portfolioWindow) {
            portfolioWindow.classList.remove('content-page-window');
        }
        return;
    }
    
    document.body.classList.add('content-page');
    
    const portfolioWindow = document.querySelector('.portfolio-window');
    if (!portfolioWindow) return;
    
    portfolioWindow.classList.add('content-page-window');
    portfolioWindow.style.transition = 'none';
    
    void portfolioWindow.offsetWidth;
    
    setTimeout(() => {
        portfolioWindow.style.transition = '';
        
        if (typeof setupTitlebarTriggers === 'function') {
            setupTitlebarTriggers();
        }
        
        if (sessionStorage.getItem('navLinkClicked') !== 'true') {
            const titlebar = document.querySelector('.window-titlebar');
            if (titlebar) {
                titlebar.style.transform = 'translateY(-100%)';
            }
        }
    }, 50);
}

/**
 * Get current page info from the URL
 */
async function getCurrentPageInfo() {
    try {
        const config = await loadSiteConfig();
        const path = window.location.pathname;
        const activePage = path.endsWith('/') ? 'index' : path.split('/').pop().split('.')[0];
        
        const pageConfig = config.pages[activePage] || config.pages['index'];
        return pageConfig;
    } catch (error) {
        console.error('Error getting page info:', error);
        return {
            pageName: "Portfolio",
            statusText: "Welcome to my portfolio!",
            activePage: "index"
        };
    }
}

/**
 * Initialize all page components
 * This is the main entry point for the components system
 */
async function initPageComponents() {
    try {
        // Get current page info
        const pageInfo = await getCurrentPageInfo();
        const { activePage } = pageInfo;
        
        // Setup content page fullscreen
        setupContentPageFullscreen(activePage);
        
        // Create main navigation (only for content pages)
        if (activePage !== 'index') {
            createMainNavigation(activePage);
        }
        
        return true;
    } catch (error) {
        console.error('Error initializing page components:', error);
        return false;
    }
}

/**
 * Force the window title bar to be visible
 * Used primarily by contact form initialization
 */
function showWindowTitleBar() {
    const titlebar = document.querySelector('.window-titlebar');
    if (titlebar) {
        titlebar.style.transform = 'translateY(0)';
        titlebar.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    }
}

// Export the Components API for use in other scripts
window.Components = {
    initPageComponents,
    showWindowTitleBar,
    getConfig: loadSiteConfig
};