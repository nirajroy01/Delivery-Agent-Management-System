# AWS EC2 production deployment

This repository is set up so the backend can be deployed on an AWS EC2 Ubuntu instance with Docker Compose while keeping the existing local development flow intact.

## 1. Create the EC2 instance

Create an Ubuntu EC2 t3.micro instance.

Allow the security group to expose only what is needed:

- 22/tcp for SSH
- 80/tcp for HTTP
- 443/tcp for HTTPS

Do not expose:

- 27017 (MongoDB)
- 6379 (Redis)

The application can keep Redis private to the Docker network and leave MongoDB Atlas external.

## 2. Connect to the EC2 instance

```bash
ssh -i YOUR_KEY_PAIR.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## 3. Install Docker and Docker Compose

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verify:

```bash
docker --version
docker compose version
```

## 4. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_REPOSITORY_NAME
```

## 5. Create the backend environment file

Create the production env file manually on the EC2 instance:

```bash
nano backend/.env
```

Use values like:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/delivery_agent_management
REDIS_URL=redis://redis:6379
REDIS_CACHE_TTL=60
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=https://your-frontend-domain.com
```

### Environment variable notes

- `PORT` — application port, usually `5000`
- `NODE_ENV` — set to `production`
- `MONGODB_URI` — MongoDB Atlas connection string
- `REDIS_URL` — for Docker Compose, use `redis://redis:6379`
- `REDIS_CACHE_TTL` — cache lifetime in seconds
- `JWT_SECRET` — strong secret for JWT signing
- `JWT_EXPIRES_IN` — token validity, usually `1d`
- `CORS_ORIGIN` — deployed frontend URL

Important:

- MongoDB is external and remains in MongoDB Atlas.
- Redis runs inside the Docker Compose stack on the private Docker network.
- Do not use `redis://localhost:6379` inside the backend container; the backend container must use the Redis service name `redis`.

## 6. Start the production stack

From the repository root:

```bash
docker compose -f docker-compose-prod.yml up -d --build
```

This will:

- build the backend image
- pull Redis
- create the Redis volume
- start Redis with persistence enabled
- start the backend container
- expose the backend on port `5000`

## 7. Check the status

```bash
docker compose -f docker-compose-prod.yml ps
```

Check logs:

```bash
docker compose -f docker-compose-prod.yml logs -f backend
docker compose -f docker-compose-prod.yml logs -f redis
```

## 8. Health check

Inside the EC2 instance:

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "API is healthy",
  "environment": "production"
}
```

## 9. Internet access

The backend is exposed on port `5000` in the Docker Compose file for simplicity during the first deployment. Later, you can place Nginx in front of it and open only:

- 80
- 443

through the EC2 security group.

Do not expose Redis or MongoDB publicly.

## 10. Nginx and HTTPS

If you want the API to be served through a domain name or a reverse proxy:

- install Nginx on EC2
- proxy traffic to `http://127.0.0.1:5000`
- configure TLS with Lets Encrypt or your existing certificate manager

This is optional for the first working deployment and not required to run the backend itself.

## 11. Update the application

When you pull new code:

```bash
git pull

docker compose -f docker-compose-prod.yml up -d --build
```

## 12. Restart the stack

```bash
docker compose -f docker-compose-prod.yml restart
```

## 13. Stop the stack

```bash
docker compose -f docker-compose-prod.yml down
```

## 14. Troubleshooting

### Backend container fails to start

```bash
docker compose -f docker-compose-prod.yml logs -f backend
```

Check:

- `backend/.env` exists
- `MONGODB_URI` is valid
- `REDIS_URL` is set to `redis://redis:6379`
- `JWT_SECRET` is set

### Redis health failure

```bash
docker compose -f docker-compose-prod.yml logs -f redis
```

### Health endpoint not responding

```bash
curl http://localhost:5000/api/health
```

If it fails, check whether the backend container is still starting and look at the logs.

## 15. Important notes

- The existing local development setup in `docker-compose.yml` remains unchanged.
- The production setup is isolated in `docker-compose-prod.yml`.
- MongoDB is not part of the production Docker stack because MongoDB Atlas is used.
- Redis is the only extra service running in the production deployment.
- The backend container uses the existing Express API and existing MongoDB/Mongoose logic without a rewrite.

## 16. Optional EC2 memory note

A t3.micro instance has limited memory. Docker image builds can consume memory, so if build time becomes heavy, add a small swap file before building. This is optional, but can help on tight memory constraints.

Example:

```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 17. Production flow summary

```bash
git clone <repo>
cd <repo>
nano backend/.env
docker compose -f docker-compose-prod.yml up -d --build
docker compose -f docker-compose-prod.yml ps
curl http://localhost:5000/api/health
```
