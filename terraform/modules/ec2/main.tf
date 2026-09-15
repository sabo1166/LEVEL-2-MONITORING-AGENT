data "aws_ami" "amazon_linux" {
  most_recent = true

  owners = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-${var.environment}-ec2-sg"
  description = "Security group for AWS monitoring EC2"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-ec2-sg"
    }
  )
}

resource "aws_instance" "monitoring" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  subnet_id = var.subnet_id

  iam_instance_profile = var.instance_profile_name

  vpc_security_group_ids = [
    aws_security_group.ec2.id
  ]

  associate_public_ip_address = true

  user_data = <<-EOF
  #!/bin/bash

  dnf update -y

  systemctl enable amazon-ssm-agent
  systemctl start amazon-ssm-agent

  dnf install -y nginx

  systemctl enable nginx
  systemctl start nginx

  cat > /usr/share/nginx/html/index.html <<'HTML'
  <!DOCTYPE html>
  <html>
  <head>
    <title>AWS Infrastructure Monitoring</title>
  </head>
  <body>
    <h1>AWS Infrastructure Monitoring Server</h1>
    <p>EC2 instance is healthy.</p>
  </body>
  </html>
  HTML
EOF

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-monitoring-server"
    }
  )
}