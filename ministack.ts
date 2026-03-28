import fs, { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, type Dirent } from "fs";
import path from "path";

// [중요] 경로 설계 개편 (Global Tooling 대응)
// GLOBAL_DIR: 스크립트가 실제 위치한 곳 (전역 템플릿)
// PROJECT_DIR: 사용자가 현재 명령어를 실행한 곳 (로컬 프로젝트)

const GLOBAL_DIR = import.meta.dir;
const PROJECT_DIR = process.cwd();

const GLOBAL_ROLES_DIR = path.join(GLOBAL_DIR, "roles");
const GLOBAL_WORKFLOWS_DIR = path.join(GLOBAL_DIR, "workflows");

const LOCAL_ROLES_DIR = path.join(PROJECT_DIR, "roles");
const LOCAL_WORKFLOWS_DIR = path.join(PROJECT_DIR, "workflows");
const DOCS_DIR = path.join(PROJECT_DIR, "docs");
const STATE_FILE = path.join(PROJECT_DIR, "state_execution.json");
const PROJECT_FILE = path.join(PROJECT_DIR, "state_project.json");

// 디렉토리 초기화 (프로젝트별 산출물 폴더)
if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });

interface State {
  workflow: string;
  step: number;
  role: string;
}

interface ProjectState {
  mission?: string;
  assignments?: Record<string, string>;
  jobs?: any[];
  localStaff?: any[];
}

function getResourcePath(type: "role" | "workflow", name: string): string {
  const localPath = path.join(
    type === "role" ? LOCAL_ROLES_DIR : LOCAL_WORKFLOWS_DIR,
    `${name}.md`
  );
  const globalPath = path.join(
    type === "role" ? GLOBAL_ROLES_DIR : GLOBAL_WORKFLOWS_DIR,
    `${name}.md`
  );
  return existsSync(localPath) ? localPath : globalPath;
}

function loadProject(): ProjectState {
  if (existsSync(PROJECT_FILE)) {
    try {
      return JSON.parse(readFileSync(PROJECT_FILE, "utf-8"));
    } catch (e) {
      /* ignore */
    }
  }
  return {};
}

function saveProject(project: ProjectState) {
  writeFileSync(PROJECT_FILE, JSON.stringify(project, null, 2), "utf-8");
}

function loadState(): State {
  if (existsSync(STATE_FILE)) {
    try {
      return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
    } catch (e) {
      /* ignore */
    }
  }
  return { workflow: "", step: 1, role: "product" };
}

function saveState(state: State) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

function listItems() {
  console.log(`\n[현지 프로젝트]: ${PROJECT_DIR}`);
  
  // 1. 채용된 팀원 (Local Team)
  console.log("\n--- [채용된 팀원 (Local Team)] ---");
  const localRoles: string[] = [];
  if (existsSync(LOCAL_ROLES_DIR)) {
    const walk = (dir: string) => {
      readdirSync(dir, { withFileTypes: true }).forEach((dirent: Dirent) => {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
          walk(res);
        } else if (dirent.name.endsWith(".md")) {
          const rel = path.relative(LOCAL_ROLES_DIR, res);
          localRoles.push(rel.slice(0, -3));
        }
      });
    };
    walk(LOCAL_ROLES_DIR);
  }
  if (localRoles.length > 0) {
    localRoles.sort().forEach((r) => console.log(`- ${r} (현지 상주)`));
  } else {
    console.log("(아직 채용된 전담 팀원이 없습니다. 전역 인력을 사용합니다.)");
  }

  // 2. 사용 가능한 워크플로우
  console.log("\n--- [사용 가능한 워크플로우] ---");
  const wfs = new Set<string>();
  [GLOBAL_WORKFLOWS_DIR, LOCAL_WORKFLOWS_DIR].forEach((d) => {
    if (existsSync(d)) {
      readdirSync(d)
        .filter((f) => f.endsWith(".md"))
        .forEach((f) => wfs.add(f.slice(0, -3)));
    }
  });
  Array.from(wfs)
    .sort()
    .forEach((w) => console.log(`- ${w}`));
}

function listMarket() {
  console.log("\n" + "=".repeat(50));
  console.log("🌍 글로벌 인력 시장 (Global Talent Market)");
  console.log("=".repeat(50));
  if (existsSync(GLOBAL_ROLES_DIR)) {
    const walk = (dir: string) => {
      const category = path.relative(GLOBAL_ROLES_DIR, dir) || "General";
      const files = readdirSync(dir, { withFileTypes: true });
      const mdFiles = files.filter((f: Dirent) => !f.isDirectory() && f.name.endsWith(".md"));
      
      if (mdFiles.length > 0) {
        console.log(`\n[${category.toUpperCase()}]`);
        mdFiles.forEach((dirent: Dirent) => {
          const relPath = path.relative(GLOBAL_ROLES_DIR, path.join(dir, dirent.name));
          const r = relPath.slice(0, -3);
          const isHired = existsSync(path.join(LOCAL_ROLES_DIR, relPath));
          const status = isHired ? "[채용됨]" : "[대기 중]";
          console.log(`  - ${r.padEnd(30)} ${status}`);
        });
      }
      
      files.filter((f: Dirent) => f.isDirectory()).forEach((d: Dirent) => walk(path.join(dir, d.name)));
    };
    walk(GLOBAL_ROLES_DIR);
  }
  console.log("\n* 명령: 'ministack recruit <카테고리/이름>'으로 전문가를 영입하세요.");
}

function recruitPersona(name: string) {
  if (!existsSync(LOCAL_ROLES_DIR)) mkdirSync(LOCAL_ROLES_DIR, { recursive: true });

  const source = path.join(GLOBAL_ROLES_DIR, `${name}.md`);
  const target = path.join(LOCAL_ROLES_DIR, `${name}.md`);

  if (!existsSync(source)) {
    console.error(`Error: 인력 시장에 '${name}'이라는 전문가가 없습니다.`);
    return;
  }

  if (existsSync(target)) {
    console.log(`안내: '${name}'은(는) 이미 우리 팀원입니다.`);
    return;
  }

  const content = readFileSync(source, "utf-8");
  writeFileSync(target, content, "utf-8");
  console.log(`🎉 축하합니다! '${name}' 전문가가 우리 팀으로 정식 채용되었습니다.`);
  console.log(`이제 'roles/${name}.md' 파일을 수정하여 우리 프로젝트에 맞게 특수 교육(Customizing)을 할 수 있습니다.`);
}

function onboardPersona(name: string) {
  const source = path.join(GLOBAL_ROLES_DIR, `${name}.md`);
  if (existsSync(source)) {
    console.log(`안내: '${name}' 전문가가 이미 인력 시장에 등록되어 있습니다.`);
    return;
  }

  const template = `# 역할: ${name.replace(/_/g, " ").toUpperCase()}

당신은 ${name} 분야에서 풍부한 경험을 가진 전문가입니다.

## 핵심 원칙
- **전문성**: 해당 분야의 베스트 프랙티스를 준수합니다.
- **협업**: 팀의 목표 달성을 위해 다른 전문가들과 적극적으로 소통합니다.

## 도구 (Tools)
당신은 다음 도구들을 활용할 권한이 있습니다:
- [여기에 도구 목록을 작성하세요]

## 활동
- [여기에 주요 활동을 작성하세요]
`;
  writeFileSync(source, template, "utf-8");
  console.log(`✨ 새로운 전문가 '${name}'이(가) 글로벌 인력 시장에 등록되었습니다.`);
  console.log(`위치: ${source}`);
  console.log("이제 이 파일을 수정하여 전문가의 상세 지침을 완성하세요.");
}

function clonePersona(sourceName: string, targetName: string) {
  let source = path.join(LOCAL_ROLES_DIR, `${sourceName}.md`);
  const target = path.join(LOCAL_ROLES_DIR, `${targetName}.md`);

  if (!existsSync(source)) {
    source = path.join(GLOBAL_ROLES_DIR, `${sourceName}.md`);
    if (!existsSync(source)) {
      console.error(`Error: 원본 전문가 '${sourceName}'을 찾을 수 없습니다.`);
      return;
    }
  }

  if (existsSync(target)) {
    console.error(`Error: 이미 '${targetName}'이라는 전문가가 존재합니다.`);
    return;
  }

  mkdirSync(path.dirname(target), { recursive: true });
  const content = readFileSync(source, "utf-8");
  writeFileSync(target, content, "utf-8");
  console.log(`👥 전문가 '${sourceName}'을(를) 기반으로 새로운 전문가 '${targetName}'(이)가 탄생했습니다.`);
}

function trainPersona(name: string, knowledge: string) {
  const p = path.join(LOCAL_ROLES_DIR, `${name}.md`);
  if (!existsSync(p)) {
    console.error(`Error: 우리 팀에 '${name}' 전문가가 없습니다.`);
    return;
  }

  const learned = `\n\n## 💡 추가 교육된 지식 (Learned Knowledge)\n- ${knowledge}\n`;
  const content = readFileSync(p, "utf-8");
  writeFileSync(p, content + learned, "utf-8");
  console.log(`📖 '${name}' 전문가에게 새로운 지식을 전수했습니다. 이제 더 똑똑해졌습니다!`);
}

function assignPersona(stepNum: string, roleName: string) {
  const project = loadProject();
  if (!project.assignments) project.assignments = {};
  project.assignments[stepNum] = roleName;
  saveProject(project);
  console.log(`📌 ${stepNum}단계의 담당자로 '${roleName}' 전문가를 배치했습니다. (project.json 저장)`);
}

function startWorkflow(name: string) {
  const workflowPath = getResourcePath("workflow", name);
  if (!existsSync(workflowPath)) {
    console.error(`\x1b[31m❌ Error: 워크플로우 '${name}'을(를) 찾을 수 없습니다.\x1b[0m`);
    return;
  }

  const state: State = { workflow: name, step: 1, role: "market_researcher" };
  saveState(state);
  console.log(`\x1b[36m🚀 새 프로젝트에서 '${name}' 워크플로우를 시작합니다. (현재 1단계)\x1b[0m`);
}

async function listSteps() {
  const state = loadState();
  if (!state.workflow) {
    console.log("진행 중인 워크플로우가 없습니다.");
    return;
  }
  const wfPath = getResourcePath("workflow", state.workflow);
  if (existsSync(wfPath)) {
    const text = await Bun.file(wfPath).text();
    console.log(`\n--- [워크플로우 '${state.workflow}'의 전체 단계] ---`);
    text.split("\n").forEach((line) => {
      if (line.includes("단계:")) console.log(line.trim());
    });
  }
}

async function generatePrompt(userMessage?: string) {
  const state = loadState();
  if (!state.workflow) {
    console.log("진행 중인 워크플로우가 없습니다.");
    return;
  }

  let roleName = "engineer";
  const project = loadProject();
  if (project.assignments && project.assignments[state.step.toString()]) {
    roleName = project.assignments[state.step.toString()];
  } else {
    let roleMap: Record<number, string> = {};
    if (state.workflow === "feature") {
      roleMap = {
        1: "market_researcher",
        2: "researcher",
        3: "product",
        4: "concept_reviewer",
        5: "architect",
        6: "architect",
        7: "engineer",
        8: "reviewer",
        9: "security_reviewer",
        10: "engineer",
      };
    } else {
      roleMap = {
        1: "researcher",
        2: "engineer",
        3: "reviewer",
        4: "qa",
        5: "engineer",
      };
    }
    roleName = roleMap[state.step] || "engineer";
  }
  const rolePath = getResourcePath("role", roleName);
  const workflowPath = getResourcePath("workflow", state.workflow);

  let promptContent = "--- [AGENT ROLE] ---\n";
  if (existsSync(rolePath)) {
    const roleText = await Bun.file(rolePath).text();
    promptContent += roleText;
    if (roleText.includes("## 도구")) {
      promptContent +=
        "\n\n(참고: 당신은 위 명시된 도구들을 활용할 수 있는 권한이 있습니다.)";
    }
  }

  promptContent += "\n\n--- [CURRENT TASK & CONTEXT] ---\n";
  promptContent += `당신은 현재 '${state.workflow}' 워크플로우의 ${state.step}단계를 진행 중입니다.\n`;

  if (existsSync(workflowPath)) {
    const workflowText = await Bun.file(workflowPath).text();
    const lines = workflowText.split("\n");
    const stepMarker = `${state.step}단계`;
    let inStep = false;
    for (const line of lines) {
      if (line.includes(stepMarker)) {
        inStep = true;
        promptContent += line + "\n";
      } else if (inStep && (line.startsWith("##") || line.startsWith("---"))) {
        break;
      } else if (inStep) {
        promptContent += line + "\n";
      }
    }
  }

  if (userMessage) {
    promptContent += `\n\n[사용자 추가 지시 사항]:\n${userMessage}\n`;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`[${roleName.toUpperCase()} 프롬프트 생성 (CWD 모드)]`);
  console.log("=".repeat(50) + "\n");
  console.log(promptContent);
  console.log("\n" + "=".repeat(50));
}

function showHelp() {
  const helpText = `
MiniStack CLI (전역 엔진: ${GLOBAL_DIR})

명령어:
  list                  사용 가능한 역할과 워크플로우 목록을 출력합니다.
  start <workflow>      현재 폴더에서 새로운 프로젝트를 시작합니다.
  status                현재 진행 중인 단계의 상태를 출력합니다.
  steps                 현재 워크플로우의 전체 단계 목록을 보여줍니다.
  next                  다음 단계로 이동합니다.
  back                  이전 단계로 이동합니다.
  onboard <name>       새로운 전문가 페르소나를 글로벌 인력 시장에 등록합니다.
  recruit <name>        인력 시장의 전문가를 내 프로젝트 전담 팀원으로 채용합니다.
  prompt [message]      현재 단계에 최적화된 프롬프트를 생성합니다. 
  help                  이 도움말을 출력합니다.
`;
  console.log(helpText);
}

// CLI 로직
const args = Bun.argv.slice(2);
const cmd = (args[0] || "").toLowerCase();

switch (cmd) {
  case "help":
  case "-h":
  case "--help":
  case "":
    showHelp();
    break;
  case "list":
    listItems();
    break;
  case "market":
    listMarket();
    break;
  case "onboard":
    if (args[1]) onboardPersona(args[1]);
    else console.log("Usage: ministack onboard <name>");
    break;
  case "recruit":
    if (args[1]) recruitPersona(args[1]);
    else console.log("Usage: ministack recruit <name>");
    break;
  case "clone":
    if (args[1] && args[2]) clonePersona(args[1], args[2]);
    else console.log("Usage: ministack clone <source> <target>");
    break;
  case "train":
    if (args[1] && args[2]) trainPersona(args[1], args.slice(2).join(" "));
    else console.log("Usage: ministack train <name> <knowledge>");
    break;
  case "assign":
    if (args[1] && args[2]) assignPersona(args[1], args[2]);
    else console.log("Usage: ministack assign <step> <role>");
    break;
  case "start":
    if (args[1]) startWorkflow(args[1]);
    else console.log("Usage: ministack start <name>");
    break;
  case "status":
    const ss = loadState();
    console.log(`\n[현재 프로젝트] 경로: ${PROJECT_DIR}`);
    console.log(`[로그] 워크플로우: ${ss.workflow}, 단계: ${ss.step}`);
    break;
  case "steps":
    listSteps();
    break;
  case "next":
    const ns = loadState();
    if (!ns.workflow) {
      console.log("\x1b[33m⚠️  진행 중인 워크플로우가 없습니다. 먼저 start 하세요.\x1b[0m");
      break;
    }
    ns.step++;
    saveState(ns);
    console.log(`\x1b[32m⏭️  다음 단계(${ns.step})로 이동했습니다.\x1b[0m`);
    break;
  case "back":
    const ps = loadState();
    if (ps.step > 1) {
      ps.step--;
      saveState(ps);
      console.log(`\x1b[33m⏮️  이전 단계(${ps.step})로 돌아갔습니다.\x1b[0m`);
    } else {
      console.log("\x1b[31m❌ 이미 첫 번째 단계입니다.\x1b[0m");
    }
    break;
  case "set":
    const ssSet = loadState();
    if (!ssSet.workflow) {
      console.log("진행 중인 워크플로우가 없습니다.");
      break;
    }
    const targetStep = parseInt(args[1]);
    if (!isNaN(targetStep) && targetStep >= 1) {
      ssSet.step = targetStep;
      saveState(ssSet);
      console.log(`${targetStep}단계로 직접 이동했습니다.`);
    } else {
      console.log("Usage: ministack set <step_number>");
    }
    break;
  case "prompt":
    const userMsg = args.slice(1).join(" ");
    generatePrompt(userMsg || undefined);
    break;
  default:
    console.log(`Unknown command: ${cmd}`);
    showHelp();
}
