import React from 'react';

interface SpringPunchModalProps {
  open: boolean;
  onClose: () => void;
  mistakeNote: string;
  guidingQuestion: string;
}

export const SpringPunchModal: React.FC<SpringPunchModalProps> = ({
  open,
  onClose,
  mistakeNote,
  guidingQuestion,
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          borderRadius: 24,
          border: '2px solid #f59e0b',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: 20,
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.28)',
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            margin: '0 auto 12px',
            borderRadius: 9999,
            backgroundColor: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            userSelect: 'none',
          }}
        >
          🥊
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#b45309',
          }}
        >
          Boing! Nắm đấm lò xo bật ra!
        </div>

        <h2
          style={{
            margin: '6px 0 0',
            fontSize: 18,
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          Giật mình chưa con? Xem lại chỗ này nhé!
        </h2>

        <div style={{ marginTop: 12, textAlign: 'left', fontSize: 12 }}>
          <div
            style={{
              borderRadius: 12,
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              padding: 10,
              color: '#1e293b',
              marginBottom: 8,
            }}
          >
            <strong style={{ color: '#92400e' }}>Lỗi hay gặp:</strong> {mistakeNote}
          </div>
          <div
            style={{
              borderRadius: 12,
              backgroundColor: '#eef2ff',
              border: '1px solid #c7d2fe',
              padding: 10,
              color: '#1e1b4b',
            }}
          >
            <strong>Gợi ý hỏi nhanh:</strong> &ldquo;{guidingQuestion}&rdquo;
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 16,
            width: '100%',
            borderRadius: 12,
            border: 'none',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Gỡ lò xo &amp; Thử lại ngay
        </button>
      </div>
    </div>
  );
};