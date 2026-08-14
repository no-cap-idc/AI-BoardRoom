// lib/types.ts
export type ExecutiveRole = 'CSO' | 'CIO' | 'CTO' | 'CRO' | 'CHIEF_OF_STAFF';

export type ExecutiveStatus = 'idle' | 'thinking' | 'speaking' | 'challenging' | 'completed';

export interface Executive {
  id: ExecutiveRole;
  name: string;
  model: string;
  role: string;
  color: string;
  bgColor: string;
  borderColor: string;
  avatar: string;
  position: 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right' | 'center';
}

export interface DialogueItem {
  id: string;
  speaker: ExecutiveRole | 'CHAIRMAN';
  speakerName: string;
  model: string;
  message: string;
  timestamp: string;
  type: 'agenda' | 'opinion' | 'challenge' | 'summary';
}

export interface BoardReport {
  title: string;
  conclusion: string;
  coreEvidences: string[];
  executiveOpinions: {
    cso: string;
    cio: string;
    cto: string;
    cro: string;
  };
  conflicts: string;
  risks: string;
  recommendation: string;
  alternative: string;
  chairmanDecisions: string[];
}