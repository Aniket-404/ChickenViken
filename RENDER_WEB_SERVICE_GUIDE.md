# Deploying React Apps as Web Services on Render

This guide explains how to deploy your ChickenViken user-app and admin-app as web services on Render.com.

## Current Configuration

Your `render.yaml` file is configured to deploy:

1. **Backend API** (`chickenviken-api`)
   - Type: Web Service
   - Runtime: Node.js
   - Start Command: `cd server && npm run start`

2. **User App** (`chickenviken-user-app`)
   - Type: Web Service
   - Runtime: Node.js
   - Build Command: `cd user-app && npm install && npm run build`
   - Start Command: `cd user-app && npx serve -s dist`

3. **Admin App** (`chickenviken-admin-app`)
   - Type: Web Service
   - Runtime: Node.js
   - Build Command: `cd admin-app && npm install && npm run build`
   - Start Command: `cd admin-app && npx serve -s dist`

## Why Web Services vs. Static Sites

You've chosen to deploy your React apps as web services rather than static sites on Render. Here's what this means:

**Web Service Deployment:**
- Runs a Node.js server (`serve`) to serve your static files
- Requires a start command to run the server
- Uses more resources (since a server is running)
- Gives you more control over how files are served
- Can be useful if you need server-side functionality

**Static Site Deployment:**
- Files are served directly by Render's CDN
- No server process is running
- More cost-effective and faster
- Simpler configuration

## Deployment Steps

1. **Make sure 'serve' is installed in your project**

   Add serve as a dependency to both user-app and admin-app:

   ```bash
   cd user-app
   npm install --save serve
   
   cd ../admin-app
   npm install --save serve
   ```

   This ensures that `serve` is available during deployment.

2. **Add a serve script to package.json**

   In both user-app/package.json and admin-app/package.json, add:

   ```json
   "scripts": {
     "serve": "serve -s dist"
   }
   ```

   Then update your render.yaml to use:
   ```
   startCommand: cd user-app && npm run serve
   ```

3. **Push your changes to GitHub**

   ```bash
   git add .
   git commit -m "Update configuration for Render deployment"
   git push
   ```

4. **Deploy on Render**

   - Log in to Render Dashboard
   - Connect your GitHub repository
   - Deploy using the Blueprint option
   - Render will use your render.yaml configuration

## Verifying Your Deployment

After deployment is complete:

1. Check the Render dashboard for successful deployments
2. Test your applications at their Render URLs:
   - User App: `https://chickenviken-user-app.onrender.com`
   - Admin App: `https://chickenviken-admin-app.onrender.com`
   - API: `https://chickenviken-api.onrender.com`

## Environment Variables

Make sure all necessary environment variables are set in Render dashboard:

1. For API service:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

2. For user-app and admin-app:
   - Set any environment variables needed by your React applications

## Troubleshooting

If you encounter issues:

1. **Build Failures:**
   - Check build logs in Render dashboard
   - Verify that dependencies are installed correctly

2. **Startup Failures:**
   - Make sure `serve` is installed
   - Check that the dist directory exists after build

3. **Application Errors:**
   - Check browser console for errors
   - Verify that environment variables are correctly set

## Maintenance

Render automatically deploys when you push changes to your repository. To update:

1. Make changes to your code
2. Push to GitHub
3. Render will automatically rebuild and redeploy
