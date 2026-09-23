# Deploying Sampath Food City to AWS

This guide deploys the NestJS API as a containerized service on **ECS Fargate**,
backed by **RDS PostgreSQL**, fronted by an **Application Load Balancer**, with
images stored in **ECR** and a **GitHub Actions** CI/CD pipeline doing the
build/push/deploy on every push to `main`.

## Architecture

```
GitHub push → GitHub Actions (test → build image → push to ECR → deploy to ECS)
                                                              │
Internet → Route 53 (optional) → ALB (public subnets) ───────┤
                                                              ▼
                              ECS Fargate service (private subnets)
                              ┌─────────────────────────────┐
                              │ Task: sampath-food-city-api │
                              │ (2 tasks, auto scaled)      │
                              └──────────────┬──────────────┘
                                             │
                                             ▼
                              RDS PostgreSQL (private subnets, Multi-AZ)
                                             ▲
                              Secrets Manager (DB creds, JWT secret)
                                             ▲
                              CloudWatch Logs + Alarms (observability)
```

**Why these services:**
- **ECR** — private Docker registry, versioned by git SHA for easy rollback.
- **ECS Fargate** — runs containers without managing EC2 servers; scales tasks
  based on CPU/memory.
- **ALB** — health-checks `/health` on each task, routes traffic only to
  healthy tasks, terminates HTTPS.
- **RDS PostgreSQL** — managed database, automated backups, Multi-AZ failover.
- **Secrets Manager** — DB credentials and JWT secret are never hardcoded or
  committed; injected into the container at runtime.
- **CloudWatch** — centralized logs from every task, plus alarms on CPU/error
  rate.
- **VPC with public/private subnets** — only the ALB is internet-facing; the
  app and database sit in private subnets.

## 1. Prerequisites

- AWS account with the AWS CLI configured (`aws configure`)
- Docker installed locally
- An ECR repository, ECS cluster, and VPC (steps below)

## 2. One-time AWS setup

```bash
# 1. Create the ECR repository
aws ecr create-repository --repository-name sampath-food-city --region ap-south-1

# 2. Create the ECS cluster (Fargate)
aws ecs create-cluster --cluster-name sampath-food-city-cluster --region ap-south-1

# 3. Create a CloudWatch log group
aws logs create-log-group --log-group-name /ecs/sampath-food-city --region ap-south-1
```

**VPC / networking** (use the AWS Console for a first pass, it's faster than
CLI): create a VPC with 2 public subnets (for the ALB) and 2 private subnets
(for ECS tasks + RDS), a NAT gateway so private subnets can pull images/talk
to Secrets Manager, and security groups:
- `alb-sg`: inbound 443/80 from `0.0.0.0/0`
- `ecs-sg`: inbound 3000 from `alb-sg` only
- `rds-sg`: inbound 5432 from `ecs-sg` only

**RDS**: create a `db.t4g.micro` PostgreSQL instance in the private subnets,
not publicly accessible, security group `rds-sg`.

**Secrets Manager**: store DB host/port/username/password/dbname and the JWT
secret as a secret named `sampath-food-city/db` and `sampath-food-city/jwt`
(referenced in `aws/task-definition.json`).

**IAM**: `ecsTaskExecutionRole` (pulls images from ECR, reads secrets, writes
logs) and a `sampath-food-city-task-role` for the app's own AWS permissions.
For CI/CD, create an IAM role GitHub Actions can assume via OIDC
(`AWS_DEPLOY_ROLE_ARN` secret in the repo) rather than long-lived access keys.

**ALB + Target Group + ECS Service**: target group health-checks `GET
/health` on port 3000; ECS service (Fargate, desired count 2, private
subnets) registers its tasks to that target group.

## 3. Manual first deploy (before CI/CD is wired up)

```bash
# Build and push the image
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

docker build -t sampath-food-city .
docker tag sampath-food-city:latest <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/sampath-food-city:latest
docker push <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/sampath-food-city:latest

# Register the task definition (fill in <ACCOUNT_ID> in aws/task-definition.json first)
aws ecs register-task-definition --cli-input-json file://aws/task-definition.json

# Create the service (one-time; after this, deploys just update the task def)
aws ecs create-service \
  --cluster sampath-food-city-cluster \
  --service-name sampath-food-city-service \
  --task-definition sampath-food-city-task \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<PRIVATE_SUBNET_IDS>],securityGroups=[<ECS_SG_ID>],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=<TARGET_GROUP_ARN>,containerName=sampath-food-city-api,containerPort=3000"
```

## 4. Ongoing deploys: CI/CD

From then on, `.github/workflows/deploy.yml` handles everything: on every
push to `main` it runs lint/tests, builds the Docker image, pushes it to ECR
tagged with the commit SHA, renders a new task definition revision, and
updates the ECS service — with `wait-for-service-stability` so the pipeline
only goes green once the new tasks are actually healthy behind the ALB.
Rolling back is `aws ecs update-service --task-definition <previous-revision>`.

## 5. Local testing before pushing

```bash
docker compose up --build
curl http://localhost:3000/health
```

## Cost note

This setup (2 Fargate tasks, `db.t4g.micro` RDS, 1 NAT gateway, ALB) runs
roughly $50–70/month — for a portfolio/interview demo, you can drop to 1
Fargate task and shut it down when not needed to keep costs near zero.
