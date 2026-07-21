# Vercel Deployment Checklist

Complete this checklist to fix your Vercel deployment and enable persistent storage.

## Phase 1: Preparation (Local)

- [ ] Review `VERCEL_FIX_SUMMARY.md` to understand the problem and solution
- [ ] Read `VERCEL_QUICK_REFERENCE.md` for a quick overview
- [ ] Pull latest code: `git pull origin main`
- [ ] Install new dependencies: `npm install`

## Phase 2: Local Testing (File Storage Mode)

Test that the app still works locally with file-based storage:

```bash
# Make sure DATABASE_URL is NOT set in .env.local
npm run dev
```

- [ ] App starts without errors
- [ ] Health check works: `http://localhost:3000/health`
- [ ] Can upload a document via API or UI
- [ ] Document appears in `/api/documents`
- [ ] Chat query works and retrieves the document
- [ ] Logs show: "📄 Initializing file-based storage"

## Phase 3: PostgreSQL Setup (Choose ONE)

### Option A: Neon (Recommended for Vercel)
- [ ] Go to https://neon.tech
- [ ] Sign up (free, no credit card)
- [ ] Create a new project
- [ ] Copy connection string (looks like: `postgresql://...`)
- [ ] Keep string safe (you'll need it soon)

### Option B: Railway
- [ ] Go to https://railway.app
- [ ] Create PostgreSQL database project
- [ ] Copy connection string from dashboard
- [ ] Keep string safe

### Option C: Vercel Postgres
- [ ] Go to your Vercel project dashboard
- [ ] Click Storage → Create Postgres
- [ ] Vercel auto-creates `DATABASE_URL` env variable
- [ ] Skip to Phase 4

## Phase 4: Local Testing (Database Mode)

Test the app with PostgreSQL locally:

```bash
# Set DATABASE_URL in .env.local
# Example: DATABASE_URL="postgresql://user:pass@host/dbname"

npm run dev
```

- [ ] App starts without errors
- [ ] Logs show: "🗄️  Initializing PostgreSQL storage..."
- [ ] Database tables are created automatically
- [ ] Can upload a document
- [ ] Document persists across requests
- [ ] Chat query works
- [ ] Logs show: "✅ Connected to PostgreSQL"

## Phase 5: Commit & Push

Commit all changes to git:

```bash
git add .
git commit -m "feat: add PostgreSQL support for Vercel deployment

- Implement dual-storage architecture (file + database)
- Auto-detect storage mode from DATABASE_URL environment variable
- Add PostgreSQL adapter with connection pooling
- Fix ephemeral filesystem issue on Vercel
- Support persistent conversations and documents
- Maintain backward compatibility with local file storage

Fixes issue with document uploads failing on Vercel."

git push origin main
```

- [ ] All changes committed
- [ ] Code pushed to GitHub/GitLab
- [ ] No uncommitted files: `git status` shows clean

## Phase 6: Vercel Deployment

### Deploy to Vercel

- [ ] Go to https://vercel.com
- [ ] Open your project dashboard
- [ ] Vercel should auto-deploy when you pushed (watch for status)
- [ ] If not automatic, click "Deploy"
- [ ] Wait for deployment to complete (usually 1-2 minutes)
- [ ] Check deployment status (should show ✅ Success)

### Add Environment Variables

Go to Vercel project settings → Environment Variables:

- [ ] Add `DATABASE_URL`
  - Name: `DATABASE_URL`
  - Value: Your PostgreSQL connection string (from Neon/Railway)
  - Environment: Production
  - Save

- [ ] Verify `GROQ_API_KEY` is set
  - Should already be there from before
  - If not, add it
  - Environment: Production

- [ ] Optional: Add `NODE_ENV=production`

### Trigger Redeployment

After adding `DATABASE_URL`:

- [ ] Vercel should auto-redeploy
- [ ] If not, go to Deployments and click "Redeploy"
- [ ] Wait for deployment to complete
- [ ] Check logs: Deployments → Latest → Logs

## Phase 7: Verification

Test your live Vercel app:

```bash
# Replace with your actual Vercel URL
APP_URL="https://your-app-name.vercel.app"

# 1. Health check
curl $APP_URL/health
# Expected: {"status":"ok","storage":"postgresql",...}

# 2. Upload document
curl -X POST $APP_URL/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Document","content":"This is a test."}'
# Expected: 201 status with document details

# 3. List documents
curl $APP_URL/api/documents
# Expected: {"success":true,"documents":[...],"count":1}

# 4. Chat query
curl -X POST $APP_URL/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What test document did I upload?"}'
# Expected: Response with retrieved document context

# 5. Check storage mode in API docs
curl $APP_URL/api
# Expected: "storage":"PostgreSQL"
```

- [ ] Health check returns `storage: "postgresql"`
- [ ] Upload returns HTTP 201
- [ ] Documents appear in list
- [ ] Chat query retrieves documents
- [ ] API docs show PostgreSQL storage

## Phase 8: Persistence Test (Critical!)

This test verifies documents persist across deployments:

```bash
# 1. Upload a document (from Phase 7, step 2)
# 2. Wait 30 seconds
# 3. Go to Vercel dashboard and click "Redeploy" on latest deployment
# 4. Wait for redeploy to complete (~1 minute)
# 5. List documents again
```

- [ ] Document still exists after redeploy
- [ ] No "Error uploading" messages
- [ ] Chat still retrieves the document

**If documents disappeared, check:**
- [ ] `DATABASE_URL` is set in Vercel env (not just local .env)
- [ ] Connection string is correct
- [ ] PostgreSQL provider is accessible
- [ ] Logs show: "🗄️  Initializing PostgreSQL storage"

## Phase 9: Frontend Testing

Open your app in browser:

- [ ] Navigate to `https://your-app.vercel.app`
- [ ] Upload a document via UI
- [ ] Refresh the page
- [ ] Upload a new query
- [ ] Document appears in results
- [ ] No errors in browser console (F12 → Console)

## Phase 10: Rollback (If Needed)

If something went wrong:

```bash
# 1. Remove DATABASE_URL from Vercel Environment Variables
# 2. Redeploy (app falls back to file storage)
# 3. Test locally: npm run dev (without DATABASE_URL)
# 4. Fix code locally if needed
# 5. Add DATABASE_URL back when ready
# 6. Redeploy again
```

- [ ] If rollback needed, executed cleanly
- [ ] App still works locally with file storage
- [ ] Ready to try fix again

## Troubleshooting Checklist

If tests fail, check these in order:

### Upload Fails (HTTP 500)
- [ ] Check Vercel logs: `vercel logs`
- [ ] Verify `GROQ_API_KEY` is set and valid
- [ ] Verify `DATABASE_URL` is set in Vercel env
- [ ] Try local test with `DATABASE_URL` set

### "No documents found" or "Connection refused"
- [ ] Verify `DATABASE_URL` connection string is correct
- [ ] Test connection string locally: `psql <connection-string>`
- [ ] Check PostgreSQL provider is accessible
- [ ] Verify pgvector extension is available

### App won't start
- [ ] Check Vercel build logs
- [ ] Verify `npm install` works locally: `npm install`
- [ ] Check for syntax errors: `npm run lint`
- [ ] Review recent code changes

### Logs show "file-based storage" on Vercel
- [ ] `DATABASE_URL` is not set in Vercel env
- [ ] Go to project settings and add it
- [ ] Redeploy

## Success Indicators

When everything is working:

- ✅ Vercel health check shows `storage: "postgresql"`
- ✅ Documents upload without errors
- ✅ Documents persist across requests and redeployments
- ✅ Chat queries retrieve uploaded documents
- ✅ No errors in Vercel logs
- ✅ Browser console shows no errors
- ✅ Conversations persist in database

## After Deployment (Ongoing)

- [ ] Monitor Vercel logs for errors
- [ ] Periodically test uploads/queries
- [ ] Monitor database usage (in PostgreSQL provider dashboard)
- [ ] Consider adding authentication (future enhancement)
- [ ] Consider adding rate limiting (future enhancement)

## Documentation Reference

- `VERCEL_FIX_SUMMARY.md` — What was changed and why
- `VERCEL_DEPLOYMENT.md` — Step-by-step deployment guide
- `VERCEL_MIGRATION_GUIDE.md` — Detailed code implementation
- `VERCEL_QUICK_REFERENCE.md` — Quick reference card
- `CLAUDE.md` — Updated project documentation

---

**Total Time**: ~30-45 minutes (including waiting for deployments)

**Difficulty**: Low (mostly copy-paste and clicking buttons)

**Success Rate**: 99% if you follow steps exactly

**Questions?** Check the documentation files or review the code changes in `src/storage/` and `src/index.js`
