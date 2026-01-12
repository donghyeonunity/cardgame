# /update-doc 명령어

현재 작업 내용을 기반으로 관련 문서를 찾아 업데이트합니다.

## 실행 절차

### 1. 현재 작업 내용 파악
- 이번 세션에서 수정/생성된 파일 확인
- 작업의 주제와 영역 파악 (카드, 전직, UI, 프로젝트 등)

### 2. 관련 문서 탐색
`.claude/agents/docs-mapping.md`를 읽고 현재 작업과 관련된 문서를 찾습니다.

**에이전트별 담당 문서:**
- **project-pd**: 프로젝트 기획 문서 (one-pager, scope-board, milestone 등)
- **content-manager**: 게임 콘텐츠 문서 (cards.md, class-advancement.md, paladin.md 등)
- **ui-ux-manager**: UI/UX 문서 (ui-ux.md, screen.md, animation.md 등)

### 3. 문서 업데이트 또는 생성 권유

**관련 문서를 찾은 경우:**
1. 해당 문서를 읽고 현재 내용 파악
2. 작업 내용을 반영하여 문서 업데이트
3. `01. docs/changelog.md`에 변경 이력 추가

**관련 문서를 찾지 못한 경우:**
1. 사용자에게 새 문서 생성을 권유
2. 적절한 문서 경로와 구조 제안
3. 사용자 동의 시 문서 생성 및 docs-mapping.md 업데이트

### 4. 변경 로그 작성
`01. docs/changelog.md`에 다음 형식으로 기록:

```markdown
## [날짜] - 문서 업데이트

### 변경 내용
- [문서명]: [변경 설명]

### 관련 작업
- [작업 내용 요약]
```

## 사용 예시

```
/update-doc
```

세션에서 카드를 추가했다면 → `01. docs/contents/cards.md` 업데이트
세션에서 UI를 변경했다면 → `01. docs/02. proto/` 하위 문서 업데이트
새로운 시스템을 추가했다면 → 새 문서 생성 권유
