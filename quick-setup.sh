#!/bin/bash

echo "🚀 Qwen Code 내부망 LLM 빠른 설정"
echo "=================================="

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 2. 내부망 설정 활성화
echo "⚙️  내부망 설정 활성화 중..."
cp .env.example .env
echo "✅ 로컬 .env 파일 생성 완료"

# 3. 글로벌 설정
echo "🌐 글로벌 설정 중..."
npm run setup-internal

echo ""
echo "🎉 설정 완료!"
echo ""
echo "사용 방법:"
echo "1. 테스트 서버 실행: npm run test:proxy"
echo "2. qwen 실행: npm run qwen"
echo ""
echo "글로벌 설치: npm run install-global"
echo ""