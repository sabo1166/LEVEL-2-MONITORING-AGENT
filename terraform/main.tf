module "networking" {
  source = "./modules/networking"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  vpc_cidr     = var.vpc_cidr
  common_tags  = local.common_tags
}


module "iam" {
  source = "./modules/iam"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags
}


module "monitoring" {
  source = "./modules/monitoring"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  common_tags  = local.common_tags
}

module "dashboard" {
  source = "./modules/dashboard"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.common_tags
}

module "ec2" {
  source = "./modules/ec2"

  project_name = var.project_name
  environment  = var.environment

  vpc_id = module.networking.vpc_id

  subnet_id = module.networking.public_subnet_ids[0]

  instance_profile_name = module.iam.ai_agent_instance_profile_name

  instance_type = "t3.micro"

  common_tags = local.common_tags
}