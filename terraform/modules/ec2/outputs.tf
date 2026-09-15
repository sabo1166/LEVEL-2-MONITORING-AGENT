output "instance_id" {
  value = aws_instance.monitoring.id
}

output "public_ip" {
  value = aws_instance.monitoring.public_ip
}

output "private_ip" {
  value = aws_instance.monitoring.private_ip
}

output "security_group_id" {
  value = aws_security_group.ec2.id
}