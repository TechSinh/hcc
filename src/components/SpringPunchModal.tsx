import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  mistakeNote: string;
  guidingQuestion: string;
}

export const SpringPunchModal: React.FC<Props> = ({
  open,
  onClose,
  mistakeNote,
  guidingQuestion
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-sm rounded-3xl border-2 border-amber-400 bg-white p-5 text-center shadow-2xl animate-bounce">
        <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-5xl select-none">
          🥊
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
          Boing! Nắm đấm lò xo bật ra!
        </div>
        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Giật mình chưa con? Xem lại chỗ này nhé!
        </h3>

        <div className="mt-3 space-y-2 text-left text-xs">
          <div className="rounded-xl bg-amber-50 p-3 text-slate-800">
            <strong className="text-amber-900">Lỗi hay gặp:</strong> {mistakeNote}
          </div>
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-950">
            <strong>Gợi ý hỏi nhanh:</strong> "{guidingQuestion}"
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white active:scale-95"
        >
          Gỡ lò xo & Thử lại ngay
        </button>
      </div>
    </div>
  );
};