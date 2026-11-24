import React, { useEffect, useRef, useState } from 'react';

type LabMode = 'parabola' | 'linear';

export const VisualDesmosLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [labMode, setLabMode] = useState<LabMode>('parabola');
  const [coeffA, setCoeffA] = useState<number>(1);
  const [coeffB, setCoeffB] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = 28; // 1 đơn vị = 28px

    ctx.clearRect(0, 0, width, height);

    // Nền lưới tọa độ kiểu Desmos
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = cx % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = cy % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Trục Ox và Oy
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Nhãn trục O, x, y
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('x', width - 16, cy - 8);
    ctx.fillText('y', cx + 8, 16);
    ctx.fillText('O', cx + 6, cy + 14);

    // Vẽ đồ thị hàm số
    ctx.strokeStyle = labMode === 'parabola' ? '#2563eb' : '#059669';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let started = false;
    for (let px = 0; px <= width; px += 2) {
      const mathX = (px - cx) / scale;
      const mathY =
        labMode === 'parabola' ? coeffA * mathX * mathX : coeffA * mathX + coeffB;
      const py = cy - mathY * scale;

      if (py < -200 || py > height + 200) {
        started = false;
        continue;
      }

      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Đánh dấu đỉnh (0;0) với y = ax^2 hoặc giao điểm Oy (0;b) với y = ax + b
    const markX = cx;
    const markY = cy - (labMode === 'parabola' ? 0 : coeffB) * scale;
    if (markY >= 0 && markY <= height) {
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(markX, markY, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [labMode, coeffA, coeffB]);

  const formulaText =
    labMode === 'parabola'
      ? `y = ${coeffA === 1 ? '' : coeffA === -1 ? '-' : coeffA}x²`
      : `y = ${coeffA === 1 ? '' : coeffA === -1 ? '-' : coeffA}x ${
          coeffB >= 0 ? `+ ${coeffB}` : `- ${Math.abs(coeffB)}`
        }`;

  const shapeNote =
    labMode === 'parabola'
      ? coeffA > 0
        ? 'Bề lõm hướng lên (a > 0), đỉnh tại O(0; 0).'
        : coeffA < 0
        ? 'Bề lõm hướng xuống (a < 0), đỉnh tại O(0; 0).'
        : 'Khi a = 0, đồ thị suy biến thành đường thẳng y = 0.'
      : `Hệ số góc a = ${coeffA}; tung độ gốc khi x = 0 là y = ${coeffB}.`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: '#0f172a' }}>
            Phòng Lab Đồ Thị Trực Quan (phong cách Desmos)
          </div>
          <div style={{ fontSize: 12, color: '#475569' }}>
            Kéo thanh trượt tham số để quan sát trực quan tính chất hàm số Toán 9
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={() => {
              setLabMode('parabola');
              setCoeffB(0);
              if (coeffA === 0) setCoeffA(1);
            }}
            style={{
              borderRadius: 10,
              border: labMode === 'parabola' ? 'none' : '1px solid #cbd5e1',
              backgroundColor: labMode === 'parabola' ? '#2563eb' : '#ffffff',
              color: labMode === 'parabola' ? '#ffffff' : '#334155',
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Parabol y = ax²
          </button>
          <button
            type="button"
            onClick={() => {
              setLabMode('linear');
              if (coeffA === 0) setCoeffA(1);
            }}
            style={{
              borderRadius: 10,
              border: labMode === 'linear' ? 'none' : '1px solid #cbd5e1',
              backgroundColor: labMode === 'linear' ? '#059669' : '#ffffff',
              color: labMode === 'linear' ? '#ffffff' : '#334155',
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Đường thẳng y = ax + b
          </button>
        </div>
      </div>

      <div
        style={{
          borderRadius: 16,
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
        <canvas
          ref={canvasRef}
          width={520}
          height={280}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      <div
        style={{
          borderRadius: 14,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          fontSize: 12.5,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
          <span>Hàm số: {formulaText}</span>
          <span style={{ color: '#2563eb' }}>Hệ số a = {coeffA}</span>
        </div>

        <input
          type="range"
          min={-3}
          max={3}
          step={0.5}
          value={coeffA}
          onChange={(e) => setCoeffA(Number(e.target.value))}
          aria-label="Hệ số a"
          style={{ width: '100%', cursor: 'pointer' }}
        />

        {labMode === 'linear' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Tung độ gốc b</span>
              <span style={{ color: '#059669' }}>b = {coeffB}</span>
            </div>
            <input
              type="range"
              min={-4}
              max={4}
              step={1}
              value={coeffB}
              onChange={(e) => setCoeffB(Number(e.target.value))}
              aria-label="Hệ số b"
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </>
        )}

        <div
          style={{
            borderRadius: 10,
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: 9,
            color: '#1e3a8a',
            lineHeight: 1.5,
          }}
        >
          <strong>Nhận xét trực quan:</strong> {shapeNote}
        </div>
      </div>
    </div>
  );
};