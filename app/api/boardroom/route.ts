// app/api/boardroom/route.ts
import { NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// 외국어(러시아어, 중국어, 일본어) 및 불필요 기호 강제 제거 필터
function filterStrictKorean(text: string): string {
  if (!text) return '';
  let cleaned = text
    .replace(/[\u0400-\u04FF]/g, '') // 러시아어(Cyrillic) 제거
    .replace(/[\u4E00-\u9FFF]/g, '') // 한자 제거
    .replace(/[\u3040-\u309F\u30A0-\u30FF]/g, ''); // 일본어 제거

  cleaned = cleaned.replace(
    /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s.,!?:;\-_'"()\[\]{}<>/\\+=%*$&@#~`^|·…₩℃]/g,
    ''
  );
  return cleaned.trim();
}

// 안전한 JSON 파서
function extractJsonSafe(rawText: string) {
  const firstBrace = rawText.indexOf('{');
  const lastBrace = rawText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonStr = rawText.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonStr);
  }
  throw new Error('JSON 구조 파싱 실패');
}

export async function POST(request: Request) {
  try {
    const { agenda } = await request.json();
    if (!agenda) {
      return NextResponse.json({ error: '안건이 필요합니다.' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY가 .env.local에 설정되지 않았습니다.');
    }

    // 5인 임원진의 독립 직무 분업 및 단일 배치 호출 프롬프트
    const prompt = `
당신은 최고경영진 이사회 오케스트레이터입니다.
상정 안건: "${agenda}"

[절대 작성 규칙]
1. 모든 임원은 첫 문장부터 자신의 직무에 맞는 본론만 말하십시오.
2. 임원 간 같은 문장이나 서두(예: '~의 발전에 따라...', '~호조로 인해...')를 절대 반복/복제하지 마십시오.
3. 100% 자연스러운 한국어로만 작성하고, 영한 병기(영어 번역 병기)를 일체 금지합니다.
4. 오직 아래 JSON 구조로만 응답하십시오 (마크다운 백틱 및 서두/결미 텍스트 금지).

JSON 포맷:
{
  "cio": "정보·리서치: 시장 점유율, 경쟁사 비교 수치, 객관적 팩트 데이터만 2~3문장 브리핑",
  "cso": "전략기획: 사업 포트폴리오 재편, 수익화 구조, 경영 전략만 2~3문장 제시",
  "cto": "기술·혁신: 핵심 공정 기술, 수율, 아키텍처 및 엔지니어링 타당성만 2~3문장 분석",
  "cro": "리스크·감사: 설비 투자 실패, 적자 지속, 경쟁사 공세 등 최악의 재무 위험을 2~3문장으로 날카롭게 공격",
  "csoDefense": "전략기획 방어: 리스크 지적을 인정하고 손실을 방어할 2단계 절충안 2문장",
  "conclusion": "최종 핵심 결론 (1~2문장)",
  "coreEvidences": [
    "핵심 근거 1 (데이터/시장 팩트)",
    "핵심 근거 2 (경영/사업화 전략)",
    "핵심 근거 3 (공정 기술/아키텍처)",
    "핵심 근거 4 (리스크 방어책)"
  ],
  "conflicts": "임원들 간의 핵심 충돌 지점 (사업 확장 속도 vs 재무 리스크)",
  "risks": "최악의 실패 시나리오 및 주요 위험 요인",
  "recommendation": "가장 합리적인 1차 실행 추천안",
  "alternative": "차선책",
  "chairmanDecisions": [
    "회장이 직접 승인할 핵심 결정사항 1",
    "회장이 직접 승인할 핵심 결정사항 2"
  ],
  "systemCode": "// 아키텍처 Blueprint TypeScript 코드"
}
`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              '당신은 오직 JSON으로만 응답하는 최고경영진 이사회 분석 엔진입니다. 한국어 외 타 언어(러시아어, 중국어 등)는 절대 쓰지 마십시오.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API 응답 실패 (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';
    const cleanContent = filterStrictKorean(rawContent.replace(/<think>[\s\S]*?<\/think>/g, ''));

    const parsed = extractJsonSafe(cleanContent);

    return NextResponse.json({
      success: true,
      opinions: {
        cio: parsed.cio,
        cso: parsed.cso,
        cto: parsed.cto,
        cro: parsed.cro,
        csoDefense: parsed.csoDefense,
      },
      report: {
        title: `안건: ${agenda}`,
        conclusion: parsed.conclusion,
        coreEvidences: parsed.coreEvidences || [],
        executiveOpinions: {
          cio: parsed.cio,
          cso: parsed.cso,
          cto: parsed.cto,
          cro: parsed.cro,
          csoDefense: parsed.csoDefense,
        },
        conflicts: parsed.conflicts,
        risks: parsed.risks || parsed.cro,
        recommendation: parsed.recommendation || parsed.cso,
        alternative: parsed.alternative,
        chairmanDecisions: parsed.chairmanDecisions || [],
        systemCode: parsed.systemCode || `// Architecture Spec for: ${agenda}`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '이사회 처리 중 오류가 발생했습니다.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}