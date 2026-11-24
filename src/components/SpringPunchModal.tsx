import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  mistakeNote: string;
}

export const SpringPunchModal: React.FC<Props> = ({ open, onClose, mistakeNote }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl border-2 border-amber-400 animate-bounce">
        <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-5xl select-none">
          🥊
        </div>
        <div className="text-xs font-bold uppercase tracking-wide text-amber-700">
          Boing! Nắm đấm lò xo bật ra!
        </div>
        <h3 className="mt-1 text-lg font-bold text-slate-900">
          Suýt trúng đích rồi! Xem lại chỗ này nhé
        </h3>
        <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-slate-700 text-left">
          <strong>Lỗi hay gặp:</strong> {mistakeNote}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white active:scale-95"
        >
          Thử lại ngay
        </button>
      </div>
    </div>
  );
};