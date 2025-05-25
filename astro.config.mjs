import { defineConfig } from 'astro/config';

export default defineConfig({
  // Site config - set to your custom domain
  site: 'akhilchowdary.info',
  
  // Base path is empty for custom domain
  // base: '/PortFolio',
  
  // Output options - static site generation
  output: 'static',
  
  // Disable content collections since we're using our own approach
  content: {
    // This disables Astro's built-in content collections
    handleContentNotFound: false
  },
  
  // Build options - using hybrid approach for SEO
  build: {
    assets: '_astro',
    format: 'directory'
  },
  
  // Server options for development
  server: {
    port: 4321,
    host: true
  },
  
  // Note: We use src/data during build for SEO but also copy to public/data for client-side JS
  // This ensures both good SEO and runtime data access
  
  // Enhanced SEO with pre-rendered blog posts from src/blogs
  // These get copied to public/blogs for client-side compatibility
  integrations: []
}); 