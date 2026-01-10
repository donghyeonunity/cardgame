# 문서 의존성 맵

> 문서 간 연관 관계를 정의합니다.
> 한 문서 수정 시 연관 문서도 검토가 필요합니다.

---

## 사용 방법

1. 문서 수정 완료 시 이 맵을 참조
2. 연관 문서가 있으면 업데이트 필요 여부 검토
3. changelog.md는 모든 변경 시 필수 업데이트

---

## 전직 시스템

| 문서 | 연관 문서 | 비고 |
|------|----------|------|
| `class-advancement.md` | decisions/class-advancement-decision.md, cards.md, paladin.md | 전직 규칙 변경 시 |
| `class-advancement-decision.md` | class-advancement.md | 의사결정 추가 시 |
| `advancement-hint.md` | class-advancement.md | 힌트 로직 변경 시 |

---

## 콘텐츠

| 문서 | 연관 문서 | 비고 |
|------|----------|------|
| `cards.md` | class-advancement.md, warrior.md, paladin.md | 카드 추가/수정 시 |
| `warrior.md` | cards.md | 전사 카드 변경 시 |
| `paladin.md` | cards.md, class-advancement.md | 팔라딘 카드/오라 변경 시 |

---

## 프로젝트

| 문서 | 연관 문서 | 비고 |
|------|----------|------|
| `one-pager.md` | tech-stack.md | 기술 스택 참조 |
| `scope-board.md` | milestone.md | 스코프 변경 시 일정 영향 |
| `milestone.md` | scope-board.md, production-pipeline.md | 일정 변경 시 |
| `tech-stack.md` | one-pager.md | 기술 변경 시 |
| `production-pipeline.md` | milestone.md | 프로세스 변경 시 |

---

## UI/UX

| 문서 | 연관 문서 | 비고 |
|------|----------|------|
| `00. common/ui-ux.md` | 모든 씬별 ui-ux.md | 공통 규칙 변경 시 |
| `screen.md` | ui-ux.md | 레이아웃 변경 시 |
| `ui-ux.md` | screen.md, ui-ux-work-log.md | UI 규칙 변경 시 |
| `ui-ux-work-log.md` | - | 작업 로그 (단방향) |

---

## 공통 규칙

| 조건 | 필수 업데이트 |
|------|--------------|
| 모든 문서 변경 시 | `changelog.md` |
| 에이전트 역할 변경 시 | `docs-mapping.md` |
| 새 문서 추가 시 | 이 파일 (`dependency-map.md`) |

---

## 변경 이력

| 날짜 | 변경 내용 |
|------|----------|
| 2026-01-10 | 최초 생성 - 하이브리드 문서 업데이트 시스템 |
