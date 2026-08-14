// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import BoardroomTable, { EXECUTIVES_DATA } from '@/components/BoardroomTable';
import { DialogueItem, ExecutiveRole, ExecutiveStatus, BoardReport } from '@/lib/types';
import {
  Play,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Crown,
  Code2,
  LayoutDashboard,
  Terminal,
  Layers,
  Download,
  Printer,
  History,
  Send,
  Trash2,
} from 'lucide-react';

interface ExtendedBoardReport extends BoardReport {
  systemCode?: string;
  executiveOpinions: {
    cio: string;
    cso: string;
    cto: string;
    cro: string;
    csoDefense?: string;
  };
}

interface SavedSession {
  id: string;
  date: string;
  agenda: string;
  report: ExtendedBoardReport;
  dialogueLogs: DialogueItem[];
}

export default function BoardroomPage() {
  const [activeTab, setActiveTab] = useState<'boardroom' | 'code'>('boardroom');
  const [agenda, setAgenda] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [dialogueLogs, setDialogueLogs] = useState<DialogueItem[]>([]);
  const [latestSpeech, setLatestSpeech] = useState<Record<string, string>>({});
  const [executiveStatuses, setExecutiveStatuses] = useState<Record<string, ExecutiveStatus>>({
    CSO: 'idle',
    CIO: 'idle',
    CTO: 'idle',
    CRO: 'idle',
    CHIEF_OF_STAFF: 'idle',
  });
  const [report, setReport] = useState<ExtendedBoardReport | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // 추가 질의(Q&A) 상태
  const [selectedTargetRole, setSelectedTargetRole] = useState<'CIO' | 'CSO' | 'CTO' | 'CRO' | 'CHIEF_OF_STAFF'>('CRO');
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  // 히스토리 관리
  const [historyList, setHistoryList] = useState<SavedSession[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // 로컬스토리지에서 이력 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_boardroom_history');
      if (saved) {
        setHistoryList(JSON.parse(saved));
      }
    } catch {
      // 무시
    }
  }, []);

  // 이력 저장
  const saveToHistory = (newAgenda: string, newReport: ExtendedBoardReport, logs: DialogueItem[]) => {
    const session: SavedSession = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ko-KR'),
      agenda: newAgenda,
      report: newReport,
      dialogueLogs: logs,
    };
    const updated = [session, ...historyList].slice(0, 20);
    setHistoryList(updated);
    localStorage.setItem('ai_boardroom_history', JSON.stringify(updated));
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = historyList.filter((item) => item.id !== id);
    setHistoryList(updated);
    localStorage.setItem('ai_boardroom_history', JSON.stringify(updated));
  };

  const loadSession = (session: SavedSession) => {
    setAgenda(session.agenda);
    setReport(session.report);
    setDialogueLogs(session.dialogueLogs);
    setLatestSpeech({
      CIO: session.report.executiveOpinions.cio,
      CSO: session.report.executiveOpinions.cso,
      CTO: session.report.executiveOpinions.cto,
      CRO: session.report.executiveOpinions.cro,
    });
    setShowHistoryModal(false);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const addDialogue = (
    speaker: ExecutiveRole | 'CHAIRMAN',
    speakerName: string,
    model: string,
    message: string,
    type: 'agenda' | 'opinion' | 'challenge' | 'summary'
  ) => {
    const item: DialogueItem = {
      id: Math.random().toString(),
      speaker,
      speakerName,
      model,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
    };
    setDialogueLogs((prev) => [...prev, item]);
    if (speaker !== 'CHAIRMAN') {
      setLatestSpeech((prev) => ({ ...prev, [speaker]: message }));
    }
    return item;
  };

  const handleStartBoardMeeting = async () => {
    if (!agenda.trim() || isRunning) return;

    setIsRunning(true);
    setReport(null);
    setDialogueLogs([]);
    setLatestSpeech({});
    setExecutiveStatuses({
      CSO: 'thinking',
      CIO: 'thinking',
      CTO: 'thinking',
      CRO: 'thinking',
      CHIEF_OF_STAFF: 'thinking',
    });

    const initialLogs: DialogueItem[] = [];
    initialLogs.push(addDialogue('CHAIRMAN', '회장 (Chairman)', 'User', `[안건 상정] ${agenda}`, 'agenda'));
    await sleep(400);

    setActiveSpeaker('CHIEF_OF_STAFF');
    setExecutiveStatuses((prev) => ({ ...prev, CHIEF_OF_STAFF: 'speaking' }));
    initialLogs.push(
      addDialogue(
        'CHIEF_OF_STAFF',
        '비서실장',
        'Groq Llama 3.3',
        `회장님의 안건 "${agenda}"에 대해 5인 전문 임원진의 독립 분석 및 교차 검증을 개시합니다.`,
        'summary'
      )
    );

    try {
      const res = await fetch('/api/boardroom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agenda }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '회의 처리 중 오류가 발생했습니다.');
      }

      const { opinions, report: finalReport } = data;

      // 1. 정보 임원
      await sleep(900);
      setActiveSpeaker('CIO');
      setExecutiveStatuses((prev) => ({ ...prev, CIO: 'speaking', CHIEF_OF_STAFF: 'completed' }));
      initialLogs.push(addDialogue('CIO', '정보·리서치 (CIO)', 'Groq Llama 3.3', opinions.cio, 'opinion'));

      // 2. 전략 임원
      await sleep(1000);
      setActiveSpeaker('CSO');
      setExecutiveStatuses((prev) => ({ ...prev, CSO: 'speaking', CIO: 'completed' }));
      initialLogs.push(addDialogue('CSO', '전략기획 (CSO)', 'Groq Llama 3.3', opinions.cso, 'opinion'));

      // 3. 기술 임원
      await sleep(1000);
      setActiveSpeaker('CTO');
      setExecutiveStatuses((prev) => ({ ...prev, CTO: 'speaking', CSO: 'completed' }));
      initialLogs.push(addDialogue('CTO', '기술·혁신 (CTO)', 'Groq Llama 3.3', opinions.cto, 'opinion'));

      // 4. 리스크 임원
      await sleep(1100);
      setActiveSpeaker('CRO');
      setExecutiveStatuses((prev) => ({ ...prev, CRO: 'challenging', CTO: 'completed' }));
      initialLogs.push(addDialogue('CRO', '리스크·감사 (CRO)', 'Groq DeepSeek-R1', opinions.cro, 'challenge'));

      // 5. 전략 방어
      if (opinions.csoDefense) {
        await sleep(1000);
        setActiveSpeaker('CSO');
        setExecutiveStatuses((prev) => ({ ...prev, CSO: 'speaking' }));
        initialLogs.push(addDialogue('CSO', '전략기획 (CSO)', 'Groq Llama 3.3', opinions.csoDefense, 'opinion'));
      }

      // 6. 비서실장 종합 보고
      await sleep(900);
      setActiveSpeaker('CHIEF_OF_STAFF');
      setExecutiveStatuses({
        CSO: 'completed',
        CIO: 'completed',
        CTO: 'completed',
        CRO: 'completed',
        CHIEF_OF_STAFF: 'speaking',
      });
      initialLogs.push(
        addDialogue(
          'CHIEF_OF_STAFF',
          '비서실장',
          'Groq Llama 3.3',
          '각 임원진의 독립 분석과 리스크 검토를 종합하여 회장 의사결정 보고서를 상정합니다.',
          'summary'
        )
      );

      setReport(finalReport);
      setExecutiveStatuses((prev) => ({ ...prev, CHIEF_OF_STAFF: 'completed' }));
      saveToHistory(agenda, finalReport, initialLogs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '회의 진행 중 오류가 발생했습니다.';
      alert(`[오류] ${msg}`);
      setExecutiveStatuses({
        CSO: 'idle',
        CIO: 'idle',
        CTO: 'idle',
        CRO: 'idle',
        CHIEF_OF_STAFF: 'idle',
      });
    } finally {
      setActiveSpeaker(null);
      setIsRunning(false);
    }
  };

  // 회장 추가 지시/Q&A 핸들러
  const handleAskFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim() || isAskingFollowUp || !report) return;

    setIsAskingFollowUp(true);
    const targetNameMap = {
      CIO: '정보·리서치 (CIO)',
      CSO: '전략기획 (CSO)',
      CTO: '기술·혁신 (CTO)',
      CRO: '리스크·감사 (CRO)',
      CHIEF_OF_STAFF: '비서실장',
    };

    // 회장 추가 질문 기록
    addDialogue(
      'CHAIRMAN',
      '회장 (Chairman)',
      'User',
      `[@${targetNameMap[selectedTargetRole]} 추가 지시] ${followUpQuery}`,
      'agenda'
    );

    setActiveSpeaker(selectedTargetRole);
    setExecutiveStatuses((prev) => ({ ...prev, [selectedTargetRole]: 'thinking' }));

    try {
      const res = await fetch('/api/boardroom/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agenda,
          role: selectedTargetRole,
          question: followUpQuery,
          reportContext: report.conclusion,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '응답 수신 실패');
      }

      await sleep(600);
      setExecutiveStatuses((prev) => ({ ...prev, [selectedTargetRole]: 'speaking' }));
      addDialogue(
        selectedTargetRole,
        targetNameMap[selectedTargetRole],
        'Groq Llama 3.3',
        data.reply,
        'opinion'
      );
      setFollowUpQuery('');
    } catch {
      alert('추가 질의 처리 중 오류가 발생했습니다.');
    } finally {
      setActiveSpeaker(null);
      setIsAskingFollowUp(false);
      setExecutiveStatuses((prev) => ({ ...prev, [selectedTargetRole]: 'completed' }));
    }
  };

  // Markdown 파일 다운로드
  const handleDownloadMarkdown = () => {
    if (!report) return;
    const text = `# 회장 의사결정 보고서: ${report.title}
생성일시: ${new Date().toLocaleString('ko-KR')}

---

## 1. 결론 (Executive Summary)
${report.conclusion}

## 2. 핵심 근거
${report.coreEvidences.map((e, i) => `${i + 1}. ${e}`).join('\n')}

## 3. 임원별 분석 요약
- **정보·리서치(CIO)**: ${report.executiveOpinions.cio}
- **전략기획(CSO)**: ${report.executiveOpinions.cso}
- **기술·혁신(CTO)**: ${report.executiveOpinions.cto}
- **리스크·감사(CRO)**: ${report.executiveOpinions.cro}
${report.executiveOpinions.csoDefense ? `- **전략기획 방어안**: ${report.executiveOpinions.csoDefense}` : ''}

## 4. 의견 충돌 및 대립 지점
${report.conflicts}

## 5. 주요 위험 및 최악 시나리오
${report.risks}

## 6. 추천안 (합리적 실행 방안)
${report.recommendation}

## 7. 대안 (차선책)
${report.alternative}

## 8. 회장이 결정할 사항
${report.chairmanDecisions.map((d) => `- [ ] ${d}`).join('\n')}

---
## 아키텍처 블루프린트 코드
\`\`\`typescript
${report.systemCode || '// No code provided'}
\`\`\`
`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `의사결정보고서_${agenda.slice(0, 15).replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // PDF / 인쇄
  const handlePrint = () => {
    window.print();
  };

  const handleCopyReport = () => {
    if (!report) return;
    const text = `
# 회장 의사결정 보고서: ${report.title}

## 1. 결론
${report.conclusion}

## 2. 핵심 근거
${report.coreEvidences.map((e, i) => `${i + 1}. ${e}`).join('\n')}

## 3. 임원별 분석 요약
- 정보·리서치(CIO): ${report.executiveOpinions.cio}
- 전략기획(CSO): ${report.executiveOpinions.cso}
- 기술·혁신(CTO): ${report.executiveOpinions.cto}
- 리스크·감사(CRO): ${report.executiveOpinions.cro}

## 4. 의견 충돌
${report.conflicts}

## 5. 주요 위험
${report.risks}

## 6. 추천안
${report.recommendation}

## 7. 대안
${report.alternative}

## 8. 회장이 결정할 사항
${report.chairmanDecisions.map((d) => `[ ] ${d}`).join('\n')}
    `;
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30">
      {/* 상단 네비게이션 헤더 */}
      <header className="border-b border-slate-800/80 px-6 py-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/20 text-white font-bold">
            👑
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              AI Virtual Boardroom
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                Groq Multi-Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400">회장 직속 5인 AI 전문 임원진 의사결정 시스템</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 과거 회의록 버튼 */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>회의록 이력 ({historyList.length})</span>
          </button>

          {/* 탭 전환 */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('boardroom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'boardroom'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>이사회 회의실</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>시스템 콘솔</span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 뷰 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* 안건 입력 바 */}
        <section className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartBoardMeeting();
            }}
            className="flex flex-col md:flex-row gap-3"
          >
            <input
              type="text"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="경영 의사결정 안건을 입력하세요 (예: 삼성전자 HBM4 차세대 메모리 투자 및 파운드리 진출 타당성)"
              disabled={isRunning}
              className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-100 placeholder:text-slate-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isRunning || !agenda.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 active:scale-95"
            >
              {isRunning ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>5인 임원진 독립 분석 중...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>이사회 소집</span>
                </>
              )}
            </button>
          </form>
        </section>

        {activeTab === 'boardroom' && (
          <div className="space-y-6">
            {/* 원형 회의실 테이블 */}
            <BoardroomTable
              executives={EXECUTIVES_DATA}
              executiveStatuses={executiveStatuses}
              activeSpeaker={activeSpeaker}
              latestSpeech={latestSpeech}
            />

            {/* 메인 피드 & 보고서 그리드 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 좌측: 실시간 토론 피드 */}
              <section className="lg:col-span-5 bg-slate-900/60 rounded-2xl border border-slate-800 p-4 h-[600px] flex flex-col shadow-xl backdrop-blur-sm">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    실시간 이사회 독립 토론 피드
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{dialogueLogs.length} Events</span>
                </h2>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                  {dialogueLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-2">
                      <Sparkles className="w-6 h-6 opacity-30" />
                      <p>안건을 상정하면 5인 AI 임원진이<br />각자의 전문 영역에서 독립 분석을 시작합니다.</p>
                    </div>
                  ) : (
                    dialogueLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border text-xs leading-relaxed ${
                          log.type === 'challenge'
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-200 ring-1 ring-rose-500/30'
                            : log.type === 'summary'
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                            : log.type === 'agenda'
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-200'
                            : 'bg-slate-950/80 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span>{log.speakerName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({log.model})</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap">{log.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* 우측: 8대 표준 의사결정 보고서 및 컨트롤 */}
              <section className="lg:col-span-7 bg-slate-900/60 rounded-2xl border border-slate-800 p-5 h-[600px] flex flex-col shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-sm font-bold text-white">회장 의사결정 보고서 (8대 표준)</h2>
                  </div>

                  {report && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleDownloadMarkdown}
                        title="Markdown 다운로드"
                        className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span>MD 저장</span>
                      </button>
                      <button
                        onClick={handlePrint}
                        title="인쇄 및 PDF 출력"
                        className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-cyan-400" />
                        <span>PDF 출력</span>
                      </button>
                      <button
                        onClick={handleCopyReport}
                        className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
                      >
                        {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedReport ? '완료' : '복사'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 보고서 내용 */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
                  {!report ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center space-y-2">
                      <FileText className="w-8 h-8 opacity-20" />
                      <p>토론이 완료되면 8대 표준 의사결정 보고서가 렌더링됩니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-slate-300 leading-relaxed">
                      <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
                        <h3 className="font-bold text-purple-300 text-sm mb-1">1. 결론 (Executive Summary)</h3>
                        <p className="text-slate-200">{report.conclusion}</p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-200 mb-1.5">2. 핵심 근거</h3>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                          {report.coreEvidences.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-200 mb-1.5">3. 임원별 분석 요약</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <div className="p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                            <span className="font-bold text-cyan-400 block mb-0.5">정보·리서치 (CIO)</span>
                            <p className="text-slate-300">{report.executiveOpinions.cio}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <span className="font-bold text-amber-400 block mb-0.5">전략기획 (CSO)</span>
                            <p className="text-slate-300">{report.executiveOpinions.cso}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <span className="font-bold text-blue-400 block mb-0.5">기술·혁신 (CTO)</span>
                            <p className="text-slate-300">{report.executiveOpinions.cto}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
                            <span className="font-bold text-rose-400 block mb-0.5">리스크·감사 (CRO)</span>
                            <p className="text-slate-300">{report.executiveOpinions.cro}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                          <h4 className="font-bold text-slate-200 flex items-center gap-1 mb-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                            4. 의견 충돌 및 대립 지점
                          </h4>
                          <p className="text-slate-400 text-[11px]">{report.conflicts}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                          <h4 className="font-bold text-rose-300 flex items-center gap-1 mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            5. 주요 위험 및 최악 시나리오
                          </h4>
                          <p className="text-rose-200/80 text-[11px]">{report.risks}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                          <h4 className="font-bold text-emerald-300 mb-1">6. 추천안 (합리적 실행 방안)</h4>
                          <p className="text-slate-200">{report.recommendation}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                          <h4 className="font-bold text-slate-300 mb-1">7. 대안 (차선책)</h4>
                          <p className="text-slate-400">{report.alternative}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                        <h4 className="font-bold text-yellow-300 mb-1.5 flex items-center gap-1.5">
                          <Crown className="w-4 h-4" />
                          8. 회장이 결정할 사항
                        </h4>
                        <div className="space-y-1.5">
                          {report.chairmanDecisions.map((decision, idx) => (
                            <label key={idx} className="flex items-start gap-2 text-slate-200 cursor-pointer">
                              <input type="checkbox" className="mt-0.5 rounded border-slate-700 bg-slate-900 text-yellow-500 focus:ring-0" />
                              <span>{decision}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* 회장 1:1 추가 지시 / 재검토 Q&A 콘솔 */}
            {report && (
              <section className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span>회장 직속 1:1 추가 지시 및 재검토 청문 콘솔</span>
                </div>

                <form onSubmit={handleAskFollowUp} className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedTargetRole}
                    onChange={(e) => setSelectedTargetRole(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-purple-300 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="CRO">리스크·감사 (CRO)</option>
                    <option value="CSO">전략기획 (CSO)</option>
                    <option value="CTO">기술·혁신 (CTO)</option>
                    <option value="CIO">정보·리서치 (CIO)</option>
                    <option value="CHIEF_OF_STAFF">비서실장</option>
                  </select>

                  <input
                    type="text"
                    value={followUpQuery}
                    onChange={(e) => setFollowUpQuery(e.target.value)}
                    placeholder="지목된 임원에게 내릴 추가 지시를 입력하세요 (예: 손실 발생 시 구체적인 2차 방어선 구축 방안을 제시해)"
                    disabled={isAskingFollowUp}
                    className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <button
                    type="submit"
                    disabled={isAskingFollowUp || !followUpQuery.trim()}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition disabled:opacity-50 shadow-md"
                  >
                    {isAskingFollowUp ? (
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>지시 전달</span>
                  </button>
                </form>
              </section>
            )}
          </div>
        )}

        {/* 탭 2: 코드 및 시스템 콘솔 */}
        {activeTab === 'code' && (
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  기술 아키텍처 & 시스템 엔지니어링 콘솔
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  안건에 대해 CTO와 비서실장이 생성한 시스템 아키텍처 및 파이프라인 데이터입니다.
                </p>
              </div>

              {report?.systemCode && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(report.systemCode || '');
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl transition shadow-lg shadow-indigo-500/20"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? '코드 복사됨' : '아키텍처 코드 복사'}</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  architecture_blueprint.ts
                </span>
                <span>TypeScript / Multi-Agent Spec</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                {report?.systemCode || `// 안건을 상정하여 이사회를 소집하면 시스템 아키텍처 청사진 코드가 이곳에 자동 생성됩니다.`}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  boardroom_payload.json
                </span>
                <span>Live State Payload</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                {report ? JSON.stringify(report, null, 2) : '{\n  "status": "idle",\n  "message": "안건을 입력하고 이사회를 소집하십시오."\n}'}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* 과거 회의록 모달 */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>과거 이사회 회의록 보관함</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                닫기 ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {historyList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">보관된 과거 회의록이 없습니다.</p>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadSession(item)}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition">
                        {item.agenda}
                      </h4>
                      <span className="text-[10px] text-slate-500">{item.date}</span>
                    </div>
                    <button
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      title="삭제"
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}