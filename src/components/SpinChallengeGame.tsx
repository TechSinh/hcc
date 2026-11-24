import React, { useMemo, useState } from 'react';
import type { LearningItem, Subject } from '../data/seedQuestions';

type TurnSide = 'dad' | 'kid';
type FunRuleId = 'no_hint_pride' | 'dad_guiding_only' | 'spring_mood';

interface SpinOutcome {
  id: string;
  side: TurnSide;
  label: string;
  actorBadge: string;
  description: string;
  targetSubject?: Subject;
  suggestedQuestion?: LearningItem;
}

interface FunRuleCard {
  id: FunRuleId;
  title: string;
  detail: string;
}

const FUN_RULE_CARDS: FunRuleCard[] = [
  {
    id: 'no_hint_pride',
    title: 'Luật "Tự lực cánh sinh"',
    detail: 'Khánh Ngọc tự soi đề trong 16 tuần trước khi bấm gợi ý; giải trúng được bố khen một câu đặc biệt!',
  },
  {
    id: 'dad_guiding_only',
    title: 'Luật "Bố chỉ hỏi gợi mở"',
    detail: 'Khi vấp kèo, bố chỉ dùng câu hỏi gợi mở ngắn để con tự tìm ra hướng làm, tuyệt đối không làm thay.',
  },
  {
    id: 'spring_mood',
    title: 'Luật "Tùy hứng lò xo"',
    detail: 'Hai bố con thống nhất bật lò xo cho vui nhộn hoặc tắt đi khi muốn giữ nhịp nhẹ nhàng.',
  },
];

const MINI_ROUND_STEPS = 4;

interface SpinChallengeGameProps {
  items16Weeks: LearningItem[];
  currentSubject: Subject;
  punchEnabled: boolean;
  onTogglePunch: () => void;
  onJumpToQuestion: (item: LearningItem) => void;
  onBackToQuest: () => void;
}

export const SpinChallengeGame: React.FC<SpinChallengeGameProps> = ({
  items16Weeks,
  currentSubject,
  punchEnabled,
  onTogglePunch,
  onJumpToQuestion,
  onBackToQuest,
}) => {
  const [turnSide, setTurnSide] = useState<TurnSide>('dad');
  const [selectedRule, setSelectedRule] = useState<FunRuleId>('dad_guiding_only');
  const [spinIndex, setSpinIndex] = useState(0);
  const [spinningAnim, setSpinningAnim] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [roundCleared, setRoundCleared] = useState(false);
  const [statusNote, setStatusNote] = useState<string>(
    'Bố bấm "Quay đổi kèo" để mở lượt đầu tiên cho Khánh Ngọc nhé!'
  );

  const outcomes = useMemo<SpinOutcome[]>(() => {
    const safePool = Array.isArray(items16Weeks) ? items16Weeks : [];
    const toanItems = safePool.filter((i) => i.subject === 'toan');
    const vanItems = safePool.filter((i) => i.subject === 'van');

    const pickedToan =
      toanItems.length > 0 ? toanItems[spinIndex % toanItems.length] : safePool[0];
    const pickedVan =
      vanItems.length > 0 ? vanItems[spinIndex % vanItems.length] : safePool[0];

    const dadList: SpinOutcome[] = [
      {
        id: 'dad-toan-16w',
        side: 'dad',
        label: 'Bố tung kèo Toán 9 (≤16 tuần)',
        actorBadge: 'PHE BỐ • RA KÈO',
        description:
          'Bố chọn một kèo Toán 9 trong phạm vi 16 tuần đầu. Con đọc kỹ điều kiện/phép tính rồi tự giải xem có qua mặt được bố không!',
        targetSubject: 'toan',
        suggestedQuestion: pickedToan,
      },
      {
        id: 'dad-van-16w',
        side: 'dad',
        label: 'Bố tung kèo Ngữ văn 9 (≤16 tuần)',
        actorBadge: 'PHE BỐ • RA KÈO',
        description:
          'Bố đổi sang kèo Ngữ văn 9 (bám ngữ liệu, giải pháp thực tế hoặc lập luận luận điểm). Con thử bắt đúng trọng tâm nhé!',
        targetSubject: 'van',
        suggestedQuestion: pickedVan,
      },
      {
        id: 'dad-guiding-card',
        side: 'dad',
        label: 'Bố rút "Thẻ hỏi gợi mở" (không giải hộ)',
        actorBadge: 'PHE BỐ • GỢI MỞ',
        description: pickedToan?.parentGuide?.guidingQuestion
          ? `Bố đố miệng gợi mở (không làm hộ): "${pickedToan.parentGuide.guidingQuestion}"`
          : 'Bố đặt một câu hỏi gợi mở ngắn để Khánh Ngọc tự chỉ ra cách làm của riêng mình.',
        suggestedQuestion: pickedToan,
      },
    ];

    const kidList: SpinOutcome[] = [
      {
        id: 'kid-flip-toan',
        side: 'kid',
        label: 'Khánh Ngọc "Lật kèo" sang Toán 9',
        actorBadge: 'PHE CON • LẬT KÈO',
        description:
          'Con giành quyền đổi sang mạch Toán 9 trong 16 tuần đầu để chứng minh phong độ với bố!',
        targetSubject: 'toan',
        suggestedQuestion: pickedToan,
      },
      {
        id: 'kid-flip-van',
        side: 'kid',
        label: 'Khánh Ngọc "Lật kèo" sang Ngữ văn 9',
        actorBadge: 'PHE CON • LẬT KÈO',
        description:
          'Con giành quyền đổi sang mạch Ngữ văn 9 trong 16 tuần đầu và chọn kèo thử thách ngay!',
        targetSubject: 'van',
        suggestedQuestion: pickedVan,
      },
      {
        id: 'kid-spring-gag',
        side: 'kid',
        label: 'Con ra lệnh cho "Nắm đấm lò xo"',
        actorBadge: 'PHE CON • ĐỔI NHỊP',
        description: `Lò xo của bố hiện đang ${
          punchEnabled ? 'BẬT' : 'TẮT'
        }. Khánh Ngọc muốn bật hay tắt lò xo cho kèo tiếp theo nào?`,
      },
    ];

    return turnSide === 'dad' ? dadList : kidList;
  }, [items16Weeks, spinIndex, turnSide, punchEnabled]);

  const activeOutcome = outcomes[spinIndex % outcomes.length];
  const currentStepInRound = turnCount % MINI_ROUND_STEPS;
  const completedStepsDisplay = roundCleared ? MINI_ROUND_STEPS : currentStepInRound;
  const activeRuleCard =
    FUN_RULE_CARDS.find((r) => r.id === selectedRule) ?? FUN_RULE_CARDS[1];

  const handleSpin = () => {
    setSpinningAnim(true);
    const nextTurn = turnCount + 1;
    setTurnCount(nextTurn);
    setSpinIndex((prev) => prev + 1);

    if (nextTurn % MINI_ROUND_STEPS === 0) {
      setRoundCleared(true);
      setStatusNote(
        'Tròn 4 lượt xả hơi của hai bố con! Con có thể quay vòng mới hoặc vào giải kèo chính.'
      );
    } else {
      setRoundCleared(false);
      setStatusNote(
        turnSide === 'dad'
          ? 'Bố vừa tung kèo xong—mời tuyển thủ Khánh Ngọc đón kèo!'
          : 'Khánh Ngọc vừa lật kèo xong—bố xem con xử lý ra sao!'
      );
    }

    window.setTimeout(() => {
      setSpinningAnim(false);
    }, 360);
  };

  const handleStartFreshMiniRound = () => {
    setRoundCleared(false);
    setTurnCount(0);
    setSpinIndex((prev) => prev + 1);
    setStatusNote('Đã mở đợt xả hơi mới (4 lượt). Bố và con tiếp tục tung hứng nào!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <style>{`
        @keyframes wheelHop {
          0% { transform: rotate(0deg) scale(0.96); }
          50% { transform: rotate(180deg) scale(1.04); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .wheel-spin-badge {
          animation: wheelHop 0.36s ease-out;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          borderRadius: 16,
          backgroundColor: '#fff7ed',
          border: '1px solid #fed7aa',
          padding: 13,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: '#c2410c',
              textTransform: 'uppercase',
            }}
          >
            Mini Game 5–10 phút • 2 phe Bố/Con • Phạm vi 16 tuần đầu
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
            Vòng Quay Đổi Kèo: Bố Thách – Con Giải
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
            Tổng lượt: <strong>{turnCount}</strong> • Môn hiện tại:{' '}
            <strong>{currentSubject === 'toan' ? 'Toán 9' : 'Ngữ văn 9'}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToQuest}
          style={{
            minHeight: 40,
            borderRadius: 11,
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ← Về đấu trí chính
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            setTurnSide('dad');
            setStatusNote('Đang ở lượt Phe Bố: bố chọn kèo thách đấu hoặc thẻ gợi mở.');
          }}
          style={{
            minHeight: 42,
            borderRadius: 12,
            border: turnSide === 'dad' ? 'none' : '1px solid #cbd5e1',
            backgroundColor: turnSide === 'dad' ? '#ea580c' : '#ffffff',
            color: turnSide === 'dad' ? '#ffffff' : '#334155',
            fontSize: 12.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Phe Bố tung kèo
        </button>
        <button
          type="button"
          onClick={() => {
            setTurnSide('kid');
            setStatusNote('Đang ở lượt Phe Con: Khánh Ngọc lật kèo môn học hoặc đổi nhịp lò xo.');
          }}
          style={{
            minHeight: 42,
            borderRadius: 12,
            border: turnSide === 'kid' ? 'none' : '1px solid #cbd5e1',
            backgroundColor: turnSide === 'kid' ? '#059669' : '#ffffff',
            color: turnSide === 'kid' ? '#ffffff' : '#334155',
            fontSize: 12.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Phe Con lật kèo
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
        {Array.from({ length: MINI_ROUND_STEPS }).map((_, idx) => {
          const done = idx < completedStepsDisplay;
          const active = !roundCleared && idx === currentStepInRound;
          return (
            <div
              key={idx}
              style={{
                borderRadius: 10,
                padding: '6px 8px',
                fontSize: 11,
                fontWeight: 800,
                textAlign: 'center',
                border: `1.5px solid ${
                  done ? '#10b981' : active ? '#ea580c' : '#cbd5e1'
                }`,
                backgroundColor: done ? '#ecfdf5' : active ? '#fff7ed' : '#ffffff',
                color: done ? '#047857' : active ? '#c2410c' : '#64748b',
              }}
            >
              {done ? `Lượt ${idx + 1} ✓` : `Lượt ${idx + 1}`}
            </div>
          );
        })}
      </div>

      {roundCleared && (
        <div
          style={{
            borderRadius: 16,
            border: '2px solid #10b981',
            backgroundColor: '#ecfdf5',
            padding: 13,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: '#064e3b' }}>
            Hoàn thành mốc {MINI_ROUND_STEPS} lượt xả hơi! Hai bố con đã nạp đủ năng lượng vui vẻ.
          </div>
          <button
            type="button"
            onClick={handleStartFreshMiniRound}
            style={{
              minHeight: 38,
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#059669',
              color: '#ffffff',
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Quay vòng 4 lượt mới
          </button>
        </div>
      )}

      <div
        style={{
          borderRadius: 18,
          border: '2px solid #f59e0b',
          backgroundColor: '#ffffff',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <div
            className={spinningAnim ? 'wheel-spin-badge' : undefined}
            style={{
              width: 52,
              height: 52,
              borderRadius: 9999,
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            🎯
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: 10.5,
                fontWeight: 900,
                backgroundColor: turnSide === 'dad' ? '#ffedd5' : '#d1fae5',
                color: turnSide === 'dad' ? '#c2410c' : '#065f46',
                padding: '2px 8px',
                borderRadius: 9999,
              }}
            >
              {activeOutcome.actorBadge}
            </span>
            <div style={{ fontSize: 16.5, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {activeOutcome.label}
            </div>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
          {activeOutcome.description}
        </p>

        {activeOutcome.suggestedQuestion && (
          <div
            style={{
              borderRadius: 12,
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: 11,
              fontSize: 12,
              color: '#0f172a',
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 800, color: '#475569', fontSize: 11 }}>
              Kèo gợi ý ({activeOutcome.suggestedQuestion.sourceRef})
            </div>
            <div style={{ marginTop: 4, fontWeight: 700 }}>
              {activeOutcome.suggestedQuestion.prompt}
            </div>
          </div>
        )}

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
            gap: 7,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {FUN_RULE_CARDS.map((rule) => {
              const active = rule.id === selectedRule;
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setSelectedRule(rule.id)}
                  style={{
                    borderRadius: 8,
                    border: active ? 'none' : '1px solid #a5b4fc',
                    backgroundColor: active ? '#4338ca' : '#ffffff',
                    color: active ? '#ffffff' : '#312e81',
                    padding: '4px 9px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {rule.title}
                </button>
              );
            })}
          </div>
          <div style={{ lineHeight: 1.45 }}>{activeRuleCard.detail}</div>
        </div>

        <div style={{ fontSize: 12, color: '#64748b' }}>{statusNote}</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            onClick={handleSpin}
            style={{
              flex: 1,
              minWidth: 160,
              minHeight: 44,
              borderRadius: 12,
              border: 'none',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              padding: '10px 14px',
              fontSize: 13.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            🎲 Quay đổi kèo
          </button>

          {activeOutcome.suggestedQuestion && (
            <button
              type="button"
              onClick={() => {
                if (activeOutcome.suggestedQuestion) {
                  setStatusNote('Đã chuyển sang kèo thách đấu này trên bảng chính!');
                  onJumpToQuestion(activeOutcome.suggestedQuestion);
                }
              }}
              style={{
                flex: 1,
                minWidth: 160,
                minHeight: 44,
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Vào giải kèo này →
            </button>
          )}

          {activeOutcome.id === 'kid-spring-gag' && (
            <button
              type="button"
              onClick={() => {
                onTogglePunch();
                setStatusNote(
                  `Hai bố con vừa đổi trạng thái lò xo sang: ${!punchEnabled ? 'BẬT' : 'TẮT'}.`
                );
              }}
              style={{
                minHeight: 44,
                borderRadius: 12,
                border: '1px solid #f59e0b',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '10px 14px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Đổi lò xo ({punchEnabled ? 'Đang bật' : 'Đang tắt'})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};