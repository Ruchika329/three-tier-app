# Three-Tier Web Application Deployment on AWS

MCA Project — HPTU | Three-Tier Architecture using Docker, ECS & CI/CD Pipeline

## Architecture
- **Frontend**: React.js (served via Nginx)
- **Backend**: Node.js + Express REST API
- **Database**: MySQL 8.0 (RDS on AWS / local Docker)

## Local Setup (Step 2)
```bash
docker-compose up --build
```
Open: http://localhost:3000

## AWS Deployment
1. AWS CLI configure karo
2. `cd terraform && terraform init && terraform apply`
3. Docker images ECR pe push karo
4. ECS services automatically deploy ho jaayenge

## CI/CD
GitHub Actions pe push karo — auto deploy hoga ECS pe.
