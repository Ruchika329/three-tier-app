variable "aws_region" {
  description = "AWS region to deploy in"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name prefix for all resources"
  default     = "three-tier-app"
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "public_subnets" {
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnets" {
  default = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "availability_zones" {
  default = ["us-east-1a", "us-east-1b"]
}

variable "db_password" {
  description = "MySQL database password"
  default     = "MySecureDBPass123!"
  sensitive   = true
}
