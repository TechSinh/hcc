import React, { useMemo, useState } from 'react';
import { SEED_ITEMS } from './data/seedQuestions';
import { LearningItem, MistakeRecord, Subject } from './types/learning';
import { SpringPunchModal } from './components/SpringPunchModal';

export default function App() {
  const [subject, setSubject] = useState<Subject>('toan');
  const [reviewWrongOnly, setReviewWrongOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'play' | 'parent'>('play');

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [hintStep, setHintStep] = useState(0);

  const [punchOpen, setPunchOpen] = useState(false);
  const [punchEnabled, setPunchEnabled] = useState(true);
  const [showParentInline, setShowParentInline] = useState(false);

  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [mistakeMap, setMistakeMap] = useState<Record<string, MistakeRecord>>({});

  const subjectItems = useMemo(
    () => SEED_ITEMS.filter((item) => item.subject === subject),
    [subject]
  );

  const poolItems: LearningItem[] = useMemo(() => {
    if (!reviewWrongOnly) return subjectItems;
    const filtered = subjectItems.filter((item) => wrongIds.includes(item.id));
    return filtered.length > 0 ? filtered : subjectItems;
  }, [reviewWrongOnly, subjectItems, wrongIds]);

  const current = poolItems[index % poolItems.length] ?? subjectItems[0];

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

    if (opt === current.correctAnswer) {
      setWrongIds((prev) => prev.filter((id) => id !== current.id));
      return;
    }

    setWrongIds((prev) => (prev.includes(current.id) ? prev : [...prev, current.id]));
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
          guidingQuestion: current.parentGuide.guidingQuestion,
          wrongCount: (existing?.wrongCount ?? 0) + 1
        }
      };
    });

    if (punchEnabled) {
      setPunchOpen(true);
    }
  };

  const handleNext = () => {
    resetQuestionState();
    setIndex((prev) => (prev + 1) % poolItems.length);
  };

  const mistakeList = Object.values(mistakeMap).sort((a, b) => b.wrongCount - a.wrongCount);
  const totalWrongAttempts = mistakeList.reduce((acc, item) => acc + item.wrongCount, 0);
  const isCorrect = selected === current.correctAnswer;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center p-3">
      <div className="w-full max-w-md rounded-3xl bg-white p-4 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <div className="text-[11px] font-medium text-slate-500">
              Học cùng con • Lớp 9 (Toán & Ngữ văn)
            </div>
            <h1 className="text-base font-bold text-slate-900">Phạm Hoàng Khánh Ngọc</h1>
          </div>
          <button
            type="button"
            onClick={() => setPunchEnabled((v) => !v)}
            className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900 active:scale-95"
          >
            Lò xo: {punchEnabled ? 'Bật' : 'Tắt'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('play')}
            className={`rounded-xl py-2 text-xs font-bold ${
              activeTab === 'play'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Chơi & Luyện tập
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('parent')}
            className={`rounded-xl py-2 text-xs font-bold ${
              activeTab === 'parent'
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-50 text-indigo-800'
            }`}
          >
            Góc phụ huynh ({totalWrongAttempts} lỗi)
          </button>
        </div>

        {activeTab === 'play' ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSwitchSubject('toan')}
                className={`rounded-xl py-2 text-xs font-semibold ${
                  subject === 'toan'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Toán 9
              </button>
              <button
                type="button"
                onClick={() => handleSwitchSubject('van')}
                className={`rounded-xl py-2 text-xs font-semibold ${
                  subject === 'van'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Ngữ văn 9
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs border border-slate-200">
              <span className="text-slate-600">
                Câu {(index % poolItems.length) + 1}/{poolItems.length}
                {reviewWrongOnly ? ' (Đang ôn câu sai)' : ''}
              </span>
              <button
                type="button"
                onClick={handleToggleWrongReview}
                className={`rounded-lg px-2.5 py-1 font-semibold ${
                  reviewWrongOnly
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {reviewWrongOnly ? 'Thoát ôn câu sai' : `Ôn câu sai (${wrongIds.length})`}
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">
                {current.topic} • {current.sourceRef}
              </div>
              <p className="mt-1.5 text-sm font-semibold text-slate-900 leading-relaxed">
                {current.prompt}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {current.options.map((opt) => {
                const chosen = selected === opt;
                const style = !chosen
                  ? 'border-slate-200 bg-white text-slate-800'
                  : opt === current.correctAnswer
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold'
                  : 'border-rose-400 bg-rose-50 text-rose-950';

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full rounded-xl border px-3.5 py-3 text-left text-sm transition active:scale-[0.99] ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selected && (
              <div
                className={`rounded-xl p-3 text-xs leading-relaxed ${
                  isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                }`}
              >
                {isCorrect
                  ? 'Chính xác! Con đã nắm vững bước làm câu này.'
                  : `Chưa đúng. Lưu ý: ${current.commonMistake}`}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHintStep((s) => Math.min(s + 1, current.hints.length))}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 active:scale-95"
              >
                Gợi ý ({Math.min(hintStep, current.hints.length)}/{current.hints.length})
              </button>
              <button
                type="button"
                onClick={() => setShowParentInline((v) => !v)}
                className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-xs font-semibold text-indigo-800 active:scale-95"
              >
                {showParentInline ? 'Ẩn gợi ý bố mẹ' : 'Gợi ý cho bố mẹ'}
              </button>
            </div>

            {hintStep > 0 && (
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-950 space-y-1">
                {current.hints.slice(0, hintStep).map((h, i) => (
                  <div key={i}>
                    • Bước {i + 1}: {h}
                  </div>
                ))}
              </div>
            )}

            {showParentInline && (
              <div className="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-950 space-y-1.5 border border-indigo-200">
                <div>
                  <strong>Kiến thức cốt lõi:</strong> {current.parentGuide.keyConcept}
                </div>
                <div>
                  <strong>Câu hỏi gợi mở cho con:</strong> "{current.parentGuide.guidingQuestion}"
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="mt-1 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white active:scale-95"
            >
              Câu tiếp theo →
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl bg-indigo-50 p-3.5 border border-indigo-200 text-xs text-indigo-950 space-y-1">
              <div className="font-bold text-sm">Bảng thống kê lỗi sai & đồng hành cùng con</div>
              <div>
                Tổng số lần làm sai ghi nhận: <strong>{totalWrongAttempts}</strong> ({mistakeList.length} dạng/câu)
              </div>
              <div>
                Nguyên tắc: bố mẹ dùng câu hỏi gợi mở bên dưới để con tự tìm ra hướng làm, tránh làm hộ.
              </div>
            </div>

            {mistakeList.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600">
                Chưa có lỗi sai nào được ghi nhận trong phiên này. Khi Khánh Ngọc chọn sai câu nào, hệ thống sẽ tổng hợp ngay tại đây.
              </div>
            ) : (
              <div className="space-y-2.5">
                {mistakeList.map((rec) => (
                  <div
                    key={rec.itemId}
                    className="rounded-2xl border border-slate-200 bg-white p-3.5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {rec.subject === 'toan' ? 'Toán 9' : 'Ngữ văn 9'} • {rec.topic}
                      </span>
                      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-bold text-rose-800">
                        Sai {rec.wrongCount} lần
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{rec.sourceRef}</div>
                    <div className="rounded-lg bg-rose-50 p-2 text-rose-950">
                      <strong>Lỗi sai:</strong> {rec.commonMistake}
                    </div>
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-950">
                      <strong>Hỏi gợi mở cho con:</strong> "{rec.guidingQuestion}"
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
        guidingQuestion={current.parentGuide.guidingQuestion}
      />
    </div>
  );
}