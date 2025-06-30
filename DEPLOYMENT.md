# GitHub Pages Deployment Guide

This guide explains how to deploy the Scoundrel Card Game to GitHub Pages.

## Quick Setup

1. **Fork this repository** to your GitHub account
2. **Enable GitHub Pages** in your repository settings:
   - Go to `Settings` → `Pages`
   - Under "Source", select `GitHub Actions`
3. **Trigger deployment** by pushing to the main branch or manually running the workflow
4. **Access your game** at `https://yourusername.github.io/scoundrel`

## Automatic Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys the site when you:

- Push commits to the `main` or `master` branch
- Create a pull request to these branches
- Manually trigger the workflow from the Actions tab

## Configuration Files

The following files have been added to optimize GitHub Pages deployment:

### `.github/workflows/deploy.yml`
- GitHub Actions workflow for automatic deployment
- Handles building and deploying the static site
- Configures proper permissions for Pages deployment

### `_config.yml`
- Jekyll configuration to exclude unnecessary files
- Ensures proper file processing for the static site
- Sets site metadata

### `.nojekyll`
- Bypasses Jekyll processing when needed
- Ensures static files are served correctly

### `_headers`
- Configures proper MIME types for JavaScript modules
- Ensures ES6 modules work correctly in browsers

### `manifest.json`
- Web app manifest for progressive web app features
- Enables "Add to Home Screen" functionality
- Improves mobile experience

## Troubleshooting

### JavaScript Modules Not Loading
If you experience issues with ES6 modules:
1. Ensure all JavaScript files are served with `application/javascript` MIME type
2. Check that the `_headers` file is properly configured
3. Verify that your browser supports ES6 modules

### 404 Errors
If you get 404 errors:
1. Check that the repository name matches the URL path
2. Ensure GitHub Pages is enabled in repository settings
3. Verify the workflow has completed successfully

### Deployment Failures
If the deployment workflow fails:
1. Check the Actions tab for error details
2. Ensure you have proper permissions set up
3. Verify the workflow file syntax is correct

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the repository root with your domain
2. Configure DNS settings with your domain provider
3. Enable "Enforce HTTPS" in GitHub Pages settings

Example `CNAME` file:
```
yourdomain.com
```

## Performance Optimization

The site is already optimized for GitHub Pages with:

- **Static Assets**: All resources are static files (no build process needed)
- **Image Optimization**: Card images are optimized for web delivery
- **Caching**: Proper cache headers for static assets
- **Compression**: GitHub Pages automatically serves compressed content

## Security

- All code runs client-side (no server-side vulnerabilities)
- No user data is collected or stored
- All assets are served over HTTPS
- No third-party dependencies or CDNs

## Monitoring

You can monitor your site's performance and usage through:

- **GitHub Pages Analytics**: Available in repository insights
- **Browser Developer Tools**: For performance debugging
- **GitHub Actions**: For deployment status and logs

## Support

If you encounter issues:

1. Check this guide first
2. Review GitHub Pages documentation
3. Check the repository issues for known problems
4. Create a new issue with detailed error information