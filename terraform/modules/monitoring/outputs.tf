output "ai_agent_log_group_name" {
  description = "AI Agent CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.ai_agent.name
}

output "application_log_group_name" {
  description = "Application CloudWatch Log Group"
  value       = aws_cloudwatch_log_group.application.name
}

output "cloudtrail_name" {
  description = "CloudTrail name"
  value       = aws_cloudtrail.main.name
}

output "cloudtrail_bucket" {
  description = "CloudTrail S3 bucket"
  value       = aws_s3_bucket.cloudtrail.id
}