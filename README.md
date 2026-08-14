# 👑 AI Virtual Boardroom (AI 가상 이사회 시스템)

> **회장 직속 5인 AI 전문 임원진의 독립 직무 분석, 심층 교차 검증, 그리고 8대 표준 의사결정 보고서 자동 생성 시스템**

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-PostCSS-06B6D4?style=flat-square&logo=tailwindcss)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-F55036?style=flat-square)

---

## 📌 프로젝트 소개

**AI Virtual Boardroom**은 기업 의사결정권자(회장/CEO)가 경영 안건을 상정하면, 각기 다른 전문 도메인을 가진 **5인의 AI 임원진**이 자신의 직무 관점에서 독립적으로 분석하고 토론하여 최적의 실행 전략과 리스크를 도출하는 멀티 에이전트 시스템입니다.

---

## ✨ 핵심 기능

### 1. 🏛️ 5인 AI 임원진 직무별 독립 분석 및 상호 토론
- **문장 복제(앵무새 현상) 0% 보장:** 각 임원이 자신의 고유 전문 영역에서만 첫 문장부터 본론으로 브리핑합니다.
- **실시간 상호 교차 검증:** CSO의 공격적 전략에 대해 CRO가 최악의 시나리오로 반론을 제기하고, CSO가 2단계 방어 절충안을 제시합니다.

### 2. 📋 8대 표준 의사결정 보고서
토론 완료 즉시 비서실장이 종합 정리한 경영 보고서가 렌더링됩니다:
1. **결론 (Executive Summary)**
2. **핵심 근거 (Data & Fact)**
3. **임원별 분석 요약**
4. **의견 충돌 및 대립 지점**
5. **주요 위험 및 최악 시나리오**
6. **추천안 (1차 실행안)**
7. **대안 (차선책)**
8. **회장이 결정할 사항 (체크리스트)**

### 3. 🎯 회장 직속 1:1 추가 지시 콘솔 (Interactive Q&A)
- 보고서 검토 후 특정 임원(CIO/CSO/CTO/CRO/비서실장)을 지목하여 추가 질문이나 수정 지시를 내리면 단독 재검토 답변을 즉각 회신합니다.

### 4. 📂 회의록 히스토리 & 원클릭 내보내기
- **자동 보관:** 진행된 모든 이사회 회의가 로컬 저장소에 안전하게 자동 저장됩니다.
- **다양한 포맷 지원:** **Markdown(`.md`) 파일 다운로드**, **인쇄 및 PDF 출력**, **클립보드 복사** 지원.

### 5. 💻 기술 아키텍처 & 시스템 엔지니어링 콘솔
- 안건별 기술 스택 및 데이터 파이프라인 블루프린트 TypeScript 코드 실시간 생성 및 제공.

---

## 👥 임원진 구성 및 페르소나

| 직책 | 담당 페르소나 | 핵심 역할 및 관점 | 기반 모델 |
| :--- | :--- | :--- | :--- |
| **CIO** | 정보·리서치 임원 | 시장 점유율, 경쟁사 비교 수치, 실시간 팩트 데이터 브리핑 | Groq Llama 3.3 70B |
| **CSO** | 전략기획 임원 | 사업 포트폴리오 재편, 시장 진입 전략, 수익화 모델 수립 | Groq Llama 3.3 70B |
| **CTO** | 기술·혁신 임원 | 핵심 공정 수율, 인프라 아키텍처, 엔지니어링 구현 타당성 | Groq Llama 3.3 70B |
| **CRO** | 리스크·감사 임원 | 설비 투자 실패, 적자 지속, 법적 규제 등 최악의 시나리오 공격 | Groq Llama 3.3 70B |
| **비서실장** | Chief of Staff | 회의 진행 조율 및 8대 표준 의사결정 보고서 종합 편철 | Groq Llama 3.3 70B |

---

## 🛠️ 기술 스택

- **Framework:** Next.js (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, PostCSS
- **Icons & Animation:** Lucide React, Framer Motion
- **AI Inference Engine:** Groq Cloud API (`llama-3.3-70b-versatile`)
- **Language Integrity:** 이중 언어 무결성 필터링 파이프라인 (타 언어 혼용 및 영한 병기 차단)

---

## 🚀 시작 가이드

### 1. 저장소 클론 및 패키지 설치

```bash
git clone [https://github.com/no-cap-idc/AI-BoardRoom.git](https://github.com/no-cap-idc/AI-BoardRoom.git)
cd AI-BoardRoom
npm install
