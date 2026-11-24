import React, { useEffect, useMemo, useState } from 'react';
import {
  CORE_SEED_ITEMS,
  EXAM_FORMULA_CARDS,
  EXTRA_MOCK_EXAM_ITEMS,
} from './data/seedQuestions';
import type { LearningItem, MistakeRecord, Subject } from './data/seedQuestions';
import { SpringPunchModal } from './components/SpringPunchModal';

const MISTAKE_STORAGE_KEY = 'hcc_l9_mistakes_v12';
const EXTRA_PACK_STORAGE_KEY = 'hcc_l9_extra_pack_v12';

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

export default function App() {
  const [subject, setSubject] = useState<Subject>('toan');
  const [reviewWrongOnly, setReviewWrongOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'play' | 'formulas' | 'parent'>('play');

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

  const subjectFormulaCards = useMemo(() => {
    const cards = Array.isArray(EXAM_FORMULA_CARDS) ? EXAM_FORMULA_CARDS : [];
    return cards.filter((card) => card.subject === subject);
  }, [subject]);

  const poolItems: LearningItem[] = useMemo(() => {
    if (!reviewWrongOnly) return subjectItems;
    const filtered = subjectItems.filter((item) => wrongIds.includes(item.id));
    return filtered.length > 0 ? filtered : subjectItems;
  }, [reviewWrongOnly, subjectItems, wrongIds]);

  const safePool = poolItems.length > 0 ? poolItems : [FALLBACK_ITEM];
  const current: LearningItem = safePool[index % safePool.length] ?? FALLBACK_ITEM;
  const safeOptions = Array.isArray(current.options) ? current.options : [];
  const safeHints = Array.isArray(current.hints) ? current.hints : [];

  const resetQuestionState = () => {
    setSelected(null);
    setHintStep(0);
    setShowParentInline(false);
  };

  const handleSwitchSubject = (nextSubject: Subject) => {
    setSubject(nextSubject);
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
    if (opt === current.correctAnswer) return;

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
    setIndex((prev) => (prev + 1) % safePool.length);
  };

  const mistakeList = Object.values(mistakeMap).sort((a, b) => b.wrongCount - a.wrongCount);
  const totalWrongAttempts = mistakeList.reduce((acc, item) => acc + item.wrongCount, 0);
  const isCorrect = selected === current.correctAnswer;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#e2e8f0',
        display: 'flex',
        justifyContent: 'center',
        padding: 12,
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 24,
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: 16,
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignSelf: 'flex-start',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: 10,
            gap: 8,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
              Học cùng con • Lớp 9 (Toán &amp; Ngữ văn)
            </div>
            <h1 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Phạm Hoàng Khánh Ngọc
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setPunchEnabled((v) => !v)}
            style={{
              borderRadius: 9999,
              border: '1px solid #fcd34d',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Lò xo: {punchEnabled ? 'Bật' : 'Tắt'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          <button
            type="button"
            onClick={() => setActiveTab('play')}
            style={{
              borderRadius: 12,
              border: 'none',
              padding: '9px 6px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'play' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'play' ? '#ffffff' : '#334155',
            }}
          >
            Luyện tập
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('formulas')}
            style={{
              borderRadius: 12,
              border: 'none',
              padding: '9px 6px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'formulas' ? '#1d4ed8' : '#eff6ff',
              color: activeTab === 'formulas' ? '#ffffff' : '#1e40af',
            }}
          >
            Đề &amp; Công thức
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parent')}
            style={{
              borderRadius: 12,
              border: 'none',
              padding: '9px 6px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: activeTab === 'parent' ? '#4338ca' : '#eef2ff',
              color: activeTab === 'parent' ? '#ffffff' : '#3730a3',
            }}
          >
            Phụ huynh ({totalWrongAttempts})
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <button
            type="button"
            onClick={() => handleSwitchSubject('toan')}
            style={{
              borderRadius: 12,
              border: 'none',
              padding: '9px 10px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: subject === 'toan' ? '#2563eb' : '#f1f5f9',
              color: subject === 'toan' ? '#ffffff' : '#334155',
            }}
          >
            Toán 9
          </button>
          <button
            type="button"
            onClick={() => handleSwitchSubject('van')}
            style={{
              borderRadius: 12,
              border: 'none',
              padding: '9px 10px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: subject === 'van' ? '#059669' : '#f1f5f9',
              color: subject === 'van' ? '#ffffff' : '#334155',
            }}
          >
            Ngữ văn 9
          </button>
        </div>

        {activeTab === 'play' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 12,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '8px 12px',
                fontSize: 12,
              }}
            >
              <span style={{ color: '#475569', fontWeight: 600 }}>
                Câu {(index % safePool.length) + 1}/{safePool.length}
                {reviewWrongOnly ? ' (Ôn câu sai)' : ''}
              </span>
              <button
                type="button"
                onClick={handleToggleWrongReview}
                style={{
                  borderRadius: 8,
                  border: reviewWrongOnly ? 'none' : '1px solid #fecdd3',
                  backgroundColor: reviewWrongOnly ? '#e11d48' : '#fff1f2',
                  color: reviewWrongOnly ? '#ffffff' : '#be123c',
                  padding: '5px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {reviewWrongOnly ? 'Thoát ôn sai' : `Ôn câu sai (${wrongIds.length})`}
              </button>
            </div>

            <div
              style={{
                borderRadius: 16,
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                {current.topic} • {current.sourceRef}
              </div>
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.5,
                }}
              >
                {current.prompt}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {safeOptions.map((opt) => {
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
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      border: `1.5px solid ${border}`,
                      backgroundColor: bg,
                      color,
                      padding: '11px 14px',
                      textAlign: 'left',
                      fontSize: 13,
                      fontWeight,
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div
                style={{
                  borderRadius: 12,
                  padding: 12,
                  fontSize: 12,
                  lineHeight: 1.5,
                  backgroundColor: isCorrect ? '#ecfdf5' : '#fff1f2',
                  color: isCorrect ? '#065f46' : '#9f1239',
                  border: `1px solid ${isCorrect ? '#a7f3d0' : '#fecdd3'}`,
                }}
              >
                {isCorrect
                  ? 'Chính xác! Con đã nắm vững bước làm câu này.'
                  : `Chưa đúng. Lưu ý: ${current.commonMistake}`}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              <button
                type="button"
                onClick={() => setHintStep((s) => Math.min(s + 1, safeHints.length))}
                style={{
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  padding: '10px 8px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Gợi ý ({Math.min(hintStep, safeHints.length)}/{safeHints.length})
              </button>
              <button
                type="button"
                onClick={() => setShowParentInline((v) => !v)}
                style={{
                  borderRadius: 12,
                  border: '1px solid #c7d2fe',
                  backgroundColor: '#eef2ff',
                  color: '#3730a3',
                  padding: '10px 8px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {showParentInline ? 'Ẩn gợi ý bố mẹ' : 'Gợi ý cho bố mẹ'}
              </button>
            </div>

            {hintStep > 0 && (
              <div
                style={{
                  borderRadius: 12,
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  padding: 12,
                  fontSize: 12,
                  color: '#78350f',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
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
                  padding: 12,
                  fontSize: 12,
                  color: '#1e1b4b',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
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

            <button
              type="button"
              onClick={handleNext}
              style={{
                width: '100%',
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Câu tiếp theo →
            </button>
          </div>
        )}

        {activeTab === 'formulas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            {subject === 'toan' && (
              <div
                style={{
                  borderRadius: 16,
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: 14,
                  color: '#1e3a8a',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>Gói đề thi thử vào 10 môn Toán</div>
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
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    border: 'none',
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                    padding: '10px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
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
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{card.topic}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{card.weightNote}</div>
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
                borderRadius: 16,
                backgroundColor: '#eef2ff',
                border: '1px solid #c7d2fe',
                padding: 14,
                fontSize: 12,
                color: '#1e1b4b',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Bảng thống kê lỗi sai &amp; đồng hành</div>
                {mistakeList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetMistakes}
                    style={{
                      borderRadius: 8,
                      border: '1px solid #a5b4fc',
                      backgroundColor: '#ffffff',
                      color: '#312e81',
                      padding: '4px 10px',
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
                Tổng số lần làm sai ghi nhận: <strong>{totalWrongAttempts}</strong> ({mistakeList.length} dạng/câu)
              </div>
              <div>
                Nguyên tắc: bố mẹ dùng câu hỏi gợi mở bên dưới để con tự tìm ra hướng làm, tránh làm hộ.
              </div>
            </div>

            {mistakeList.length === 0 ? (
              <div
                style={{
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  padding: 16,
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#475569',
                }}
              >
                Chưa có lỗi sai nào được ghi nhận. Khi Khánh Ngọc chọn sai câu nào, hệ thống sẽ tự lưu và tổng hợp tại đây.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {mistakeList.map((rec) => (
                  <div
                    key={rec.itemId}
                    style={{
                      borderRadius: 16,
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      padding: 12,
                      fontSize: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        {rec.subject === 'toan' ? 'Toán 9' : 'Ngữ văn 9'} • {rec.topic}
                      </span>
                      <span
                        style={{
                          borderRadius: 9999,
                          backgroundColor: '#ffe4e6',
                          color: '#9f1239',
                          padding: '2px 10px',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        Sai {rec.wrongCount} lần
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{rec.sourceRef}</div>
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
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <SpringPunchModal
        open={punchOpen}
        onClose={() => setPunchOpen(false)}
        mistakeNote={current.commonMistake}
        guidingQuestion={current.parentGuide?.guidingQuestion ?? ''}
      />
    </div>
  );
}