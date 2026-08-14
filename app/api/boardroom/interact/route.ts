// app/api/boardroom/interact/route.ts
import { NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function filterStrictKorean(text: string): string {
  if (!text) return '';
  let cleaned = text
    .replace(/[\u0400-\u04FF]/g, '')
    .replace(/[\u4E00-\u9FFF]/g, '')
    .replace(/[\u3040-\u309F\u30A0-\u30FF]/g, '');

  cleaned = cleaned.replace(
    /[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\s.,!?:;\-_'"()\[\]{}<>/\\+=%*$&@#~`^|·…₩℃]/g,
    ''
  );
  return cleaned.trim();
}

export async function POST(request: Request) {
  try {
    const { agenda, role, question, reportContext } = await request.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    const personaPrompts: Record<string, string> = {
      CIO: '당신은 정보·리서치 임원(CIO)입니다. 회장님의 추가 질의에 대해 오직 시장 데이터, 경쟁사 비교 수치, 객관적 팩트 중심으로 2~3문장 한국어로 답변하십시오.',
      CSO: '당신은 전략기획 임원(CSO)입니다. 회장님의 추가 지시사항에 대해 사업 포트폴리오 재편, 수익화 전략, 단계적 실행 방안 관점에서 2~3문장 한국어로 답변하십시오.',
      CTO: '당신은 최고기술책임자(CTO)입니다. 회장님의 기술적 질문에 대해 핵심 공정 수율, 기술 아키텍처, 개발 일정 및 엔지니어링 타당성 관점에서 2~3문장 한국어로 답변하십시오.',
      CRO: '당신은 리스크·감사 임원(CRO)입니다. 회장님의 질의에 대해 숨겨진 재무적 리스크, 법적 규제, 최악의 시나리오 및 구체적인 리스크 방어책 관점에서 2~3문장 한국어로 답변하십시오.',
      CHIEF_OF_STAFF: '당신은 비서실장입니다. 회장님의 지시를 바탕으로 전체 임원진의 의견을 조율하고 최종 가이드라인을 2~3문장 한국어로 요약 보고하십시오.',
    };

    const systemPrompt = `${personaPrompts[role] || personaPrompts.CHIEF_OF_STAFF}

[필수 원칙]
1. 회장님의 추가 지시/질문에 즉각적이고 구체적인 본론으로 답변하십시오.
2. 100% 한국어로만 작성하고 영한 병기나 타 언어를 절대 쓰지 마십시오.
3. 2~3문장으로 명확하고 간결하게 답변하십시오.`;

    const userPrompt = `
[상정 안건] ${agenda}
[기존 의사결정 요약] ${reportContext || '없음'}
[회장님의 추가 지시/질의] "${question}"

해당 직무 관점에서 명확한 실행 답변을 보고하십시오.
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Groq 호출 실패');
    }

    const data = await response.json();
    const reply = filterStrictKorean(
      (data.choices?.[0]?.message?.content || '').replace(/<think>[\s\S]*?<\/think>/g, '')
    );

    return NextResponse.json({ success: true, reply });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '추가 질의 처리 실패';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}