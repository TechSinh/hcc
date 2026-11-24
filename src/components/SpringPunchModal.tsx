import React, { useEffect, useState } from 'react';

interface SpringPunchModalProps {
  open: boolean;
  onClose: () => void;
  mistakeNote: string;
  guidingQuestion: string;
  hints?: string[];
  topic: string;
}

export const SpringPunchModal: React.FC<SpringPunchModalProps> = ({
  open,
  onClose,
  mistakeNote,
  guidingQuestion,
  hints = [],
  topic,
}) => {
  const [revealedHintCount, setRevealedHintCount] = useState(0);

  useEffect(() => {
    if (open) {
      setRevealedHintCount(0);
    }
  }, [open, topic, guidingQuestion]);

  if (!open) return null;

  const safeHints = Array.isArray(hints) ? hints : [];
  const hasMoreHints = revealedHintCount < safeHints.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(4px)',
        padding: 16,
      }}
    >
      <style>{`
        @keyframes springPunchIn {
          0% { transform: translateY(-36px) scale(0.72) rotate(-16deg); opacity: 0; }
          45% { transform: translateY(8px) scale(1.08) rotate(8deg); opacity: 1; }
          72% { transform: translateY(-5px) scale(0.97) rotate(-4deg); opacity: 1; }
          100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes gloveBob {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-6px) rotate(5deg); }
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 26,
          border: '2px solid #f59e0b',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: 22,
          textAlign: 'center',
          boxShadow: '0 26px 54px rgba(15, 23, 42, 0.38)',
          animation: 'springPunchIn 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            margin: '0 auto 12px',
            borderRadius: 9999,
            background: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 44,
            userSelect: 'none',
            animation: 'gloveBob 1.3s ease-in-out infinite',
          }}
        >
          🥊
        </div>

        <div
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: '#b45309',
            backgroundColor: '#fef3c7',
            padding: '4px 10px',
            borderRadius: 9999,
          }}
        >
          Boing! Lò xo của bố bật ra! • {topic}
        </div>

        <h2
          style={{
            margin: '10px 0 0',
            fontSize: 18.5,
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.32,
          }}
        >
          Hì, bố gài nhẹ một cú—con soi lại xem lật kèo được không!
        </h2>

        <div style={{ marginTop: 14, textAlign: 'left', fontSize: 12.5, lineHeight: 1.55 }}>
          <div
            style={{
              borderRadius: 14,
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              padding: 12,
              color: '#881337',
              marginBottom: 10,
            }}
          >
            <strong>Chỗ dễ vấp ở kèo này:</strong> {mistakeNote}
          </div>
          <div
            style={{
              borderRadius: 14,
              backgroundColor: '#eef2ff',
              border: '1px solid #c7d2fe',
              padding: 12,
              color: '#1e1b4b',
            }}
          >
            <strong>Bố hỏi gợi mở cho con:</strong> &ldquo;{guidingQuestion}&rdquo;
          </div>

          {revealedHintCount > 0 && (
            <div
              style={{
                marginTop: 10,
                borderRadius: 14,
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                padding: 12,
                color: '#78350f',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <strong style={{ color: '#92400e' }}>Gợi ý thêm của bố:</strong>
              {safeHints.slice(0, revealedHintCount).map((hintText, idx) => (
                <div key={idx}>
                  • Bước {idx + 1}: {hintText}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hasMoreHints && (
            <button
              type="button"
              onClick={() => setRevealedHintCount((c) => Math.min(c + 1, safeHints.length))}
              style={{
                width: '100%',
                minHeight: 42,
                borderRadius: 14,
                border: '1px solid #f59e0b',
                backgroundColor: '#fffbeb',
                color: '#92400e',
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Xin bố gợi ý thêm 1 bước ({revealedHintCount}/{safeHints.length})
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              minHeight: 46,
              borderRadius: 14,
              border: 'none',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Thu lò xo &amp; Con tự giải lại ngay!
          </button>
        </div>
      </div>
    </div>
  );
};