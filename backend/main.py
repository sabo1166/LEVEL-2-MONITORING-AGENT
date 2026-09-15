from datetime import datetime, timezone, timedelta

import boto3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="AWS AI Agent API",
    version="1.0.0",
    description="AWS infrastructure monitoring and AI analysis backend",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Helpers
# ============================================================

def utc_now():
    return datetime.now(timezone.utc)


def get_resource_name(tags):
    for tag in tags or []:
        if tag.get("Key") == "Name":
            return tag.get("Value", "Unnamed")

    return "Unnamed"


def get_latest_metric(
    cloudwatch,
    namespace,
    metric_name,
    dimensions,
    start_time,
    end_time,
    period=300,
):
    response = cloudwatch.get_metric_statistics(
        Namespace=namespace,
        MetricName=metric_name,
        Dimensions=dimensions,
        StartTime=start_time,
        EndTime=end_time,
        Period=period,
        Statistics=["Average"],
    )

    datapoints = response.get("Datapoints", [])

    if not datapoints:
        return None

    latest = max(
        datapoints,
        key=lambda item: item["Timestamp"],
    )

    return round(latest["Average"], 2)


# ============================================================
# Root
# ============================================================

@app.get("/")
def root():
    return {
        "service": "AWS AI Agent",
        "status": "running",
    }


# ============================================================
# Health Check
# ============================================================

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "aws-ai-agent-backend",
        "timestamp": utc_now().isoformat(),
    }


# ============================================================
# AWS Connection / Identity
# ============================================================

@app.get("/api/aws/status")
def aws_status():
    sts = boto3.client("sts")

    identity = sts.get_caller_identity()

    return {
        "status": "connected",
        "account_id": identity["Account"],
        "arn": identity["Arn"],
        "user_id": identity["UserId"],
    }


# ============================================================
# EC2 Instances
# ============================================================

@app.get("/api/aws/ec2")
def aws_ec2():
    ec2 = boto3.client("ec2")

    response = ec2.describe_instances()

    instances = []

    for reservation in response.get("Reservations", []):
        for instance in reservation.get("Instances", []):

            instances.append(
                {
                    "id": instance["InstanceId"],
                    "name": get_resource_name(
                        instance.get("Tags")
                    ),
                    "state": instance["State"]["Name"],
                    "instance_type": instance["InstanceType"],
                    "private_ip": instance.get(
                        "PrivateIpAddress"
                    ),
                    "public_ip": instance.get(
                        "PublicIpAddress"
                    ),
                    "availability_zone": instance[
                        "Placement"
                    ]["AvailabilityZone"],
                }
            )

    return {
        "status": "success",
        "count": len(instances),
        "instances": instances,
    }


# ============================================================
# RDS Databases
# ============================================================

@app.get("/api/aws/rds")
def aws_rds():
    rds = boto3.client("rds")

    response = rds.describe_db_instances()

    databases = []

    for db in response.get("DBInstances", []):

        databases.append(
            {
                "id": db["DBInstanceIdentifier"],
                "engine": db["Engine"],
                "engine_version": db.get(
                    "EngineVersion"
                ),
                "status": db["DBInstanceStatus"],
                "instance_class": db[
                    "DBInstanceClass"
                ],
                "availability_zone": db.get(
                    "AvailabilityZone"
                ),
                "endpoint": db.get(
                    "Endpoint",
                    {},
                ).get("Address"),
                "port": db.get(
                    "Endpoint",
                    {},
                ).get("Port"),
                "storage": db.get(
                    "AllocatedStorage"
                ),
            }
        )

    return {
        "status": "success",
        "count": len(databases),
        "databases": databases,
    }


# ============================================================
# CloudWatch EC2 CPU Metrics
# ============================================================

@app.get("/api/aws/cloudwatch/cpu")
def cloudwatch_cpu():
    ec2 = boto3.client("ec2")
    cloudwatch = boto3.client("cloudwatch")

    response = ec2.describe_instances()

    instances = []

    end_time = utc_now()
    start_time = end_time - timedelta(minutes=15)

    for reservation in response.get("Reservations", []):
        for instance in reservation.get("Instances", []):

            instance_id = instance["InstanceId"]

            name = get_resource_name(
                instance.get("Tags")
            )

            cpu = get_latest_metric(
                cloudwatch=cloudwatch,
                namespace="AWS/EC2",
                metric_name="CPUUtilization",
                dimensions=[
                    {
                        "Name": "InstanceId",
                        "Value": instance_id,
                    }
                ],
                start_time=start_time,
                end_time=end_time,
            )

            instances.append(
                {
                    "id": instance_id,
                    "name": name,
                    "cpu": cpu,
                }
            )

    return {
        "status": "success",
        "count": len(instances),
        "instances": instances,
    }


# ============================================================
# CloudWatch RDS Metrics
# ============================================================

@app.get("/api/aws/cloudwatch/rds")
def cloudwatch_rds():
    rds = boto3.client("rds")
    cloudwatch = boto3.client("cloudwatch")

    response = rds.describe_db_instances()

    databases = []

    end_time = utc_now()
    start_time = end_time - timedelta(minutes=15)

    for db in response.get("DBInstances", []):

        db_id = db["DBInstanceIdentifier"]

        dimensions = [
            {
                "Name": "DBInstanceIdentifier",
                "Value": db_id,
            }
        ]

        cpu = get_latest_metric(
            cloudwatch=cloudwatch,
            namespace="AWS/RDS",
            metric_name="CPUUtilization",
            dimensions=dimensions,
            start_time=start_time,
            end_time=end_time,
        )

        connections = get_latest_metric(
            cloudwatch=cloudwatch,
            namespace="AWS/RDS",
            metric_name="DatabaseConnections",
            dimensions=dimensions,
            start_time=start_time,
            end_time=end_time,
        )

        freeable_memory = get_latest_metric(
            cloudwatch=cloudwatch,
            namespace="AWS/RDS",
            metric_name="FreeableMemory",
            dimensions=dimensions,
            start_time=start_time,
            end_time=end_time,
        )

        read_latency = get_latest_metric(
            cloudwatch=cloudwatch,
            namespace="AWS/RDS",
            metric_name="ReadLatency",
            dimensions=dimensions,
            start_time=start_time,
            end_time=end_time,
        )

        write_latency = get_latest_metric(
            cloudwatch=cloudwatch,
            namespace="AWS/RDS",
            metric_name="WriteLatency",
            dimensions=dimensions,
            start_time=start_time,
            end_time=end_time,
        )

        databases.append(
            {
                "id": db_id,
                "engine": db["Engine"],
                "status": db["DBInstanceStatus"],
                "instance_class": db["DBInstanceClass"],
                "availability_zone": db.get(
                    "AvailabilityZone"
                ),
                "cpu": cpu,
                "connections": connections,
                "freeable_memory": freeable_memory,
                "read_latency": read_latency,
                "write_latency": write_latency,
            }
        )

    return {
        "status": "success",
        "count": len(databases),
        "databases": databases,
    }


# ============================================================
# CloudTrail Activity
# ============================================================

@app.get("/api/aws/cloudtrail")
def cloudtrail_activity():
    cloudtrail = boto3.client("cloudtrail")

    response = cloudtrail.lookup_events(
        MaxResults=20
    )

    events = []

    for event in response.get("Events", []):

        event_time = event.get("EventTime")

        events.append(
            {
                "event_id": event.get("EventId"),
                "event_name": event.get("EventName"),
                "event_source": event.get(
                    "EventSource"
                ),
                "username": event.get(
                    "Username"
                ),
                "event_time": (
                    event_time.isoformat()
                    if event_time
                    else None
                ),
            }
        )

    return {
        "status": "success",
        "count": len(events),
        "events": events,
    }


# ============================================================
# AI Infrastructure Analysis
# ============================================================

@app.get("/api/ai/analyze")
def ai_analyze():

    ec2 = boto3.client("ec2")
    rds = boto3.client("rds")
    cloudtrail = boto3.client("cloudtrail")

    # --------------------------------------------------------
    # Collect EC2
    # --------------------------------------------------------

    ec2_response = ec2.describe_instances()

    ec2_instances = []

    for reservation in ec2_response.get("Reservations", []):
        for instance in reservation.get("Instances", []):

            ec2_instances.append(
                {
                    "id": instance["InstanceId"],
                    "state": instance["State"]["Name"],
                    "type": instance["InstanceType"],
                }
            )

    # --------------------------------------------------------
    # Collect RDS
    # --------------------------------------------------------

    rds_response = rds.describe_db_instances()

    rds_databases = []

    for db in rds_response.get("DBInstances", []):

        rds_databases.append(
            {
                "id": db["DBInstanceIdentifier"],
                "status": db["DBInstanceStatus"],
                "engine": db["Engine"],
            }
        )

    # --------------------------------------------------------
    # Collect CloudTrail
    # --------------------------------------------------------

    cloudtrail_response = cloudtrail.lookup_events(
        MaxResults=20
    )

    events = cloudtrail_response.get("Events", [])

    # --------------------------------------------------------
    # AI Analysis
    # --------------------------------------------------------

    findings = []

    # EC2 analysis
    stopped_instances = [
        instance
        for instance in ec2_instances
        if instance["state"] != "running"
    ]

    if stopped_instances:

        findings.append(
            {
                "severity": "medium",
                "resource": "EC2",
                "problem": "EC2 instance is not running",
                "analysis": (
                    f"{len(stopped_instances)} EC2 "
                    "instance(s) are not in the running state."
                ),
                "recommendation": (
                    "Investigate the instance state and "
                    "determine whether the instance should "
                    "be started or intentionally remain stopped."
                ),
                "confidence": 0.95,
            }
        )

    # RDS analysis
    unavailable_databases = [
        database
        for database in rds_databases
        if database["status"] != "available"
    ]

    if unavailable_databases:

        findings.append(
            {
                "severity": "high",
                "resource": "RDS",
                "problem": "RDS database is unavailable",
                "analysis": (
                    f"{len(unavailable_databases)} RDS "
                    "database(s) are not available."
                ),
                "recommendation": (
                    "Check RDS events, CloudWatch metrics, "
                    "maintenance status, and database health."
                ),
                "confidence": 0.96,
            }
        )

    # No infrastructure
    if not ec2_instances and not rds_databases:

        findings.append(
            {
                "severity": "info",
                "resource": "Infrastructure",
                "problem": "No EC2 or RDS resources detected",
                "analysis": (
                    "The monitored AWS region currently "
                    "contains no EC2 or RDS resources."
                ),
                "recommendation": (
                    "Deploy infrastructure when required. "
                    "The AI Agent is ready to monitor new resources."
                ),
                "confidence": 1.0,
            }
        )

    # CloudTrail analysis
    if events:

        findings.append(
            {
                "severity": "info",
                "resource": "CloudTrail",
                "problem": "AWS activity detected",
                "analysis": (
                    f"{len(events)} recent CloudTrail "
                    "events were detected."
                ),
                "recommendation": (
                    "Continue monitoring API activity for "
                    "unexpected or high-risk operations."
                ),
                "confidence": 0.90,
            }
        )

    return {
        "status": "success",
        "analysis_time": utc_now().isoformat(),
        "summary": {
            "ec2_instances": len(ec2_instances),
            "rds_databases": len(rds_databases),
            "cloudtrail_events": len(events),
            "findings": len(findings),
        },
        "findings": findings,
    }