import type React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';

interface UseResizableOptions {
  initialHeight: number;
  minHeight: number;
  maxHeight: number;
  onResize?: (height: number) => void;
}

interface UseResizableReturn {
  height: number;
  isResizing: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  setHeight: (height: number) => void;
}

export function useResizable({
  initialHeight,
  minHeight,
  maxHeight,
  onResize,
}: UseResizableOptions): UseResizableReturn {
  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startYRef.current = e.clientY;
      startHeightRef.current = height;
    },
    [height]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startYRef.current = e.touches[0].clientY;
      startHeightRef.current = height;
    },
    [height]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      // Calculate the delta (negative because moving up should increase bottom height)
      const deltaY = startYRef.current - e.clientY;
      const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeightRef.current + deltaY));

      setHeight(newHeight);
      onResize?.(newHeight);
    },
    [isResizing, minHeight, maxHeight, onResize]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isResizing) return;

      // Calculate the delta (negative because moving up should increase bottom height)
      const deltaY = startYRef.current - e.touches[0].clientY;
      const newHeight = Math.max(minHeight, Math.min(maxHeight, startHeightRef.current + deltaY));

      setHeight(newHeight);
      onResize?.(newHeight);
    },
    [isResizing, minHeight, maxHeight, onResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ns-resize';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
    return undefined;
  }, [isResizing, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return {
    height,
    isResizing,
    handleMouseDown,
    handleTouchStart,
    setHeight,
  };
}
