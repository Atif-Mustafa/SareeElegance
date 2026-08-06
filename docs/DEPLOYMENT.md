# Enterprise Deployment, DevOps, Infrastructure & Cloud Observability Architecture

---

## 1. Executive Summary & Cloud Infrastructure Architecture
The platform is engineered for **multi-region cloud resilience**, zero-downtime deployments, and rapid auto-scaling during festive flash sales. Designed to run on managed Kubernetes (GKE / EKS) or serverless container platforms (Google Cloud Run / AWS ECS Fargate), the architecture decouples static storefront CDN caching from stateless Express backend containers and managed PostgreSQL / Redis persistence layers.

```
+---------------------------------------------------------------------------------+
|                        GLOBAL EDGE (Cloudflare CDN / WAF)                       |
+----------------------------------------+----------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                    INGRESS CONTROLLER & NGINX REVERSE PROXY                     |
+----------------------------------------+----------------------------------------+
                                         |
               +-------------------------+-------------------------+
               | (Port 3000 /api/*)                                | (Port 3000 /*)
               v                                                   v
+------------------------------+                    +-----------------------------+
|    EXPRESS.JS BACKEND API    |                    |    REACT 19 STATIC ASSETS   |
|   (Stateless Docker Pods)    |                    |   (Vite Dist Bundles via    |
|   [Auto-Scaled: 2 to 50 Pods]|                    |    Nginx Static Service)    |
+--------------+---------------+                    +-----------------------------+
               |
     +---------+---------+-----------------------------------+
     |                   |                                   |
     v                   v                                   v
+----------+       +-----------+                       +------------+
|  Redis   |       |  PgBouncer|                       | BullMQ Job |
|  Cluster |       |  Pooler   |                       |  Workers   |
+----------+       +-----+-----+                       +------------+
                         |
                         v
              +---------------------+
              | PostgreSQL (Aurora/ |
              |  Cloud SQL HA Pair) |
              +---------------------+
```

---

## 2. Containerization (Docker & Multi-Stage Builds)
Our production `Dockerfile` enforces a **multi-stage build** that strips development dependencies and TypeScript compilers, resulting in an unprivileged, hardened runtime container under 120 MB:
- **Stage 1 (Builder)**: Installs npm packages, compiles React 19 static bundles to `/dist`, and compiles TypeScript server files using `esbuild` to `/dist/server.cjs`.
- **Stage 2 (Production Runner)**: Copies only compiled artifacts into an Alpine/Distroless Node.js runtime running as a non-root user (`node:1000`).
- **Ingress Port Mandate**: Binds strictly to `0.0.0.0:3000` as mandated by infrastructure ingress rules.

---

## 3. CI/CD Pipeline Architecture (GitHub Actions)

Every Pull Request and deployment release follows a staged CI/CD automation pipeline:
```
[PR Created] -> (1) ESLint & TypeScript Strict Check -> (2) Vitest Unit/Integration Tests 
             -> (3) Playwright E2E & Accessibility Audit -> (4) Docker Build & Snyk Scan
             -> [Merge to Main] -> (5) Staging Rolling Deploy -> (6) Production Blue-Green Promotion
```

---

## 4. Zero-Downtime Deployment Strategies

### 4.1 Rolling & Blue-Green Deployments
- **Rolling Deployment**: For standard patch and feature releases, Kubernetes rolling updates replace 25% of backend containers at a time. Readiness probes (`GET /api/v1/health`) ensure traffic is never routed to a container until its database pool and Redis connections are established.
- **Blue-Green Deployment**: For major database migrations or seasonal catalog promotions, a secondary "Green" environment is deployed alongside "Blue". Once automated smoke tests pass, Cloudflare/Nginx traffic weighting flips 100% of ingress to Green within zero milliseconds.

---

## 5. High Availability, Scaling & Disaster Recovery (DR)

### 5.1 Auto-Scaling Policies
- **Horizontal Pod Autoscaler (HPA)**: Automatically scales Express backend pods from `minReplicas: 2` up to `maxReplicas: 50` when CPU utilization exceeds 65% or concurrent HTTP request latency p95 exceeds 120ms.

### 5.2 Automated Backups & Disaster Recovery (RPO / RTO)
- **Recovery Point Objective (RPO) `< 5 minutes`**: Managed PostgreSQL uses automated WAL (Write-Ahead Log) streaming replicas with continuous Point-in-Time Recovery (PITR).
- **Recovery Time Objective (RTO) `< 15 minutes`**: Terraform infrastructure-as-code scripts can reprovision the entire VPC, Cloud Run containers, and Redis clusters in an alternate cloud region within 15 minutes in the event of a total datacenter outage.

---

## 6. Observability, Logging & Telemetry
- **Structured Logging (Pino)**: All backend JSON logs include distributed trace IDs (`traceId`), actor UUIDs, and HTTP latency.
- **Error Tracking (Sentry)**: Captures unhandled backend exceptions and frontend React error boundaries, grouping stack traces and alerting on-call engineers via PagerDuty.
- **Metrics Dashboard (Prometheus & Grafana)**: Tracks real-time JVM/Node heap usage, PgBouncer pool saturation, BullMQ worker queue lengths, and checkout conversion velocity.
