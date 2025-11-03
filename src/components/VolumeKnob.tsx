import React, { useRef, useState, useCallback } from 'react';
import './VolumeKnob.css';

interface VolumeKnobProps {
  value: number; // 0-1
  onChange: (value: number) => void;
  size?: number;
  color?: string;
  label?: string;
}

export function VolumeKnob({
  value,
  onChange,
  size = 40,
  color = '#667eea',
  label
}: VolumeKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const percentage = Math.round(value * 100);
  const rotation = -135 + (value * 270); // -135° to 135° (270° range)

  // Calculate arc for 270° range (3/4 of circle)
  const radius = (size / 2) - 3;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270° is 75% of full circle
  const progressLength = arcLength * value;

  // SVG circles start drawing at 3 o'clock (0°)
  // We need them to start at -135° (7:30 position)
  // -135° from 0° = -135° = 225° counterclockwise
  // That's 225/360 = 0.625 of the full circle
  const startOffset = circumference * 0.625;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
  }, [value]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    // Vertical drag: up increases, down decreases
    const deltaY = startYRef.current - e.clientY;
    const sensitivity = 0.005; // Adjust sensitivity
    const newValue = Math.max(0, Math.min(1, startValueRef.current + (deltaY * sensitivity)));

    onChange(newValue);
  }, [isDragging, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="volume-knob-container" title={label ? `${label}: ${percentage}%` : `${percentage}%`}>
      {label && <label className="volume-knob-label">{label}</label>}
      <div
        className={`volume-knob ${isDragging ? 'dragging' : ''}`}
        style={{ width: size, height: size }}
        onMouseDown={handleMouseDown}
      >
        {/* Outer ring with progress arc */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="knob-svg"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="2"
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={startOffset}
          />

          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${progressLength} ${circumference - progressLength}`}
            strokeDashoffset={startOffset}
            style={{ transition: isDragging ? 'none' : 'stroke-dasharray 0.1s ease' }}
          />
        </svg>

        {/* Center knob with indicator */}
        <div
          className="knob-center"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease'
          }}
        >
          <div className="knob-indicator" style={{ background: color }} />
        </div>

        {/* Percentage display */}
        <div className="knob-value">{percentage}</div>
      </div>
    </div>
  );
}
