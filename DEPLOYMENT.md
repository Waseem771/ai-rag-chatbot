# Deployment Guide

Guide for deploying the RAG Chatbot to production environments.

## Heroku Deployment

### 1. Prepare Repository

```bash
# Create Procfile
echo "web: node src/index.js" > Procfile

# Commit changes
git add .
git commit -m "Prepare for Heroku deployment"
```

### 2. Deploy to Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set ANTHROPIC_API_KEY=sk-ant-...
heroku config:set NODE_ENV=production
heroku config:set MODEL_ID=claude-opus-4-8

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### 3. Use Heroku Postgres for Production

```bash
# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Check connection string
heroku config | grep DATABASE_URL
```

## AWS Deployment

### Using EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18

# Clone repository
git clone https://github.com/yourusername/ai-rag-chatbot.git
cd ai-rag-chatbot
npm install

# Set environment variables
cat > .env << EOF
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=production
PORT=3000
EOF

# Start with PM2
npm install -g pm2
pm2 start src/index.js --name "rag-chatbot"
pm2 save
pm2 startup

# Setup NGINX reverse proxy (optional)
# Configure to forward to localhost:3000
```

### Using Elastic Beanstalk

```bash
# Create .ebextensions/nodecommand.config
mkdir -p .ebextensions
cat > .ebextensions/nodecommand.config << EOF
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node src/index.js"
EOF

# Deploy
eb create rag-chatbot-env
eb setenv ANTHROPIC_API_KEY=sk-ant-...
eb deploy
```

## Docker Deployment

### Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src ./src

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "src/index.js"]
```

### Build and Run

```bash
# Build image
docker build -t rag-chatbot:latest .

# Run container
docker run \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e NODE_ENV=production \
  -p 3000:3000 \
  -v rag-data:/app/data \
  rag-chatbot:latest
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  rag-chatbot:
    build: .
    ports:
      - "3000:3000"
    environment:
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      NODE_ENV: production
      DB_PATH: /app/data/documents.json
      EMBEDDINGS_PATH: /app/data/embeddings.json
    volumes:
      - rag-data:/app/data
    restart: unless-stopped

  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: rag_chatbot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  rag-data:
  postgres-data:
```

Run with:
```bash
docker-compose up -d
```

## Production Best Practices

### 1. Environment Security

```bash
# Never commit .env file
echo ".env" >> .gitignore

# Use secrets management
# AWS: AWS Secrets Manager
# Heroku: Config vars
# Docker: Secrets or environment files
```

### 2. Database Upgrade

Replace JSON storage with PostgreSQL:

```bash
npm install pg
```

Create new storage layer using pgvector for embeddings.

### 3. Monitoring and Logging

```bash
# Install monitoring tools
npm install winston pino

# Setup log aggregation (ELK, Datadog, CloudWatch)
```

### 4. Caching

```bash
# Add Redis for caching frequently asked questions
npm install redis
```

### 5. Rate Limiting

```bash
# Install rate limiting middleware
npm install express-rate-limit
```

### 6. API Security

```bash
# Add CORS, helmet, and other security middleware
npm install helmet cors
```

### 7. Backup and Recovery

```bash
# Implement automated backups
# - Database backups
# - Document storage backups
# - Daily snapshots
```

## Scaling Considerations

1. **Load Balancing**: Use multiple instances behind a load balancer
2. **Database**: Migrate to PostgreSQL with pgvector
3. **Caching**: Add Redis for frequently accessed documents
4. **CDN**: Cache API responses with CloudFront or similar
5. **Async Processing**: Use message queues for long-running tasks

## CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
```

## Health Checks

```bash
# Test deployed application
curl https://your-app.herokuapp.com/health

# Should return:
# {"status":"ok","timestamp":"2026-07-19T09:16:19.759Z"}
```

## Rollback Procedures

### Heroku
```bash
heroku releases
heroku rollback
```

### AWS
```bash
aws elasticbeanstalk abort-environment-update --environment-name rag-chatbot-env
```

### Docker
```bash
docker-compose down
docker pull your-registry/rag-chatbot:previous-version
docker-compose up -d
```
