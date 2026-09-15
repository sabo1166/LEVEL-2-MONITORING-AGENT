output "ai_agent_role_arn" {
  description = "IAM role ARN for the AI Agent"
  value       = module.iam.ai_agent_role_arn
}

output "ai_agent_role_name" {
  description = "IAM role name for the AI Agent"
  value       = module.iam.ai_agent_role_name
}

output "ai_agent_instance_profile_name" {
  description = "EC2 instance profile name for the AI Agent"
  value       = module.iam.ai_agent_instance_profile_name
}

output "ec2_instance_id" {
  description = "Monitoring EC2 instance ID"
  value       = module.ec2.instance_id
}

output "ec2_public_ip" {
  description = "Monitoring EC2 public IP"
  value       = module.ec2.public_ip
}

output "ec2_private_ip" {
  description = "Monitoring EC2 private IP"
  value       = module.ec2.private_ip
}

output "ec2_security_group_id" {
  description = "Monitoring EC2 security group ID"
  value       = module.ec2.security_group_id
}