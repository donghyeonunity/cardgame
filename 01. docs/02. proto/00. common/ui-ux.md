# 로우파이 UI 스타일 가이드

> 프로토타입 UI 개발 시 참고할 공통 규칙

---

## 색상 팔레트

### 기본 (그레이스케일)

| 용도 | Tailwind |
|------|----------|
| 배경 (어두운) | `gray-900` |
| 배경 (중간) | `gray-800` |
| 테두리 | `gray-700` |
| 텍스트 | `white` |
| 텍스트 (보조) | `gray-400` |

### 강조색

| 용도 | Tailwind |
|------|----------|
| 공격/데미지 | `red-500` |
| 방어/스킬 | `blue-500` |
| 에너지/강조 | `yellow-500` |
| 성공/회복 | `green-500` |
| 적/특수 | `purple-500` |

---

## 타이포그래피

| 용도 | Tailwind |
|------|----------|
| 제목 | `text-2xl font-bold` |
| 본문 | `text-base` |
| 보조 | `text-sm text-gray-400` |
| 수치 강조 | `text-xl font-bold` |

---

## 간격

| 용도 | Tailwind |
|------|----------|
| 내부 패딩 | `p-2` ~ `p-4` |
| 요소 간격 | `gap-2` ~ `gap-4` |
| 섹션 간격 | `gap-8` |

---

## 공통 스타일

### 박스/컨테이너
```
rounded-lg border border-gray-700 bg-gray-800
```

### 버튼
```
px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700
비활성: bg-gray-600 opacity-50 cursor-not-allowed
```

### 상태 표시
- 비활성: `opacity-50`
- 호버: `hover:scale-105`
- 선택: `ring-2 ring-yellow-400`

---

## 아이콘

아이콘은 이모지를 사용한다.
