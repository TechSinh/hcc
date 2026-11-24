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
import {
  getDominantErrorCategory,
  loadInitialLearningState,
  saveLearningState,
} from './services/learningStorage';
import {
  getSupabaseSyncConfig,
  pullLearningStateFromSupabase,
  pushLearningStateToSupabase,
} from './services/supabaseSync';
import { SpringPunchModal } from './components/SpringPunchModal';
import { VisualDesmosLab } from './components/VisualDesmosLab';
import { SpinChallengeGame } from './components/SpinChallengeGame';

type DrillMode = 'standard' | 'trap_focus' | 'violympic_speed' | 'recall_review';
type ActiveTab = 'quest' | 'spin' | 'lab' | 'formulas' | 'parent';

const STAGE_SIZE = 3;
const MAX_WEEKS_LEARNED = 16;

const DAD_PRAISE_LINES: string[] = [
  'Bố công nhận pha này! Tuyển thủ Khánh Ngọc xử lý quá gọn.',
  'Đúng bài rồi con gái! Bố tưởng câu này làm khó được con chứ.',
  'Bật chế độ chính xác cao luôn! Cứ giữ nhịp này là tự tin vào lớp 10.',
  'Ngọt lịm! Thêm một bước nữa là chạm mốc thưởng của bố.',
];

const DAD_BANTER_MISS_LINES: string[] = [
  'Hì hì, bố cài bẫy nhẹ tí thôi—con soi lại thử xem nào!',
  'Suýt hạ gục thử thách rồi! Nhìn kỹ lại điều kiện hoặc ngữ liệu nhé.',
  'Bố bắt được một manh mối nhỏ rồi nè—thử hỏi gợi ý xem con tự bật ra không!',
];

const FALLBACK_ITEM: LearningItem = {
  id: 'fallback-toan9-01',
  subject: 'toan',
  topic: 'Phương trình bậc nhất hai ẩn',
  weekSpan: 2,
  sourceRef: 'Tuần 1-2 • Đề ôn chương 1 - Đề 1 - TN Câu 3',
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
  const initialState = useMemo(() => loadInitialLearningState(), []);
  const syncConfig = useMemo(() => getSupabaseSyncConfig(), []);

  const [subject, setSubject] = useState<Subject>('toan');
  const [drillMode, setDrillMode] = useState<DrillMode>('standard');
  const [within16WeeksOnly, setWithin16WeeksOnly] = useState<boolean>(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [reviewWrongOnly, setReviewWrongOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('quest');

  const [extraPackLoaded, setExtraPackLoaded] = useState<boolean>(initialState.extraPackLoaded);
  const [masteredIds, setMasteredIds] = useState<string[]>(initialState.masteredIds);
  const [needsReinforcementIds, setNeedsReinforcementIds] = useState<string[]>(
    initialState.needsReinforcementIds
  );
  const [coachedIds, setCoachedIds] = useState<string[]>(initialState.coachedIds);
  const [mistakeMap, setMistakeMap] = useState<Record<string, MistakeRecord>>(
    initialState.mistakeMap
  );

  const [index, setIndex] = useState(0);
  const [stageClearedCount, setStageClearedCount] = useState(0);
  const [stageRewardOpen, setStageRewardOpen] = useState(false);

  const [quickCheckOpen, setQuickCheckOpen] = useState(false);
  const [quickCheckChoice, setQuickCheckChoice] = useState<string | null>(null);
  const [quickCheckFeedback, setQuickCheckFeedback] = useState<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [banterMessage, setBanterMessage] = useState<string | null>(null);
  const [hintStep, setHintStep] = useState(0);
  const [showTrapPreview, setShowTrapPreview] = useState(false);

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState<number>(initialState.bestStreak);
  const [score, setScore] = useState<number>(initialState.totalScore);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [questionSec, setQuestionSec] = useState(0);

  const [punchOpen, setPunchOpen] = useState(false);
  const [punchEnabled, setPunchEnabled] = useState(true);
  const [showParentInline, setShowParentInline] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);

  const allItems = useMemo<LearningItem[]>(() => {
    const core = Array.isArray(CORE_SEED_ITEMS) ? CORE_SEED_ITEMS : [];
    const extra =
      extraPackLoaded && Array.isArray(EXTRA_MOCK_EXAM_ITEMS) ? EXTRA_MOCK_EXAM_ITEMS : [];
    const merged = [...core, ...extra];
    return merged.length > 0 ? merged : [FALLBACK_ITEM];
  }, [extraPackLoaded]);

  const items16Weeks = useMemo<LearningItem[]>(() => {
    const filtered = allItems.filter((item) => (item.weekSpan ?? 16) <= MAX_WEEKS_LEARNED);
    return filtered.length > 0 ? filtered : allItems;
  }, [allItems]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
      setQuestionSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    saveLearningState({
      mistakeMap,
      masteredIds,
      needsReinforcementIds,
      coachedIds,
      extraPackLoaded,
      totalScore: score,
      bestStreak,
      updatedAt: new Date().toISOString(),
    });
  }, [
    mistakeMap,
    masteredIds,
    needsReinforcementIds,
    coachedIds,
    extraPackLoaded,
    score,
    bestStreak,
  ]);

  const wrongIds = useMemo(() => Object.keys(mistakeMap), [mistakeMap]);

  const baseWeekItems = useMemo(() => {
    return within16WeeksOnly ? items16Weeks : allItems;
  }, [within16WeeksOnly, items16Weeks, allItems]);

  const subjectItems = useMemo(() => {
    const bySub = baseWeekItems.filter((item) => item.subject === subject);
    return bySub.length > 0 ? bySub : baseWeekItems;
  }, [baseWeekItems, subject]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    subjectItems.forEach((item) => set.add(item.topic));
    return ['ALL', ...Array.from(set)];
  }, [subjectItems]);

  const subjectFormulaCards = useMemo(() => {
    const cards = Array.isArray(EXAM_FORMULA_CARDS) ? EXAM_FORMULA_CARDS : [];
    const weekFiltered = within16WeeksOnly
      ? cards.filter((card) => (card.weekSpan ?? 16) <= MAX_WEEKS_LEARNED)
      : cards;
    const targetList = weekFiltered.length > 0 ? weekFiltered : cards;
    return targetList.filter((card) => card.subject === subject);
  }, [subject, within16WeeksOnly]);

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
      const priorityList = list.filter(
        (item) => needsReinforcementIds.includes(item.id) && !masteredIds.includes(item.id)
      );
      if (priorityList.length > 0) {
        list = priorityList;
      } else {
        const unmastered = list.filter((item) => !masteredIds.includes(item.id));
        if (unmastered.length > 0) list = unmastered;
      }
    }
    return list.length > 0 ? list : [FALLBACK_ITEM];
  }, [
    subjectItems,
    selectedTopic,
    reviewWrongOnly,
    wrongIds,
    drillMode,
    needsReinforcementIds,
    masteredIds,
  ]);

  const current: LearningItem = poolItems[index % poolItems.length] ?? FALLBACK_ITEM;
  const safeOptions = Array.isArray(current.options) ? current.options : [];
  const safeHints = Array.isArray(current.hints) ? current.hints : [];
  const quickCheck = current.phaseOneQuickCheck;
  const isCurrentMastered = masteredIds.includes(current.id);
  const isCurrentReinforce = needsReinforcementIds.includes(current.id);

  const resetQuestionState = () => {
    setQuickCheckOpen(false);
    setQuickCheckChoice(null);
    setQuickCheckFeedback(null);
    setSelected(null);
    setBanterMessage(null);
    setHintStep(0);
    setShowParentInline(false);
    setQuestionSec(0);
    setShowTrapPreview(drillMode === 'trap_focus');
  };

  const resetPoolContext = () => {
    setIndex(0);
    setStageClearedCount(0);
    setStageRewardOpen(false);
    resetQuestionState();
  };

  const handleSwitchSubject = (nextSubject: Subject) => {
    setSubject(nextSubject);
    setSelectedTopic('ALL');
    resetPoolContext();
  };

  const handleChangeMode = (nextMode: DrillMode) => {
    setDrillMode(nextMode);
    setIndex(0);
    setStageClearedCount(0);
    setStageRewardOpen(false);
    setShowTrapPreview(nextMode === 'trap_focus');
  };

  const handleSelectTopic = (nextTopic: string) => {
    setSelectedTopic(nextTopic);
    resetPoolContext();
  };

  const handleToggleWrongReview = () => {
    setReviewWrongOnly((prev) => !prev);
    resetPoolContext();
  };

  const handleJumpToQuestion = (targetItem: LearningItem) => {
    setSubject(targetItem.subject);
    setSelectedTopic('ALL');
    setReviewWrongOnly(false);
    setActiveTab('quest');
    resetQuestionState();
    const candidates = (within16WeeksOnly ? items16Weeks : allItems).filter(
      (i) => i.subject === targetItem.subject
    );
    const foundIdx = candidates.findIndex((i) => i.id === targetItem.id);
    setIndex(foundIdx >= 0 ? foundIdx : 0);
  };

  const handleToggleMastered = (itemId: string) => {
    setMasteredIds((prev) => {
      const exists = prev.includes(itemId);
      if (exists) {
        return prev.filter((id) => id !== itemId);
      }
      setNeedsReinforcementIds((rPrev) => rPrev.filter((id) => id !== itemId));
      return [...prev, itemId];
    });
  };

  const handleToggleCoached = (itemId: string) => {
    setCoachedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleQuickCheckAnswer = (opt: string) => {
    setQuickCheckChoice(opt);
    if (quickCheck && opt === quickCheck.correctAnswer) {
      setQuickCheckFeedback('Bố duyệt! Con đã bắt đúng điểm chốt rồi đó.');
    } else {
      setQuickCheckFeedback('Chưa trúng điểm chốt của bố—nhìn lại gợi ý ngắn xem sao!');
    }
  };

  const handleSelectOption = (opt: string) => {
    const firstTimeOnQuestion = selected === null;
    setSelected(opt);
    setAnsweredCount((c) => c + 1);

    if (opt === current.correctAnswer) {
      const nextStreak = streak + 1;
      const speedBonus = drillMode === 'violympic_speed' && questionSec <= 25 ? 5 : 0;
      setBanterMessage(DAD_PRAISE_LINES[answeredCount % DAD_PRAISE_LINES.length]);
      setCorrectCount((c) => c + 1);
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      setScore((s) => s + 10 + speedBonus);

      if (hintStep === 0) {
        setNeedsReinforcementIds((prev) => prev.filter((id) => id !== current.id));
      }

      if (firstTimeOnQuestion) {
        const nextStageStep = stageClearedCount + 1;
        if (nextStageStep >= STAGE_SIZE) {
          setStageClearedCount(STAGE_SIZE);
          setScore((s) => s + 15);
          setStageRewardOpen(true);
        } else {
          setStageClearedCount(nextStageStep);
        }
      }
      return;
    }

    setBanterMessage(DAD_BANTER_MISS_LINES[answeredCount % DAD_BANTER_MISS_LINES.length]);
    setStreak(0);
    setNeedsReinforcementIds((prev) =>
      prev.includes(current.id) ? prev : [...prev, current.id]
    );
    setMasteredIds((prev) => prev.filter((id) => id !== current.id));
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

  const handleOpenHint = () => {
    setHintStep((s) => Math.min(s + 1, safeHints.length));
    setNeedsReinforcementIds((prev) =>
      prev.includes(current.id) ? prev : [...prev, current.id]
    );
  };

  const handleResetMistakes = () => {
    setMistakeMap({});
    setNeedsReinforcementIds([]);
    setCoachedIds([]);
    setReviewWrongOnly(false);
    resetPoolContext();
  };

  const handleNext = () => {
    setStageRewardOpen(false);
    resetQuestionState();
    setIndex((prev) => (prev + 1) % poolItems.length);
  };

  const handleStartNextStage = () => {
    setStageRewardOpen(false);
    setStageClearedCount(0);
    resetQuestionState();
    setIndex((prev) => (prev + 1) % poolItems.length);
  };

  const handlePushCloud = async () => {
    setSyncBusy(true);
    const res = await pushLearningStateToSupabase({
      mistakeMap,
      masteredIds,
      needsReinforcementIds,
      coachedIds,
      extraPackLoaded,
      totalScore: score,
      bestStreak,
      updatedAt: new Date().toISOString(),
    });
    setSyncStatusMessage(res.message);
    setSyncBusy(false);
  };

  const handlePullCloud = async () => {
    setSyncBusy(true);
    const res = await pullLearningStateFromSupabase();
    if (res.ok && res.remoteState) {
      setMistakeMap(res.remoteState.mistakeMap ?? {});
      setMasteredIds(res.remoteState.masteredIds ?? []);
      setNeedsReinforcementIds(res.remoteState.needsReinforcementIds ?? []);
      setCoachedIds(res.remoteState.coachedIds ?? []);
      setExtraPackLoaded(Boolean(res.remoteState.extraPackLoaded));
      if (typeof res.remoteState.totalScore === 'number') {
        setScore(res.remoteState.totalScore);
      }
      if (typeof res.remoteState.bestStreak === 'number') {
        setBestStreak(res.remoteState.bestStreak);
      }
      resetPoolContext();
    }
    setSyncStatusMessage(res.message);
    setSyncBusy(false);
  };

  const mistakeList = Object.values(mistakeMap).sort((a, b) => b.wrongCount - a.wrongCount);
  const totalWrongAttempts = mistakeList.reduce((acc, item) => acc + item.wrongCount, 0);
  const maxWrongCount = mistakeList.length > 0 ? mistakeList[0].wrongCount : 1;
  const dominantCategory = useMemo(() => getDominantErrorCategory(mistakeList), [mistakeList]);

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

  const reinforcementCount = useMemo(
    () =>
      subjectItems.filter(
        (item) => needsReinforcementIds.includes(item.id) && !masteredIds.includes(item.id)
      ).length,
    [subjectItems, needsReinforcementIds, masteredIds]
  );

  const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
  const isCorrect = selected === current.correctAnswer;
  const currentStageNumber = Math.floor(answeredCount / STAGE_SIZE) + 1;

  const sessionParentPrompt =
    mistakeList.length > 0
      ? mistakeList[0].guidingQuestion
      : 'Hôm nay con thấy kèo thách đấu nào của bố thú vị nhất và điều kiện nào cần lưu ý kỹ nhất khi lên cấp 3?';

  return (
    <div className="dad-challenge-page">
      <style>{`
        .dad-challenge-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #fff7ed 0%, #f8fafc 45%, #eff6ff 100%);
          color: #0f172a;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          padding-bottom: 28px;
          box-sizing: border-box;
        }
        .dad-topbar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .dad-topbar-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 8px 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .dad-container {
          max-width: 1040px;
          margin: 12px auto 0;
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .dad-nav-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .dad-tabs {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 5px;
          flex: 1;
          min-width: 300px;
        }
        .dad-stage-dots {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }
        .dad-topic-desktop {
          display: none;
        }
        .dad-topic-mobile {
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
          .dad-topic-desktop {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .dad-topic-mobile {
            display: none;
          }
        }
        .dad-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          align-items: start;
        }
        @media (min-width: 920px) {
          .dad-container {
            margin-top: 16px;
            padding: 0 16px;
            gap: 14px;
          }
          .dad-grid {
            grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
            gap: 18px;
          }
        }
        .dad-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 14px;
          box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
        }
        @media (min-width: 920px) {
          .dad-card {
            padding: 18px;
          }
        }
        .dad-btn {
          min-height: 44px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.12s ease, background-color 0.15s ease, border-color 0.15s ease;
        }
        .dad-btn:active {
          transform: scale(0.98);
        }
      `}</style>

      <header className="dad-topbar">
        <div className="dad-topbar-inner">
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
              BỐ THÁCH – CON GIẢI • KHÁNH NGỌC
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
              Vòng {currentStageNumber} • {score}đ • Chuỗi {streak} (Kỷ lục {bestStreak}) • Thuộc {masteredInSubjectCount}/{subjectItems.length} • {questionSec}s ({formatDuration(elapsedSec)})
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={() => {
                setWithin16WeeksOnly((prev) => !prev);
                setSelectedTopic('ALL');
                resetPoolContext();
              }}
              style={{
                borderRadius: 9,
                border: within16WeeksOnly ? 'none' : '1px solid #cbd5e1',
                backgroundColor: within16WeeksOnly ? '#0f766e' : '#ffffff',
                color: within16WeeksOnly ? '#ffffff' : '#334155',
                padding: '6px 10px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {within16WeeksOnly ? 'Trong 16 tuần' : 'Tất cả tuần'}
            </button>
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
              {reviewWrongOnly ? 'Thoát kèo sai' : `Kèo sai (${wrongIds.length})`}
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
              Lò xo bố: {punchEnabled ? 'Bật' : 'Tắt'}
            </button>
          </div>
        </div>
      </header>

      <div className="dad-container">
        <div className="dad-nav-row">
          <div className="dad-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('quest')}
              style={{
                borderRadius: 10,
                border: 'none',
                padding: '8px 5px',
                fontSize: 11.5,
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: activeTab === 'quest' ? '#0f172a' : '#ffffff',
                color: activeTab === 'quest' ? '#ffffff' : '#334155',
              }}
            >
              Đấu trí
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('spin')}
              style={{
                borderRadius: 10,
                border: 'none',
                padding: '8px 5px',
                fontSize: 11.5,
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: activeTab === 'spin' ? '#ea580c' : '#ffffff',
                color: activeTab === 'spin' ? '#ffffff' : '#334155',
              }}
            >
              Vòng quay
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lab')}
              style={{
                borderRadius: 10,
                border: 'none',
                padding: '8px 5px',
                fontSize: 11.5,
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
                padding: '8px 5px',
                fontSize: 11.5,
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
                padding: '8px 5px',
                fontSize: 11.5,
                fontWeight: 800,
                cursor: 'pointer',
                backgroundColor: activeTab === 'parent' ? '#4338ca' : '#ffffff',
                color: activeTab === 'parent' ? '#ffffff' : '#334155',
              }}
            >
              Góc bố ({totalWrongAttempts})
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, minWidth: 190 }}>
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'spin') setActiveTab('quest');
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
                if (activeTab === 'spin') setActiveTab('quest');
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

        <div className="dad-stage-dots">
          {Array.from({ length: STAGE_SIZE }).map((_, stepIdx) => {
            const done = stepIdx < stageClearedCount;
            const active = stepIdx === stageClearedCount && !stageRewardOpen;
            return (
              <div
                key={stepIdx}
                style={{
                  borderRadius: 12,
                  padding: '7px 10px',
                  fontSize: 12,
                  fontWeight: 800,
                  textAlign: 'center',
                  border: `1.5px solid ${
                    done ? '#10b981' : active ? '#ea580c' : '#cbd5e1'
                  }`,
                  backgroundColor: done ? '#ecfdf5' : active ? '#fff7ed' : '#ffffff',
                  color: done ? '#047857' : active ? '#c2410c' : '#64748b',
                }}
              >
                {done
                  ? `Kèo ${stepIdx + 1} hạ gục ✓`
                  : active
                  ? `Kèo ${stepIdx + 1} (Con đang giải)`
                  : `Kèo ${stepIdx + 1}`}
              </div>
            );
          })}
        </div>

        {stageRewardOpen && (
          <div
            style={{
              borderRadius: 18,
              border: '2px solid #f59e0b',
              background: 'linear-gradient(120deg, #fffbeb 0%, #fef3c7 100%)',
              padding: 16,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 900,
                  color: '#b45309',
                  textTransform: 'uppercase',
                }}
              >
                Bố đầu hàng kèo này! Thưởng +15 điểm cho Khánh Ngọc
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>
                Con đã vượt qua trọn vẹn {STAGE_SIZE} câu thách đấu của vòng {currentStageNumber}!
              </div>
            </div>
            <button
              type="button"
              onClick={handleStartNextStage}
              className="dad-btn"
              style={{
                border: 'none',
                backgroundColor: '#ea580c',
                color: '#ffffff',
                padding: '10px 16px',
              }}
            >
              Nhận kèo vòng tiếp theo →
            </button>
          </div>
        )}

        {activeTab === 'spin' && (
          <section className="dad-card">
            <SpinChallengeGame
              items16Weeks={items16Weeks}
              currentSubject={subject}
              punchEnabled={punchEnabled}
              onTogglePunch={() => setPunchEnabled((v) => !v)}
              onJumpToQuestion={handleJumpToQuestion}
              onBackToQuest={() => setActiveTab('quest')}
            />
          </section>
        )}

        {activeTab === 'lab' && (
          <section className="dad-card">
            <VisualDesmosLab />
          </section>
        )}

        {activeTab !== 'spin' && activeTab !== 'lab' && (
          <div className="dad-grid">
            <section className="dad-card" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <select
                aria-label="Chọn dạng bài"
                value={selectedTopic}
                onChange={(e) => {
                  setActiveTab('quest');
                  handleSelectTopic(e.target.value);
                }}
                className="dad-topic-mobile"
              >
                {topics.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp === 'ALL' ? 'Kèo: Tất cả chủ đề' : `Kèo: ${tp}`}
                  </option>
                ))}
              </select>

              <div className="dad-topic-desktop">
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
                      {tp === 'ALL' ? 'Tất cả kèo' : tp}
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                }}
              >
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
                    Đấu thường
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
                    Bố lộ bẫy
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
                    Chống quên ({reinforcementCount})
                  </button>
                </div>

                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                  Câu {(index % poolItems.length) + 1}/{poolItems.length}
                </span>
              </div>

              <div
                style={{
                  borderRadius: 15,
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  padding: 13,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>
                    Kèo của bố: {current.topic} • {current.sourceRef}
                    {isCurrentReinforce && !isCurrentMastered ? ' • Cần củng cố' : ''}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {quickCheck && (
                      <button
                        type="button"
                        onClick={() => setQuickCheckOpen((v) => !v)}
                        style={{
                          borderRadius: 9999,
                          border: '1px solid #fdba74',
                          backgroundColor: '#fff7ed',
                          color: '#c2410c',
                          padding: '3px 9px',
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {quickCheckOpen ? 'Ẩn câu hỏi bố' : 'Câu hỏi bố'}
                      </button>
                    )}
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
                      {isCurrentMastered ? 'Đã chinh phục ✓' : 'Đánh dấu đã thuộc'}
                    </button>
                  </div>
                </div>

                <p
                  style={{
                    margin: '7px 0 0',
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.5,
                  }}
                >
                  {current.prompt}
                </p>
              </div>

              {quickCheckOpen && quickCheck && (
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
                  <strong>Bố hỏi thăm dò: {quickCheck.question}</strong>
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
                            border: `1px solid ${
                              picked ? (ok ? '#10b981' : '#fb7185') : '#fdba74'
                            }`,
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
                  <strong>Bố bật mí chỗ dễ vấp:</strong> {current.commonMistake}
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
                      className="dad-btn"
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
                  <div style={{ fontWeight: 800 }}>{banterMessage}</div>
                  <div style={{ marginTop: 3 }}>
                    {isCorrect
                      ? current.parentGuide?.keyConcept ?? ''
                      : `Góc nhớ (${ERROR_CATEGORY_LABELS[current.errorCategory]}): ${current.commonMistake}`}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 7 }}>
                <button
                  type="button"
                  onClick={handleOpenHint}
                  className="dad-btn"
                  style={{
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    padding: '9px 10px',
                  }}
                >
                  Thẻ gợi ý ({Math.min(hintStep, safeHints.length)}/{safeHints.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowParentInline((v) => !v)}
                  className="dad-btn"
                  style={{
                    border: '1px solid #c7d2fe',
                    backgroundColor: '#eef2ff',
                    color: '#3730a3',
                    padding: '9px 10px',
                  }}
                >
                  {showParentInline ? 'Cất thẻ hỏi của bố' : 'Rút thẻ hỏi của bố'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="dad-btn"
                style={{
                  width: '100%',
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '11px 14px',
                  fontSize: 13.5,
                }}
              >
                Sang kèo tiếp theo →
              </button>
            </section>

            <aside className="dad-card" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {activeTab === 'quest' && (
                <>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                    Góc trợ giúp của HLV Bố
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
                    <strong>Bố dặn trước khi giải:</strong> {current.phaseOneCheck}
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
                      <strong style={{ color: '#92400e' }}>Thẻ gợi ý từng bước:</strong>
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
                        <strong>Chìa khóa kiến thức:</strong> {current.parentGuide?.keyConcept}
                      </div>
                      <div>
                        <strong>Bố hỏi gợi mở (không giải hộ):</strong> &ldquo;{current.parentGuide?.guidingQuestion}&rdquo;
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
                          resetPoolContext();
                        }}
                        className="dad-btn"
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
                      <div
                        style={{
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          padding: 8,
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <strong>Công thức / Quy tắc:</strong> {card.coreFormula}
                      </div>
                      <div
                        style={{
                          borderRadius: 8,
                          backgroundColor: '#fffbeb',
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
                      borderRadius: 12,
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: 11,
                      fontSize: 12,
                      color: '#064e3b',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                      lineHeight: 1.5,
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 13 }}>
                      Tổng kết kèo đấu của Khánh Ngọc
                    </div>
                    <div>
                      Đã giải <strong>{answeredCount}</strong> kèo (đúng <strong>{accuracy}%</strong>) • Kỷ lục chuỗi đúng: <strong>{bestStreak}</strong> • Đã chinh phục <strong>{masteredIds.length}</strong>/{allItems.length} bài.
                    </div>
                    <div>
                      Nhóm lỗi nổi bật nhất:{' '}
                      <strong>
                        {dominantCategory
                          ? ERROR_CATEGORY_LABELS[dominantCategory]
                          : 'Chưa ghi nhận kèo sai'}
                      </strong>
                    </div>
                    <div>
                      <strong>Câu hỏi gợi mở của bố:</strong> &ldquo;{sessionParentPrompt}&rdquo;
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: 12,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      padding: 11,
                      fontSize: 11.5,
                      color: '#334155',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ fontWeight: 800 }}>
                      Đồng bộ đám mây (Supabase):{' '}
                      {syncConfig.enabled ? 'Sẵn sàng' : 'Chưa cấu hình biến môi trường'}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        disabled={syncBusy}
                        onClick={handlePushCloud}
                        style={{
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          padding: '5px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Đẩy lên Supabase
                      </button>
                      <button
                        type="button"
                        disabled={syncBusy}
                        onClick={handlePullCloud}
                        style={{
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          padding: '5px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Tải từ Supabase
                      </button>
                    </div>
                    {syncStatusMessage && <div style={{ color: '#1e3a8a' }}>{syncStatusMessage}</div>}
                  </div>

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
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 13 }}>
                        Sổ kèo sai &amp; nhật ký gợi mở của bố
                      </div>
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
                      Tổng lần vấp: <strong>{totalWrongAttempts}</strong> • Đã gợi mở cùng con:{' '}
                      <strong>
                        {coachedIds.length}/{mistakeList.length}
                      </strong>{' '}
                      kèo • Khái niệm: <strong>{categorySummary.concept}</strong> • Bẫy/điều kiện:{' '}
                      <strong>{categorySummary.trap_condition}</strong> • Thao tác:{' '}
                      <strong>{categorySummary.execution}</strong>
                    </div>
                    <div>
                      Nguyên tắc của bố: hỏi gợi mở để con tự bật ra đáp án, tuyệt đối không làm hộ.
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
                      Chưa có kèo sai nào. Khi Khánh Ngọc lỡ sập bẫy câu nào, bố sẽ có ngay câu hỏi gợi mở tại đây để hai bố con cùng trao đổi.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {mistakeList.map((rec) => {
                        const barWidth = Math.max(
                          18,
                          Math.round((rec.wrongCount / maxWrongCount) * 100)
                        );
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
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 8,
                              }}
                            >
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
                                Vấp {rec.wrongCount} lần
                              </span>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#be123c' }}>
                              Nhóm lỗi: {ERROR_CATEGORY_LABELS[rec.errorCategory]}
                            </div>
                            <div
                              style={{
                                height: 5,
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
                            <div style={{ fontSize: 11, color: '#64748b' }}>{rec.sourceRef}</div>
                            <div
                              style={{
                                borderRadius: 8,
                                backgroundColor: '#fff1f2',
                                padding: 7,
                                color: '#881337',
                              }}
                            >
                              <strong>Chỗ dễ vấp:</strong> {rec.commonMistake}
                            </div>
                            <div
                              style={{
                                borderRadius: 8,
                                backgroundColor: '#eef2ff',
                                padding: 7,
                                color: '#1e1b4b',
                              }}
                            >
                              <strong>Bố hỏi gợi mở:</strong> &ldquo;{rec.guidingQuestion}&rdquo;
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
                                {coached ? 'Bố con đã cùng gỡ kèo ✓' : 'Đánh dấu đã gợi mở'}
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
        hints={current.hints}
        topic={current.topic}
      />
    </div>
  );
}