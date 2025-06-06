# 🪟 Windows 95/98 Style Portfolio - Astro Version

<div align="center">
  <img src="portfolio-preview.png" alt="Windows 95/98 Style Portfolio" width="600px" />
  <p><em>A nostalgic, retro-themed personal portfolio powered by modern web technology</em></p>
</div>

Experience the perfect blend of nostalgia and modern web development with this Windows 95/98-themed portfolio site. Built with [Astro](https://astro.build), this project delivers outstanding performance, SEO benefits, and the authentic look and feel of classic Windows interfaces.

## 🎨 Why This Design?

During my search for portfolio templates, I discovered Henry's website and was immediately captivated by its beauty. The "OS inside a browser" concept with its beautifully animated interface resonated with me on a personal level.

As I am not a UI/UX genius like him, I wanted to make a simplified version while ensuring it's extremely scalable and functional, requiring minimal setup and almost no installation of external dependencies.

As someone who deeply appreciates retro aesthetics (similar to my love for cafe racer motorcycles), I found the Windows 95/98 style to have a certain artistic quality that appeals to a select audience - and I'm proudly one of them!

This appreciation for nostalgic design drove my decision to create a portfolio based entirely on the Windows 95 theme. There's something special about the pixel-perfect borders, classic title bars, and that distinctive color palette that speaks to me.

While I have basic knowledge of HTML and CSS, I'm not an expert in UI design - that's where AI assistance was invaluable. My contribution focused on researching the right technologies to use, understanding the functionality requirements, and analyzing how different components should work together.

Through this collaborative approach of my analytical skills combined with AI guidance for implementation details, I was able to create this Windows 95/98-themed portfolio site.

## 🖼️ Theme Preview

<table>
  <tr>
    <td width="50%">
      <h3 align="center">Dark Theme</h3>
      <img src="darkTheme.png" alt="Dark Theme Preview" />
    </td>
    <td width="50%">
      <h3 align="center">Light Theme</h3>
      <img src="lightTheme.png" alt="Light Theme Preview" />
    </td>
  </tr>
</table>

## 🖥️ Features

<table>
  <tr>
    <th colspan="2" align="left">Core Features</th>
  </tr>
  <tr>
    <td width="50%"><b>🎨 Windows 95/98 UI</b></td>
    <td width="50%">Complete with title bars, buttons, classic fonts, and iconic styling</td>
  </tr>
  <tr>
    <td><b>🌓 Theme Switching</b></td>
    <td>Toggle between light (Windows 95) and dark mode</td>
  </tr>
  <tr>
    <td><b>✨ Interactive Elements</b></td>
    <td>Window controls, animated transitions, and classic form elements</td>
  </tr>
  <tr>
    <td><b>📱 Responsive Design</b></td>
    <td>Adapts to different screen sizes while maintaining the retro aesthetic</td>
  </tr>
  <tr>
    <td><b>📂 JSON-driven Content</b></td>
    <td>Update your site without touching code</td>
  </tr>
  <tr>
    <td><b>🚫 No Dependencies</b></td>
    <td>Minimal external libraries for maximum performance</td>
  </tr>
  <tr>
    <td><b>🚀 Astro-powered</b></td>
    <td>Static site generation for incredible performance and SEO</td>
  </tr>
</table>

### Content Sections

<table>
  <tr>
    <th colspan="2" align="left">Site Sections</th>
  </tr>
  <tr>
    <td width="30%"><b>🏠 Home</b></td>
    <td width="70%">Animated introduction with typewriter effect</td>
  </tr>
  <tr>
    <td><b>👤 About</b></td>
    <td>Profile information, education, skills, and certifications</td>
  </tr>
  <tr>
    <td><b>💼 Experience</b></td>
    <td>Professional experience, internships, and achievements</td>
  </tr>
  <tr>
    <td><b>🛠️ Projects</b></td>
    <td>Showcase of projects with screenshots and details</td>
  </tr>
  <tr>
    <td><b>📝 Blog</b></td>
    <td>File tree navigation for blog posts with markdown support</td>
  </tr>
  <tr>
    <td><b>📬 Contact</b></td>
    <td>Contact form with EmailJS integration (no backend required)</td>
  </tr>
</table>

## 📋 Quick Start

### Prerequisites

<table>
  <tr>
    <td width="50%">
      <ul>
        <li>Node.js (version 16.x or higher)</li>
        <li>npm or yarn</li>
        <li>A code editor (VS Code recommended)</li>
      </ul>
    </td>
    <td width="50%">
      <b>Optional:</b>
      <ul>
        <li>EmailJS account (for contact form)</li>
        <li>Git (for version control)</li>
        <li>GitHub account (for deployment)</li>
      </ul>
    </td>
  </tr>
</table>

### Installation

```bash
# Clone the repository
git clone https://github.com/uakhilchowdary/PortFolio.git

# Navigate to the project directory
cd portfolio-astro-migration

# Install dependencies
npm install

# Start the development server
npm run dev
```

Your site will be available at `http://localhost:4321`

## 🏗️ Project Architecture

This project uses a hybrid approach combining Astro's build-time rendering with client-side interactivity:

```
portfolio-astro-migration/
│
├── 📁 public/                # Static assets (runtime)
│   ├── 🖼️ assets/            # Images, fonts, and resume files
│   ├── 📝 blogs/             # Markdown blog posts
│   ├── 📊 data/              # JSON data (copied from src/data)
│   ├── 📜 scripts/           # Client-side JavaScript
│   └── 🎨 styles/            # CSS stylesheets
│
├── 📁 src/                   # Source files (build time)
│   ├── 🧩 components/        # Reusable Astro components
│   ├── 📐 layouts/           # Page layouts
│   ├── 📄 pages/             # Page templates
│   └── 📊 data/              # SOURCE OF TRUTH for content
│
├── ⚙️ astro.config.mjs       # Astro configuration
├── 📋 copyDataFiles.js       # Data sync utility
├── 📦 package.json           # Dependencies
└── 📝 tsconfig.json          # TypeScript configuration
```

## 📊 Content Management

### Data Flow Architecture

This project uses JSON files to manage content, making it easy to update your site without editing code:

<div align="center">
  <pre>
  [src/data/*.json] → Build-time import → [Static HTML with SEO content]
       ↓                                          ↓
  Copied to public/                       Served to browser
       ↓                                          ↓
  [public/data/*.json] ← Client-side fetch ← [Runtime JavaScript]
  </pre>
</div>

1. **Source of Truth**: All content lives in `src/data/` JSON files
   - `config.json` — Site metadata and global settings
   - `about.json` — Profile information and skills
   - `experience.json` — Work history
   - `projects.json` — Portfolio projects
   - `blogs.json` — Blog structure and metadata
   - `contacts.json` — Contact details and form settings

2. When you build the site, this data is:
   - Imported directly into pages for SEO benefits
   - Copied to `public/data/` for client-side interactivity

### Blog Content System

Blog content uses a specialized approach:

1. **Structure**: Defined in `src/data/blogs.json`
2. **Content**: Written as Markdown in `public/blogs/`
3. **Rendering**: Automatically converted to HTML when viewed

## 🚀 Deployment

### Building for Production

```bash
# Run full build process
npm run build

# Preview the production build
npm run preview
```

### Deployment Options

This project can be deployed to various platforms:

- **GitHub Pages** (recommended with custom domain)
- **Netlify**
- **Vercel**
- **Cloudflare Pages**

For detailed deployment instructions, see [GITHUB_PAGES_DEPLOYMENT.md](./GITHUB_PAGES_DEPLOYMENT.md)

## 🔄 Content Updates

### Updating Website Content

1. Edit the appropriate JSON file in `src/data/`
2. Run the synchronization script:
   ```bash
   npm run copy-data
   ```
3. Rebuild the site:
   ```bash
   npm run build
   ```

### Adding Blog Posts

1. Create a new Markdown file in `public/blogs/`
2. Update the blog structure in `src/data/blogs.json`
3. Follow the rebuild steps above

## 🧩 Customization

### Theme Customization

The theme system provides comprehensive styling control:

1. Edit variables in `public/styles/theme-preload.css` for colors
2. Modify component styles in their respective `.astro` files

### Contact Form Setup

1. Create a free account at [EmailJS](https://www.emailjs.com/)
2. Configure your email service and template
3. Update credentials in `src/data/contacts.json`

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Credits

- Original design inspiration from [Henry Jeff's portfolio website](https://github.com/henryjeff/portfolio-website)
- Windows 95/98 UI styling and theme concept
- Implementation and Astro migration by Akhil Chowdary Udathaneni

---

<div align="center">
  <p>© 2023 Akhil Chowdary Udathaneni</p>
  <p>
    <a href="https://github.com/uakhilchowdary/PortFolio">GitHub</a> •
    <a href="https://akhilchowdary.info">Live Demo</a>
  </p>
</div>
