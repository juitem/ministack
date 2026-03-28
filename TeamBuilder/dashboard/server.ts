import { serve, spawn } from "bun";
import { Database } from "bun:sqlite";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";

const PORT = 3001;
const PROJECT_ROOT = path.resolve(import.meta.dir, "..");
const GLOBAL_ROOT = path.resolve(PROJECT_ROOT, "..");

const STATE_FILE = path.join(PROJECT_ROOT, "state_execution.json");
const PROJECT_FILE = path.join(PROJECT_ROOT, "state_project.json");
const MISSION_FILE = path.join(PROJECT_ROOT, "docs", "mission.md");
const LOCAL_ROLES_DIR = path.join(PROJECT_ROOT, "roles");
const GLOBAL_ROLES_DIR = path.join(GLOBAL_ROOT, "roles");
const GLOBAL_WORKFLOWS_DIR = path.join(GLOBAL_ROOT, "workflows");
const DB_FILE = path.join(PROJECT_ROOT, "state.db");

// 1. Initialize DB
const db = new Database(DB_FILE);

// 2. Schema Setup
db.run(`CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT,
  specialty TEXT,
  status TEXT,
  icon TEXT,
  role_level TEXT,
  cluster_id TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS clusters (
  id TEXT PRIMARY KEY,
  name TEXT,
  lead_role_id TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  source_role_id TEXT,
  target_cluster_id TEXT,
  target_role_id TEXT,
  status TEXT,
  step_order INTEGER
)`);

// 3. Utils: Snake to Camel conversion
const toCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc: any, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamel(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

const toSnake = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toSnake);
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc: any, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnake(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// 4. Sync & Migration Logic
const syncToJson = () => {
  const staff = db.query("SELECT * FROM staff").all();
  const jobs = db.query("SELECT * FROM jobs ORDER BY step_order ASC").all();
  const clusters = db.query("SELECT * FROM clusters").all();
  
  const projectState = {
    mission: existsSync(MISSION_FILE) ? readFileSync(MISSION_FILE, "utf-8") : "",
    localStaff: toCamel(staff),
    jobs: toCamel(jobs),
    clusters: toCamel(clusters)
  };
  
  writeFileSync(PROJECT_FILE, JSON.stringify(projectState, null, 2), "utf-8");
};

// Initial Migration if DB is empty
const migrateIfEmpty = () => {
  const staffCount = (db.query("SELECT count(*) as count FROM staff").get() as any).count;
  if (staffCount === 0 && existsSync(PROJECT_FILE)) {
    console.log("Migrating existing state_project.json to SQLite...");
    try {
      const oldState = JSON.parse(readFileSync(PROJECT_FILE, "utf-8"));
      
      // Migrate Staff
      if (oldState.localStaff) {
        const insertStaff = db.prepare("INSERT INTO staff (id, name, specialty, status, icon, role_level) VALUES (?, ?, ?, ?, ?, ?)");
        oldState.localStaff.forEach((s: any) => {
          insertStaff.run(s.id, s.name, s.specialty || 'Generalist', s.status || 'Idle', s.icon || '👤', 'Contributor');
        });
      }
      
      // Migrate Jobs
      if (oldState.jobs) {
        const insertJob = db.prepare("INSERT INTO jobs (id, title, description, target_role_id, status, step_order) VALUES (?, ?, ?, ?, ?, ?)");
        oldState.jobs.forEach((j: any, i: number) => {
          insertJob.run(j.id || crypto.randomUUID(), j.title, j.description, j.assignedRoleId || null, j.status || 'Pending', i);
        });
      }

      syncToJson();
    } catch (e) {
      console.error("Migration failed:", e);
    }
  }
};

migrateIfEmpty();

// Ensure directories exist
if (!existsSync(path.dirname(MISSION_FILE))) mkdirSync(path.dirname(MISSION_FILE), { recursive: true });
if (!existsSync(LOCAL_ROLES_DIR)) mkdirSync(LOCAL_ROLES_DIR, { recursive: true });

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (method === "OPTIONS") return new Response(null, { headers });

    // 1-A. Execution State Hub
    if (url.pathname === "/api/state") {
      if (method === "GET") {
        const content = existsSync(STATE_FILE) ? readFileSync(STATE_FILE, "utf-8") : "{}";
        return new Response(content, { headers });
      }
      if (method === "POST") {
        const body = await req.json();
        writeFileSync(STATE_FILE, JSON.stringify(body, null, 2), "utf-8");
        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    // 1-B. Project Planning Hub
    if (url.pathname === "/api/project") {
      if (method === "GET") {
        const staff = db.query("SELECT * FROM staff").all();
        const jobs = db.query("SELECT * FROM jobs ORDER BY step_order ASC").all();
        const clusters = db.query("SELECT * FROM clusters").all();
        const mission = existsSync(MISSION_FILE) ? readFileSync(MISSION_FILE, "utf-8") : "";
        
        return new Response(JSON.stringify(toCamel({
          mission,
          localStaff: staff,
          jobs,
          clusters
        })), { headers });
      }
      if (method === "POST") {
        const body = await req.json();
        // Dynamic update based on keys provided
        if (body.localStaff) {
          db.run("DELETE FROM staff");
          const insertStaff = db.prepare("INSERT INTO staff (id, name, specialty, status, icon, role_level, cluster_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
          body.localStaff.forEach((s: any) => {
            const snaked = toSnake(s);
            insertStaff.run(snaked.id, snaked.name, snaked.specialty, snaked.status, snaked.icon, snaked.role_level || 'Contributor', snaked.cluster_id || null);
          });
        }
        if (body.jobs) {
          db.run("DELETE FROM jobs");
          const insertJob = db.prepare("INSERT INTO jobs (id, title, description, source_role_id, target_cluster_id, target_role_id, status, step_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
          body.jobs.forEach((j: any, i: number) => {
            const snaked = toSnake(j);
            insertJob.run(snaked.id, snaked.title, snaked.description, snaked.source_role_id || null, snaked.target_cluster_id || null, snaked.target_role_id || null, snaked.status, i);
          });
        }
        
        syncToJson();
        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    // 2. Mission Hub
    if (url.pathname === "/api/mission") {
      if (method === "GET") {
        const content = existsSync(MISSION_FILE) ? readFileSync(MISSION_FILE, "utf-8") : "";
        return new Response(JSON.stringify({ content }), { headers });
      }
      if (method === "POST") {
        const { content } = await req.json();
        writeFileSync(MISSION_FILE, content, "utf-8");
        return new Response(JSON.stringify({ success: true }), { headers });
      }
    }

    // 3. Roles Hub (Local + Global)
    if (url.pathname === "/api/roles") {
      const roles: string[] = [];
      const collect = (dir: string) => {
        if (!existsSync(dir)) return;
        readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
          if (dirent.name.endsWith(".md")) roles.push(dirent.name.replace(".md", ""));
        });
      };
      collect(GLOBAL_ROLES_DIR);
      collect(LOCAL_ROLES_DIR);
      return new Response(JSON.stringify({ roles: Array.from(new Set(roles)) }), { headers });
    }

    // 4. Workflows Hub
    if (url.pathname === "/api/workflows") {
      const workflows: string[] = [];
      if (existsSync(GLOBAL_WORKFLOWS_DIR)) {
        readdirSync(GLOBAL_WORKFLOWS_DIR).forEach(f => {
          if (f.endsWith(".md")) workflows.push(f.replace(".md", ""));
        });
      }
      return new Response(JSON.stringify({ workflows }), { headers });
    }

    // 5. Workflow Creation (Save as Template)
    if (url.pathname === "/api/workflows" && method === "POST") {
      const { name, jobs } = await req.json();
      const fileName = `${name.replace(/\s+/g, "_").toLowerCase()}.md`;
      const filePath = path.join(GLOBAL_WORKFLOWS_DIR, fileName);

      let content = `# 워크플로우: ${name}\n\n`;
      jobs.forEach((job: any, i: number) => {
        content += `### ${i + 1}단계: ${job.title}\n`;
        content += `- **목표**: ${job.description}\n`;
        content += `- **활동**: 전문가 배정 필요\n`;
        content += `- **산출물**: TBD\n\n`;
      });

      writeFileSync(filePath, content, "utf-8");
      return new Response(JSON.stringify({ success: true, fileName }), { headers });
    }

    // 6. AI Recommendation (Simulator/Heuristics)
    if (url.pathname === "/api/recommend-workflow" && method === "POST") {
      const { mission } = await req.json();
      let steps = [];

      if (mission.includes("웹") || mission.includes("App")) {
        steps = [
          { title: "시장 조사", description: "유사 앱 분석 및 타겟 유저 정의" },
          { title: "UI/UX 설계", description: "와이어프레임 및 디자인 시스템 구축" },
          { title: "프론트엔드 개발", description: "React/Next.js 기반 컴포넌트 구현" },
          { title: "백엔드 API", description: "데이터베이스 설계 및 서버 구축" },
          { title: "통합 테스트", description: "전 기능 검증 및 버그 수정" }
        ];
      } else if (mission.includes("AI") || mission.includes("데이터")) {
        steps = [
          { title: "데이터 수집", description: "필요한 데이터셋 확보 및 정제" },
          { title: "모델 설계", description: "알고리즘 선정 및 아키텍처 수립" },
          { title: "학습 및 평가", description: "모델 트레이닝 및 성능 지표 분석" },
          { title: "API 배포", description: "추론 엔진 서버 구축" }
        ];
      } else {
        steps = [
          { title: "요구사항 분석", description: "미션의 핵심 가치 정의" },
          { title: "설계", description: "시스템 구조 및 흐름 정의" },
          { title: "구현", description: "핵심 로직 개발" },
          { title: "검증", description: "최종 결과물 품질 확인" }
        ];
      }

      return new Response(JSON.stringify({ steps }), { headers });
    }

    // 7. Engine Commands (The 'Real' Sync)
    if (url.pathname === "/api/deploy" && method === "POST") {
      const { workflow, assignments } = await req.json();
      
      try {
        // Run 'ministack start <workflow>'
        console.log(`Executing: bun ../ministack.ts start ${workflow}`);
        const startProc = spawn(["bun", path.join(GLOBAL_ROOT, "ministack.ts"), "start", workflow], {
          cwd: PROJECT_ROOT
        });
        await startProc.exited;

        // Run 'ministack assign <step> <role>' for each assignment
        for (const [step, role] of Object.entries(assignments)) {
          console.log(`Executing: bun ../ministack.ts assign ${step} ${role}`);
          const assignProc = spawn(["bun", path.join(GLOBAL_ROOT, "ministack.ts"), "assign", step, role as string], {
            cwd: PROJECT_ROOT
          });
          await assignProc.exited;
        }

        return new Response(JSON.stringify({ success: true, message: "Engine deployment complete" }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, error: String(e) }), { status: 500, headers });
      }
    }

    // 8. Delegation Hub (MAS)
    if (url.pathname === "/api/delegate" && method === "POST") {
      const { source_role_id, target_cluster_id, target_role_id, title, description } = await req.json();
      
      // Authority check (Simplified for now: Orchestrator/Manager can delegate)
      const source = db.query("SELECT * FROM staff WHERE id = ?").get(source_role_id) as any;
      if (!source || (source.role_level !== 'Orchestrator' && source.role_level !== 'Manager')) {
        return new Response(JSON.stringify({ success: false, error: "Unauthorized delegation" }), { status: 403, headers });
      }

      const jobId = crypto.randomUUID();
      db.run("INSERT INTO jobs (id, title, description, source_role_id, target_cluster_id, target_role_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [jobId, title, description, source_role_id, target_cluster_id || null, target_role_id || null, 'Pending']);
      
      syncToJson();
      return new Response(JSON.stringify({ success: true, jobId }), { headers });
    }

    if (url.pathname.startsWith("/api/staff/") && url.pathname.endsWith("/inbox")) {
      const staffId = url.pathname.split("/")[3];
      const jobs = db.query("SELECT * FROM jobs WHERE target_role_id = ? OR target_cluster_id = (SELECT cluster_id FROM staff WHERE id = ?)").all(staffId, staffId);
      return new Response(JSON.stringify(toCamel({ jobs })), { headers });
    }

    return new Response("Not Found", { status: 404, headers });
  },
});

console.log(`TeamBuilder Persistence Server running on http://localhost:${PORT}`);
