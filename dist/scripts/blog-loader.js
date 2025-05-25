/**
 * Blog Loader
 * 
 * A JavaScript module for loading and rendering blog content from a 
 * recursive JSON structure and Markdown files.
 */

class BlogLoader {
    constructor() {
        this.blogData = null;
        this.currentBlog = null;
        this.markdownConverter = null;
        this.blogTreeElement = null;
        this.blogContentElement = null;
        this.blogTitleElement = null;
        this.sidebarToggleElement = null;
        this.navButtonsContainer = null;
        this.sidebarVisible = true;
        this.blogContainerElement = null;
        this.isFirstVisit = !localStorage.getItem('blog_visited');
        this.featuredPosts = [
            'resurgence-retro-ui',
            'windows-design-patterns'
        ];
        this.idleTimer = null;
        this.idleTime = 10000; // 10 seconds
        // Get the base path from the meta tag, or default to root for custom domain
        this.basePath = document.querySelector('meta[name="base-path"]')?.getAttribute('content') || '/';
        
        // Check for trailing slash and ensure consistency
        if (this.basePath && !this.basePath.endsWith('/')) {
            this.basePath += '/';
        }
    }

    /**
     * Gets the correct URL with the base path
     * @param {String} path The path to append to the base path
     * @returns {String} The full URL
     */
    getUrlWithBase(path) {
        // Remove leading slash to avoid double slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${this.basePath}${cleanPath}`;
    }

    /**
     * Initialize the blog loader
     * @param {Object} options Configuration options
     */
    async init(options = {}) {
        // Default options
        const defaults = {
            blogDataUrl: '/data/blogs.json',
            blogContentContainer: '.blog-content',
            blogTreeContainer: '.blog-tree',
            blogTitleContainer: '.section-header h2',
            sidebarToggle: '.sidebar-toggle',
            navButtonsContainer: '.blog-nav-buttons',
            defaultSlug: null,
            markdownBasePath: '/blogs/'
        };

        // Merge options
        const config = { ...defaults, ...options };
        
        // Add base path to URLs if needed
        config.blogDataUrl = this.getUrlWithBase(config.blogDataUrl);
        config.markdownBasePath = this.getUrlWithBase(config.markdownBasePath);
        
        // Load external markdown library if not already loaded
        if (typeof marked === 'undefined') {
            console.log('Marked library not found, using internal converter');
            this.markdownConverter = this.simpleMarkdownConverter;
        } else {
            // Configure marked to enable headerIds for anchor links
            marked.setOptions({
                mangle: false,
                headerIds: true
            });
            
            this.markdownConverter = marked.parse;
            console.log('Using Marked library for markdown conversion');
        }
        
        this.markdownBasePath = config.markdownBasePath;
        
        // Set DOM elements
        this.blogContentElement = document.querySelector(config.blogContentContainer);
        this.blogTreeElement = document.querySelector(config.blogTreeContainer);
        this.blogTitleElement = document.querySelector(config.blogTitleContainer);
        this.sidebarToggleElement = document.querySelector(config.sidebarToggle);
        this.navButtonsContainer = document.querySelector(config.navButtonsContainer);
        this.blogContainerElement = document.querySelector('.blog-container');
        
        // Setup first-visit animation
        if (this.sidebarToggleElement) {
            this.setupToggleAnimations();
        }
        
        // Setup sidebar toggle
        if (this.sidebarToggleElement) {
            this.sidebarToggleElement.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Show window title bar if the Components API is available
        if (window.Components && window.Components.showWindowTitleBar) {
            window.Components.showWindowTitleBar();
        }
        
        // Load blog data
        try {
            const response = await fetch(config.blogDataUrl);
            if (!response.ok) {
                throw new Error(`Failed to load blog data: ${response.status}`);
            }
            this.blogData = await response.json();
            
            // Render blog tree
            this.renderBlogTree();
            
            // Load blog from URL or default
            const urlParams = new URLSearchParams(window.location.search);
            const articleParam = urlParams.get('article');
            
            if (articleParam) {
                // Redirect users from old parameter system to new path-based system
                const fileInfo = this.findFileInfoBySlug(this.blogData.blogs, articleParam);
                if (fileInfo) {
                    // Redirect to the new format
                    window.location.href = this.getUrlWithBase(`/blog/${fileInfo.path.replace(/\.md$/, '')}`);
                    return; // Exit early since we're redirecting
                } else {
                    // Setup featured posts as fallback
                    this.setupFeaturedPosts();
                    this.triggerToggleAnimation();
                }
            } else {
                // Setup featured posts
                this.setupFeaturedPosts();
                
                // If on home page, trigger animation
                this.triggerToggleAnimation();
            }
            
            // Set up idle detection
            this.setupIdleDetection();
        } catch (error) {
            console.error('Failed to load blog data:', error);
            this.showError('Failed to load blog data. Please try again later.');
        }
    }
    
    /**
     * Set up toggle animations
     */
    setupToggleAnimations() {
        // Store this visit
        if (this.isFirstVisit) {
            localStorage.setItem('blog_visited', 'true');
        }
    }
    
    /**
     * Set up idle detection to trigger animations after a period of inactivity
     */
    setupIdleDetection() {
        // Reset the timer on any user activity
        const resetIdleTimer = () => {
            clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(() => {
                this.triggerToggleAnimation();
            }, this.idleTime);
        };
        
        // Events that reset the idle timer
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetIdleTimer, true);
        });
        
        // Initial setup of idle timer
        resetIdleTimer();
    }
    
    /**
     * Trigger the toggle animation
     */
    triggerToggleAnimation() {
        if (this.sidebarToggleElement) {
            // Remove existing animation class
            this.sidebarToggleElement.classList.remove('first-visit');
            
            // Force a reflow to restart the animation
            void this.sidebarToggleElement.offsetWidth;
            
            // Add the animation class back
            this.sidebarToggleElement.classList.add('first-visit');
        }
    }
    
    /**
     * Setup featured posts functionality
     */
    setupFeaturedPosts() {
        document.querySelectorAll('.featured-post .post-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const slug = link.getAttribute('data-slug');
                if (slug) {
                    // Navigate to the pre-rendered page instead of loading content dynamically
                    window.location.href = this.getUrlWithBase(`/blog/${slug}`);
                }
            });
        });
    }
    
    /**
     * Simple markdown converter as fallback
     * @param {String} markdown The markdown text to convert
     * @returns {String} HTML content
     */
    simpleMarkdownConverter(markdown) {
        // Very basic markdown conversion for headings, paragraphs, bold, italic
        return markdown
            // Headers
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            // Bold and Italic
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // Lists
            .replace(/^\- (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
            // Code blocks
            .replace(/```[a-z]*\n([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            // Links
            .replace(/\[([^\[]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>')
            // Images
            .replace(/!\[([^\[]+)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1">')
            // Line breaks and paragraphs
            .replace(/\n\n/gim, '</p><p>')
            .replace(/^(.+)$/gim, '<p>$1</p>');
    }
    
    /**
     * Render the blog tree in the sidebar
     */
    renderBlogTree() {
        if (!this.blogTreeElement || !this.blogData || !this.blogData.blogs) return;
        
        this.blogTreeElement.innerHTML = '';
        const treeRoot = document.createElement('ul');
        treeRoot.className = 'blog-tree-list';
        
        this.renderBlogTreeItems(treeRoot, this.blogData.blogs);
        
        this.blogTreeElement.appendChild(treeRoot);
        
        // Auto-expand first level folders for better discoverability
        const topLevelFolders = this.blogTreeElement.querySelectorAll('.blog-tree-list > .blog-tree-folder');
        topLevelFolders.forEach(folder => {
            folder.classList.add('expanded');
        });
    }
    
    /**
     * Recursively render blog tree items
     * @param {HTMLElement} parentElement 
     * @param {Array} items 
     * @param {String} parentPath Path to parent folder
     */
    renderBlogTreeItems(parentElement, items, parentPath = '') {
        if (!items || !items.length) return;
        
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'blog-tree-item';
            
            if (item.type === 'folder') {
                li.classList.add('blog-tree-folder');
                
                // Current path is parent path + folder name
                const currentPath = parentPath ? `${parentPath}/${item.folder}` : item.folder;
                
                const folderHeader = document.createElement('div');
                folderHeader.className = 'blog-tree-folder-header';
                folderHeader.innerHTML = `
                    <span class="folder-icon"></span>
                    <span class="folder-title">${item.title}</span>
                `;
                
                folderHeader.addEventListener('click', (e) => {
                    li.classList.toggle('expanded');
                    e.stopPropagation(); // Prevent event bubbling
                });
                
                li.appendChild(folderHeader);
                
                // Create children container
                if (item.children && item.children.length) {
                    const childrenUl = document.createElement('ul');
                    childrenUl.className = 'blog-tree-children';
                    this.renderBlogTreeItems(childrenUl, item.children, currentPath);
                    li.appendChild(childrenUl);
                }
                
            } else if (item.type === 'file') {
                li.classList.add('blog-tree-file');
                
                // Generate full file path
                const filePath = parentPath ? `${parentPath}/${item.file}` : item.file;
                const slug = this.generateSlugFromPath(filePath);
                
                li.innerHTML = `
                    <span class="file-icon"></span>
                    <a href="${this.getUrlWithBase(`/blog/${filePath.replace(/\.md$/, '')}`)}" class="file-link" data-file="${filePath}" data-title="${item.title}">${item.title}</a>
                `;
                
                // Add click event to load blog content
                const link = li.querySelector('.file-link');
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Navigate to the pre-rendered page instead of loading content dynamically
                    window.location.href = this.getUrlWithBase(`/blog/${filePath.replace(/\.md$/, '')}`);
                });
            }
            
            parentElement.appendChild(li);
        });
    }
    
    /**
     * Generate a slug from a file path
     * @param {String} path 
     * @returns {String}
     */
    generateSlugFromPath(path) {
        return path.replace(/\//g, '-').replace(/\.md$/, '');
    }
    
    /**
     * Load a blog by its slug
     * @param {String} slug 
     */
    async loadBlogBySlug(slug) {
        if (!slug || !this.blogData) return;
        
        const fileInfo = this.findFileInfoBySlug(this.blogData.blogs, slug);
        
        if (fileInfo) {
            this.loadBlogByFile(fileInfo.path, fileInfo.title);
        } else {
            this.showError(`Blog post not found: ${slug}`);
        }
    }
    
    /**
     * Find a file info by slug
     * @param {Array} items 
     * @param {String} slug 
     * @param {String} parentPath 
     * @returns {Object|null} {path, title}
     */
    findFileInfoBySlug(items, slug, parentPath = '') {
        if (!items) return null;
        
        for (const item of items) {
            if (item.type === 'file') {
                const filePath = parentPath ? `${parentPath}/${item.file}` : item.file;
                const itemSlug = this.generateSlugFromPath(filePath);
                if (itemSlug === slug) {
                    return {
                        path: filePath,
                        title: item.title
                    };
                }
            } else if (item.type === 'folder' && item.children) {
                const currentPath = parentPath ? `${parentPath}/${item.folder}` : item.folder;
                const found = this.findFileInfoBySlug(item.children, slug, currentPath);
                if (found) return found;
            }
        }
        
        return null;
    }
    
    /**
     * Load a blog by its file path
     * @param {String} file 
     * @param {String} title
     */
    async loadBlogByFile(file, title) {
        if (!file || !this.blogContentElement) return;
        
        try {
            // Update title
            if (this.blogTitleElement) {
                this.blogTitleElement.textContent = title || 'Blog';
                
                // Also update document title for better browser tab labeling
                document.title = `${title} - Blog - Henry Heffernan`;
            }
            
            // Show loading
            this.blogContentElement.innerHTML = '<div class="loading-indicator">Loading blog content...</div>';
            
            // Load markdown file
            const response = await fetch(`${this.markdownBasePath}${file}`);
            if (!response.ok) {
                throw new Error(`Failed to load blog content: ${response.status}`);
            }
            
            const markdown = await response.text();
            
            // Convert markdown to HTML
            const html = this.markdownConverter(markdown);
            
            // Render content with appropriate theme-aware wrapper
            this.blogContentElement.innerHTML = `
                <div class="blog-body">
                    ${html}
                </div>
            `;
            
            // Make sure all links in the content respect theme variables
            const blogLinks = this.blogContentElement.querySelectorAll('a');
            blogLinks.forEach(link => {
                // Only adjust styling for internal content links, not external links
                if (!link.getAttribute('href').startsWith('http')) {
                    link.style.color = 'var(--text-link)';
                }
            });
            
            // Ensure code blocks respect the theme
            const codeBlocks = this.blogContentElement.querySelectorAll('pre, code');
            codeBlocks.forEach(block => {
                block.style.backgroundColor = 'var(--surface)';
                block.style.color = 'var(--text-color)';
            });
            
            // Update current blog
            this.currentBlog = {
                file: file,
                title: title
            };
            
            // Highlight current blog in tree
            this.highlightCurrentBlog(file);
            
            // Render navigation
            this.renderBlogNavigation();
            
            // Scroll to top
            this.blogContentElement.scrollTop = 0;
            
            // Reset idle timer when loading a new blog
            clearTimeout(this.idleTimer);
            this.setupIdleDetection();
            
        } catch (error) {
            console.error('Failed to load blog content:', error);
            this.showError('Failed to load blog content. Please try again later.');
        }
    }
    
    /**
     * Find the prev and next blogs
     */
    findPrevNextBlogs() {
        if (!this.currentBlog || !this.blogData) return { prev: null, next: null };
        
        const flatList = this.flattenBlogTree(this.blogData.blogs);
        const fileBlogs = flatList.filter(blog => blog.type === 'file');
        
        const currentIndex = fileBlogs.findIndex(blog => blog.fullPath === this.currentBlog.file);
        
        return {
            prev: currentIndex > 0 ? fileBlogs[currentIndex - 1] : null,
            next: currentIndex < fileBlogs.length - 1 ? fileBlogs[currentIndex + 1] : null
        };
    }
    
    /**
     * Flatten the blog tree into a single array with full paths
     * @param {Array} items 
     * @param {String} parentPath 
     * @returns {Array}
     */
    flattenBlogTree(items, parentPath = '') {
        if (!items) return [];
        
        let result = [];
        
        items.forEach(item => {
            if (item.type === 'folder') {
                const currentPath = parentPath ? `${parentPath}/${item.folder}` : item.folder;
                const folderItem = { ...item, fullPath: currentPath };
                result.push(folderItem);
                
                if (item.children) {
                    result = result.concat(this.flattenBlogTree(item.children, currentPath));
                }
            } else if (item.type === 'file') {
                const filePath = parentPath ? `${parentPath}/${item.file}` : item.file;
                result.push({ ...item, fullPath: filePath });
            }
        });
        
        return result;
    }
    
    /**
     * Render blog navigation buttons
     */
    renderBlogNavigation() {
        if (!this.navButtonsContainer) return;
        
        const { prev, next } = this.findPrevNextBlogs();
        
        let html = '';
        
        if (prev) {
            const prevPath = prev.fullPath.replace(/\.md$/, '');
            html += `<a href="${this.getUrlWithBase(`/blog/${prevPath}`)}" class="nav-button" data-nav="prev" data-file="${prev.fullPath}" data-title="${prev.title}">Previous</a>`;
        } else {
            html += `<span class="nav-button-placeholder"></span>`;
        }
        
        if (next) {
            const nextPath = next.fullPath.replace(/\.md$/, '');
            html += `<a href="${this.getUrlWithBase(`/blog/${nextPath}`)}" class="nav-button" data-nav="next" data-file="${next.fullPath}" data-title="${next.title}">Next</a>`;
        } else {
            html += `<span class="nav-button-placeholder"></span>`;
        }
        
        this.navButtonsContainer.innerHTML = html;
        
        // Add click events to navigation buttons
        const navButtons = this.navButtonsContainer.querySelectorAll('.nav-button');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const file = button.getAttribute('data-file');
                const path = file.replace(/\.md$/, '');
                
                // Use the new path-based navigation
                window.location.href = this.getUrlWithBase(`/blog/${path}`);
            });
        });
    }
    
    /**
     * Highlight the current blog in the tree
     * @param {String} file 
     */
    highlightCurrentBlog(file) {
        // Remove current highlight
        const currentHighlighted = this.blogTreeElement.querySelector('.blog-tree-file.current-blog');
        if (currentHighlighted) {
            currentHighlighted.classList.remove('current-blog');
        }
        
        // Add new highlight
        const fileLinks = this.blogTreeElement.querySelectorAll('.file-link');
        fileLinks.forEach(link => {
            if (link.getAttribute('data-file') === file) {
                link.closest('.blog-tree-file').classList.add('current-blog');
                this.expandParentFolders(link);
            }
        });
    }
    
    /**
     * Expand all parent folders of an element
     * @param {HTMLElement} element 
     */
    expandParentFolders(element) {
        let parent = element.closest('.blog-tree-children');
        while (parent) {
            const folder = parent.closest('.blog-tree-folder');
            if (folder) {
                folder.classList.add('expanded');
                parent = folder.parentElement.closest('.blog-tree-children');
            } else {
                break;
            }
        }
    }
    
    /**
     * Toggle sidebar visibility
     */
    toggleSidebar() {
        if (!this.blogContainerElement || !this.sidebarToggleElement) return;
        
        this.sidebarVisible = !this.sidebarVisible;
        
        if (this.sidebarVisible) {
            this.blogContainerElement.classList.remove('sidebar-collapsed');
            this.sidebarToggleElement.classList.remove('collapsed');
        } else {
            this.blogContainerElement.classList.add('sidebar-collapsed');
            this.sidebarToggleElement.classList.add('collapsed');
        }
    }
    
    /**
     * Show error message
     * @param {String} message 
     */
    showError(message) {
        if (this.blogContentElement) {
            this.blogContentElement.innerHTML = `
                <div class="blog-error">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <a href="/blogs" class="error-home-link">Return to Blogs Home</a>
                </div>
            `;
        }
    }
}

// Create a global instance
window.BlogLoader = new BlogLoader();