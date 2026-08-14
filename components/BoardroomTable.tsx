// components/BoardroomTable.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Executive, ExecutiveStatus } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  executives: Executive[];
  executiveStatuses: Record<string, ExecutiveStatus>;
  activeSpeaker: string | null;
  latestSpeech: Record<string, string>;
}

export const EXECUTIVES_DATA: Executive[] = [
  // 1열: 회장 바로 앞열 (전략 / 비서실장 / 기술)
  {
    id: 'CSO',
    name: '전략기획 임원 (CSO)',
    model: 'Claude',
    role: '사업전략 · 논리분석 · 시장진입 · 시나리오',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    avatar: 'Oz',
    position: 'top-left',
  },
  {
    id: 'CHIEF_OF_STAFF',
    name: '비서실장 (Chief of Staff)',
    model: 'ChatGPT',
    role: '전체회의 진행 · 의견종합 · 검증 · 최종보고서',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    avatar: 'Eckhart',
    position: 'center',
  },
  {
    id: 'CTO',
    name: '기술·혁신 임원 (CTO)',
    model: 'Gemini',
    role: 'AI·기술·R&D · 기술동향 · 구현가능성',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    avatar: 'Hawkeye',
    position: 'top-right',
  },

  // 2열: 그 앞열 (정보 / 리스크)
  {
    id: 'CIO',
    name: '정보·리서치 임원 (CIO)',
    model: 'Perplexity',
    role: '최신정보 · 시장조사 · 경쟁사 · 자료검색 · 출처검증',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/50',
    avatar: 'Irina',
    position: 'bottom-left',
  },
  {
    id: 'CRO',
    name: '리스크·감사 임원 (CRO)',
    model: 'Grok',
    role: '반론 · 오류발견 · 리스크 · 최악의 시나리오',
    color: 'text-rose-300',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-500/50',
    avatar: 'Mihile',
    position: 'bottom-right',
  },
];

// --- 메이플스토리 인게임 도트 스프라이트 (고해상도 픽셀 아트) ---

// 1. 회장: 다크 시그너스 (은발 웨이브, 보라색 드레스, 다크 플레임 오라)
const DarkCygnusSprite = () => (
  <svg width="68" height="74" viewBox="0 0 34 37" className="drop-shadow-xl" shapeRendering="crispEdges">
    {/* 등 뒤 보라빛 마법진/오라 */}
    <rect x="13" y="1" width="8" height="2" fill="#A855F7" />
    <rect x="7" y="3" width="20" height="2" fill="#7E22CE" />
    <rect x="3" y="6" width="28" height="2" fill="#6B21A8" opacity="0.6" />
    
    {/* 은발 롱 헤어 & 티아라 */}
    <rect x="11" y="2" width="12" height="2" fill="#CBD5E1" />
    <rect x="14" y="2" width="6" height="2" fill="#F8FAFC" />
    <rect x="16" y="1" width="2" height="2" fill="#38BDF8" /> {/* 보석 */}
    <rect x="8" y="4" width="18" height="4" fill="#E2E8F0" />
    <rect x="5" y="8" width="6" height="18" fill="#94A3B8" />
    <rect x="23" y="8" width="6" height="18" fill="#94A3B8" />
    <rect x="4" y="14" width="3" height="10" fill="#64748B" />
    <rect x="27" y="14" width="3" height="10" fill="#64748B" />

    {/* 얼굴 및 뽀샤시 피부 */}
    <rect x="10" y="8" width="14" height="8" fill="#FFF1F2" />
    {/* 도도한 눈매 */}
    <rect x="11" y="10" width="4" height="3" fill="#1E1B4B" />
    <rect x="19" y="10" width="4" height="3" fill="#1E1B4B" />
    <rect x="12" y="11" width="2" height="2" fill="#38BDF8" />
    <rect x="20" y="11" width="2" height="2" fill="#38BDF8" />
    <rect x="12" y="10" width="1" height="1" fill="#FFFFFF" />
    <rect x="20" y="10" width="1" height="1" fill="#FFFFFF" />
    <rect x="9" y="13" width="2" height="1" fill="#F472B6" />
    <rect x="23" y="13" width="2" height="1" fill="#F472B6" />

    {/* 다크 퍼플 & 골드 드레스 바디 */}
    <rect x="11" y="16" width="12" height="4" fill="#3B0764" />
    <rect x="14" y="16" width="6" height="3" fill="#FACC15" />
    <rect x="9" y="20" width="16" height="10" fill="#2E1065" />
    <rect x="8" y="26" width="18" height="6" fill="#1E1B4B" />
    <rect x="12" y="22" width="10" height="4" fill="#581C87" />

    {/* 손에 든 보라색 화염 구체 */}
    <rect x="27" y="16" width="4" height="5" fill="#C084FC" />
    <rect x="28" y="17" width="2" height="3" fill="#F43F5E" />
  </svg>
);

// 2. 전략기획(CSO) Claude: 오즈 (주황/빨강 후드 케이프 & 붉은 단발 & 완드)
const OzSprite = () => (
  <svg width="60" height="66" viewBox="0 0 30 33" className="drop-shadow-lg" shapeRendering="crispEdges">
    {/* 빨간 후드 모자 & 골드 테두리 */}
    <rect x="11" y="1" width="8" height="2" fill="#DC2626" />
    <rect x="8" y="3" width="14" height="3" fill="#EA580C" />
    <rect x="6" y="6" width="18" height="3" fill="#F97316" />
    <rect x="6" y="8" width="18" height="1" fill="#FDE047" />

    {/* 붉은 단발머리 & 얼굴 */}
    <rect x="8" y="9" width="14" height="5" fill="#EF4444" />
    <rect x="8" y="11" width="14" height="7" fill="#FED7AA" />
    <rect x="6" y="11" width="2" height="6" fill="#DC2626" />
    <rect x="22" y="11" width="2" height="6" fill="#DC2626" />

    {/* 눈 (또렷한 블루/퍼플) */}
    <rect x="10" y="13" width="3" height="3" fill="#1E1B4B" />
    <rect x="17" y="13" width="3" height="3" fill="#1E1B4B" />
    <rect x="10" y="14" width="2" height="2" fill="#0284C7" />
    <rect x="17" y="14" width="2" height="2" fill="#0284C7" />
    <rect x="10" y="13" width="1" height="1" fill="#FFFFFF" />
    <rect x="17" y="13" width="1" height="1" fill="#FFFFFF" />
    <rect x="8" y="15" width="2" height="1" fill="#FDA4AF" />
    <rect x="20" y="15" width="2" height="1" fill="#FDA4AF" />

    {/* 후드 케이프 & 로브 */}
    <rect x="7" y="18" width="16" height="11" fill="#DC2626" />
    <rect x="11" y="18" width="8" height="11" fill="#FEF08A" />
    <rect x="13" y="19" width="4" height="4" fill="#C084FC" />
    <rect x="8" y="27" width="14" height="4" fill="#7C2D12" />

    {/* 불꽃 마법봉 지팡이 */}
    <rect x="25" y="10" width="3" height="4" fill="#F59E0B" />
    <rect x="26" y="14" width="2" height="14" fill="#78350F" />
  </svg>
);

// 3. 비서실장 ChatGPT: 이카트 (다크 헤어, 화이트 깃털 케이프, 가면, 표창)
const EckhartSprite = () => (
  <svg width="60" height="66" viewBox="0 0 30 33" className="drop-shadow-lg" shapeRendering="crispEdges">
    {/* 흑발 샤기 헤어 */}
    <rect x="8" y="2" width="14" height="4" fill="#0F172A" />
    <rect x="6" y="6" width="18" height="4" fill="#1E293B" />
    
    {/* 얼굴 */}
    <rect x="8" y="10" width="14" height="7" fill="#FED7AA" />
    <rect x="9" y="12" width="3" height="3" fill="#0F172A" />
    <rect x="18" y="12" width="3" height="3" fill="#0F172A" />
    <rect x="10" y="12" width="1" height="1" fill="#FFFFFF" />

    {/* 화이트 퍼(털 깃) 장식 */}
    <rect x="5" y="16" width="20" height="4" fill="#F1F5F9" />
    <rect x="4" y="18" width="22" height="2" fill="#E2E8F0" />

    {/* 블랙 나이트 망토 & 골드 벨트 */}
    <rect x="6" y="20" width="18" height="9" fill="#0F172A" />
    <rect x="11" y="20" width="8" height="9" fill="#1E293B" />
    <rect x="13" y="22" width="4" height="2" fill="#3B82F6" />
    <rect x="8" y="28" width="14" height="4" fill="#020617" />

    {/* 손에 든 흰색/골드 가면 */}
    <rect x="23" y="12" width="6" height="8" fill="#FFFFFF" />
    <rect x="24" y="14" width="3" height="4" fill="#0F172A" />
    <rect x="23" y="12" width="6" height="1" fill="#FACC15" />

    {/* 보라빛 표창 */}
    <rect x="1" y="20" width="5" height="5" fill="#A855F7" />
    <rect x="2" y="21" width="3" height="3" fill="#FFFFFF" />
  </svg>
);

// 4. 기술·혁신(CTO) Gemini: 호크아이 (붉은 장발, 보석 두건, 전격 오라)
const HawkeyeSprite = () => (
  <svg width="60" height="66" viewBox="0 0 30 33" className="drop-shadow-lg" shapeRendering="crispEdges">
    {/* 다크/골드 두건 헤어밴드 */}
    <rect x="8" y="2" width="14" height="4" fill="#1E293B" />
    <rect x="11" y="3" width="8" height="2" fill="#FACC15" />
    <rect x="14" y="3" width="2" height="2" fill="#0284C7" />

    {/* 붉은 갈색 장발 */}
    <rect x="6" y="6" width="18" height="5" fill="#991B1B" />
    <rect x="4" y="11" width="4" height="14" fill="#7F1D1D" />
    <rect x="22" y="11" width="4" height="14" fill="#7F1D1D" />

    {/* 건강한 피부톤 & 열정적인 눈 */}
    <rect x="8" y="10" width="14" height="7" fill="#FDBA74" />
    <rect x="9" y="12" width="3" height="3" fill="#78350F" />
    <rect x="18" y="12" width="3" height="3" fill="#78350F" />
    <rect x="10" y="12" width="1" height="1" fill="#FFFFFF" />
    <rect x="19" y="12" width="1" height="1" fill="#FFFFFF" />

    {/* 가죽 조끼 & 해적 셔츠 */}
    <rect x="7" y="17" width="16" height="11" fill="#78350F" />
    <rect x="11" y="17" width="8" height="11" fill="#FFFFFF" />
    <rect x="12" y="20" width="6" height="4" fill="#991B1B" />
    <rect x="8" y="27" width="14" height="5" fill="#1C1917" />

    {/* 주먹의 푸른 전격(번개) 이펙트 */}
    <rect x="25" y="17" width="4" height="5" fill="#38BDF8" />
    <rect x="26" y="18" width="2" height="3" fill="#FFFFFF" />
  </svg>
);

// 5. 정보·리서치(CIO) Perplexity: 이리나 (연분홍/금발 하이포니테일, 그린 궁수 제복)
const IrinaSprite = () => (
  <svg width="60" height="66" viewBox="0 0 30 33" className="drop-shadow-lg" shapeRendering="crispEdges">
    {/* 연분홍/금발 포니테일 */}
    <rect x="8" y="2" width="14" height="4" fill="#FDE047" />
    <rect x="20" y="0" width="6" height="9" fill="#FDE047" />
    <rect x="23" y="6" width="5" height="12" fill="#EAB308" />

    {/* 얼굴 & 청명한 에메랄드 눈동자 */}
    <rect x="8" y="6" width="14" height="8" fill="#FFF1F2" />
    <rect x="6" y="6" width="3" height="7" fill="#E2E8F0" />
    <rect x="9" y="9" width="3" height="3" fill="#047857" />
    <rect x="17" y="9" width="3" height="3" fill="#047857" />
    <rect x="10" y="9" width="1" height="1" fill="#FFFFFF" />
    <rect x="18" y="9" width="1" height="1" fill="#FFFFFF" />
    <rect x="7" y="12" width="2" height="1" fill="#FDA4AF" />
    <rect x="20" y="12" width="2" height="1" fill="#FDA4AF" />

    {/* 그린 & 골드 궁수 제복 코트 */}
    <rect x="7" y="15" width="16" height="12" fill="#15803D" />
    <rect x="11" y="15" width="8" height="12" fill="#FEF08A" />
    <rect x="8" y="16" width="3" height="4" fill="#FACC15" />
    <rect x="19" y="16" width="3" height="4" fill="#FACC15" />
    <rect x="8" y="26" width="14" height="5" fill="#14532D" />

    {/* 등 뒤의 롱보우 활 */}
    <rect x="3" y="8" width="2" height="18" fill="#854D0E" />
    <rect x="2" y="7" width="2" height="2" fill="#22C55E" />
  </svg>
);

// 6. 리스크·감사(CRO) Grok: 미하일 (은발 숏컷, 날개 달린 골드 서클릿 투구, 실버 아머)
const MihileSprite = () => (
  <svg width="60" height="66" viewBox="0 0 30 33" className="drop-shadow-lg" shapeRendering="crispEdges">
    {/* 날개 달린 골드 서클릿 */}
    <rect x="9" y="2" width="12" height="3" fill="#FACC15" />
    <rect x="4" y="1" width="5" height="5" fill="#FDE047" />
    <rect x="21" y="1" width="5" height="5" fill="#FDE047" />

    {/* 은발 헤어 */}
    <rect x="8" y="5" width="14" height="4" fill="#E2E8F0" />
    <rect x="6" y="8" width="18" height="3" fill="#CBD5E1" />

    {/* 진지한 눈매 (사파이어 블루) */}
    <rect x="8" y="9" width="14" height="7" fill="#FED7AA" />
    <rect x="9" y="11" width="3" height="3" fill="#1D4ED8" />
    <rect x="18" y="11" width="3" height="3" fill="#1D4ED8" />
    <rect x="10" y="11" width="1" height="1" fill="#FFFFFF" />
    <rect x="19" y="11" width="1" height="1" fill="#FFFFFF" />

    {/* 실버/골드 기사 플레이트 아머 */}
    <rect x="5" y="16" width="20" height="12" fill="#334155" />
    <rect x="4" y="16" width="4" height="5" fill="#94A3B8" /> {/* 어깨 철갑 */}
    <rect x="22" y="16" width="4" height="5" fill="#94A3B8" />
    <rect x="11" y="16" width="8" height="12" fill="#FACC15" />
    <rect x="13" y="18" width="4" height="5" fill="#F8FAFC" />
    <rect x="7" y="27" width="16" height="5" fill="#0F172A" />

    {/* 등 뒤의 기사 대검 자루 */}
    <rect x="25" y="8" width="3" height="9" fill="#F59E0B" />
  </svg>
);

const getMapleCharacterSprite = (id: string) => {
  switch (id) {
    case 'CSO': return <OzSprite />;
    case 'CIO': return <IrinaSprite />;
    case 'CTO': return <HawkeyeSprite />;
    case 'CRO': return <MihileSprite />;
    case 'CHIEF_OF_STAFF': return <EckhartSprite />;
    default: return <EckhartSprite />;
  }
};

export default function BoardroomTable({
  executiveStatuses,
  activeSpeaker,
  latestSpeech,
}: Props) {
  const row1Executives = EXECUTIVES_DATA.slice(0, 3); // Claude(CSO 오즈), ChatGPT(비서실장 이카트), Gemini(CTO 호크아이)
  const row2Executives = EXECUTIVES_DATA.slice(3, 5); // Perplexity(CIO 이리나), Grok(CRO 미하일)

  return (
    <div className="relative w-full h-[620px] rounded-3xl border-4 border-amber-950/80 p-6 flex flex-col items-center justify-between overflow-hidden shadow-2xl bg-gradient-to-b from-[#12141f] via-[#10121c] to-[#08090d]">
      
      {/* 1. 배경 창문 시티뷰 */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute bottom-10 left-0 right-0 h-40 bg-gradient-to-t from-blue-900/20 via-indigo-950/10 to-transparent flex justify-around items-end px-12 opacity-60">
          <div className="w-12 h-28 bg-slate-800/60 rounded-t border-t border-cyan-500/30" />
          <div className="w-16 h-36 bg-slate-800/50 rounded-t border-t border-amber-500/30" />
          <div className="w-20 h-24 bg-slate-800/70 rounded-t border-t border-blue-500/30" />
          <div className="w-14 h-32 bg-slate-800/60 rounded-t border-t border-purple-500/30" />
          <div className="w-18 h-40 bg-slate-800/50 rounded-t border-t border-emerald-500/30" />
        </div>
      </div>

      {/* 바닥 카펫 */}
      <div className="absolute inset-x-6 bottom-4 h-52 bg-[#2a171b]/60 rounded-2xl border border-amber-900/30 blur-sm pointer-events-none" />

      {/* 2. 대형 마호가니 원목 회의 테이블 */}
      <div className="absolute top-[96px] bottom-8 w-[92%] max-w-[840px] rounded-[48px] border-4 border-amber-800/80 bg-gradient-to-b from-[#3E2316] via-[#2A150C] to-[#180C06] flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-10 pointer-events-none">
        <div className="absolute inset-3 rounded-[40px] border border-amber-600/20 bg-gradient-to-b from-amber-500/5 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* 3. [상석] 회장석 : 다크 시그너스 */}
      <div className="relative z-30 flex flex-col items-center mt-0">
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          {/* 의자 등받이 */}
          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-purple-900 via-indigo-950 to-black rounded-t-2xl border-2 border-purple-500/80 -z-10 shadow-2xl" />
            <DarkCygnusSprite />
          </div>

          <div className="mt-1 px-3.5 py-0.5 rounded bg-black/95 border-2 border-purple-400 shadow-lg text-center">
            <span className="text-[11px] font-black text-purple-300 tracking-wider font-mono">
              👑 회장 (Chairman)
            </span>
          </div>
          <span className="text-[8.5px] text-purple-200/90 bg-black/80 px-2 py-0.2 rounded border border-purple-500/40 mt-0.5 font-medium">
            최종 판단 및 승인
          </span>
        </motion.div>
      </div>

      {/* 4. AI 임원진 2열 좌석 배치 */}
      <div className="w-full max-w-[840px] flex-1 flex flex-col justify-around pt-10 pb-4 z-20">
        
        {/* [1열] 전략기획(Claude) / 비서실장(ChatGPT) / 기술·혁신(Gemini) */}
        <div className="w-full flex items-center justify-around px-2">
          {row1Executives.map((exec, idx) => {
            const status = executiveStatuses[exec.id] || 'idle';
            const isSpeaking = activeSpeaker === exec.id;
            const bubble = latestSpeech[exec.id];

            return (
              <div key={exec.id} className="relative flex flex-col items-center">
                {/* 실시간 말풍선 */}
                <AnimatePresence>
                  {bubble && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className={`absolute -top-20 max-w-[210px] px-3 py-1.5 rounded-lg text-[11px] leading-tight shadow-2xl border-2 z-40 pointer-events-none ${
                        isSpeaking
                          ? 'bg-slate-900 border-yellow-400 text-yellow-200 font-bold ring-2 ring-yellow-400/40'
                          : 'bg-slate-950/95 border-slate-700 text-slate-200'
                      }`}
                    >
                      <p className="line-clamp-2">{bubble}</p>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r-2 border-b-2 border-slate-700 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 통통 튀는 애니메이션 */}
                <motion.div
                  animate={{
                    y: isSpeaking ? [0, -6, 0] : [0, -2.5, 0],
                    scale: isSpeaking ? 1.1 : 1,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: isSpeaking ? 0.8 : 2 + idx * 0.2,
                    ease: 'easeInOut',
                  }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-16 bg-gradient-to-b from-slate-900 to-amber-950/80 rounded-t-lg border border-amber-900/60 -z-10 shadow-md" />
                    {getMapleCharacterSprite(exec.id)}
                    {isSpeaking && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-col items-center max-w-[175px] text-center">
                    <div className={`px-2.5 py-0.5 rounded bg-black/90 border ${exec.borderColor} shadow-lg backdrop-blur-sm flex items-center justify-center gap-1`}>
                      <span className={`text-[10px] font-bold ${exec.color}`}>{exec.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">({exec.model})</span>
                      {status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-[8px] text-slate-300 font-medium mt-0.5 bg-slate-950/90 px-1.5 py-0.2 rounded border border-slate-800 leading-tight">
                      {exec.role}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* [2열] 정보·리서치(Perplexity) / 리스크·감사(Grok) */}
        <div className="w-full flex items-center justify-center gap-24 px-8">
          {row2Executives.map((exec, idx) => {
            const status = executiveStatuses[exec.id] || 'idle';
            const isSpeaking = activeSpeaker === exec.id;
            const bubble = latestSpeech[exec.id];

            return (
              <div key={exec.id} className="relative flex flex-col items-center">
                <AnimatePresence>
                  {bubble && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className={`absolute -top-20 max-w-[210px] px-3 py-1.5 rounded-lg text-[11px] leading-tight shadow-2xl border-2 z-40 pointer-events-none ${
                        isSpeaking
                          ? 'bg-slate-900 border-yellow-400 text-yellow-200 font-bold ring-2 ring-yellow-400/40'
                          : 'bg-slate-950/95 border-slate-700 text-slate-200'
                      }`}
                    >
                      <p className="line-clamp-2">{bubble}</p>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r-2 border-b-2 border-slate-700 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  animate={{
                    y: isSpeaking ? [0, -6, 0] : [0, -2.5, 0],
                    scale: isSpeaking ? 1.1 : 1,
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: isSpeaking ? 0.8 : 2.2 + idx * 0.2,
                    ease: 'easeInOut',
                  }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-16 bg-gradient-to-b from-slate-900 to-amber-950/80 rounded-t-lg border border-amber-900/60 -z-10 shadow-md" />
                    {getMapleCharacterSprite(exec.id)}
                    {isSpeaking && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-col items-center max-w-[185px] text-center">
                    <div className={`px-2.5 py-0.5 rounded bg-black/90 border ${exec.borderColor} shadow-lg backdrop-blur-sm flex items-center justify-center gap-1`}>
                      <span className={`text-[10px] font-bold ${exec.color}`}>{exec.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">({exec.model})</span>
                      {status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-[8px] text-slate-300 font-medium mt-0.5 bg-slate-950/90 px-1.5 py-0.2 rounded border border-slate-800 leading-tight">
                      {exec.role}
                    </span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}