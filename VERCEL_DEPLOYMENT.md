# Vercel Deployment Guide

## Problem: File Upload Failures on Vercel

Your app currently fails on Vercel because it uses **file-based storage** (JSON files in `data/` directory). Vercel's serverless functions have an **ephemeral filesystem** — any files written are lost when the function terminates. This causes:

- ❌ Upload endpoint returns "Error uploading" 
- ❌ Documents cannot persist between requests
- ❌ Embeddings are lost on cold starts
- ❌ Each function invocation starts with an empty database

## Solution: PostgreSQL + pgvector

Replace file-based storage with a persistent PostgreSQL database with pgvector extension for vector similarity.

### Step 1: Set Up PostgreSQL Database

You have several options:

#### Option A: Neon (Recommended for Vercel)
1. Go to https://neon.tech
2. Sign up (free tier available)
3. Create a new project
4. Copy the connection string (looks like `postgresql://user:password@host/dbname`)
5. Add to Vercel environment: `DATABASE_URL=<your-connection-string>`

#### Option B: Railway
1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Railway auto-creates a `DATABASE_URL` variable
4. Connect to Vercel

#### Option C: AWS RDS / Google Cloud SQL
- More expensive but more control
- Follow provider's connection string format

### Step 2: Update Dependencies

```bash
npm install pg pg-vector dotenv
```

Add to `package.json`:
```json
{
  "dependencies": {
    "pg": "^8.11.0",
    "pg-vector": "^0.1.0"
  }
}
```

### Step 3: Update Configuration

Update `.env` and `.env.example`:

```env
# Database (Vercel will auto-create this)
DATABASE_URL=postgresql://user:password@host/dbname

# Keep existing Groq config
GROQ_API_KEY=your_key_here
GROQ_MODEL=mixtral-8x7b-32768
PORT=3000
NODE_ENV=production

# Optional: Keep for local file-based fallback
DB_PATH=./data/documents.json
EMBEDDINGS_PATH=./data/embeddings.json
```

### Step 4: Update Storage Layer

The app now has a conditional storage adapter. Update `src/index.js`:

```javascript
import { initializePostgres } from './storage/postgres.js';
import config from './config.js';

// Use PostgreSQL on Vercel, fallback to files locally
const usePostgres = process.env.DATABASE_URL;

if (usePostgres) {
  await initializePostgres();
  console.log('📦 Using PostgreSQL storage');
} else {
  await initializeDataDirectory();
  console.log('📄 Using file-based storage (local development only)');
}
```

### Step 5: Update Document Routes

Replace `src/api/routes/documents.js` to use the appropriate storage adapter. See `/VERCEL_MIGRATION.md` for detailed code changes.

### Step 6: Update Config to Support Both Storages

Modify `src/config.js` to detect environment:

```javascript
export const useDatabase = !!process.env.DATABASE_URL;
export const storageMode = useDatabase ? 'postgresql' : 'file';
```

### Step 7: Deploy to Vercel

```bash
# 1. Commit changes
git add .
git commit -m "chore: add PostgreSQL support for Vercel deployment"

# 2. Push to GitHub/GitLab
git push origin main

# 3. Vercel auto-deploys on push, OR manually:
# - Go to https://vercel.com
# - Add environment variable DATABASE_URL (from Neon/Railway)
# - Deploy

vercel deploy --prod
```

### Step 8: Test on Vercel

```bash
# Upload a document
curl -X POST https://your-app.vercel.app/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Hello world"}'

# Query it
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What is in the document?"}'

# Verify persistence (refresh browser, query again)
```

## Temporary Workaround (Not Recommended)

If you cannot immediately set up PostgreSQL, you can:

1. Use environment variables to store small amounts of data (not scalable)
2. Use third-party services like Supabase, Firebase for storage
3. Keep app local-only until database is ready

This is NOT a production solution — Vercel functions are ephemeral by design.

## Common Issues

### Issue: "DATABASE_URL is not set"
**Solution**: Add `DATABASE_URL` to Vercel Environment Variables in project settings

### Issue: "pgvector extension not found"
**Solution**: Ensure your database provider (Neon, Railway) has pgvector pre-installed. Most do by default.

### Issue: Connection timeout
**Solution**: 
- Vercel functions have ~60s cold start timeout; ensure your database responds quickly
- Use connection pooling (already configured in `postgres.js`)
- Add DATABASE_CONNECTION_TIMEOUT to env if needed

### Issue: "Documents not found after upload"
**Solution**: Check that:
1. DATABASE_URL is set correctly
2. Database tables were created (check `initializePostgres()` logs)
3. Upload returned HTTP 201 (not 500)

## Rollback to File Storage (Local Development)

If you want to keep file-based storage for local development:

1. Don't set `DATABASE_URL` in `.env.local`
2. App will auto-detect and use file storage
3. Both modes coexist in the same codebase

## Next Steps

1. ✅ Create PostgreSQL database (Neon/Railway/RDS)
2. ✅ Add `DATABASE_URL` to Vercel environment
3. ✅ Update code to support both storages
4. ✅ Test locally with `DATABASE_URL` set
5. ✅ Deploy to Vercel and test
6. ✅ Monitor logs: `vercel logs` or Vercel dashboard

---

**After migration is complete**, you can delete:
- `src/utils/storage.js` (file-based adapter)
- `data/` directory
- `uploads/` directory

But keep them initially for safety and local development fallback.
