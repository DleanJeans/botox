import React from 'react';
import { Player } from '../types';

interface CircleLinesProps {
  players: Player[];
  positions: Record<string, { x: number; y: number }>;
  width: number;
  height: number;
}

// SVG line drawing — works on react-native-web which maps SVG to HTML elements
export default function CircleLines({ players, positions, width, height }: CircleLinesProps) {
  if (players.length < 3) return null;

  const lines = [];
  for (let i = 0; i < players.length; i++) {
    const j = (i + 1) % players.length;
    const p1 = positions[players[i].id];
    const p2 = positions[players[j].id];
    if (!p1 || !p2) continue;
    lines.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
  }

  const ns = 'http://www.w3.org/2000/svg';

  // Use createElementNS for cross-platform SVG creation
  const svgEl = document.createElementNS(ns, 'svg');
  svgEl.setAttribute('width', String(width));
  svgEl.setAttribute('height', String(height));
  svgEl.style.position = 'absolute';
  svgEl.style.top = '0';
  svgEl.style.left = '0';
  svgEl.style.pointerEvents = 'none';

  for (const line of lines) {
    const lineEl = document.createElementNS(ns, 'line');
    lineEl.setAttribute('x1', String(line.x1));
    lineEl.setAttribute('y1', String(line.y1));
    lineEl.setAttribute('x2', String(line.x2));
    lineEl.setAttribute('y2', String(line.y2));
    lineEl.setAttribute('stroke', 'rgba(255,255,255,0.07)');
    lineEl.setAttribute('stroke-width', '1.5');
    svgEl.appendChild(lineEl);
  }

  // Web only — works with react-native-web's SSR or client rendering
  // This is safe because react-native-web checks for document
  if (typeof document === 'undefined') return null;

  const container = document.createElement('div');
  container.style.cssText = `position:absolute;top:0;left:0;width:${width}px;height:${height}px;pointer-events:none`;
  container.appendChild(svgEl);

  // Return a React element from the raw HTML
  return React.createElement('div', {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      width,
      height,
      pointerEvents: 'none' as const,
    },
    dangerouslySetInnerHTML: {
      __html: `<svg xmlns="${ns}" width="${width}" height="${height}" style="position:absolute;top:0;left:0;width:${width}px;height:${height}px;pointer-events:none">${lines.map(l =>
        `<line x1="${l.x1}" y1="${l.y1}" x2="${l.x2}" y2="${l.y2}" stroke="rgba(255,255,255,0.07)" stroke-width="1.5" />`
      ).join('')}</svg>`,
    },
  });
}
