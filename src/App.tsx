import React, { useEffect, useMemo, useState } from 'react';
import {
  CORE_SEED_ITEMS,
  ERROR_CATEGORY_LABELS,
  EXAM_FORMULA_CARDS,
  EXTRA_MOCK_EXAM_ITEMS,
} from './data/seedQuestions';
import type {
  ErrorCategory,
  LearningItem,
  MistakeRecord,
  Subject,
} from './data/seedQuestions';
import { SpringPunchModal } from './components/SpringPunchModal';
import { VisualDesmosLab } from './components/VisualDesmosLab';

const MISTAKE_STORAGE_KEY = 'hcc_l9_mistakes_v21';
const EXTRA_PACK_STORAGE_KEY = 'hcc_l9_extra_pack_v21';
const MASTERED_STORAGE_KEY = 'hcc_l9_mastered_v21';
const PARENT_COACHED_STORAGE_KEY = 'hcc_l9_parent_coached_v21';

type DrillMode = 'standard' | 'trap_focus' | 'violympic_speed' | 'recall_review';

const FALLBACK_ITEM: LearningItem = {
  id: 'fallback-toan9-01',
  subject: 'toan',
  topic: 'Phương trình bậc nhất hai ẩn',
  sourceRef: 'Đề ôn chương 1 - Đề 1 - TN Câu 3',
  phaseOneCheck: 'Xác định tọa độ (x; y) của từng cặp số và thay đúng vị trí vào 2x - y - 1.',
  phaseOneQuickCheck: {
    question: 'Với cặp số (1; 1), giá trị nào được thay vào x và y?',
    options: ['x = 1, y = 1', 'x = 1, y = 0', 'x = 0, y = 1'],
    correctAnswer: 'x = 1, y = 1',
  },
  errorCategory: 'execution',
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
  const [activeTab, setActiveTab] = useState<'quest' | 'lab' | 'formulas' | 'parent'>('quest');

  const [extraPackLoaded, setExtraPackLoaded] = useState<boolean>(() => {
    try {
      return localStorage.getItem(EXTRA_PACK_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(MASTERED_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  });

  const [coachedIds, setCoachedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(PARENT_COACHED_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
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
  const [phaseOneDone, setPhaseOneDone] = useState(false);
  const [quickCheckChoice, setQuickCheckChoice] = useState<string | null>(null);
  const [quickCheckFeedback, setQuickCheckFeedback] = useState<string | null>(null);

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

  useEffect(() => {
    try {
      localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify(masteredIds));
    } catch {
      // Bỏ qua khi không có quyền lưu trữ cục bộ
    }
  }, [masteredIds]);

  useEffect(() => {
    try {
      localStorage.setItem(PARENT_COACHED_STORAGE_KEY, JSON.stringify(coachedIds));
    } catch {
      // Bỏ qua khi không có quyền lưu trữ cục bộ
    }
  }, [coachedIds]);

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
    } else if (drillMode === 'recall_review') {
      const needRecall = list.filter((item) => !masteredIds.includes(item.id));
      if (needRecall.length > 0) list = needRecall;
    }
    return list.length > 0 ? list : [FALLBACK_ITEM];
  }, [subjectItems, selectedTopic, reviewWrongOnly, wrongIds, drillMode, masteredIds]);

  const current: LearningItem = poolItems[index % poolItems.length] ?? FALLBACK_ITEM;
  const safeOptions = Array.isArray(current.options) ? current.options : [];
  const safeHints = Array.isArray(current.hints) ? current.hints : [];
  const quickCheck = current.phaseOneQuickCheck;
  const isCurrentMastered = masteredIds.includes(current.id);
  const isCurrentCoached = coachedIds.includes(current.id);

  const resetQuestionState = () => {
    setPhaseOneDone(false);
    setQuickCheckChoice(null);
    setQuickCheckFeedback(null);
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
    setIndex(0);
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

  const handleToggleMastered = (itemId: string) => {
    setMasteredIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleToggleCoached = (itemId: string) => {
    setCoachedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleQuickCheckAnswer = (opt: string) => {
    setQuickCheckChoice(opt);
    if (quickCheck && opt === quickCheck.correctAnswer) {
      setPhaseOneDone(true);
      setQuickCheckFeedback('Chuẩn Pha 1! Con đã chốt đúng điểm mấu chốt, sang chọn đáp án nhé.');
    } else {
      setQuickCheckFeedback('Chưa khớp điểm chốt Pha 1. Con thử rà lại gợi ý phía trên nhé.');
    }
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
          errorCategory: current.errorCategory,
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
    setCoachedIds([]);
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

  const categorySummary = useMemo(() => {
    const counts: Record<ErrorCategory, number> = {
      concept: 0,
      trap_condition: 0,
      execution: 0,
    };
    mistakeList.forEach((m) => {
      counts[m.errorCategory] = (counts[m.errorCategory] ?? 0) + m.wrongCount;
    });
    return counts;
  }, [mistakeList]);

  const masteredInSubjectCount = useMemo(
    () => subjectItems.filter((item) => masteredIds.includes(item.id)).length,
    [subjectItems, masteredIds]
  );

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const isCorrect = selected === current.correctAnswer;
  const progressPercent = Math.round((((index % poolItems.length) + 1) / poolItems.length) * 100);
  const currentPhaseNum = selected ? 3 : phaseOneDone ? 2 : 1;

  return (
    <div className="slim-page">
      <style>{`
        .slim-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #fff7ed 0%, #f8fafc 45%, #eff6ff 100%);
          color: #0f172a;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          padding-bottom: 28px;
          box-sizing: border-box;
        }
        .slim-topbar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .slim-topbar-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 8px 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .slim-container {
          max-width: 1080px;
          margin: 12px auto 0;
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .slim-nav-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .slim-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 6px;
          flex: 1;
          min-width: 280px;
        }
        .slim-phase-bar {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 6px;
        }
        .slim-topic-desktop {
          display: none;
        }
        .slim-topic-mobile {
          display: block;
          width: 100%;
          min-height: 40px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #0f172a;
          padding: 8px 10px;
          font-size: 12.5px;
          font-weight: 700;
        }
        @media (min-width: 768px) {
          .slim-topic-desktop {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .slim-topic-mobile {
            display: none;
          }
        }
        .slim-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          align-items: start;
        }
        @media (min-width: 920px) {
          .slim-container {
            margin-top: 16px;
            padding: 0 16px;
            gap: 14px;
          }
          .slim-grid {
            grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
            gap: 18px;
          }
        }
        .slim-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 14px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
        }
        @media (min-width: 920px) {
          .slim-card {
            padding: 18px;
          }
        }
        .slim-btn {
          min-height: 44px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.12s ease, background-color 0.15s ease, border-color 0.15s ease;
        }
        .slim-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      <header className="slim-topbar">
        <div className="slim-topbar-inner">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                backgroundColor: '#ffedd5',
                color: '#c2410c',
                fontWeight: 900,
                fontSize: 13,
                padding: '5px 10px',
                borderRadius: 10,
              }}
            >
              LỚP 9 • KHÁNH NGỌC
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                padding: '4px 9px',
                borderRadius: 9999,
              }}
            >
              {score}đ • Chuỗi {streak} • {accuracy}% • Đã thuộc {masteredInSubjectCount}/{subjectItems.length} • {questionSec}s ({formatDuration(elapsedSec)})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={handleToggleWrongReview}
              style={{
                borderRadius: 9,
                border: reviewWrongOnly ? 'none' : '1px solid #fecdd3',
                backgroundColor: reviewWrongOnly ? '#e11d48' : '#fff1f2',
                color: reviewWrongOnly ? '#ffffff' : '#be123c',
                padding: '6px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {reviewWrongOnly ? 'Thoát sai' : `Ôn sai (${wrongIds.length})`}
            </button>
            <button
              type="button"
              onClick={() => setPunchEnabled((v) => !v)}
              style={{
                borderRadius: 9,
                border: '1px solid #fcd34d',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '6px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Lò xo: {punchEnabled ? 'Bật' : 'Tắt'}
            </button>
          </div>
        </div>
      </header>

      <div className="slim-container">
        <div className="slim-nav-row">
          <div className="slim-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('quest')}
              style={{
                borderRadius: 10,
                border: 'none',
                padding: '8px 6px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: activeTab === 'quest' ? '#0f172a' : '#ffffff',
                color: activeTab === 'quest' ? '#ffffff' : '#334155',
              }}
            >
              Luyện bài
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lab')}
              style={{
                borderRadius: 10,
                border: 'none',
                padding: '8px 6px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: activeTab === 'lab' ? '#0284c7' : '#ffffff',
                color: activeTab === 'lab' ? '#ffffff' : '#334155',
              }}
            >
              Đồ thị
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('formulas')}
              style={{
                borderRadius: 10,
                border: 'none',
                padding: '8px 6px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: activeTab === 'formulas' ? '#1d4ed8' : '#ffffff',
                color: activeTab === 'formulas' ? '#ffffff' : '#334155',
              }}
            >
              Công thức
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parent')}
              style={{
                borderRadius: 10,
                border: 'none',
                padding: '8px 6px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: activeTab === 'parent' ? '#4338ca' : '#ffffff',
                color: activeTab === 'parent' ? '#ffffff' : '#334155',
              }}
            >
              Phụ huynh ({totalWrongAttempts})
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, minWidth: 190 }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('quest');
                handleSwitchSubject('toan');
              }}
              style={{
                borderRadius: 10,
                border: subject === 'toan' ? 'none' : '1px solid #cbd5e1',
                backgroundColor: subject === 'toan' ? '#ea580c' : '#ffffff',
                color: subject === 'toan' ? '#ffffff' : '#334155',
                padding: '8px 10px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Toán 9
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('quest');
                handleSwitchSubject('van');
              }}
              style={{
                borderRadius: 10,
                border: subject === 'van' ? 'none' : '1px solid #cbd5e1',
                backgroundColor: subject === 'van' ? '#059669' : '#ffffff',
                color: subject === 'van' ? '#ffffff' : '#334155',
                padding: '8px 10px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Ngữ văn 9
            </button>
          </div>
        </div>

        <div className="slim-phase-bar">
          <button
            type="button"
            onClick={() => {
              setActiveTab('quest');
              setSelected(null);
              setPhaseOneDone(false);
            }}
            style={{
              borderRadius: 10,
              padding: '6px 8px',
              fontSize: 11.5,
              fontWeight: 800,
              textAlign: 'center',
              cursor: 'pointer',
              border: `1px solid ${currentPhaseNum === 1 ? '#ea580c' : '#cbd5e1'}`,
              backgroundColor: currentPhaseNum === 1 ? '#fff7ed' : '#ffffff',
              color: currentPhaseNum === 1 ? '#c2410c' : '#64748b',
            }}
          >
            1. Chốt nền tảng
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('quest');
              setSelected(null);
              setPhaseOneDone(true);
            }}
            style={{
              borderRadius: 10,
              padding: '6px 8px',
              fontSize: 11.5,
              fontWeight: 800,
              textAlign: 'center',
              cursor: 'pointer',
              border: `1px solid ${currentPhaseNum === 2 ? '#2563eb' : '#cbd5e1'}`,
              backgroundColor: currentPhaseNum === 2 ? '#eff6ff' : '#ffffff',
              color: currentPhaseNum === 2 ? '#1d4ed8' : '#64748b',
            }}
          >
            2. Giải &amp; kiểm chứng
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('quest');
              if (!selected && safeOptions[0]) {
                handleSelectOption(safeOptions[0]);
              }
            }}
            style={{
              borderRadius: 10,
              padding: '6px 8px',
              fontSize: 11.5,
              fontWeight: 800,
              textAlign: 'center',
              cursor: 'pointer',
              border: `1px solid ${currentPhaseNum === 3 ? '#059669' : '#cbd5e1'}`,
              backgroundColor: currentPhaseNum === 3 ? '#ecfdf5' : '#ffffff',
              color: currentPhaseNum === 3 ? '#047857' : '#64748b',
            }}
          >
            3. Bắt lỗi &amp; nhớ bài
          </button>
        </div>

        {activeTab === 'lab' ? (
          <section className="slim-card">
            <VisualDesmosLab />
          </section>
        ) : (
          <div className="slim-grid">
            <section className="slim-card" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <select
                aria-label="Chọn dạng bài"
                value={selectedTopic}
                onChange={(e) => {
                  setActiveTab('quest');
                  handleSelectTopic(e.target.value);
                }}
                className="slim-topic-mobile"
              >
                {topics.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp === 'ALL' ? 'Dạng: Tất cả chủ đề' : `Dạng: ${tp}`}
                  </option>
                ))}
              </select>

              <div className="slim-topic-desktop">
                {topics.map((tp) => {
                  const active = selectedTopic === tp;
                  return (
                    <button
                      key={tp}
                      type="button"
                      onClick={() => {
                        setActiveTab('quest');
                        handleSelectTopic(tp);
                      }}
                      style={{
                        borderRadius: 9999,
                        border: active ? 'none' : '1px solid #cbd5e1',
                        backgroundColor: active ? '#0f172a' : '#f8fafc',
                        color: active ? '#ffffff' : '#334155',
                        padding: '5px 11px',
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

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  <button
                    type="button"
                    onClick={() => handleChangeMode('standard')}
                    style={{
                      borderRadius: 9,
                      border: drillMode === 'standard' ? 'none' : '1px solid #cbd5e1',
                      backgroundColor: drillMode === 'standard' ? '#0f172a' : '#ffffff',
                      color: drillMode === 'standard' ? '#ffffff' : '#475569',
                      padding: '5px 9px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeMode('trap_focus')}
                    style={{
                      borderRadius: 9,
                      border: drillMode === 'trap_focus' ? 'none' : '1px solid #fcd34d',
                      backgroundColor: drillMode === 'trap_focus' ? '#b45309' : '#fffbeb',
                      color: drillMode === 'trap_focus' ? '#ffffff' : '#92400e',
                      padding: '5px 9px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Soi bẫy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeMode('violympic_speed')}
                    style={{
                      borderRadius: 9,
                      border: drillMode === 'violympic_speed' ? 'none' : '1px solid #93c5fd',
                      backgroundColor: drillMode === 'violympic_speed' ? '#1d4ed8' : '#eff6ff',
                      color: drillMode === 'violympic_speed' ? '#ffffff' : '#1e40af',
                      padding: '5px 9px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Tốc độ (+5đ)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeMode('recall_review')}
                    style={{
                      borderRadius: 9,
                      border: drillMode === 'recall_review' ? 'none' : '1px solid #a7f3d0',
                      backgroundColor: drillMode === 'recall_review' ? '#047857' : '#ecfdf5',
                      color: drillMode === 'recall_review' ? '#ffffff' : '#065f46',
                      padding: '5px 9px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Chống quên
                  </button>
                </div>

                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                  Câu {(index % poolItems.length) + 1}/{poolItems.length} ({progressPercent}%)
                </span>
              </div>

              <div
                style={{
                  height: 7,
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
                    backgroundColor: subject === 'toan' ? '#ea580c' : '#059669',
                    transition: 'width 0.25s ease',
                  }}
                />
              </div>

              <div
                style={{
                  borderRadius: 15,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: 13,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>
                    {current.topic} • {current.sourceRef}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleMastered(current.id)}
                    style={{
                      borderRadius: 9999,
                      border: isCurrentMastered ? 'none' : '1px solid #10b981',
                      backgroundColor: isCurrentMastered ? '#059669' : '#ffffff',
                      color: isCurrentMastered ? '#ffffff' : '#047857',
                      padding: '3px 10px',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {isCurrentMastered ? 'Đã thuộc chắc ✓' : 'Đánh dấu đã thuộc'}
                  </button>
                </div>

                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.5,
                  }}
                >
                  {current.prompt}
                </p>
              </div>

              {!phaseOneDone && quickCheck && (
                <div
                  style={{
                    borderRadius: 13,
                    backgroundColor: '#fff7ed',
                    border: '1px solid #fed7aa',
                    padding: 11,
                    fontSize: 12,
                    color: '#7c2d12',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <strong>Chốt Pha 1: {quickCheck.question}</strong>
                    <button
                      type="button"
                      onClick={() => setPhaseOneDone(true)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#c2410c',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        flexShrink: 0,
                      }}
                    >
                      Bỏ qua chốt
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {quickCheck.options.map((qOpt) => {
                      const picked = quickCheckChoice === qOpt;
                      const ok = qOpt === quickCheck.correctAnswer;
                      return (
                        <button
                          key={qOpt}
                          type="button"
                          onClick={() => handleQuickCheckAnswer(qOpt)}
                          style={{
                            borderRadius: 9,
                            border: `1px solid ${picked ? (ok ? '#10b981' : '#fb7185') : '#fdba74'}`,
                            backgroundColor: picked ? (ok ? '#ecfdf5' : '#fff1f2') : '#ffffff',
                            color: '#0f172a',
                            padding: '6px 10px',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {qOpt}
                        </button>
                      );
                    })}
                  </div>

                  {quickCheckFeedback && (
                    <div style={{ fontSize: 11.5, fontWeight: 700 }}>{quickCheckFeedback}</div>
                  )}
                </div>
              )}

              {showTrapPreview && (
                <div
                  style={{
                    borderRadius: 12,
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fcd34d',
                    padding: 10,
                    fontSize: 12,
                    color: '#78350f',
                    lineHeight: 1.45,
                  }}
                >
                  <strong>Bẫy thường gặp:</strong> {current.commonMistake}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
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
                      className="slim-btn"
                      style={{
                        width: '100%',
                        border: `1.5px solid ${border}`,
                        backgroundColor: bg,
                        color,
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontSize: 13,
                        fontWeight,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                      }}
                    >
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 7,
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          fontSize: 11.5,
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
                    borderRadius: 12,
                    padding: 11,
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    backgroundColor: isCorrect ? '#ecfdf5' : '#fff1f2',
                    color: isCorrect ? '#065f46' : '#9f1239',
                    border: `1px solid ${isCorrect ? '#a7f3d0' : '#fecdd3'}`,
                  }}
                >
                  {isCorrect
                    ? `Chính xác! ${current.parentGuide?.keyConcept ?? ''}`
                    : `Chưa đúng (${ERROR_CATEGORY_LABELS[current.errorCategory]}): ${current.commonMistake}`}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 7 }}>
                <button
                  type="button"
                  onClick={() => setHintStep((s) => Math.min(s + 1, safeHints.length))}
                  className="slim-btn"
                  style={{
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    padding: '9px 10px',
                  }}
                >
                  Gợi ý ({Math.min(hintStep, safeHints.length)}/{safeHints.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowParentInline((v) => !v)}
                  className="slim-btn"
                  style={{
                    border: '1px solid #c7d2fe',
                    backgroundColor: '#eef2ff',
                    color: '#3730a3',
                    padding: '9px 10px',
                  }}
                >
                  {showParentInline ? 'Ẩn gợi ý bố mẹ' : 'Gợi ý bố mẹ'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="slim-btn"
                style={{
                  width: '100%',
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '11px 14px',
                  fontSize: 13.5,
                }}
              >
                Câu tiếp theo →
              </button>
            </section>

            <aside className="slim-card" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {activeTab === 'quest' && (
                <>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    Trợ lý tư duy &amp; lưu ý Pha 1
                  </div>

                  <div
                    style={{
                      borderRadius: 12,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: 11,
                      fontSize: 12,
                      color: '#334155',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>Điều kiện / Trọng tâm cần nhớ:</strong> {current.phaseOneCheck}
                  </div>

                  {hintStep > 0 && (
                    <div
                      style={{
                        borderRadius: 12,
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        padding: 11,
                        fontSize: 12,
                        color: '#78350f',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ color: '#92400e' }}>Gợi ý từng bước:</strong>
                      {safeHints.slice(0, hintStep).map((h, i) => (
                        <div key={i}>
                          • Bước {i + 1}: {h}
                        </div>
                      ))}
                    </div>
                  )}

                  {showParentInline && (
                    <div
                      style={{
                        borderRadius: 12,
                        backgroundColor: '#eef2ff',
                        border: '1px solid #c7d2fe',
                        padding: 11,
                        fontSize: 12,
                        color: '#1e1b4b',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        lineHeight: 1.5,
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
                </>
              )}

              {activeTab === 'formulas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                  {subject === 'toan' && (
                    <div
                      style={{
                        borderRadius: 12,
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        padding: 11,
                        color: '#1e3a8a',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>Gói đề thi thử vào 10 môn Toán</div>
                      <div>
                        Gói câu hỏi đề thi thử bổ sung ({EXTRA_MOCK_EXAM_ITEMS.length} câu đã kiểm chứng):{' '}
                        <strong>{extraPackLoaded ? 'Đã nạp' : 'Chưa nạp'}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setExtraPackLoaded((prev) => !prev);
                          setIndex(0);
                          resetQuestionState();
                        }}
                        className="slim-btn"
                        style={{
                          width: '100%',
                          border: 'none',
                          backgroundColor: '#1d4ed8',
                          color: '#ffffff',
                          padding: '9px 12px',
                        }}
                      >
                        {extraPackLoaded ? 'Gỡ gói câu hỏi bổ sung' : 'Nạp gói câu hỏi bổ sung'}
                      </button>
                    </div>
                  )}

                  {subjectFormulaCards.map((card) => (
                    <div
                      key={card.id}
                      style={{
                        borderRadius: 12,
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        padding: 11,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5,
                      }}
                    >
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{card.topic}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{card.weightNote}</div>
                      <div style={{ borderRadius: 8, backgroundColor: '#fff', padding: 8, border: '1px solid #e2e8f0' }}>
                        <strong>Công thức / Quy tắc:</strong> {card.coreFormula}
                      </div>
                      <div style={{ borderRadius: 8, backgroundColor: '#fffbeb', padding: 8, color: '#78350f' }}>
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
                      borderRadius: 12,
                      backgroundColor: '#eef2ff',
                      border: '1px solid #c7d2fe',
                      padding: 11,
                      fontSize: 12,
                      color: '#1e1b4b',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>Chẩn đoán lỗi sai &amp; nhật ký đồng hành</div>
                      {mistakeList.length > 0 && (
                        <button
                          type="button"
                          onClick={handleResetMistakes}
                          style={{
                            borderRadius: 8,
                            border: '1px solid #a5b4fc',
                            backgroundColor: '#ffffff',
                            color: '#312e81',
                            padding: '4px 9px',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Đặt lại
                        </button>
                      )}
                    </div>
                    <div>
                      Tổng lần sai: <strong>{totalWrongAttempts}</strong> • Đã gợi mở cùng con: <strong>{coachedIds.length}/{mistakeList.length}</strong> dạng • Khái niệm: <strong>{categorySummary.concept}</strong> • Bẫy/điều kiện: <strong>{categorySummary.trap_condition}</strong> • Thao tác: <strong>{categorySummary.execution}</strong>
                    </div>
                    <div>
                      Nguyên tắc: bố mẹ dùng câu hỏi gợi mở để con tự tìm ra hướng làm, tránh làm hộ.
                    </div>
                  </div>

                  {mistakeList.length === 0 ? (
                    <div
                      style={{
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        padding: 14,
                        textAlign: 'center',
                        fontSize: 12,
                        color: '#475569',
                      }}
                    >
                      Chưa có lỗi sai nào được ghi nhận. Khi Khánh Ngọc chọn sai câu nào, hệ thống sẽ tổng hợp nhóm lỗi, câu hỏi gợi mở và nút đánh dấu đã cùng con trao đổi tại đây.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {mistakeList.map((rec) => {
                        const barWidth = Math.max(18, Math.round((rec.wrongCount / maxWrongCount) * 100));
                        const coached = coachedIds.includes(rec.itemId);
                        return (
                          <div
                            key={rec.itemId}
                            style={{
                              borderRadius: 12,
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              padding: 11,
                              fontSize: 12,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 5,
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
                                  padding: '2px 9px',
                                  fontSize: 11,
                                  fontWeight: 800,
                                }}
                              >
                                Sai {rec.wrongCount} lần
                              </span>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#be123c' }}>
                              Nhóm lỗi: {ERROR_CATEGORY_LABELS[rec.errorCategory]}
                            </div>
                            <div style={{ height: 5, width: '100%', borderRadius: 9999, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${barWidth}%`, backgroundColor: '#e11d48' }} />
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{rec.sourceRef}</div>
                            <div style={{ borderRadius: 8, backgroundColor: '#fff1f2', padding: 7, color: '#881337' }}>
                              <strong>Lỗi sai:</strong> {rec.commonMistake}
                            </div>
                            <div style={{ borderRadius: 8, backgroundColor: '#eef2ff', padding: 7, color: '#1e1b4b' }}>
                              <strong>Hỏi gợi mở cho con:</strong> &ldquo;{rec.guidingQuestion}&rdquo;
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                              <button
                                type="button"
                                onClick={() => handleToggleCoached(rec.itemId)}
                                style={{
                                  borderRadius: 8,
                                  border: coached ? 'none' : '1px solid #a5b4fc',
                                  backgroundColor: coached ? '#4338ca' : '#eef2ff',
                                  color: coached ? '#ffffff' : '#312e81',
                                  padding: '4px 10px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                {coached ? 'Đã cùng con gợi mở ✓' : 'Đánh dấu đã gợi mở'}
                              </button>
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