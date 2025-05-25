/**
 * Windows 95/98 Portfolio - Main JavaScript
 * Astro Version - Updated for Relative Paths
 */

// DOM helper functions
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => parent.querySelectorAll(selector);
const onEvent = (element, event, handler) => element?.addEventListener(event, handler);
const addClassWithReflow = (element, className) => {
    element?.classList.add(className);
    void element?.offsetWidth; // Force a reflow
};

// Get base path from meta tag
const getBasePath = () => document.querySelector('meta[name="base-path"]')?.getAttribute('content') || '';

// In Astro, page identifier is already set, but add this for compatibility
function setPageIdentifier() {
    const path = window.location.pathname;
    const basePath = getBasePath();
    // Remove base path from pathname to get actual page
    const pagePathRegex = new RegExp(`^${basePath}/?(.*)$`);
    const match = path.match(pagePathRegex);
    const pagePath = match ? match[1] : '';
    const pageName = pagePath.split('/').pop().split('.')[0] || 'index';
    if (!document.documentElement.getAttribute('data-page')) {
        document.documentElement.setAttribute('data-page', pageName);
    }
}

// Execute immediately to prevent any flash of unstyled content
setPageIdentifier();

function initializeWindowControls() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('window-close')) {
            if (isHomePage()) {
                alert('Thanks for visiting! (Window close simulated)');
            } else {
                animateToHomePage();
            }
        } else if (e.target.classList.contains('window-minimize')) {
            alert('Window minimized (simulated)');
        } else if (e.target.classList.contains('window-maximize')) {
            alert('Window maximized (simulated)');
        }
    });
}

// Updated for Astro path patterns
function isHomePage() {
    const path = window.location.pathname;
    const basePath = getBasePath();
    return path === basePath || 
           path === `${basePath}/` || 
           path === `${basePath}/index` || 
           path === `${basePath}/index.html`;
}

function updateCopyrightYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

function setupPageTransitions() {
    const portfolioWindow = document.querySelector('.portfolio-window');
    
    if (!portfolioWindow) {
        return;
    }
    
    // Add direct full-screen class immediately if on a content page
    if (!isHomePage()) {
        document.body.classList.add('content-page');
        portfolioWindow.classList.add('content-page-window');
    }
    
    if (isHomePage()) {
        setupHomePageTransitions(portfolioWindow);
    } else {
        setupContentPageTransitions(portfolioWindow);
    }
}

// Updated for Astro paths
function setupHomePageTransitions(portfolioWindow) {
    const basePath = getBasePath();
    // Find all internal links on home page
    document.querySelectorAll('.horizontal-nav a, .main-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http')) {
            // Add click handler to each internal link
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Set flag for showing titlebar on content page
                sessionStorage.setItem('navLinkClicked', 'true');
                
                // Reset any existing classes that might interfere
                portfolioWindow.classList.remove('zoom-from-fullscreen');
                
                // Force a reflow to ensure the animation works
                void portfolioWindow.offsetWidth;
                
                // Apply animation class
                portfolioWindow.classList.add('zoom-to-fullscreen');
                
                // Construct the correct URL
                const targetHref = href.startsWith('/') ? href.substring(1) : href;
                const fullUrl = `${window.location.origin}${basePath}/${targetHref}`;
                
                // Navigate after animation completes
                setTimeout(() => {
                    window.location.href = fullUrl;
                }, 500); // Match animation duration in CSS
            });
        }
    });
}

// Adjusted for Astro paths
function setupContentPageTransitions(portfolioWindow) {
    portfolioWindow.classList.add('content-page-window');
    
    const basePath = getBasePath();
    // Match home page links with Astro paths
    const homeLinks = document.querySelectorAll(`a[href="${basePath}/"], a[href="${basePath}/index"], a[href="${basePath}/index.html"], .page-nav-button[href="${basePath}/"], .page-nav-button[href="${basePath}/index"], .page-nav-button[href="${basePath}/index.html"]`);
    
    homeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.setItem('navLinkClicked', 'true');
            animateToHomePage();
        });
    });
    
    // Add flag for other internal links - adjusted for Astro paths
    const otherLinks = document.querySelectorAll(`a[href^="${basePath}/"]:not([href="${basePath}/"]):not([href="${basePath}/index"]):not([href="${basePath}/index.html"])`);
    
    otherLinks.forEach(link => {
        if (!link.classList.contains('page-nav-button')) {
            link.addEventListener('click', function() {
                sessionStorage.setItem('navLinkClicked', 'true');
            });
        }
    });
}

// Updated for Astro paths
function animateToHomePage() {
    const portfolioWindow = document.querySelector('.portfolio-window');
    const basePath = getBasePath();
    
    if (!portfolioWindow) {
        // If can't find the window element, just navigate directly
        window.location.href = `${basePath}/`;
        return;
    }
    
    // 1. Add classes for animation
    document.body.classList.add('returning-home');
    
    // Force remove any conflicting classes
    portfolioWindow.classList.remove('content-page-window');
    
    // Force a reflow to ensure animation will work
    void portfolioWindow.offsetWidth;
    
    // Add animation class
    portfolioWindow.classList.add('zoom-from-fullscreen');
    
    // 2. Make sure titlebar is visible during transition
    const titlebar = document.querySelector('.window-titlebar');
    if (titlebar) {
        titlebar.style.transform = 'translateY(0)';
        titlebar.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
        titlebar.style.pointerEvents = 'auto';
    }
    
    // 3. Wait for animation to complete before navigating
    setTimeout(() => {
        window.location.href = `${basePath}/`;
    }, 500); // Match the animation duration in CSS
}

// Initialize all functionality when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        if (window.Components && window.Components.initPageComponents) {
            await window.Components.initPageComponents();
        }
        
        initializeWindowControls();
        updateCopyrightYear();
        setupPageTransitions();
        
        // Call setupTitlebarTriggers if available - for Astro
        if (window.setupTitlebarTriggers) {
            window.setupTitlebarTriggers();
        }
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Make setupTitlebarTriggers globally accessible
window.setupTitlebarTriggers = setupTitlebarTriggers;

function setupTitlebarTriggers() {
    // Skip this on the home page
    if (isHomePage()) {
        return;
    }
    
    function showTitlebarImmediately() {
        const titlebar = document.querySelector('.window-titlebar');
        if (titlebar) {
            titlebar.style.transform = 'translateY(0)';
            titlebar.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
        }
    }
    
    function hideTitlebar() {
        const titlebar = document.querySelector('.window-titlebar');
        if (titlebar) {
            titlebar.style.transform = 'translateY(-100%)';
            titlebar.style.boxShadow = 'none';
        }
    }
    
    const contentArea = document.querySelector('.window-content');
    if (contentArea) {
        contentArea.addEventListener('mousemove', function(e) {
            const rect = contentArea.getBoundingClientRect();
            const distanceFromTop = e.clientY - rect.top;
            
            if (distanceFromTop < 40) {
                showTitlebarImmediately();
            } else {
                hideTitlebar();
            }
        });
        
        contentArea.addEventListener('click', function(e) {
            const rect = contentArea.getBoundingClientRect();
            const distanceFromTop = e.clientY - rect.top;
            
            if (distanceFromTop < 60) {
                showTitlebarImmediately();
            }
        });
    }
    
    document.addEventListener('mousemove', (e) => {
        if (e.clientY < 20) {
            showTitlebarImmediately();
        }
    });
    
    const isNavLinkClicked = sessionStorage.getItem('navLinkClicked') === 'true';
    
    if (!isNavLinkClicked) {
        setTimeout(() => {
            hideTitlebar();
        }, 1000);
    } else {
        sessionStorage.removeItem('navLinkClicked');
    }
    
    showTitlebarImmediately();
} 
