import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

// 경로 설정
const BASE_DIR = import.meta.dir;
const ROLES_DIR = path.join(BASE_DIR, "roles");
const WORKFLOWS_DIR = path.join(BASE_DIR, "workflows");
const STATE_FILE = path.join(BASE_DIR, "state.json");
const DOCS_DIR = path.join(BASE_DIR, "docs");

// 디렉토리 초기화
[ROLES_DIR, WORKFLOWS_DIR, DOCS_DIR].forEach((d) => {
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
});

interface State {
  workflow: string;
  step: number;
  role: string;
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
  console.log("\n--- [사용 가능한 역할(Roles)] ---");
  import("fs").then((fs) => {
    fs.readdirSync(ROLES_DIR)
      .filter((f) => f.endsWith(".md"))
      .forEach((f) => console.log(`- ${f.slice(0, -3)}`));

    console.log("\n--- [사용 가능한 워크플로우(Workflows)] ---");
    fs.readdirSync(WORKFLOWS_DIR)
      .filter((f) => f.endsWith(".md"))
      .forEach((f) => console.log(`- ${f.slice(0, -3)}`));
  });
}

function startWorkflow(name: string) {
  const workflowPath = path.join(WORKFLOWS_DIR, `${name}.md`);
  if (!existsSync(workflowPath)) {
    console.error(`Error: 워크플로우 '${name}'을 찾을 수 없습니다.`);
    return;
  }

  const state: State = { workflow: name, step: 1, role: "market_researcher" };
  saveState(state);
  console.log(`'${name}' 워크플로우를 (Bun 버전으로) 시작합니다. (1단계)`);
}

async function listSteps() {
  const state = loadState();
  if (!state.workflow) {
    console.log("진행 중인 워크플로우가 없습니다.");
    return;
  }
  const wfPath = path.join(WORKFLOWS_DIR, `${state.workflow}.md`);
  if (existsSync(wfPath)) {
    const text = await Bun.file(wfPath).text();
    console.log(`\n--- [워크플로우 '${state.workflow}'의 전체 단계] ---`);
    text.split("\n").forEach((line) => {
      if (line.includes("단계:")) console.log(line.trim());
    });
    console.log(
      "\n'bun ministack.ts set <번호>'로 원하는 단계로 이동할 수 있습니다."
    );
  }
}

async function generatePrompt(userMessage?: string) {
  const state = loadState();
  if (!state.workflow) {
    console.log("진행 중인 워크플로우가 없습니다.");
    return;
  }

  const roleMap: Record<number, string> = {
    1: "market_researcher",
    2: "researcher",
    3: "product",
    4: "concept_reviewer",
    5: "architect",
    6: "architect",
    7: "engineer",
    8: "reviewer",
    9: "engineer",
  };

  const roleName = roleMap[state.step] || "engineer";
  const rolePath = path.join(ROLES_DIR, `${roleName}.md`);
  const workflowPath = path.join(WORKFLOWS_DIR, `${state.workflow}.md`);

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
  console.log(`[${roleName.toUpperCase()} 프롬프트 생성 (Bun 버전)]`);
  console.log("=".repeat(50) + "\n");
  console.log(promptContent);
  console.log("\n" + "=".repeat(50));
}

// CLI 로직
const args = Bun.argv.slice(2);
const cmd = args[0];

switch (cmd) {
  case "list":
    listItems();
    break;
  case "start":
    if (args[1]) startWorkflow(args[1]);
    else console.log("Usage: bun ministack.ts start <name>");
    break;
  case "status":
    const ss = loadState();
    console.log(`[Bun 상태] 워크플로우: ${ss.workflow}, 단계: ${ss.step}`);
    break;
  case "steps":
    listSteps();
    break;
  case "next":
    const ns = loadState();
    ns.step++;
    saveState(ns);
    console.log(`다음 단계(${ns.step})로 이동했습니다.`);
    break;
  case "back":
    const ps = loadState();
    if (ps.step > 1) {
      ps.step--;
      saveState(ps);
      console.log(`이전 단계(${ps.step})로 이동했습니다.`);
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
      console.log("Usage: bun ministack.ts set <step_number>");
    }
    break;
  case "prompt":
    const userMsg = args.slice(1).join(" ");
    generatePrompt(userMsg || undefined);
    break;
  default:
    console.log(
      "Usage: bun ministack.ts [list|start|status|steps|next|back|set|prompt]"
    );
}
