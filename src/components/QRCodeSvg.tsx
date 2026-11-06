import React from 'react';

interface QRCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeSvg: React.FC<QRCodeSvgProps> = ({
  value,
  size = 110,
  className = '',
}) => {
  // Deterministic pseudo-random matrix generator based on input string hash
  // with authentic QR finder patterns at top-left, top-right, bottom-left.
  const matrixSize = 21; // standard version 1 QR size (21x21)
  
  // Simple hash for pseudo-random data bits
  const hash = Array.from(value).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 42);

  const isFinderPattern = (r: number, c: number) => {
    // Top-left finder (7x7)
    if (r <= 6 && c <= 6) return true;
    // Top-right finder (7x7)
    if (r <= 6 && c >= matrixSize - 7) return true;
    // Bottom-left finder (7x7)
    if (r >= matrixSize - 7 && c <= 6) return true;
    return false;
  };

  const isFinderBit = (r: number, c: number) => {
    // Top-left
    if (r <= 6 && c <= 6) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Top-right
    if (r <= 6 && c >= matrixSize - 7) {
      const col = c - (matrixSize - 7);
      if (r === 0 || r === 6 || col === 0 || col === 6) return true;
      if (r >= 2 && r <= 4 && col >= 2 && col <= 4) return true;
      return false;
    }
    // Bottom-left
    if (r >= matrixSize - 7 && c <= 6) {
      const row = r - (matrixSize - 7);
      if (row === 0 || row === 6 || c === 0 || c === 6) return true;
      if (row >= 2 && row <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    return false;
  };

  const grid: boolean[][] = [];
  for (let r = 0; r < matrixSize; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < matrixSize; c++) {
      if (isFinderPattern(r, c)) {
        row.push(isFinderBit(r, c));
      } else if (r === 6 || c === 6) {
        // Timing patterns
        row.push((r + c) % 2 === 0);
      } else {
        // Data bits seeded by hash
        const bitSeed = (hash + r * 37 + c * 19 + r * c * 7) % 100;
        row.push(bitSeed % 3 !== 0);
      }
    }
    grid.push(row);
  }

  const cellSize = size / matrixSize;

  return (
    <div className={`p-2 bg-white rounded-lg shadow-inner inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shape-rendering-crispEdges"
      >
        {grid.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize + 0.1}
                height={cellSize + 0.1}
                fill="#0F172A"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
};
