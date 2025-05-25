# 🚀 Deploying to GitHub Pages with Custom Domain

<div align="center">
  <h3>Comprehensive step-by-step guide for deploying your Windows 98 Portfolio to GitHub Pages</h3>
  <p><em>Using a custom domain with proper configuration for flawless deployment</em></p>
</div>

This comprehensive guide walks you through every step of deploying your Astro-powered Windows 98 portfolio site to GitHub Pages with a custom domain. Follow these instructions carefully to ensure a smooth deployment.

## 📋 Table of Contents

- [Prerequisites](#-prerequisites)
- [Deployment Process](#-deployment-process-overview)
- [Step 1: Repository Setup](#-step-1-repository-setup)
- [Step 2: Code Preparation](#-step-2-code-preparation)
- [Step 3: DNS Configuration](#-step-3-dns-configuration)
- [Step 4: GitHub Pages Setup](#-step-4-github-pages-setup)
- [Step 5: Final Verification](#-step-5-final-verification)
- [Troubleshooting](#-troubleshooting)
- [Updating Your Site](#-updating-your-site)

## 📦 Prerequisites

Before starting the deployment process, ensure you have:

1. **GitHub Account**: Active GitHub account with repository creation permissions
2. **Git Installation**: Git installed and configured on your local machine
3. **Node.js & npm**: Node.js (version 18+) and npm for building the project
4. **Custom Domain**: A domain you own (e.g., `akhilchowdary.info`)
5. **DNS Access**: Administrative access to your domain's DNS settings

## 🔄 Deployment Process Overview

<div align="center">
  <pre>
  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
  │                 │     │                 │     │                 │
  │  Local Project  │────▶│  GitHub Repo    │────▶│  GitHub Pages   │
  │  Preparation    │     │  Configuration  │     │  Deployment     │
  │                 │     │                 │     │                 │
  └─────────────────┘     └─────────────────┘     └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                        ┌─────────────────┐
                        │                 │
                        │  DNS Settings   │
                        │  Configuration  │
                        │                 │
                        └─────────────────┘
  </pre>
</div>

## 📁 Step 1: Repository Setup

### Create a New GitHub Repository

1. Navigate to [GitHub](https://github.com/) and log in
2. Click the "+" icon in the top-right corner
3. Select "New repository"
4. Configure the repository:
   - **Name**: `PortFolio`
   - **Visibility**: Public
   - **Initialize**: No README (we'll push your existing code)
5. Click "Create repository"

### Connect Your Local Project

```bash
# Navigate to your project directory
cd portfolio-astro-migration

# Initialize Git if not already done
git init

# Add the remote repository
git remote add origin https://github.com/uakhilchowdary/PortFolio.git

# Add your files
git add .

# Commit the files
git commit -m "Initial commit for GitHub Pages deployment"

# Push to GitHub
git push -u origin main
```

> **Note**: If your default branch is named `master` instead of `main`, use that name in the commands above.

## 🛠️ Step 2: Code Preparation

### 1. Configure Astro for Custom Domain

Edit `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Set to your custom domain
  site: 'https://akhilchowdary.info',
  
  // Remove or empty the base property for custom domains
  // base: '',
  
  // Rest of your configuration...
  output: 'static',
  // ...
});
```

### 2. Create CNAME File

Create a file named `CNAME` in the `public` directory with a single line containing your domain:

```
akhilchowdary.info
```

### 3. Fix Client-Side JavaScript Paths

This is the **most critical step** to prevent redirect loops and data loading failures:

#### Update `components.js`:

```javascript
// CHANGE THIS:
const response = await fetch('/data/config.json');

// TO THIS:
const response = await fetch('./data/config.json');
```

#### Update `home-loader.js`:

```javascript
// CHANGE THIS:
const response = await fetch('data/config.json');

// TO THIS:
const response = await fetch('./data/config.json');
```

#### Update all client-side scripts in `.astro` files:

```javascript
// CHANGE THIS:
const response = await fetch('/data/config.json');

// TO THIS:
const response = await fetch('./data/config.json');
```

> ⚠️ **WARNING**: Failure to update these paths will result in redirect loops and broken functionality when deployed with a custom domain!

### 4. Verify GitHub Actions Workflow

Ensure `.github/workflows/deploy.yml` exists with content similar to:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run copy data script
        run: node copyDataFiles.js
      - name: Build Astro
        run: npm run build
      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v1
        with:
          path: "./dist"

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v1
```

### 5. Commit and Push Your Changes

```bash
git add .
git commit -m "Configure for GitHub Pages with custom domain"
git push
```

## 🌐 Step 3: DNS Configuration

### For Root Domain (`akhilchowdary.info`)

Add these **A records** to your domain's DNS settings:

| Type | Name | Value            | TTL      |
|------|------|------------------|----------|
| A    | @    | 185.199.108.153  | Automatic |
| A    | @    | 185.199.109.153  | Automatic |
| A    | @    | 185.199.110.153  | Automatic |
| A    | @    | 185.199.111.153  | Automatic |

### For WWW Subdomain (`www.akhilchowdary.info`)

Add a **CNAME record**:

| Type  | Name | Value                   | TTL      |
|-------|------|-------------------------|----------|
| CNAME | www  | uakhilchowdary.github.io | Automatic |

> **Note**: DNS propagation can take up to 24 hours. Be patient if your custom domain doesn't work immediately.

## ⚙️ Step 4: GitHub Pages Setup

### Configure GitHub Pages Settings

1. Go to your GitHub repository
2. Click on "Settings"
3. Scroll down to the "Pages" section
4. Configure the following:
   - **Source**: GitHub Actions
   - **Custom domain**: Enter your domain (`akhilchowdary.info`)
   - **Enforce HTTPS**: Check this box (may be grayed out initially until certificate is provisioned)

### Verify GitHub Actions Workflow

1. Go to the "Actions" tab in your repository
2. You should see a workflow running for your latest commit
3. Wait for it to complete successfully
4. If it fails, check the logs for error messages

## ✅ Step 5: Final Verification

After your GitHub Action completes and DNS propagation finishes:

1. Visit your custom domain (e.g., `https://akhilchowdary.info`)
2. Verify that:
   - Site loads with HTTPS (secure lock icon)
   - All pages load correctly
   - Navigation works properly
   - Images and styles load correctly
   - Blog posts can be accessed
   - No console errors related to data loading

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Redirect Loops (`ERR_TOO_MANY_REDIRECTS`)

**Cause**: Absolute URL paths in fetch requests

**Solution**:
1. Change all references from `/data/config.json` to `./data/config.json`
2. Update all client-side JavaScript files
3. Rebuild and redeploy

#### Site Not Loading / 404 Errors

**Possible Causes and Solutions**:
1. **DNS not propagated**: Wait up to 24 hours
2. **GitHub Pages not enabled**: Check repository settings
3. **Build issues**: Check GitHub Actions logs
4. **Wrong branch**: Ensure you're deploying from the correct branch

#### HTTPS Not Working

**Solution**:
1. Wait 24-48 hours for GitHub Pages to provision an SSL certificate
2. Ensure "Enforce HTTPS" is checked in GitHub Pages settings

#### Missing Content / Styling

**Cause**: Incorrect path references

**Solution**:
1. Ensure all asset references use proper paths
2. Check developer console for 404 errors
3. Fix any broken references and redeploy

## 🔄 Updating Your Site

After initial setup, updating your site is simple:

```bash
# Make your changes locally

# Commit changes
git add .
git commit -m "Update site content"

# Push to GitHub
git push
```

The GitHub Actions workflow will automatically:
1. Build your site
2. Deploy the updated version to GitHub Pages
3. Preserve your custom domain settings

## 📁 Key Configuration Files

| File | Purpose | Critical Settings |
|------|---------|-------------------|
| `astro.config.mjs` | Astro configuration | `site: 'https://akhilchowdary.info'` |
| `public/CNAME` | Custom domain config | Contains domain name |
| `.github/workflows/deploy.yml` | Deployment workflow | Build and deploy steps |
| `public/scripts/components.js` | Core functionality | Relative data paths |
| `public/scripts/home-loader.js` | Home page data loading | Relative data paths |

## 🆘 Need More Help?

If you encounter issues not covered here:

1. Check [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Consult [Astro deployment docs](https://docs.astro.build/en/guides/deploy/github/)
3. Review the [deployment checklist](./DEPLOYMENT_CHECKLIST.md)
4. Open an issue on your GitHub repository

---

<div align="center">
  <p><strong>Congratulations!</strong> Your Windows 98 Portfolio should now be live at your custom domain!</p>
  <p>
    <a href="README.md">Return to Main Documentation</a> • 
    <a href="DEPLOYMENT_CHECKLIST.md">Deployment Checklist</a>
  </p>
</div> 