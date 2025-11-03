/**
 * useDragResize Hook
 * 
 * Generic drag-to-resize hook that works for both horizontal and vertical resizing.
 * Unifies the logic from useResizable (vertical) and useResizableHorizontal (horizontal).
 * 
 * Supports both mouse and touch events for cross-platform compatibility.
 * 
 * @example
 * ```typescript
 * // Vertical resize (height)
 * const { size: height, handleMouseDown, handleTouchStart } = useDragResize({
 *   initialSize: 300,
 *   minSize: 150,
 *   maxSize: 600,
 *   direction: 'vertical',
 * });
 * 
 * // Horizontal resize (width)
 * const { size: width, handleMouseDown, handleTouchStart } = useDragResize({
 *   initialSize: 420,
 *   minSize: 280,
 *   maxSize: 600,
 *   direction: 'horizontal',
 * });
 * ```
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Resize direction
 */
export type ResizeDirection = 'horizontal' | 'vertical';

/**
 * Hook options
 */
export interface UseDragResizeOptions {
  /** Initial size (width or height in pixels) */
  initialSize: number;
  
  /** Minimum size in pixels */
  minSize: number;
  
  /** Maximum size in pixels */
  maxSize: number;
  
  /** Resize direction (horizontal = width, vertical = height) */
  direction: ResizeDirection;
  
  /** Callback when size changes */
  onResize?: (newSize: number) => void;
  
  /** Invert the drag direction (e.g., dragging up increases height) */
  invertDrag?: boolean;
}

/**
 * Hook return value
 */
export interface UseDragResizeReturn {
  /** Current size in pixels */
  size: number;
  
  /** Whether actively resizing */
  isResizing: boolean;
  
  /** Mouse down handler for resize handle */
  handleMouseDown: (e: React.MouseEvent) => void;
  
  /** Touch start handler for resize handle */
  handleTouchStart: (e: React.TouchEvent) => void;
  
  /** Programmatically set the size */
  setSize: (size: number) => void;
}

/**
 * Custom hook for drag-based resizing
 * 
 * Provides a unified interface for both horizontal (width) and vertical (height)
 * resizing with mouse and touch support. Handles all the event management
 * and cursor/styling updates automatically.
 * 
 * @param options - Hook configuration
 * @returns Resize state and control functions
 */
export function useDragResize(
  options: UseDragResizeOptions
): UseDragResizeReturn {
  const {
    initialSize,
    minSize,
    maxSize,
    direction,
    onResize,
    invertDrag = false,
  } = options;
  
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  
  // Refs to store values during drag
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  /**
   * Calculate new size based on mouse/touch position
   */
  const calculateNewSize = useCallback((currentPos: number): number => {
    let delta = currentPos - startPosRef.current;
    
    // Invert delta if needed
    // For vertical: dragging up (negative delta) should increase height
    // For horizontal: dragging left (negative delta) should decrease width
    if (invertDrag) {
      delta = -delta;
    } else if (direction === 'vertical') {
      // Default vertical behavior: dragging up decreases, dragging down increases
      // But we want dragging up to increase the bottom panel height
      delta = -delta;
    }
    
    const newSize = startSizeRef.current + delta;
    return Math.max(minSize, Math.min(maxSize, newSize));
  }, [minSize, maxSize, direction, invertDrag]);

  /**
   * Mouse down handler - start resize
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    // Store starting position and size
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSizeRef.current = size;
  }, [size, direction]);

  /**
   * Touch start handler - start resize
   */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    // Store starting position and size from first touch
    const touch = e.touches[0];
    startPosRef.current = direction === 'horizontal' ? touch.clientX : touch.clientY;
    startSizeRef.current = size;
  }, [size, direction]);

  /**
   * Mouse move handler - update size during drag
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const newSize = calculateNewSize(currentPos);

    setSize(newSize);
    onResize?.(newSize);
  }, [isResizing, direction, calculateNewSize, onResize]);

  /**
   * Touch move handler - update size during drag
   */
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isResizing) return;

    const touch = e.touches[0];
    const currentPos = direction === 'horizontal' ? touch.clientX : touch.clientY;
    const newSize = calculateNewSize(currentPos);

    setSize(newSize);
    onResize?.(newSize);
  }, [isResizing, direction, calculateNewSize, onResize]);

  /**
   * Mouse/touch up handler - end resize
   */
  const handleEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  /**
   * Set up and clean up event listeners when resizing
   */
  useEffect(() => {
    if (!isResizing) return;

    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);

    // Update cursor and prevent text selection
    document.body.style.userSelect = 'none';
    document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, handleMouseMove, handleTouchMove, handleEnd, direction]);

  return {
    size,
    isResizing,
    handleMouseDown,
    handleTouchStart,
    setSize,
  };
}

