#!/bin/bash
# Vercel Deployment Script
# Run this to deploy the app to Vercel

echo "🚀 AI RAG Chatbot - Vercel Deployment Script"
echo "=============================================="

# Step 1: Verify git is ready
echo ""
echo "Step 1: Checking git status..."
git status

# Step 2: Push to GitHub
echo ""
echo "Step 2: Pushing code to GitHub..."
echo "NOTE: You may be prompted for GitHub credentials"
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully!"
else
    echo "❌ Failed to push code"
    echo "Please check your GitHub credentials and try again"
    exit 1
fi

# Step 3: Vercel auto-deploys
echo ""
echo "✅ DEPLOYMENT INITIATED!"
echo ""
echo "Vercel will auto-deploy your changes in 1-2 minutes."
echo ""
echo "Next steps:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Watch your deployment progress"
echo "3. Once deployed, test at: https://ai-rag-chat-bot-5985-rh6l4ta5l-waseem771s-projects.vercel.app"
echo ""
echo "Your app should now work properly with file-based storage!"
