import React from 'react';

interface SpringPunchModalProps {
  open: boolean;
  onClose: () => void;
  mistakeNote: string;
  guidingQuestion: string;
  topic: string;
}

export const SpringPunchModal: React.FC<SpringPunchModalProps> = ({
  open,
  onClose,
  mistakeNote,
  guidingQuestion,
  topic,
}) => {
  if (!open) return null;

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
            letterSpacing: '0.08em',
            color: '#b45309',
            backgroundColor: '#fef3c7',
            padding: '4px 10px',
            borderRadius: 9999,
          }}
        >
          Boing! Nắm đấm lò xo bật ra! • {topic}
        </div>

        <h2
          style={{
            margin: '10px 0 0',
            fontSize: 19,
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.3,
          }}
        >
          Dừng lại một nhịp! Bắt đúng bẫy tư duy nhé
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
            <strong>Lỗi hay gặp ở dạng này:</strong> {mistakeNote}
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
            <strong>Câu hỏi gợi mở (không giải hộ):</strong> &ldquo;{guidingQuestion}&rdquo;
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 16,
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
          Thu lò xo &amp; Tự làm lại bước này
        </button>
      </div>
    </div>
  );
};