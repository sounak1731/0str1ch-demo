
"use client";

import React from 'react';

interface Point {
  x: number;
  y: number;
}

interface ArtifactConnectorProps {
  from: Point;
  to: Point;
  direction?: 'horizontal' | 'vertical';
}

export function ArtifactConnector({ from, to, direction = 'horizontal' }: ArtifactConnectorProps) {
  let pathData: string;

  if (direction === 'horizontal') {
    // A bezier curve for a "Miro-style" feel
    pathData = `M ${from.x} ${from.y} C ${from.x + 80} ${from.y}, ${to.x - 80} ${to.y}, ${to.x} ${to.y}`;
  } else {
    // Vertical bezier curve
    pathData = `M ${from.x} ${from.y} C ${from.x} ${from.y + 80}, ${to.x} ${to.y - 80}, ${to.x} ${to.y}`;
  }


  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Make sure it doesn't interfere with dragging
        overflow: 'visible',
      }}
    >
      <path
        d={pathData}
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
        strokeDasharray="4 4"
        className="connector-path"
      />
      <circle cx={from.x} cy={from.y} r="5" fill="hsl(var(--primary))" />
      <circle cx={to.x} cy={to.y} r="5" fill="hsl(var(--primary))" />
    </svg>
  );
}
