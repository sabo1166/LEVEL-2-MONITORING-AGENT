output "ai_agent_role_arn" {
  description = "IAM role ARN for the AI Agent"
  value       = aws_iam_role.ai_agent.arn
}

output "ai_agent_role_name" {
  description = "IAM role name for the AI Agent"
  value       = aws_iam_role.ai_agent.name
}

output "ai_agent_instance_profile_name" {
  description = "EC2 instance profile name for the AI Agent"
  value       = aws_iam_instance_profile.ai_agent.name
}
