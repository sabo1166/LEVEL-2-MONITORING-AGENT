resource "aws_iam_role" "ai_agent" {
  name = "${var.project_name}-${var.environment}-ai-agent-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-ai-agent-role"
    }
  )
}


resource "aws_iam_role_policy" "ai_agent_read_only" {
  name = "${var.project_name}-${var.environment}-ai-agent-read-only"
  role = aws_iam_role.ai_agent.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [

      # ----------------------------------------
      # CloudWatch
      # ----------------------------------------
      {
        Sid    = "CloudWatchRead"
        Effect = "Allow"

        Action = [
          "cloudwatch:GetMetricData",
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics",
          "cloudwatch:DescribeAlarms"
        ]

        Resource = "*"
      },

      # ----------------------------------------
      # CloudTrail
      # ----------------------------------------
      {
        Sid    = "CloudTrailRead"
        Effect = "Allow"

        Action = [
          "cloudtrail:LookupEvents",
          "cloudtrail:GetTrailStatus",
          "cloudtrail:DescribeTrails"
        ]

        Resource = "*"
      },

      # ----------------------------------------
      # EC2
      # ----------------------------------------
      {
        Sid    = "EC2Read"
        Effect = "Allow"

        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeInstanceStatus",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSubnets",
          "ec2:DescribeVpcs",
          "ec2:DescribeVolumes"
        ]

        Resource = "*"
      },

      # ----------------------------------------
      # RDS
      # ----------------------------------------
      {
        Sid    = "RDSRead"
        Effect = "Allow"

        Action = [
          "rds:DescribeDBInstances",
          "rds:DescribeDBClusters",
          "rds:DescribeDBParameters"
        ]

        Resource = "*"
      },

      # ----------------------------------------
      # S3
      # ----------------------------------------
      {
        Sid    = "S3Read"
        Effect = "Allow"

        Action = [
          "s3:GetBucketLocation",
          "s3:ListAllMyBuckets",
          "s3:GetObject",
          "s3:ListBucket"
        ]

        Resource = "*"
      },

      # ----------------------------------------
      # SSM
      # ----------------------------------------
      {
        Sid    = "SSMInstanceManagement"
        Effect = "Allow"

        Action = [
          "ssm:UpdateInstanceInformation",
          "ssm:DescribeInstanceInformation",

          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel",

          "ec2messages:GetMessages",
          "ec2messages:AcknowledgeMessage",
          "ec2messages:SendReply",
          "ec2messages:DeleteMessage",
          "ec2messages:FailMessage",
          "ec2messages:GetEndpoint"
        ]

        Resource = "*"
      },

      # ----------------------------------------
      # Amazon Bedrock
      # ----------------------------------------
      {
        Sid    = "BedrockInvoke"
        Effect = "Allow"

        Action = [
          "bedrock:InvokeModel",
          "bedrock:Converse"
        ]

        Resource = "*"
      }
    ]
  })
}


resource "aws_iam_instance_profile" "ai_agent" {
  name = "${var.project_name}-${var.environment}-ai-agent-profile"

  role = aws_iam_role.ai_agent.name

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-ai-agent-profile"
    }
  )
}