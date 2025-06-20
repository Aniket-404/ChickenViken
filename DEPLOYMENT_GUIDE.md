# Deploying ChickenViken Applications on Render.com

This guide provides detailed steps for deploying the ChickenViken user-app and admin-app on Render.com.

## Prerequisites

1. GitHub repository with your ChickenViken project
2. A Render.com account
3. Firebase project (already set up)

## Step-by-Step Deployment Process

### 1. Prepare Your Repository

Ensure your repository is up-to-date with the following key files:
- Updated `render.yaml` with configurations for all services
- `.env.production` files for both user-app and admin-app
- All application code properly committed

### 2. Set Up Your Render Account

#### A. Create a Render.com Account
1. Go to [Render.com](https://render.com/)
2. Sign up for an account if you don't have one
3. Verify your email

#### B. Connect Your GitHub Repository
1. In the Render dashboard, click on "New" in the top right
2. Select "Blueprint"
3. Connect your GitHub account if not already connected
4. Grant Render access to your repository

### 3. Deploy Using Render Blueprint

#### A. Create a New Blueprint Instance
1. After connecting your repository, select it from the list
2. Render will automatically detect your `render.yaml` file
3. You'll see the services defined in your render.yaml:
   - chickenviken-api
   - chickenviken-user-app
   - chickenviken-admin-app

#### B. Configure Service Settings
1. Review each service configuration
2. For the API service, ensure environment variables are correctly set:
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_CLIENT_EMAIL`: Service account email from Firebase
   - `FIREBASE_PRIVATE_KEY`: Private key from Firebase (must include `\n` characters)

#### C. Deploy Services
1. Click "Apply" to start deploying all services
2. Render will begin building and deploying each service according to your configuration
3. This process may take several minutes

### 4. Monitor Deployment Progress

1. In the Render dashboard, navigate to the "Events" tab for each service
2. Watch for any build or deployment errors
3. If errors occur, check the logs for details

### 5. Verify Deployments

After all services show as "Live", test each application:

#### A. Test User Application
1. Open the user-app URL: `https://chickenviken-user-app.onrender.com`
2. Verify that the application loads correctly
3. Test core functionality (login, browsing products, etc.)

#### B. Test Admin Application
1. Open the admin-app URL: `https://chickenviken-admin-app.onrender.com`
2. Log in with admin credentials
3. Verify that you can access the dashboard and all admin features

#### C. Test API Integration
1. Ensure both applications can communicate with the API
2. Test data retrieval and submission in both apps

### 6. Set Up Custom Domains (Optional)

If you want to use custom domains for your applications:

1. In the Render dashboard, select the service
2. Go to "Settings" > "Custom Domain"
3. Follow the instructions to add and verify your domain
4. Update DNS records at your domain registrar

### 7. Set Up Continuous Deployment

Render automatically sets up continuous deployment:

1. Any push to your main branch will trigger a new deployment
2. To modify this behavior, go to service settings
3. Under "Build & Deploy", you can configure:
   - Auto-deploy settings
   - Branch to deploy from
   - Build hook URLs for manual triggers

## Troubleshooting Common Issues

### Build Failures
- Check that your package.json has the correct scripts for building
- Ensure all dependencies are correctly listed
- Verify that Node.js version is compatible with your application

### Environment Variables
- Double-check all environment variables are correctly set
- For Firebase credentials, ensure proper formatting
- For the private key, ensure it includes newline characters

### SPA Routing Issues
- Verify that the routes in render.yaml are correctly configured
- The rewrite rule should direct all routes to index.html

### API Connection Problems
- Check that the API URL in the .env.production files is correct
- Ensure CORS is properly configured in your API
- Verify that the API is functioning correctly

## Maintenance

### Monitoring
- Regularly check the Render dashboard for service status
- Set up monitoring and alerts in the Render dashboard

### Updates
- To update your applications, push changes to your GitHub repository
- Render will automatically deploy the updated code

### Scaling
- If needed, you can upgrade your Render plan for more resources
- Adjust service settings as your traffic grows

## Contact and Support

For Render-specific issues, consult the [Render documentation](https://render.com/docs) or contact Render support.

---

Document last updated: June 20, 2025
