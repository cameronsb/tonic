import { useCallback } from 'react';
import './VolumeSlider.css';

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  color?: string;
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function VolumeSlider({
  value,
  onChange,
  color = '#667eea',
  label,
  orientation = 'horizontal'
}: VolumeSliderProps) {
  const percentage = Math.round(value * 100);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value) / 100;
    onChange(newValue);
  }, [onChange]);

  // Touch-friendly slider with native HTML5 range input
  return (
    <div className={`volume-slider ${orientation}`}>
      {label && <span className="volume-slider-label">{label}</span>}
      <div className="volume-slider-container">
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={handleChange}
          className="volume-slider-input"
          style={{
            '--slider-color': color,
            '--slider-progress': `${percentage}%`
          } as React.CSSProperties}
          aria-label={`${label} volume: ${percentage}%`}
        />
        <span className="volume-slider-value">{percentage}%</span>
      </div>
    </div>
  );
}