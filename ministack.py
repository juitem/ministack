import os
import json
import sys

# 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROLES_DIR = os.path.join(BASE_DIR, 'roles')
WORKFLOWS_DIR = os.path.join(BASE_DIR, 'workflows')
STATE_FILE = os.path.join(BASE_DIR, 'state.json')
DOCS_DIR = os.path.join(BASE_DIR, 'docs') # 산출물 저장소

# 디렉토리 초기화
for d in [ROLES_DIR, WORKFLOWS_DIR, DOCS_DIR]:
    if not os.path.exists(d):
        os.makedirs(d)

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return {
                    "workflow": str(data.get("workflow", "")),
                    "step": int(data.get("step", 1)),
                    "role": str(data.get("role", "product"))
                }
        except Exception:
            pass
    return {"workflow": "", "step": 1, "role": "product"}

def save_state(state):
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=2)

def list_items():
    print("\n--- [사용 가능한 역할(Roles)] ---")
    if os.path.exists(ROLES_DIR):
        for f in sorted(os.listdir(ROLES_DIR)):
            if f.endswith('.md'):
                print(f"- {f[:-3]}")
    
    print("\n--- [사용 가능한 워크플로우(Workflows)] ---")
    if os.path.exists(WORKFLOWS_DIR):
        for f in sorted(os.listdir(WORKFLOWS_DIR)):
            if f.endswith('.md'):
                print(f"- {f[:-3]}")

def list_steps():
    state = load_state()
    workflow_name = state.get("workflow")
    if not workflow_name:
        print("진행 중인 워크플로우가 없습니다.")
        return
    
    path = os.path.join(WORKFLOWS_DIR, f"{workflow_name}.md")
    if not os.path.exists(path):
        print(f"Error: 워크플로우 파일을 찾을 수 없습니다.")
        return

    print(f"\n--- [워크플로우 '{workflow_name}'의 전체 단계] ---")
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            if "단계:" in line:
                print(line.strip())
    print("\n'python3 ministack.py set <번호>'로 원하는 단계로 이동할 수 있습니다.")

def start_workflow(name):
    path = os.path.join(WORKFLOWS_DIR, f"{name}.md")
    if not os.path.exists(path):
        print(f"Error: 워크플로우 '{name}'을 찾을 수 없습니다.")
        return
    
    state = {"workflow": str(name), "step": 1, "role": "market_researcher"}
    save_state(state)
    print(f"'{name}' 워크플로우를 시작합니다. (1단계: 시장 조사)")
    show_status()

def show_status():
    state = load_state()
    workflow_name = state.get("workflow")
    if not workflow_name:
        print("진행 중인 워크플로우가 없습니다. 'python3 ministack.py start <name>'으로 시작하세요.")
        return
    
    current_step = int(state.get("step", 1))
    print(f"\n[현재 상태]")
    print(f"- 워크플로우: {workflow_name}")
    print(f"- 단계: {current_step}")
    
    path = os.path.join(WORKFLOWS_DIR, f"{workflow_name}.md")
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            step_marker = f"{current_step}단계"
            found = False
            for line in lines:
                if step_marker in line:
                    print(f"- 설명: {line.strip()}")
                    found = True
                elif found and line.strip().startswith("-"):
                    print(f"  {line.strip()}")
                elif found and (line.strip().startswith("##") or line.strip() == "---"):
                    break

def next_step():
    state = load_state()
    if not state.get("workflow"):
        print("진행 중인 워크플로우가 없습니다.")
        return
    state["step"] = int(state.get("step", 0)) + 1
    save_state(state)
    print(f"다음 단계({state['step']})로 이동했습니다.")
    show_status()

def set_step(step_num):
    state = load_state()
    if not state.get("workflow"):
        print("진행 중인 워크플로우가 없습니다.")
        return
    try:
        new_step = int(step_num)
        if new_step < 1:
            print("단계는 1보다 커야 합니다.")
            return
        state["step"] = new_step
        save_state(state)
        print(f"{new_step}단계로 직접 이동했습니다.")
        show_status()
    except ValueError:
        print("Error: 올바른 단계 숫자(정수)를 입력하세요.")

def prev_step():
    state = load_state()
    current_step = int(state.get("step", 0))
    if not state.get("workflow") or current_step <= 1:
        print("이전 단계가 없습니다.")
        return
    state["step"] = current_step - 1
    save_state(state)
    print(f"이전 단계({state['step']})로 이동했습니다.")
    show_status()

def generate_prompt(user_message=None):
    state = load_state()
    workflow_name = state.get("workflow")
    if not workflow_name:
        print("진행 중인 워크플로우가 없습니다.")
        return
    
    current_step = int(state.get("step", 1))
    
    # 워크플로우별 역할 매핑
    if workflow_name == "feature":
        role_map = {
            1: "market_researcher",
            2: "researcher",
            3: "product",
            4: "concept_reviewer",
            5: "architect",
            6: "architect",
            7: "engineer",
            8: "reviewer",
            9: "security_reviewer",
            10: "engineer"
        }
    else:
        role_map = {
            1: "researcher",
            2: "engineer",
            3: "reviewer",
            4: "qa",
            5: "engineer"
        }
    
    role_name = role_map.get(current_step, "engineer")
    role_path = os.path.join(ROLES_DIR, f"{role_name}.md")
    workflow_path = os.path.join(WORKFLOWS_DIR, f"{workflow_name}.md")
    
    prompt_content = "--- [AGENT ROLE] ---\n"
    if os.path.exists(role_path):
        with open(role_path, 'r', encoding='utf-8') as f:
            role_text = f.read()
            prompt_content += role_text
            if "## 도구" in role_text:
                prompt_content += "\n\n(참고: 당신은 위 명시된 도구들을 활용할 수 있는 권한이 있습니다.)"
    
    prompt_content += "\n\n--- [CURRENT TASK & CONTEXT] ---\n"
    prompt_content += f"당신은 현재 '{workflow_name}' 워크플로우의 {current_step}단계를 진행 중입니다.\n"
    
    if os.path.exists(workflow_path):
        with open(workflow_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            step_marker = f"{current_step}단계"
            in_step = False
            for line in lines:
                if step_marker in line:
                    in_step = True
                    prompt_content += line
                elif in_step and (line.startswith("##") or line.startswith("---")):
                    break
                elif in_step:
                    prompt_content += line

    if user_message:
        prompt_content += f"\n\n[사용자 추가 지시 사항]:\n{user_message}\n"
    
    print("\n" + "="*50)
    print(f"[{role_name.upper()} 프롬프트 생성 완료]")
    print("다음 내용을 복사하여 AI 에이전트에게 전달하세요:")
    print("="*50 + "\n")
    print(prompt_content)
    print("\n" + "="*50)

def show_help():
    help_text = """
MiniStack CLI 사용 가이드

명령어:
  list                  사용 가능한 역할과 워크플로우 목록을 출력합니다.
  start <workflow>      새로운 워크플로우를 시작합니다. (예: start feature)
  status                현재 진행 중인 단계의 상세 정보를 출력합니다.
  steps                 현재 워크플로우의 전체 단계 목록을 보여줍니다.
  next                  다음 단계로 1칸 이동합니다.
  back                  이전 단계로 1칸 이동합니다.
  set <number>          특정 단계 번호로 즉시 이동합니다. (예: set 5)
  prompt [message]      현재 단계에 최적화된 AI 프롬프트를 생성합니다. 
  help                  이 도움말을 출력합니다.
"""
    print(help_text)

def main():
    if len(sys.argv) < 2:
        show_help()
        return
    
    cmd = sys.argv[1].lower()
    if cmd in ["help", "-h", "--help"]:
        show_help()
    elif cmd == "list":
        list_items()
    elif cmd == "start":
        if len(sys.argv) < 3:
            print("Usage: python3 ministack.py start <workflow_name>")
        else:
            start_workflow(sys.argv[2])
    elif cmd == "status":
        show_status()
    elif cmd == "steps":
        list_steps()
    elif cmd == "next":
        next_step()
    elif cmd == "back":
        prev_step()
    elif cmd == "set":
        if len(sys.argv) < 3:
            print("Usage: python3 ministack.py set <step_number>")
        else:
            set_step(sys.argv[2])
    elif cmd == "prompt":
        user_msg = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None
        generate_prompt(user_msg)
    else:
        print(f"Unknown command: {cmd}")
        show_help()

if __name__ == "__main__":
    main()
