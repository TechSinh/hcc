import React, { useEffect, useMemo, useState } from 'react';
import {
  CORE_SEED_ITEMS,
  EXAM_FORMULA_CARDS,
  EXTRA_MOCK_EXAM_ITEMS,
} from './data/seedQuestions';
import type { LearningItem, MistakeRecord, Subject } from './data/seedQuestions';
import { SpringPunchModal } from './components/SpringPunchModal';
import { VisualDesmosLab } from './components/VisualDesmosLab';

const MISTAKE_STORAGE_KEY = 'hcc_l9_mistakes_v15';
const EXTRA_PACK_STORAGE_KEY = 'hcc_l9_extra_pack_v15';

type DrillMode = 'standard' | 'trap_focus' | 'violympic_speed';

const FALLBACK_ITEM: LearningItem = {
  id: 'fallback-toan9-01',
  subject: 'toan',
  topic: 'Phương trình bậc nhất hai ẩn',
  sourceRef: 'Đề ôn chương 1 - Đề 1 - TN Câu 3',
  prompt: 'Cặp số nào sau đây là nghiệm của phương trình 2x - y - 1 = 0?',
  options: ['(0; 1)', '(1; 0)', '(1; 1)', '(-1; 0)'],
  correctAnswer: '(1; 1)',
  hints: [
    'Thay lần lượt giá trị x và y vào vế trái của biểu thức 2x - y - 1.',
    'Cặp số đúng sẽ làm cho giá trị vế trái bằng 0.',
  ],
  commonMistake: 'Thay nhầm thứ tự x và y hoặc nhầm dấu khi tính phép trừ.',
  parentGuide: {
    keyConcept: 'Cặp số (x0; y0) là nghiệm của phương trình khi thay vào làm hai vế bằng nhau.',
    guidingQuestion: 'Con thay x = 1 và y = 1 vào 2x - y - 1 trước rồi kiểm tra có bằng 0 không nhé?',
  },
};

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function App() {
  const [subject, setSubject] = useState<Subject>('toan');
  const [drillMode, setDrillMode] = useState<DrillMode>('standard');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [reviewWrongOnly, setReviewWrongOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'coach' | 'lab' | 'formulas' | 'parent'>('coach');

  const [extraPackLoaded, setExtraPackLoaded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(EXTRA_PACK_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const allItems = useMemo<LearningItem[]>(() => {
    const core = Array.isArray(CORE_SEED_ITEMS) ? CORE_SEED_ITEMS : [];
    const extra =
      extraPackLoaded && Array.isArray(EXTRA_MOCK_EXAM_ITEMS) ? EXTRA_MOCK_EXAM_ITEMS : [];
    const merged = [...core, ...extra];
    return merged.length > 0 ? merged : [FALLBACK_ITEM];
  }, [extraPackLoaded]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [hintStep, setHintStep] = useState(0);
  const [showTrapPreview, setShowTrapPreview] = useState(false);

  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [questionSec, setQuestionSec] = useState(0);

  const [punchOpen, setPunchOpen] = useState(false);
  const [punchEnabled, setPunchEnabled] = useState(true);
  const [showParentInline, setShowParentInline] = useState(false);

  const [mistakeMap, setMistakeMap] = useState<Record<string, MistakeRecord>>(() => {
    try {
      const raw = localStorage.getItem(MISTAKE_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, MistakeRecord>) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
      setQuestionSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MISTAKE_STORAGE_KEY, JSON.stringify(mistakeMap));
    } catch {
      // Bỏ qua khi không có quyền lưu trữ cục bộ
    }
  }, [mistakeMap]);

  useEffect(() => {
    try {
      localStorage.setItem(EXTRA_PACK_STORAGE_KEY, String(extraPackLoaded));
    } catch {
      // Bỏ qua khi không có quyền lưu trữ cục bộ
    }
  }, [extraPackLoaded]);

  const wrongIds = useMemo(() => Object.keys(mistakeMap), [mistakeMap]);

  const subjectItems = useMemo(() => {
    const bySub = allItems.filter((item) => item.subject === subject);
    return bySub.length > 0 ? bySub : allItems;
  }, [allItems, subject]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    subjectItems.forEach((item) => set.add(item.topic));
    return ['ALL', ...Array.from(set)];
  }, [subjectItems]);

  const subjectFormulaCards = useMemo(() => {
    const cards = Array.isArray(EXAM_FORMULA_CARDS) ? EXAM_FORMULA_CARDS : [];
    return cards.filter((card) => card.subject === subject);
  }, [subject]);

  const poolItems: LearningItem[] = useMemo(() => {
    let list = subjectItems;
    if (selectedTopic !== 'ALL') {
      const byTopic = list.filter((item) => item.topic === selectedTopic);
      if (byTopic.length > 0) list = byTopic;
    }
    if (reviewWrongOnly) {
      const filtered = list.filter((item) => wrongIds.includes(item.id));
      if (filtered.length > 0) list = filtered;
    }
    return list.length > 0 ? list : [FALLBACK_ITEM];
  }, [subjectItems, selectedTopic, reviewWrongOnly, wrongIds]);

  const current: LearningItem = poolItems[index % poolItems.length] ?? FALLBACK_ITEM;
  const safeOptions = Array.isArray(current.options) ? current.options : [];
  const safeHints = Array.isArray(current.hints) ? current.hints : [];

  const resetQuestionState = () => {
    setSelected(null);
    setHintStep(0);
    setShowParentInline(false);
    setQuestionSec(0);
    setShowTrapPreview(drillMode === 'trap_focus');
  };

  const handleSwitchSubject = (nextSubject: Subject) => {
    setSubject(nextSubject);
    setSelectedTopic('ALL');
    setIndex(0);
    resetQuestionState();
  };

  const handleChangeMode = (nextMode: DrillMode) => {
    setDrillMode(nextMode);
    setShowTrapPreview(nextMode === 'trap_focus');
  };

  const handleSelectTopic = (nextTopic: string) => {
    setSelectedTopic(nextTopic);
    setIndex(0);
    resetQuestionState();
  };

  const handleToggleWrongReview = () => {
    setReviewWrongOnly((prev) => !prev);
    setIndex(0);
    resetQuestionState();
  };

  const handleSelectOption = (opt: string) => {
    setSelected(opt);
    setAnsweredCount((c) => c + 1);

    if (opt === current.correctAnswer) {
      const nextStreak = streak + 1;
      const speedBonus = drillMode === 'violympic_speed' && questionSec <= 25 ? 5 : 0;
      setCorrectCount((c) => c + 1);
      setStreak(nextStreak);
      setScore((s) => s + 10 + speedBonus);
      return;
    }

    setStreak(0);
    setMistakeMap((prev) => {
      const existing = prev[current.id];
      return {
        ...prev,
        [current.id]: {
          itemId: current.id,
          subject: current.subject,
          topic: current.topic,
          sourceRef: current.sourceRef,
          commonMistake: current.commonMistake,
          guidingQuestion: current.parentGuide?.guidingQuestion ?? '',
          wrongCount: (existing?.wrongCount ?? 0) + 1,
        },
      };
    });

    if (punchEnabled) {
      setPunchOpen(true);
    }
  };

  const handleResetMistakes = () => {
    setMistakeMap({});
    setReviewWrongOnly(false);
    setIndex(0);
    resetQuestionState();
  };

  const handleNext = () => {
    resetQuestionState();
    setIndex((prev) => (prev + 1) % poolItems.length);
  };

  const mistakeList = Object.values(mistakeMap).sort((a, b) => b.wrongCount - a.wrongCount);
  const totalWrongAttempts = mistakeList.reduce((acc, item) => acc + item.wrongCount, 0);
  const maxWrongCount = mistakeList.length > 0 ? mistakeList[0].wrongCount : 1;
  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const isCorrect = selected === current.correctAnswer;
  const progressPercent = Math.round((((index % poolItems.length) + 1) / poolItems.length) * 100);

  return (
    <div className="pro-shell">
      <style>{`
        .pro-shell {
          min-height: 100vh;
          background: linear-gradient(155deg, #eff6ff 0%, #f8fafc 48%, #e2e8f0 100%);
          color: #0f172a;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          padding: 14px;
          box-sizing: border-box;
        }
        .pro-wrap {
          max-width: 1140px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pro-header {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 22px;
          padding: 16px 20px;
          box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }
        .pro-kpi-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          margin-top: 10px;
        }
        .pro-kpi {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 6px 11px;
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
        }
        .pro-controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .pro-tabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          flex: 1;
          min-width: 280px;
        }
        @media (min-width: 640px) {
          .pro-tabs {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        .pro-right-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pro-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          align-items: start;
        }
        @media (min-width: 920px) {
          .pro-shell {
            padding: 22px 24px;
          }
          .pro-grid {
            grid-template-columns: minmax(0, 1.42fr) minmax(0, 1fr);
            gap: 18px;
          }
        }
        .pro-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
        }
        .pro-btn {
          min-height: 44px;
          border-radius: 13px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.12s ease, background-color 0.15s ease, border-color 0.15s ease;
        }
        .pro-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      <div className="pro-wrap">
        <header className="pro-header">
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#1e3a8a',
                  backgroundColor: '#dbeafe',
                  padding: '4px 10px',
                  borderRadius: 9999,
                }}
              >
                LỚP 9 • ÔN THI VÀO 10 &amp; NỀN TẢNG CẤP 3
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#065f46',
                  backgroundColor: '#d1fae5',
                  padding: '4px 10px',
                  borderRadius: 9999,
                }}
              >
                Phạm Hoàng Khánh Ngọc
              </span>
            </div>

            <div className="pro-kpi-strip">
              <div className="pro-kpi">Điểm rèn: {score}</div>
              <div className="pro-kpi">Chuỗi đúng: {streak}</div>
              <div className="pro-kpi">
                Chính xác: {accuracy}% ({correctCount}/{answeredCount})
              </div>
              <div className="pro-kpi">Câu này: {questionSec}s • Tổng: {formatDuration(elapsedSec)}</div>
            </div>
          </div>

          <div className="pro-right-group">
            <button
              type="button"
              onClick={handleToggleWrongReview}
              className="pro-btn"
              style={{
                border: reviewWrongOnly ? 'none' : '1px solid #fecdd3',
                backgroundColor: reviewWrongOnly ? '#e11d48' : '#fff1f2',
                color: reviewWrongOnly ? '#ffffff' : '#be123c',
                padding: '9px 14px',
              }}
            >
              {reviewWrongOnly ? 'Thoát ôn câu sai' : `Ôn câu sai (${wrongIds.length})`}
            </button>

            <button
              type="button"
              onClick={() => setPunchEnabled((v) => !v)}
              className="pro-btn"
              style={{
                border: '1px solid #fcd34d',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '9px 14px',
              }}
            >
              Lò xo: {punchEnabled ? 'Bật' : 'Tắt'}
            </button>
          </div>
        </header>

        <div className="pro-controls">
          <div className="pro-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('coach')}
              className="pro-btn"
              style={{
                border: 'none',
                backgroundColor: activeTab === 'coach' ? '#0f172a' : '#ffffff',
                color: activeTab === 'coach' ? '#ffffff' : '#334155',
              }}
            >
              Luyện &amp; Tốc độ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lab')}
              className="pro-btn"
              style={{
                border: 'none',
                backgroundColor: activeTab === 'lab' ? '#0f766e' : '#f0fdfa',
                color: activeTab === 'lab' ? '#ffffff' : '#115e59',
              }}
            >
              Lab Đồ thị
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('formulas')}
              className="pro-btn"
              style={{
                border: 'none',
                backgroundColor: activeTab === 'formulas' ? '#1d4ed8' : '#eff6ff',
                color: activeTab === 'formulas' ? '#ffffff' : '#1e40af',
              }}
            >
              Đề &amp; Công thức
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parent')}
              className="pro-btn"
              style={{
                border: 'none',
                backgroundColor: activeTab === 'parent' ? '#4338ca' : '#eef2ff',
                color: activeTab === 'parent' ? '#ffffff' : '#3730a3',
              }}
            >
              Phụ huynh ({totalWrongAttempts})
            </button>
          </div>

          <div className="pro-right-group">
            <button
              type="button"
              onClick={() => handleSwitchSubject('toan')}
              className="pro-btn"
              style={{
                border: subject === 'toan' ? 'none' : '1px solid #cbd5e1',
                backgroundColor: subject === 'toan' ? '#2563eb' : '#ffffff',
                color: subject === 'toan' ? '#ffffff' : '#334155',
                padding: '9px 16px',
              }}
            >
              Toán 9
            </button>
            <button
              type="button"
              onClick={() => handleSwitchSubject('van')}
              className="pro-btn"
              style={{
                border: subject === 'van' ? 'none' : '1px solid #cbd5e1',
                backgroundColor: subject === 'van' ? '#059669' : '#ffffff',
                color: subject === 'van' ? '#ffffff' : '#334155',
                padding: '9px 16px',
              }}
            >
              Ngữ văn 9
            </button>
          </div>
        </div>

        {activeTab === 'lab' ? (
          <section className="pro-card">
            <VisualDesmosLab />
          </section>
        ) : (
          <div className="pro-grid">
            <section className="pro-card" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {topics.map((tp) => {
                    const active = selectedTopic === tp;
                    return (
                      <button
                        key={tp}
                        type="button"
                        onClick={() => handleSelectTopic(tp)}
                        style={{
                          borderRadius: 9999,
                          border: active ? 'none' : '1px solid #cbd5e1',
                          backgroundColor: active ? '#0f172a' : '#f8fafc',
                          color: active ? '#ffffff' : '#334155',
                          padding: '6px 12px',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {tp === 'ALL' ? 'Tất cả dạng' : tp}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleChangeMode('standard')}
                    style={{
                      borderRadius: 10,
                      border: drillMode === 'standard' ? 'none' : '1px solid #cbd5e1',
                      backgroundColor: drillMode === 'standard' ? '#1e293b' : '#ffffff',
                      color: drillMode === 'standard' ? '#ffffff' : '#475569',
                      padding: '6px 10px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Luyện chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeMode('trap_focus')}
                    style={{
                      borderRadius: 10,
                      border: drillMode === 'trap_focus' ? 'none' : '1px solid #fcd34d',
                      backgroundColor: drillMode === 'trap_focus' ? '#b45309' : '#fffbeb',
                      color: drillMode === 'trap_focus' ? '#ffffff' : '#92400e',
                      padding: '6px 10px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Soi bẫy chuyên đề
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeMode('violympic_speed')}
                    style={{
                      borderRadius: 10,
                      border: drillMode === 'violympic_speed' ? 'none' : '1px solid #93c5fd',
                      backgroundColor: drillMode === 'violympic_speed' ? '#1d4ed8' : '#eff6ff',
                      color: drillMode === 'violympic_speed' ? '#ffffff' : '#1e40af',
                      padding: '6px 10px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Đua tốc độ (+5đ ≤25s)
                  </button>
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: '#475569',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  <span>
                    Câu {(index % poolItems.length) + 1} / {poolItems.length}
                    {reviewWrongOnly ? ' • Đang ôn câu sai' : ''}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div
                  style={{
                    height: 8,
                    width: '100%',
                    borderRadius: 9999,
                    backgroundColor: '#e2e8f0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progressPercent}%`,
                      backgroundColor: subject === 'toan' ? '#2563eb' : '#059669',
                      transition: 'width 0.25s ease',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: subject === 'toan' ? '#1d4ed8' : '#047857',
                      backgroundColor: subject === 'toan' ? '#dbeafe' : '#d1fae5',
                      padding: '3px 9px',
                      borderRadius: 8,
                    }}
                  >
                    {current.topic}
                  </span>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                    Nguồn: {current.sourceRef}
                  </span>
                </div>

                <p
                  style={{
                    margin: '10px 0 0',
                    fontSize: 15.5,
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.55,
                  }}
                >
                  {current.prompt}
                </p>
              </div>

              {showTrapPreview && (
                <div
                  style={{
                    borderRadius: 14,
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fcd34d',
                    padding: 12,
                    fontSize: 12.5,
                    color: '#78350f',
                    lineHeight: 1.5,
                  }}
                >
                  <strong>Cảnh báo bẫy thường gặp:</strong> {current.commonMistake}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {safeOptions.map((opt, idx) => {
                  const chosen = selected === opt;
                  let bg = '#ffffff';
                  let border = '#cbd5e1';
                  let color = '#0f172a';
                  let fontWeight = 500;

                  if (chosen && opt === current.correctAnswer) {
                    bg = '#ecfdf5';
                    border = '#10b981';
                    color = '#064e3b';
                    fontWeight = 700;
                  } else if (chosen) {
                    bg = '#fff1f2';
                    border = '#fb7185';
                    color = '#881337';
                    fontWeight = 600;
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className="pro-btn"
                      style={{
                        width: '100%',
                        border: `1.5px solid ${border}`,
                        backgroundColor: bg,
                        color,
                        padding: '11px 14px',
                        textAlign: 'left',
                        fontSize: 13.5,
                        fontWeight,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          fontSize: 12,
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {selected && (
                <div
                  style={{
                    borderRadius: 14,
                    padding: 13,
                    fontSize: 13,
                    lineHeight: 1.55,
                    backgroundColor: isCorrect ? '#ecfdf5' : '#fff1f2',
                    color: isCorrect ? '#065f46' : '#9f1239',
                    border: `1px solid ${isCorrect ? '#a7f3d0' : '#fecdd3'}`,
                  }}
                >
                  {isCorrect
                    ? `Chính xác! Kiến thức nền tảng: ${current.parentGuide?.keyConcept ?? ''}`
                    : `Chưa đúng. Lưu ý: ${current.commonMistake}`}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setHintStep((s) => Math.min(s + 1, safeHints.length))}
                  className="pro-btn"
                  style={{
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    padding: '10px 12px',
                  }}
                >
                  Gợi ý từng bước ({Math.min(hintStep, safeHints.length)}/{safeHints.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowParentInline((v) => !v)}
                  className="pro-btn"
                  style={{
                    border: '1px solid #c7d2fe',
                    backgroundColor: '#eef2ff',
                    color: '#3730a3',
                    padding: '10px 12px',
                  }}
                >
                  {showParentInline ? 'Ẩn gợi ý bố mẹ' : 'Gợi ý cho bố mẹ'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="pro-btn"
                style={{
                  width: '100%',
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '12px 16px',
                  fontSize: 14,
                }}
              >
                Chuyển sang câu tiếp theo →
              </button>
            </section>

            <aside className="pro-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeTab === 'coach' && (
                <>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a' }}>
                    Lộ trình tư duy &amp; rèn phản xạ
                  </div>

                  {hintStep > 0 ? (
                    <div
                      style={{
                        borderRadius: 14,
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        padding: 12,
                        fontSize: 12.5,
                        color: '#78350f',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ color: '#92400e' }}>Các bước gợi mở theo trình tự:</strong>
                      {safeHints.slice(0, hintStep).map((h, i) => (
                        <div key={i}>
                          • Bước {i + 1}: {h}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        borderRadius: 14,
                        backgroundColor: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        padding: 12,
                        fontSize: 12.5,
                        color: '#475569',
                        lineHeight: 1.55,
                      }}
                    >
                      Tự phân tích giả thiết và điều kiện trước khi chọn. Khi cần định hướng, bấm{' '}
                      <strong>Gợi ý từng bước</strong> hoặc bấm <strong>Gợi ý cho bố mẹ</strong> để
                      cùng trao đổi.
                    </div>
                  )}

                  {showParentInline && (
                    <div
                      style={{
                        borderRadius: 14,
                        backgroundColor: '#eef2ff',
                        border: '1px solid #c7d2fe',
                        padding: 12,
                        fontSize: 12.5,
                        color: '#1e1b4b',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        lineHeight: 1.55,
                      }}
                    >
                      <div>
                        <strong>Kiến thức cốt lõi:</strong> {current.parentGuide?.keyConcept}
                      </div>
                      <div>
                        <strong>Câu hỏi gợi mở cho con:</strong> &ldquo;{current.parentGuide?.guidingQuestion}&rdquo;
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      borderRadius: 14,
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: 12,
                      fontSize: 12,
                      color: '#1e3a8a',
                      lineHeight: 1.55,
                    }}
                  >
                    <strong>Chuẩn bị lên cấp 3:</strong> Nắm chắc điều kiện xác định, quy tắc biến
                    đổi, lập luận chặt chẽ và bám ngữ liệu—kết hợp rèn tốc độ mà vẫn giữ độ chính xác.
                  </div>
                </>
              )}

              {activeTab === 'formulas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                  {subject === 'toan' && (
                    <div
                      style={{
                        borderRadius: 14,
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        padding: 12,
                        color: '#1e3a8a',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>Gói đề thi thử vào 10 môn Toán</div>
                      <div>
                        Gói câu hỏi đề thi thử bổ sung ({EXTRA_MOCK_EXAM_ITEMS.length} câu đã kiểm chứng):{' '}
                        <strong>{extraPackLoaded ? 'Đã nạp vào bộ luyện tập' : 'Chưa nạp'}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setExtraPackLoaded((prev) => !prev);
                          setIndex(0);
                          resetQuestionState();
                        }}
                        className="pro-btn"
                        style={{
                          width: '100%',
                          border: 'none',
                          backgroundColor: '#1d4ed8',
                          color: '#ffffff',
                          padding: '10px 12px',
                        }}
                      >
                        {extraPackLoaded
                          ? 'Gỡ gói câu hỏi đề thi thử bổ sung'
                          : 'Nạp ngay gói câu hỏi đề thi thử bổ sung'}
                      </button>
                    </div>
                  )}

                  {subjectFormulaCards.map((card) => (
                    <div
                      key={card.id}
                      style={{
                        borderRadius: 14,
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{card.topic}</div>
                      <div style={{ fontSize: 11.5, color: '#64748b' }}>{card.weightNote}</div>
                      <div
                        style={{
                          borderRadius: 10,
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          padding: 8,
                          color: '#1e293b',
                        }}
                      >
                        <strong>Công thức / Quy tắc:</strong> {card.coreFormula}
                      </div>
                      <div
                        style={{
                          borderRadius: 10,
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fde68a',
                          padding: 8,
                          color: '#78350f',
                        }}
                      >
                        <strong>Chuẩn bị lên cấp 3:</strong> {card.transitionTip}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'parent' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div
                    style={{
                      borderRadius: 14,
                      backgroundColor: '#eef2ff',
                      border: '1px solid #c7d2fe',
                      padding: 12,
                      fontSize: 12.5,
                      color: '#1e1b4b',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5 }}>Thống kê lỗi sai &amp; hướng dẫn đồng hành</div>
                      {mistakeList.length > 0 && (
                        <button
                          type="button"
                          onClick={handleResetMistakes}
                          style={{
                            borderRadius: 8,
                            border: '1px solid #a5b4fc',
                            backgroundColor: '#ffffff',
                            color: '#312e81',
                            padding: '5px 10px',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Đặt lại
                        </button>
                      )}
                    </div>
                    <div>
                      Tổng số lần làm sai ghi nhận: <strong>{totalWrongAttempts}</strong> ({mistakeList.length} dạng/câu)
                    </div>
                    <div>
                      Nguyên tắc: bố mẹ dùng câu hỏi gợi mở để con tự tìm ra hướng làm, tránh làm hộ.
                    </div>
                  </div>

                  {mistakeList.length === 0 ? (
                    <div
                      style={{
                        borderRadius: 14,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        padding: 16,
                        textAlign: 'center',
                        fontSize: 12.5,
                        color: '#475569',
                      }}
                    >
                      Chưa có lỗi sai nào được ghi nhận. Khi Khánh Ngọc chọn sai câu nào, hệ thống sẽ tự lưu, vẽ thanh tần suất lỗi và gợi ý câu hỏi đồng hành tại đây.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {mistakeList.map((rec) => {
                        const barWidth = Math.max(18, Math.round((rec.wrongCount / maxWrongCount) * 100));
                        return (
                          <div
                            key={rec.itemId}
                            style={{
                              borderRadius: 14,
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              padding: 12,
                              fontSize: 12.5,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                              <span style={{ fontWeight: 800, color: '#0f172a' }}>
                                {rec.subject === 'toan' ? 'Toán 9' : 'Ngữ văn 9'} • {rec.topic}
                              </span>
                              <span
                                style={{
                                  borderRadius: 9999,
                                  backgroundColor: '#ffe4e6',
                                  color: '#9f1239',
                                  padding: '2px 10px',
                                  fontSize: 11.5,
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Sai {rec.wrongCount} lần
                              </span>
                            </div>

                            <div
                              style={{
                                height: 6,
                                width: '100%',
                                borderRadius: 9999,
                                backgroundColor: '#f1f5f9',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${barWidth}%`,
                                  backgroundColor: '#e11d48',
                                }}
                              />
                            </div>

                            <div style={{ fontSize: 11.5, color: '#64748b' }}>{rec.sourceRef}</div>
                            <div
                              style={{
                                borderRadius: 10,
                                backgroundColor: '#fff1f2',
                                padding: 8,
                                color: '#881337',
                              }}
                            >
                              <strong>Lỗi sai:</strong> {rec.commonMistake}
                            </div>
                            <div
                              style={{
                                borderRadius: 10,
                                backgroundColor: '#eef2ff',
                                padding: 8,
                                color: '#1e1b4b',
                              }}
                            >
                              <strong>Hỏi gợi mở cho con:</strong> &ldquo;{rec.guidingQuestion}&rdquo;
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}
      </div>

      <SpringPunchModal
        open={punchOpen}
        onClose={() => setPunchOpen(false)}
        mistakeNote={current.commonMistake}
        guidingQuestion={current.parentGuide?.guidingQuestion ?? ''}
        topic={current.topic}
      />
    </div>
  );
}