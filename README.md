# 🚀 AWS Infrastructure Monitoring Dashboard

> **Production-style AWS infrastructure monitoring platform built with Terraform, FastAPI, HTML, CSS, JavaScript, CloudWatch, CloudTrail, S3, CloudFront, and IAM.**

A cloud infrastructure monitoring dashboard designed to provide centralized visibility into AWS resources, infrastructure health, metrics, and AWS activity.

The project combines **Infrastructure as Code**, a Python-based REST API, AWS monitoring services, and a lightweight web interface to create a practical Cloud/DevOps monitoring platform.

---

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │        User         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   HTML / CSS / JS   │
                         │   Monitoring UI     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │      Backend        │
                         └──────────┬──────────┘
                                    │
                                    ▼
                              ┌───────────┐
                              │   Boto3   │
                              └─────┬─────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
          ┌──────┐             ┌──────────┐          ┌───────────┐
          │ EC2  │             │CloudWatch│          │CloudTrail │
          └──────┘             └──────────┘          └───────────┘
             │
             ▼
          ┌──────┐
          │ IAM  │
          └──────┘


                 AWS Infrastructure Layer

        ┌────────────────────────────────────────┐
        │                  VPC                   │
        │                                        │
        │  Public Subnets      Private Subnets  │
        │       │                     │           │
        │       ▼                     ▼           │
        │      EC2                  Services     │
        │                             │           │
        │                        NAT Gateway      │
        └────────────────────────────────────────┘

                         │
                         ▼
                  ┌─────────────┐
                  │     S3      │
                  │  Dashboard  │
                  └──────┬──────┘
                         │
                         ▼
                  ┌─────────────┐
                  │ CloudFront  │
                  │     CDN     │
                  └─────────────┘
```

---

# 🎯 Project Goals

The main objectives of this project are:

* Build AWS infrastructure using **Terraform**
* Monitor AWS resources through a centralized dashboard
* Retrieve AWS infrastructure data using **Boto3**
* Build a REST API using **FastAPI**
* Create a lightweight monitoring interface using **HTML, CSS, and JavaScript**
* Collect infrastructure metrics through **CloudWatch**
* Inspect AWS API activity through **CloudTrail**
* Apply IAM-based access control
* Host dashboard assets using **Amazon S3**
* Distribute the dashboard using **CloudFront**
* Build reusable and modular Terraform infrastructure
* Create a foundation for future monitoring automation

---

# ✨ Features

## ☁️ AWS Infrastructure Monitoring

The dashboard provides visibility into:

* EC2 instances
* EC2 health/status
* CPU utilization
* RDS resources
* CloudWatch metrics
* CloudTrail events
* AWS account connectivity
* Infrastructure health

---

## 📊 Monitoring Dashboard

The web interface provides a centralized view of the AWS environment.

```text
┌──────────────────────────────────────────────┐
│        AWS Infrastructure Monitoring         │
├──────────────┬──────────────┬───────────────┤
│ EC2 Instances│ RDS Databases│ CloudTrail    │
│              │              │ Events        │
├──────────────┴──────────────┴───────────────┤
│                                              │
│              CPU Monitoring                  │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│         Infrastructure Analysis              │
│                                              │
└──────────────────────────────────────────────┘
```

The dashboard periodically refreshes monitoring information from the backend API.

---

# 🔌 Backend API

The backend is built using:

* Python
* FastAPI
* Boto3
* Uvicorn

### API Endpoints

| Endpoint                  | Purpose                       |
| ------------------------- | ----------------------------- |
| `/`                       | API information               |
| `/api/health`             | Backend health check          |
| `/api/aws/status`         | AWS connectivity status       |
| `/api/aws/ec2`            | EC2 infrastructure data       |
| `/api/aws/rds`            | RDS infrastructure data       |
| `/api/aws/cloudwatch/cpu` | EC2 CPU metrics               |
| `/api/aws/cloudwatch/rds` | RDS monitoring metrics        |
| `/api/aws/cloudtrail`     | AWS activity/events           |
| `/api/ai/analyze`         | Infrastructure analysis layer |

---

# 🌐 Frontend

The monitoring interface is intentionally built using lightweight web technologies:

```text
HTML
CSS
JavaScript
```

The frontend communicates with the FastAPI backend using REST API requests.

```text
HTML / CSS / JavaScript
          │
          │ HTTP Requests
          ▼
       FastAPI
          │
          ▼
        Boto3
          │
          ▼
     AWS Services
```

This approach keeps the monitoring interface simple, fast, and easy to deploy as static content.

---

# 🏗️ Terraform Infrastructure

The AWS infrastructure is organized into reusable Terraform modules.

```text
terraform/
│
├── main.tf
├── providers.tf
├── variables.tf
├── outputs.tf
├── locals.tf
├── terraform.tfvars
│
└── modules/
    │
    ├── networking/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── iam/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── monitoring/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── dashboard/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    │
    └── ec2/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

---

# 🌐 AWS Networking

The infrastructure contains a dedicated VPC:

```text
VPC
10.0.0.0/16
│
├── Public Subnet
│
├── Public Subnet
│
├── Private Subnet
│
└── Private Subnet
```

Networking components include:

* VPC
* Internet Gateway
* Public Route Tables
* Private Route Tables
* NAT Gateway
* Elastic IP
* Public Subnets
* Private Subnets

The architecture separates public and private workloads and provides outbound connectivity for private resources through the NAT Gateway.

---

# 🖥️ EC2 Monitoring Server

Terraform provisions an EC2 monitoring server using:

```text
Amazon Linux 2023
t3.micro
Nginx
IAM Instance Profile
Security Group
```

The instance is configured automatically through Terraform `user_data`.

```text
Terraform
    │
    ▼
EC2
    │
    ├── Amazon Linux 2023
    ├── Nginx
    └── Monitoring Server
```

---

# 🔐 IAM & Security

The project uses an IAM role attached to the EC2 instance through an Instance Profile.

The monitoring role provides access required to retrieve monitoring information from:

* EC2
* CloudWatch
* CloudTrail
* RDS
* S3

Systems Manager permissions are also configured to support future **SSM-based EC2 management without SSH**.

---

# 📈 CloudWatch

Amazon CloudWatch is used as the primary monitoring data source.

The backend retrieves infrastructure metrics including:

```text
EC2 CPU Utilization
RDS Metrics
CloudWatch Alarms
```

The data is exposed through FastAPI and consumed by the monitoring dashboard.

---

# 🔎 CloudTrail

AWS CloudTrail provides visibility into AWS API activity.

The application can retrieve recent events to help identify:

* Resource changes
* API operations
* Infrastructure activity
* AWS service events

This adds an auditing and operational visibility layer to the platform.

---

# 🗄️ S3 + CloudFront

The dashboard can be delivered using a private S3 bucket and CloudFront.

```text
             Dashboard
                 │
                 ▼
          Private S3 Bucket
                 │
                 │ OAC
                 ▼
             CloudFront
                 │
                 ▼
               Users
```

The S3 bucket remains private while CloudFront provides controlled access to the dashboard.

---

# 🛠️ Technology Stack

## ☁️ AWS

* Amazon EC2
* Amazon VPC
* AWS IAM
* Amazon CloudWatch
* AWS CloudTrail
* Amazon S3
* Amazon CloudFront
* AWS Systems Manager

## 🏗️ Infrastructure as Code

* Terraform
* Terraform Modules
* AWS Provider

## 🔌 Backend

* Python
* FastAPI
* Boto3
* Uvicorn

## 🎨 Frontend

* HTML5
* CSS3
* JavaScript
* REST API
* Responsive Dashboard UI

## 🧰 Development & DevOps

* Git
* GitHub
* Git Bash
* VS Code
* AWS CLI
* AWS Toolkit

---

# 📁 Project Structure

```text
LEVEL-1-MONITORING-AGENT/
│
├── backend/
│   ├── main.py
│   ├── test_bedrock.py
│   └── venv/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── terraform/
    │
    ├── main.tf
    ├── providers.tf
    ├── variables.tf
    ├── outputs.tf
    ├── locals.tf
    ├── terraform.tfvars
    │
    └── modules/
        │
        ├── networking/
        ├── iam/
        ├── monitoring/
        ├── dashboard/
        └── ec2/
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/sabo1166/LEVEL-1-MONITORING-AGENT.git
cd LEVEL-1-MONITORING-AGENT
```

---

# 2. Configure AWS

Verify AWS authentication:

```bash
aws sts get-caller-identity
```

Check the configured region:

```bash
aws configure get region
```

The project currently uses:

```text
us-east-1
```

---

# 3. Deploy AWS Infrastructure

Navigate to Terraform:

```bash
cd terraform
```

Initialize Terraform:

```bash
terraform init
```

Format:

```bash
terraform fmt
```

Validate:

```bash
terraform validate
```

Review the deployment:

```bash
terraform plan
```

Deploy:

```bash
terraform apply
```

---

# 4. Start the Backend

Navigate to the backend:

```bash
cd ../backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
source venv/Scripts/activate
```

Install dependencies:

```bash
pip install fastapi uvicorn boto3
```

Start the API:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# 5. Run the Frontend

The frontend is a static HTML/CSS/JavaScript application.

You can serve it using a local web server or deploy it to S3.

Example using Python:

```bash
cd ../frontend
python -m http.server 3000
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Validation

### AWS Authentication

```bash
aws sts get-caller-identity
```

### Terraform

```bash
terraform validate
terraform plan
```

### Backend Health

```text
/api/health
```

### AWS Connectivity

```text
/api/aws/status
```

### EC2 Monitoring

```text
/api/aws/ec2
```

### CloudWatch

```text
/api/aws/cloudwatch/cpu
```

### CloudTrail

```text
/api/aws/cloudtrail
```

---

# 🔒 Security

Never commit credentials or sensitive infrastructure state.

The following should remain excluded from Git:

```text
.terraform/
terraform.tfstate
terraform.tfstate.backup
.env
venv/
node_modules/
*.pem
AWS credentials
```

Recommended practices:

* Use IAM roles where possible
* Avoid hardcoded AWS credentials
* Keep S3 buckets private
* Use CloudFront OAC for S3 access
* Apply least-privilege IAM permissions
* Store secrets outside source control

---

# 🗺️ Roadmap

## Phase 1 — AWS Infrastructure

* [x] Terraform project
* [x] VPC
* [x] Public subnets
* [x] Private subnets
* [x] Internet Gateway
* [x] NAT Gateway
* [x] IAM
* [x] EC2

## Phase 2 — Monitoring

* [x] CloudWatch integration
* [x] CloudTrail integration
* [x] EC2 monitoring
* [x] RDS monitoring layer
* [x] Infrastructure health API

## Phase 3 — Dashboard

* [x] FastAPI backend
* [x] HTML frontend
* [x] CSS styling
* [x] JavaScript API integration
* [x] Monitoring cards
* [x] CPU visualization
* [x] CloudTrail events
* [x] Auto-refresh

## Phase 4 — Cloud Delivery

* [x] Private S3
* [x] CloudFront
* [x] Origin Access Control
* [x] Dashboard distribution

## Phase 5 — Operations

* [ ] Complete SSM registration
* [ ] VS Code + AWS Toolkit SSM connection
* [ ] Remote EC2 management
* [ ] CPU stress testing
* [ ] CloudWatch alarm validation

## Future Development

* [ ] Automated remediation
* [ ] Alerting integrations
* [ ] Infrastructure anomaly detection
* [ ] Expanded RDS monitoring
* [ ] Automated incident response
* [ ] CI/CD pipeline
* [ ] Terraform remote state
* [ ] Authentication and authorization
* [ ] Multi-account monitoring

---

# 📚 What This Project Demonstrates

This project demonstrates practical Cloud and DevOps skills across the full infrastructure lifecycle:

```text
Terraform
    ↓
AWS Networking
    ↓
IAM & Security
    ↓
EC2
    ↓
CloudWatch
    ↓
CloudTrail
    ↓
FastAPI + Boto3
    ↓
HTML + CSS + JavaScript
    ↓
S3 + CloudFront
    ↓
Infrastructure Monitoring
```

The project combines **Infrastructure as Code, AWS monitoring, backend development, frontend development, security, and cloud deployment** into one practical portfolio project.

---

# 👨‍💻 Author

**Sabo1166**

GitHub:

https://github.com/sabo1166

Repository:

https://github.com/sabo1166/LEVEL-1-MONITORING-AGENT

---

## ⭐ Project Status

**Status:** Active Development

**Project:** AWS Infrastructure Monitoring Dashboard

**Cloud:** AWS

**Infrastructure:** Terraform

**Backend:** FastAPI + Boto3

**Frontend:** HTML + CSS + JavaScript

**Monitoring:** CloudWatch + CloudTrail

**Storage & CDN:** S3 + CloudFront

**Instance Management:** AWS Systems Manager
