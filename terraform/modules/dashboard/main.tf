# ============================================================
# S3 Bucket
# ============================================================

resource "aws_s3_bucket" "dashboard" {
  bucket = "${var.project_name}-${var.environment}-dashboard"

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-dashboard"
    }
  )
}


# ============================================================
# S3 Ownership Controls
# ============================================================

resource "aws_s3_bucket_ownership_controls" "dashboard" {
  bucket = aws_s3_bucket.dashboard.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}


# ============================================================
# S3 Public Access Block
# ============================================================

resource "aws_s3_bucket_public_access_block" "dashboard" {
  bucket = aws_s3_bucket.dashboard.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


# ============================================================
# S3 Encryption
# ============================================================

resource "aws_s3_bucket_server_side_encryption_configuration" "dashboard" {
  bucket = aws_s3_bucket.dashboard.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}


# ============================================================
# CloudFront Origin Access Control
# ============================================================

resource "aws_cloudfront_origin_access_control" "dashboard" {
  name                              = "${var.project_name}-${var.environment}-dashboard-oac"
  description                       = "OAC for AI Agent Dashboard"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}


# ============================================================
# CloudFront Distribution
# ============================================================

resource "aws_cloudfront_distribution" "dashboard" {
  enabled = true

  comment = "${var.project_name}-${var.environment}-dashboard"

  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.dashboard.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.dashboard.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.dashboard.id
  }

  default_cache_behavior {
    target_origin_id       = "S3-${aws_s3_bucket.dashboard.id}"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    compress = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = merge(
    var.common_tags,
    {
      Name = "${var.project_name}-${var.environment}-dashboard-cdn"
    }
  )
}


# ============================================================
# S3 Bucket Policy
# ============================================================

data "aws_iam_policy_document" "dashboard" {

  statement {
    sid    = "AllowCloudFrontServicePrincipal"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject"
    ]

    resources = [
      "${aws_s3_bucket.dashboard.arn}/*"
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"

      values = [
        aws_cloudfront_distribution.dashboard.arn
      ]
    }
  }
}


resource "aws_s3_bucket_policy" "dashboard" {
  bucket = aws_s3_bucket.dashboard.id
  policy = data.aws_iam_policy_document.dashboard.json

  depends_on = [
    aws_s3_bucket_public_access_block.dashboard,
    aws_s3_bucket_ownership_controls.dashboard
  ]
}