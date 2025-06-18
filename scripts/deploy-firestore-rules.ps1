# deploy-firestore-rules.ps1
# PowerShell script to deploy Firestore rules

Write-Host "Deploying Firestore rules..." -ForegroundColor Cyan

# Run the Firebase CLI command to deploy only Firestore rules
firebase deploy --only firestore:rules

Write-Host "Deployment complete!" -ForegroundColor Green
