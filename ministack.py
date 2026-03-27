import os
import json
import sys

# [중요] 경로 설계 개편 (Global Tooling 대응)
# GLOBAL_DIR: 스크립트가 실제 위치한 곳 (전역 템플릿)
# PROJECT_DIR: 사용자가 현재 명령어를 실행한 곳 (로컬 프로젝트)

GLOBAL_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.getcwd()

# 1. 전역 리소스 경로 (템플릿)
GLOBAL_ROLES_DIR = os.path.join(GLOBAL_DIR, 'roles')
GLOBAL_WORKFLOWS_DIR = os.path.join(GLOBAL_DIR, 'workflows')

# 2. 로컬 프로젝트 리소스 경로 (오버라이드 가능/산출물 저장)
LOCAL_ROLES_DIR = os.path.join(PROJECT_DIR, 'roles')
LOCAL_WORKFLOWS_DIR = os.path.join(PROJECT_DIR, 'workflows')
DOCS_DIR = os.path.join(PROJECT_DIR, 'docs')
STATE_FILE = os.path.join(PROJECT_DIR, 'state.json')

# 필요한 디렉토리 초기화 (프로젝트별로 docs 생성)
if not os.path.exists(DOCS_DIR):
    os.makedirs(DOCS_DIR)

def get_resource_path(resource_type, name):
    """로컬에 파일이 있으면 로컬을, 없으면 전역 템플릿을 반환"""
    local_path = os.path.join(LOCAL_ROLES_DIR if resource_type == 'role' else LOCAL_WORKFLOWS_DIR, f"{name}.md")
    global_path = os.path.join(GLOBAL_ROLES_DIR if resource_type == 'role' else GLOBAL_WORKFLOWS_DIR, f"{name}.md")
    
    if os.path.exists(local_path):
        return local_path
    return global_path

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
    print(f"\n[현지 프로젝트]: {PROJECT_DIR}")
    
    # 1. 채용된 팀원 (Local Roles)
    print("\n--- [채용된 팀원 (Local Team)] ---")
    local_roles = []
    if os.path.exists(LOCAL_ROLES_DIR):
        local_roles = [f[:-3] for f in os.listdir(LOCAL_ROLES_DIR) if f.endswith('.md')]
    if local_roles:
        for r in sorted(local_roles): print(f"- {r} (현지 상주)")
    else:
        print("(아직 채용된 전담 팀원이 없습니다. 전역 인력을 사용합니다.)")

    # 2. 사용 가능한 워크플로우
    print("\n--- [사용 가능한 워크플로우] ---")
    wfs = set()
    for d in [GLOBAL_WORKFLOWS_DIR, LOCAL_WORKFLOWS_DIR]:
        if os.path.exists(d):
            for f in os.listdir(d):
                if f.endswith('.md'): wfs.add(f[:-3])
    for w in sorted(wfs): print(f"- {w}")

def list_market():
    print("\n" + "="*50)
    print("🌍 글로벌 인력 시장 (Global Talent Market)")
    print("="*50)
    if os.path.exists(GLOBAL_ROLES_DIR):
        roles = [f[:-3] for f in os.listdir(GLOBAL_ROLES_DIR) if f.endswith('.md')]
        for r in sorted(roles):
            # 로컬에 이미 있는지 체크
            status = "[채용됨]" if os.path.exists(os.path.join(LOCAL_ROLES_DIR, f"{r}.md")) else "[대기 중]"
            print(f"- {r:<20} {status}")
    print("\n* 명령: 'ministack recruit <이름>'으로 전문가를 내 팀으로 영입하세요.")

def recruit_persona(name):
    if not os.path.exists(LOCAL_ROLES_DIR):
        os.makedirs(LOCAL_ROLES_DIR)
    
    source = os.path.join(GLOBAL_ROLES_DIR, f"{name}.md")
    target = os.path.join(LOCAL_ROLES_DIR, f"{name}.md")
    
    if not os.path.exists(source):
        print(f"Error: 인력 시장에 '{name}'이라는 전문가가 없습니다.")
        return
    
    if os.path.exists(target):
        print(f"안내: '{name}'은(는) 이미 우리 팀원입니다. (업데이트하려면 파일을 직접 수정하세요.)")
        return

    import shutil
    shutil.copy(source, target)
    print(f"🎉 축하합니다! '{name}' 전문가가 우리 팀으로 정식 채용되었습니다.")
    print(f"이제 'roles/{name}.md' 파일을 수정하여 우리 프로젝트에 맞게 특수 교육(Customizing)을 할 수 있습니다.")

def onboard_persona(name):
    source = os.path.join(GLOBAL_ROLES_DIR, f"{name}.md")
    if os.path.exists(source):
        print(f"안내: '{name}' 전문가가 이미 인력 시장에 등록되어 있습니다.")
        return

    template = f"""# 역할: {name.replace('_', ' ').title()}

당신은 {name} 분야에서 풍부한 경험을 가진 전문가입니다.

## 핵심 원칙
- **전문성**: 해당 분야의 베스트 프랙티스를 준수합니다.
- **협업**: 팀의 목표 달성을 위해 다른 전문가들과 적극적으로 소통합니다.

## 도구 (Tools)
당신은 다음 도구들을 활용할 권한이 있습니다:
- [여기에 도구 목록을 작성하세요]

## 활동
- [여기에 주요 활동을 작성하세요]
"""
    with open(source, 'w', encoding='utf-8') as f:
        f.write(template)
    print(f"✨ 새로운 전문가 '{name}'이(가) 글로벌 인력 시장에 등록되었습니다.")
    print(f"위치: {source}")
    print("이제 이 파일을 수정하여 전문가의 상세 지침을 완성하세요.")
    state = load_state()
    workflow_name = state.get("workflow")
    if not workflow_name:
        print("진행 중인 워크플로우가 없습니다.")
        return
    
    path = get_resource_path('workflow', workflow_name)
    if not os.path.exists(path):
        print(f"Error: 워크플로우 파일을 찾을 수 없습니다. ({path})")
        return

    print(f"\n--- [워크플로우 '{workflow_name}'의 전체 단계] ---")
    with open(path, 'r', encoding='utf-8') as f:
        for line in f:
            if "단계:" in line:
                print(line.strip())

def start_workflow(name):
    path = get_resource_path('workflow', name)
    if not os.path.exists(path):
        print(f"Error: 워크플로우 '{name}'을 찾을 수 없습니다.")
        return
    
    state = {"workflow": str(name), "step": 1, "role": "market_researcher"}
    save_state(state)
    print(f"새 프로젝트에서 '{name}' 워크플로우를 시작합니다. (1단계)")
    show_status()

def show_status():
    state = load_state()
    workflow_name = state.get("workflow")
    if not workflow_name:
        print("진행 중인 워크플로우가 없습니다. 'ministack start <name>'으로 시작하세요.")
        return
    
    current_step = int(state.get("step", 1))
    print(f"\n[현재 프로젝트 상태]")
    print(f"- 경로: {PROJECT_DIR}")
    print(f"- 워크플로우: {workflow_name}")
    print(f"- 단계: {current_step}")
    
    path = get_resource_path('workflow', workflow_name)
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
    
    if workflow_name == "feature":
        role_map = {1: "market_researcher", 2: "researcher", 3: "product", 4: "concept_reviewer", 5: "architect", 6: "architect", 7: "engineer", 8: "reviewer", 9: "security_reviewer", 10: "engineer"}
    else:
        role_map = {1: "researcher", 2: "engineer", 3: "reviewer", 4: "qa", 5: "engineer"}
    
    role_name = role_map.get(current_step, "engineer")
    role_path = get_resource_path('role', role_name)
    workflow_path = get_resource_path('workflow', workflow_name)
    
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
    print("="*50 + "\n")
    print(prompt_content)
    print("\n" + "="*50)

def show_help():
    help_text = f"""
MiniStack CLI (위치: {GLOBAL_DIR})

명령어:
  list                  현재 프로젝트의 팀원과 워크플로우를 확인합니다.
  market                글로벌 인력 시장의 전문가 후보들을 살펴봅기다.
  onboard <name>       새로운 전문가 페르소나를 글로벌 인력 시장에 등록합니다.
  recruit <name>        인력 시장의 전문가를 내 프로젝트 전담 팀원으로 채용합니다.
  start <workflow>      현재 폴더에서 새로운 프로젝트 워크플로우를 시작합니다.
  status                현재 진행 중인 단계의 상세 정보를 출력합니다.
  steps                 현재 워크플로우의 전체 단계 목록을 보여줍니다.
  next                  다음 단계로 이동합니다.
  back                  이전 단계로 이동합니다.
  set <number>          특정 단계 번호로 이동합니다.
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
    elif cmd == "market":
        list_market()
    elif cmd == "onboard":
        if len(sys.argv) < 3:
            print("Usage: ministack onboard <persona_name>")
        else:
            onboard_persona(sys.argv[2])
    elif cmd == "recruit":
        if len(sys.argv) < 3:
            print("Usage: ministack recruit <persona_name>")
        else:
            recruit_persona(sys.argv[2])
    elif cmd == "start":
        if len(sys.argv) < 3:
            print("Usage: ministack start <workflow_name>")
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
            print("Usage: ministack set <step_number>")
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
