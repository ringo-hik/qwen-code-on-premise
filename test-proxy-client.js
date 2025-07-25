#!/usr/bin/env node

/**
 * 프록시 서버 테스트 클라이언트
 */

const testProxyServer = async () => {
  const PROXY_URL = 'http://localhost:9443/devport/api/v1/chat/completions';
  
  const testRequest = {
    model: 'internal-llm-model',
    messages: [
      {
        role: 'user',
        content: '안녕하세요! 간단한 테스트 메시지입니다.'
      }
    ],
    max_tokens: 100,
    temperature: 0.7
  };

  console.log('🧪 프록시 서버 테스트 시작...');
  console.log('📍 테스트 URL:', PROXY_URL);
  console.log('📝 요청 데이터:', JSON.stringify(testRequest, null, 2));
  
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-key'
      },
      body: JSON.stringify(testRequest)
    });

    console.log('\n📊 응답 상태:', response.status);
    console.log('📊 응답 헤더:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.text();
    console.log('📝 응답 데이터:', responseData);

    if (response.ok) {
      try {
        const jsonData = JSON.parse(responseData);
        console.log('\n✅ 성공! JSON 파싱됨');
        console.log('💬 AI 응답:', jsonData.choices?.[0]?.message?.content);
      } catch (e) {
        console.log('\n⚠️ JSON 파싱 실패, 원시 응답:', responseData);
      }
    } else {
      console.log('\n❌ 응답 실패');
    }

  } catch (error) {
    console.error('\n❌ 요청 오류:', error.message);
  }
};

// 테스트 실행
testProxyServer();