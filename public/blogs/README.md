# Markdown-based Blog System

This folder contains the markdown content for the blog system. The blog is structured as a recursive tree where each item can be either a folder (containing more blogs) or a file (a single blog post).

## How It Works

1. **Blog Structure**: The structure is defined in `html/data/blogs.json`
2. **Blog Content**: The content is stored in markdown files in this directory
3. **Blog Rendering**: The content is rendered using the blog.html template and blog-loader.js

## Adding a New Blog Post

To add a new blog post:

1. Create a new markdown file in the appropriate directory (e.g., `development/my-new-post.md`)
2. Add metadata to the top of the file:
   ```markdown
   # Your Blog Post Title
   
   *Date* | *Tags: Tag1, Tag2, Tag3*
   
   ## Your first section
   
   Content goes here...
   ```
3. Update the `blogs.json` file to include your new post:
   ```json
   {
     "title": "Your Blog Post Title",
     "type": "file",
     "slug": "your-post-slug",
     "file": "folder/your-post-slug.md",
     "date": "Month Day, Year",
     "tags": ["Tag1", "Tag2", "Tag3"]
   }
   ```

## Creating a New Category

To create a new category:

1. Create a new folder in the appropriate directory (e.g., `blogs/new-category/`)
2. Update the `blogs.json` file to include your new category:
   ```json
   {
     "title": "Your Category Name",
     "type": "folder",
     "slug": "your-category-slug",
     "folder": "your-category-slug",
     "children": []
   }
   ```
3. Add blog posts to the category by adding them to the `children` array

## Markdown Features

The blog system supports standard markdown features:

- **Headers**: Use # for h1, ## for h2, etc.
- **Formatting**: *italic*, **bold**, ~~strikethrough~~
- **Lists**: Ordered and unordered lists
- **Links**: [link text](url)
- **Images**: ![alt text](image-url)
- **Code**: Inline `code` and code blocks with ```language
- **Blockquotes**: > quote text
- **Tables**: Standard markdown tables

## File Organization

The blogs directory follows this structure:

```
blogs/
├── development/
│   ├── resurgence-retro-ui.md
│   └── building-dos-emulator.md
├── design/
│   ├── ui-ux-principles/
│   │   └── windows-design-patterns.md
│   └── portfolio-concept-deployment.md
└── tech-nostalgia/
    ├── window-management-evolution.md
    └── retro-dev-environment.md
```

Each directory corresponds to a category in the blog system.

## How the Blog Loader Works

The blog system uses:

1. **Marked.js**: For rendering markdown as HTML
2. **Recursive Navigation**: For browsing through the blog structure
3. **Dynamic Content Loading**: For loading blog content without page refreshes
4. **URL Parameters**: For direct linking to specific blog posts

## Troubleshooting

- If a blog post doesn't appear, check that it's correctly added to the blogs.json file
- If markdown isn't rendering correctly, verify that the markdown syntax is valid
- If images aren't loading, make sure the paths are correct (relative to the HTML file) 