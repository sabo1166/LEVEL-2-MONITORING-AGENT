"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";

import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Cloud,
  Cpu,
  Database,
  FileText,
  LayoutDashboard,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = "http://localhost:8000";

// ============================================================
// Types
// ============================================================

type AWSStatus = {
  status: string;
  account_id?: string;
  arn?: string;
  user_id?: string;
};

type EC2Instance = {
  id: string;
  name: string;
  state: string;
  instance_type: string;
  private_ip?: string;
  public_ip?: string;
  availability_zone: string;
};

type EC2Response = {
  status: string;
  count: number;
  instances: EC2Instance[];
};

type RDSDatabase = {
  id: string;
  engine: string;
  engine_version?: string;
  status: string;
  instance_class: string;
  availability_zone?: string;
  endpoint?: string;
  port?: number;
  storage?: number;
};

type RDSResponse = {
  status: string;
  count: number;
  databases: RDSDatabase[];
};

type CPUInstance = {
  id: string;
  name: string;
  cpu: number | null;
};

type CPUResponse = {
  status: string;
  count: number;
  instances: CPUInstance[];
};

type RDSMetric = {
  id: string;
  engine?: string;
  status?: string;
  instance_class?: string;
  availability_zone?: string;
  cpu: number | null;
  connections: number | null;
  freeable_memory: number | null;
  read_latency: number | null;
  write_latency: number | null;
};

type RDSMetricResponse = {
  status: string;
  count: number;
  databases: RDSMetric[];
};

type CloudTrailEvent = {
  event_id?: string;
  event_name?: string;
  event_source?: string;
  username?: string;
  event_time?: string;
};

type CloudTrailResponse = {
  status: string;
  count: number;
  events: CloudTrailEvent[];
};

type AIFinding = {
  severity: "info" | "low" | "medium" | "high" | "critical";
  resource: string;
  problem: string;
  analysis: string;
  recommendation: string;
  confidence: number;
};

type AIAnalysisResponse = {
  status: string;
  analysis_time: string;
  summary: {
    ec2_instances: number;
    rds_databases: number;
    cloudtrail_events: number;
    findings: number;
  };
  findings: AIFinding[];
};

// ============================================================
// Components
// ============================================================

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  danger = false,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>

          <h2
            className={`mt-2 text-3xl font-bold ${
              danger ? "text-red-400" : "text-white"
            }`}
          >
            {value}
          </h2>

          <p className="mt-2 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div
          className={`rounded-xl p-3 ${
            danger
              ? "bg-red-500/10 text-red-400"
              : "bg-blue-500/10 text-blue-400"
          }`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Service({
  name,
  status,
  value,
  icon: Icon,
}: {
  name: string;
  status: "Healthy" | "Attention";
  value: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}) {
  const healthy = status === "Healthy";

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-800 p-2 text-blue-400">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-sm font-medium text-white">
            {name}
          </p>

          <p className="text-xs text-slate-500">
            {value}
          </p>
        </div>
      </div>

      <div
        className={`flex items-center gap-1 text-xs ${
          healthy
            ? "text-emerald-400"
            : "text-amber-400"
        }`}
      >
        {healthy ? (
          <CheckCircle2 size={14} />
        ) : (
          <AlertTriangle size={14} />
        )}

        {status}
      </div>
    </div>
  );
}

function EmptyState({
  message,
  icon: Icon = Server,
}: {
  message: string;
  icon?: ComponentType<{
    size?: number;
    className?: string;
  }>;
}) {
  return (
    <div className="flex min-h-[170px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 text-center">
      <Icon
        size={30}
        className="mb-3 text-slate-600"
      />

      <p className="text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function severityClass(
  severity: AIFinding["severity"],
) {
  switch (severity) {
    case "critical":
      return "bg-red-500/10 text-red-400";

    case "high":
      return "bg-red-500/10 text-red-400";

    case "medium":
      return "bg-amber-500/10 text-amber-400";

    case "low":
      return "bg-blue-500/10 text-blue-400";

    default:
      return "bg-slate-800 text-slate-400";
  }
}

// ============================================================
// Dashboard
// ============================================================

export default function Home() {
  const [awsStatus, setAwsStatus] =
    useState<AWSStatus | null>(null);

  const [ec2Data, setEc2Data] =
    useState<EC2Response | null>(null);

  const [rdsData, setRdsData] =
    useState<RDSResponse | null>(null);

  const [cpuData, setCpuData] =
    useState<CPUResponse | null>(null);

  const [rdsMetrics, setRdsMetrics] =
    useState<RDSMetricResponse | null>(null);

  const [cloudTrailData, setCloudTrailData] =
    useState<CloudTrailResponse | null>(null);

  const [aiAnalysis, setAIAnalysis] =
    useState<AIAnalysisResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // Load AWS Data
  // ==========================================================

  async function loadAWSData(
    isRefresh = false,
  ) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const responses = await Promise.all([
        fetch(`${API_URL}/api/aws/status`),
        fetch(`${API_URL}/api/aws/ec2`),
        fetch(`${API_URL}/api/aws/rds`),
        fetch(`${API_URL}/api/aws/cloudwatch/cpu`),
        fetch(`${API_URL}/api/aws/cloudwatch/rds`),
        fetch(`${API_URL}/api/aws/cloudtrail`),
        fetch(`${API_URL}/api/ai/analyze`),
      ]);

      if (
        responses.some(
          (response) => !response.ok,
        )
      ) {
        throw new Error(
          "One or more AWS API requests failed.",
        );
      }

      const [
        statusJson,
        ec2Json,
        rdsJson,
        cpuJson,
        rdsMetricJson,
        cloudTrailJson,
        aiJson,
      ] = await Promise.all(
        responses.map((response) =>
          response.json(),
        ),
      );

      setAwsStatus(statusJson);
      setEc2Data(ec2Json);
      setRdsData(rdsJson);
      setCpuData(cpuJson);
      setRdsMetrics(rdsMetricJson);
      setCloudTrailData(cloudTrailJson);
      setAIAnalysis(aiJson);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to the FastAPI backend. Make sure the backend is running on port 8000.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ==========================================================
  // Auto Refresh
  // ==========================================================

  useEffect(() => {
    loadAWSData();

    const interval = setInterval(() => {
      loadAWSData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================================
  // Calculations
  // ==========================================================

  const awsConnected =
    awsStatus?.status === "connected";

  const ec2Count =
    ec2Data?.count ?? 0;

  const rdsCount =
    rdsData?.count ?? 0;

  const cloudTrailCount =
    cloudTrailData?.count ?? 0;

  const runningInstances =
    useMemo(
      () =>
        ec2Data?.instances.filter(
          (instance) =>
            instance.state === "running",
        ).length ?? 0,
      [ec2Data],
    );

  const unhealthyInstances =
    useMemo(
      () =>
        ec2Data?.instances.filter(
          (instance) =>
            instance.state !== "running",
        ).length ?? 0,
      [ec2Data],
    );

  const availableRDS =
    useMemo(
      () =>
        rdsData?.databases.filter(
          (database) =>
            database.status === "available",
        ).length ?? 0,
      [rdsData],
    );

  const unhealthyRDS =
    useMemo(
      () =>
        rdsData?.databases.filter(
          (database) =>
            database.status !== "available",
        ).length ?? 0,
      [rdsData],
    );

  const averageCPU =
    useMemo(() => {
      const values =
        cpuData?.instances
          .map(
            (instance) =>
              instance.cpu,
          )
          .filter(
            (
              cpu,
            ): cpu is number =>
              cpu !== null,
          ) ?? [];

      if (values.length === 0) {
        return 0;
      }

      return Number(
        (
          values.reduce(
            (sum, cpu) =>
              sum + cpu,
            0,
          ) / values.length
        ).toFixed(1),
      );
    }, [cpuData]);

  const chartData =
    useMemo(
      () =>
        cpuData?.instances.map(
          (instance) => ({
            name:
              instance.name ||
              instance.id,
            cpu:
              instance.cpu ?? 0,
          }),
        ) ?? [],
      [cpuData],
    );

  const aiFindings =
    aiAnalysis?.findings ?? [];

  // ==========================================================
  // Loading
  // ==========================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw
            size={32}
            className="animate-spin text-blue-500"
          />

          <p className="text-sm text-slate-400">
            Loading AWS AI Agent...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">

        {/* ==================================================
            Sidebar
        ================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-5 lg:block">

          <div className="mb-8 flex items-center gap-3">

            <div className="rounded-xl bg-blue-600 p-2.5">
              <Brain size={22} />
            </div>

            <div>
              <h1 className="font-bold">
                AWS AI Agent
              </h1>

              <p className="text-xs text-slate-500">
                Monitoring Platform
              </p>
            </div>

          </div>

          <nav className="space-y-2">

            <NavItem
              icon={
                <LayoutDashboard size={18} />
              }
              label="Dashboard"
              active
            />

            <NavItem
              icon={
                <Server size={18} />
              }
              label="EC2 Instances"
            />

            <NavItem
              icon={
                <Database size={18} />
              }
              label="RDS Databases"
            />

            <NavItem
              icon={
                <Activity size={18} />
              }
              label="CloudWatch"
            />

            <NavItem
              icon={
                <FileText size={18} />
              }
              label="CloudTrail"
            />

            <NavItem
              icon={
                <Brain size={18} />
              }
              label="AI Analysis"
            />

          </nav>

          <div className="mt-8 border-t border-slate-800 pt-6">

            <NavItem
              icon={
                <Settings size={18} />
              }
              label="Settings"
            />

          </div>

          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4">

            <div className="flex items-center gap-2">

              {awsConnected ? (
                <CheckCircle2
                  size={16}
                  className="text-emerald-400"
                />
              ) : (
                <XCircle
                  size={16}
                  className="text-red-400"
                />
              )}

              <span className="text-xs text-slate-400">
                AWS Connection
              </span>

            </div>

            <p className="mt-2 text-sm font-medium">
              {awsConnected
                ? "Connected"
                : "Offline"}
            </p>

          </div>

        </aside>

        {/* ==================================================
            Main
        ================================================== */}

        <section className="flex-1">

          {/* Header */}

          <header className="flex flex-col gap-4 border-b border-slate-800 bg-slate-950/90 px-5 py-5 backdrop-blur md:flex-row md:items-center md:justify-between md:px-8">

            <div className="flex items-center gap-3">

              <div className="rounded-lg bg-blue-600/10 p-2 text-blue-400 lg:hidden">
                <Brain size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Infrastructure Dashboard
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Real-time AWS infrastructure monitoring
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3">

              <div
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                  awsConnected
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                    : "border-red-500/20 bg-red-500/5 text-red-400"
                }`}
              >

                {awsConnected ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <XCircle size={14} />
                )}

                {awsConnected
                  ? "AWS Connected"
                  : "AWS Offline"}

              </div>

              <button
                onClick={() =>
                  loadAWSData(true)
                }
                disabled={refreshing}
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

            </div>

          </header>

          <div className="space-y-6 p-5 md:p-8">

            {/* Error */}

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">

                <XCircle size={18} />

                {error}

              </div>
            )}

            {/* ==================================================
                Stats
            ================================================== */}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                title="EC2 Instances"
                value={ec2Count}
                subtitle={`${runningInstances} running`}
                icon={Server}
                danger={
                  unhealthyInstances > 0
                }
              />

              <StatCard
                title="Average CPU"
                value={`${averageCPU}%`}
                subtitle={
                  cpuData?.count
                    ? "Across detected instances"
                    : "No CPU metrics"
                }
                icon={Cpu}
                danger={
                  averageCPU > 80
                }
              />

              <StatCard
                title="RDS Databases"
                value={rdsCount}
                subtitle={`${availableRDS} available`}
                icon={Database}
                danger={
                  unhealthyRDS > 0
                }
              />

              <StatCard
                title="CloudTrail Events"
                value={cloudTrailCount}
                subtitle="Recent activity"
                icon={ShieldCheck}
              />

            </section>

            {/* ==================================================
                CPU + Services
            ================================================== */}

            <section className="grid gap-6 xl:grid-cols-3">

              {/* CPU */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 xl:col-span-2">

                <div className="mb-5 flex items-center justify-between">

                  <div>

                    <h3 className="font-semibold">
                      EC2 CPU Utilization
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Current CloudWatch CPU metrics
                    </p>

                  </div>

                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                    <Activity size={18} />
                  </div>

                </div>

                {chartData.length > 0 ? (

                  <div className="h-72 w-full">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <LineChart
                        data={chartData}
                      >

                        <XAxis
                          dataKey="name"
                          stroke="#64748b"
                          tick={{
                            fontSize: 11,
                          }}
                        />

                        <YAxis
                          stroke="#64748b"
                          tick={{
                            fontSize: 11,
                          }}
                        />

                        <Tooltip
                          contentStyle={{
                            background:
                              "#0f172a",
                            border:
                              "1px solid #334155",
                            borderRadius:
                              "10px",
                            color:
                              "#fff",
                          }}
                          formatter={(
                            value,
                          ) => [
                            `${value}%`,
                            "CPU",
                          ]}
                        />

                        <Line
                          type="monotone"
                          dataKey="cpu"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                          }}
                          activeDot={{
                            r: 6,
                          }}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  </div>

                ) : (

                  <EmptyState
                    message="No EC2 CPU metrics available."
                    icon={Cpu}
                  />

                )}

              </div>

              {/* Services */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <div className="mb-5">

                  <h3 className="font-semibold">
                    AWS Services
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Current infrastructure status
                  </p>

                </div>

                <div className="space-y-3">

                  <Service
                    name="EC2"
                    status={
                      unhealthyInstances > 0
                        ? "Attention"
                        : "Healthy"
                    }
                    value={`${ec2Count} instance(s)`}
                    icon={Server}
                  />

                  <Service
                    name="RDS"
                    status={
                      unhealthyRDS > 0
                        ? "Attention"
                        : "Healthy"
                    }
                    value={`${rdsCount} database(s)`}
                    icon={Database}
                  />

                  <Service
                    name="CloudWatch"
                    status="Healthy"
                    value="Monitoring active"
                    icon={Cloud}
                  />

                  <Service
                    name="CloudTrail"
                    status="Healthy"
                    value={`${cloudTrailCount} recent events`}
                    icon={FileText}
                  />

                  <Service
                    name="AI Agent"
                    status="Healthy"
                    value={`${aiAnalysis?.summary.findings ?? 0} findings`}
                    icon={Brain}
                  />

                </div>

              </div>

            </section>

            {/* ==================================================
                RDS Monitoring
            ================================================== */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h3 className="font-semibold">
                    RDS Monitoring
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Database health and CloudWatch metrics
                  </p>

                </div>

                <Database
                  size={20}
                  className="text-blue-400"
                />

              </div>

              {rdsMetrics?.databases.length ? (

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {rdsMetrics.databases.map(
                    (database) => (

                      <div
                        key={database.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                      >

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="font-medium text-white">
                              {database.id}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {database.engine ||
                                "Unknown engine"}
                            </p>

                          </div>

                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">
                            {database.status ||
                              "unknown"}
                          </span>

                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">

                          <div className="rounded-lg bg-slate-900 p-3">
                            <p className="text-xs text-slate-500">
                              CPU
                            </p>

                            <p className="mt-1 font-semibold">
                              {database.cpu !==
                              null
                                ? `${database.cpu}%`
                                : "N/A"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-900 p-3">
                            <p className="text-xs text-slate-500">
                              Connections
                            </p>

                            <p className="mt-1 font-semibold">
                              {database.connections ??
                                "N/A"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-900 p-3">
                            <p className="text-xs text-slate-500">
                              Read Latency
                            </p>

                            <p className="mt-1 font-semibold">
                              {database.read_latency ??
                                "N/A"}
                            </p>
                          </div>

                          <div className="rounded-lg bg-slate-900 p-3">
                            <p className="text-xs text-slate-500">
                              Write Latency
                            </p>

                            <p className="mt-1 font-semibold">
                              {database.write_latency ??
                                "N/A"}
                            </p>
                          </div>

                        </div>

                      </div>

                    ),
                  )}

                </div>

              ) : (

                <EmptyState
                  message="No RDS databases detected."
                  icon={Database}
                />

              )}

            </section>

            {/* ==================================================
                AI Analysis
            ================================================== */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                    <Brain size={20} />
                  </div>

                  <div>

                    <h3 className="font-semibold">
                      AI Infrastructure Analysis
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Automated diagnosis and recommendations
                    </p>

                  </div>

                </div>

                <div className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                  Rule-Based AI
                </div>

              </div>

              {aiFindings.length > 0 ? (

                <div className="space-y-4">

                  {aiFindings.map(
                    (finding, index) => (

                      <div
                        key={`${finding.resource}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                      >

                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                          <div className="flex gap-3">

                            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                              <Brain size={18} />
                            </div>

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <h4 className="font-semibold text-white">
                                  {finding.problem}
                                </h4>

                                <span
                                  className={`rounded-full px-2 py-1 text-[10px] uppercase ${severityClass(
                                    finding.severity,
                                  )}`}
                                >
                                  {finding.severity}
                                </span>

                              </div>

                              <p className="mt-2 text-sm text-slate-400">
                                {finding.analysis}
                              </p>

                              <div className="mt-3 rounded-lg border border-blue-500/10 bg-blue-500/5 p-3">

                                <p className="text-xs font-medium text-blue-400">
                                  Recommendation
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-400">
                                  {finding.recommendation}
                                </p>

                              </div>

                            </div>

                          </div>

                          <div className="shrink-0 text-right">

                            <p className="text-xs text-slate-500">
                              Confidence
                            </p>

                            <p className="mt-1 text-lg font-bold text-white">
                              {(
                                finding.confidence *
                                100
                              ).toFixed(0)}
                              %
                            </p>

                          </div>

                        </div>

                      </div>

                    ),
                  )}

                </div>

              ) : (

                <EmptyState
                  message="No AI findings available."
                  icon={Brain}
                />

              )}

            </section>

            {/* ==================================================
                CloudTrail
            ================================================== */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h3 className="font-semibold">
                    Recent CloudTrail Activity
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest AWS API activity
                  </p>

                </div>

                <Zap
                  size={19}
                  className="text-amber-400"
                />

              </div>

              {cloudTrailData?.events.length ? (

                <div className="space-y-3">

                  {cloudTrailData.events
                    .slice(0, 10)
                    .map(
                      (
                        event,
                        index,
                      ) => (

                        <div
                          key={
                            event.event_id ||
                            index
                          }
                          className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 md:flex-row md:items-center md:justify-between"
                        >

                          <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-slate-800 p-2 text-blue-400">
                              <FileText size={17} />
                            </div>

                            <div>

                              <p className="text-sm font-medium text-white">
                                {event.event_name ||
                                  "Unknown event"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {event.event_source ||
                                  "Unknown source"}
                              </p>

                            </div>

                          </div>

                          <div className="text-left md:text-right">

                            <p className="text-xs text-slate-400">
                              {event.username ||
                                "Unknown user"}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {formatDate(
                                event.event_time,
                              )}
                            </p>

                          </div>

                        </div>

                      ),
                    )}

                </div>

              ) : (

                <EmptyState
                  message="No CloudTrail events found."
                  icon={FileText}
                />

              )}

            </section>

            {/* Footer */}

            <footer className="flex flex-col gap-2 border-t border-slate-800 pt-5 text-xs text-slate-600 md:flex-row md:items-center md:justify-between">

              <p>
                AWS AI Agent • Infrastructure Monitoring Platform
              </p>

              <p>
                Auto refresh: 30 seconds • Region: us-east-1
              </p>

            </footer>

          </div>

        </section>

      </div>
    </main>
  );
}