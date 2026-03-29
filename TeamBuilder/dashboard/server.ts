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
const SCENARIOS_DIR = path.join(PROJECT_ROOT, "docs", "scenarios");
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

const parseFrontmatter = (content: string) => {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return { data: {}, content };
  
  const yamlStr = match[1];
  const data: any = {};
  yamlStr.split("\n").forEach(line => {
    const parts = line.split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let value = parts.slice(1).join(":").trim();
      
      if (value.startsWith("-")) {
        if (!data[key]) data[key] = [];
        data[key].push(value.replace(/^- /, "").trim().replace(/^["']|["']$/g, ""));
      } else {
        data[key] = value.replace(/^["']|["']$/g, "");
      }
    }
  });
  return { data, content: content.replace(match[0], "").trim() };
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

    // API: Execution State
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

    // API: Scenarios (New)
    if (url.pathname === "/api/scenarios") {
      const scenarios: any[] = [];
      if (existsSync(SCENARIOS_DIR)) {
        readdirSync(SCENARIOS_DIR).forEach(f => {
          if (f.endsWith(".md")) {
            const content = readFileSync(path.join(SCENARIOS_DIR, f), "utf-8");
            const titleMatch = content.match(/^# (.+)/m);
            scenarios.push({
              id: f.replace(".md", ""),
              title: titleMatch ? titleMatch[1] : f,
              path: f
            });
          }
        });
      }
      return new Response(JSON.stringify({ scenarios }), { headers });
    }

    if (url.pathname === "/api/scenarios/import" && method === "POST") {
      const { scenarioId } = await req.json();
      const scenarioPath = path.join(SCENARIOS_DIR, `${scenarioId}.md`);
      if (!existsSync(scenarioPath)) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });

      const content = readFileSync(scenarioPath, "utf-8");
      // Extract mission
      const missionMatch = content.match(/## 1\. Mission\n([\s\S]+?)\n##/);
      if (missionMatch) {
        writeFileSync(MISSION_FILE, missionMatch[1].trim(), "utf-8");
      }
      
      return new Response(JSON.stringify({ success: true, mission: missionMatch ? missionMatch[1].trim() : "" }), { headers });
    }

    // API: Project Planning Hub
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

    // API: Roles Hub (Local + Global) - Advanced with YAML Parsing
    if (url.pathname === "/api/roles") {
      const roles: any[] = [];
      const collect = (dir: string, source: string = "local") => {
        if (!existsSync(dir)) return;
        readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
          const fullPath = path.join(dir, dirent.name);
          if (dirent.isDirectory()) {
            collect(fullPath, source);
          } else if (dirent.name.endsWith(".md")) {
            const content = readFileSync(fullPath, "utf-8");
            const { data, content: body } = parseFrontmatter(content);
            const titleMatch = body.match(/^# (.+)/m);
            
            roles.push({
              id: dirent.name.replace(".md", ""),
              title: data.role || (titleMatch ? titleMatch[1] : dirent.name.replace(".md", "")),
              source,
              ...data,
              body: body.substring(0, 1000) // Truncate body for list
            });
          }
        });
      };
      collect(GLOBAL_ROLES_DIR, "global");
      collect(LOCAL_ROLES_DIR, "local");
      return new Response(JSON.stringify({ roles }), { headers });
    }

    // Fallback for other hubs (Workflows, Mission, etc. - keep existing logic or simplify)
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

    return new Response("Not Found", { status: 404, headers });
  },
});

console.log(`TeamBuilder Persistence Server running on http://localhost:${PORT}`);
