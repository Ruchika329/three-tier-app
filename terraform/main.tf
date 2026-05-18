terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "aws" {
  region = var.aws_region
}

# ─── VPC ───────────────────────────────────────────
module "vpc" {
  source             = "./modules/vpc"
  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  public_subnets     = var.public_subnets
  private_subnets    = var.private_subnets
  availability_zones = var.availability_zones
}

# ─── ECR Repositories ──────────────────────────────
resource "aws_ecr_repository" "frontend" {
  name                 = "${var.project_name}-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

# ─── RDS (MySQL) ───────────────────────────────────
module "rds" {
  source          = "./modules/rds"
  project_name    = var.project_name
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnet_ids
  db_password     = var.db_password
}

# ─── ALB ───────────────────────────────────────────
module "alb" {
  source         = "./modules/alb"
  project_name   = var.project_name
  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnet_ids
}

# ─── ECS ───────────────────────────────────────────
module "ecs" {
  source              = "./modules/ecs"
  project_name        = var.project_name
  vpc_id              = module.vpc.vpc_id
  private_subnets     = module.vpc.private_subnet_ids
  frontend_image      = "${aws_ecr_repository.frontend.repository_url}:latest"
  backend_image       = "${aws_ecr_repository.backend.repository_url}:latest"
  alb_target_group_frontend = module.alb.frontend_tg_arn
  alb_target_group_backend  = module.alb.backend_tg_arn
  alb_sg_id           = module.alb.alb_sg_id
  db_host             = module.rds.db_endpoint
  db_password         = var.db_password
  aws_region          = var.aws_region
}
