# 온프레미스 qwen-code 적용 가이드

이 폴더는 폐쇄망(온프레미스) 환경에서 qwen-code를 사용하기 위한 문서와 설정 파일을 포함합니다.

## 📁 폴더 구조

```
docs/on-premise/
├── README.md                    # 이 파일
├── 온프레미스-qwen-code-PRD.md   # 상세 요구사항 문서
├── 개발진행계획서.md              # 단계별 개발 계획
└── 설치가이드.md                 # 사용자 설치 및 설정 가이드
```

## 🎯 목표

**최소한의 수정**으로 폐쇄망 환경에서 qwen-code가 내부 LLM 서버와 연동되어 동작하도록 구현

## 🔧 핵심 수정 사항 (총 3개 파일)

1. `internal-web-config.json` - 내부 웹 URL 설정 (신규)
2. `packages/core/src/utils/fetch.ts` - SSL 우회 기능 (최소 수정)  
3. `packages/core/src/tools/web-search.ts` - 내부 웹 검색 (대체)

## 📋 주요 원칙

- ✅ **최소 수정**: 3개 파일만 터치
- ✅ **노코드 우선**: 환경변수 + JSON 설정
- ✅ **심플함**: npm install → 환경설정 → qwen 실행
- ✅ **완전 충족**: 내부 LLM 연동 + 웹검색 + SSL 우회

---

**업데이트**: 2025-01-26  
**작성자**: Claude Code SuperClaude  
**목적**: PoC (Proof of Concept)