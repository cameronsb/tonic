/**
 * useGlissando Hook
 *
 * Unified glissando (slide/drag to play) support for both mouse and touch.
 * Handles the complexity of tracking pointer state and determining which
 * element is being interacted with during a drag.
 *
 * Works with any draggable element that has a data attribute or aria-label
 * to identify it.
 *
 * @example
 * ```typescript
 * const { isActive, handlers } = useGlissando({
 *   onTrigger: (identifier) => playNote(identifier),
 *   selector: '.piano-key',
 *   getIdentifier: (element) => element.getAttribute('aria-label'),
 * });
 *
 * <div {...handlers}>
 *   <button className="piano-key" aria-label="C4">C</button>
 *   <button className="piano-key" aria-label="D4">D</button>
 * </div>
 * ```
 */

import { useState, useCallback, useRef, type TouchEvent, type MouseEvent } from 'react';

/**
 * Glissando options
 */
export interface UseGlissandoOptions<T = string> {
  /**
   * Callback when an element is triggered during glissando
   * @param identifier - The identifier of the triggered element
   */
  onTrigger: (identifier: T) => void;

  /**
   * CSS selector to find interactive elements
   * @example '.piano-key'
   */
  selector: string;

  /**
   * Function to extract identifier from element
   * @param element - The DOM element
   * @returns Identifier or null if invalid
   *
   * @example
   * (element) => element.getAttribute('aria-label')
   * (element) => element.dataset.noteId
   */
  getIdentifier: (element: Element) => T | null;

  /**
   * Whether to prevent default browser behavior (default: true)
   */
  preventDefault?: boolean;

  /**
   * Throttle time in milliseconds to avoid rapid re-triggers (default: 0)
   */
  throttleMs?: number;
}

/**
 * Glissando handlers return value
 */
export interface UseGlissandoReturn {
  /**
   * Whether glissando is currently active (dragging)
   */
  isActive: boolean;

  /**
   * Event handlers to spread onto container element
   */
  handlers: {
    onMouseDown: (e: MouseEvent) => void;
    onMouseMove: (e: MouseEvent) => void;
    onMouseUp: (e: MouseEvent) => void;
    onMouseLeave: (e: MouseEvent) => void;
    onTouchStart: (e: TouchEvent) => void;
    onTouchMove: (e: TouchEvent) => void;
    onTouchEnd: (e: TouchEvent) => void;
    onTouchCancel: (e: TouchEvent) => void;
  };

  /**
   * Manually activate glissando mode
   */
  activate: () => void;

  /**
   * Manually deactivate glissando mode
   */
  deactivate: () => void;
}

/**
 * Unified glissando hook for mouse and touch
 *
 * Provides consistent drag-to-play behavior across all input devices.
 * Handles pointer tracking, element detection, and duplicate prevention.
 */
export function useGlissando<T = string>(options: UseGlissandoOptions<T>): UseGlissandoReturn {
  const { onTrigger, selector, getIdentifier, preventDefault = true, throttleMs = 0 } = options;

  // Track pointer state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [touchId, setTouchId] = useState<number | null>(null);

  // Track last triggered element to avoid duplicates
  const lastTriggeredRef = useRef<T | null>(null);
  const lastTriggerTimeRef = useRef(0);

  /**
   * Check if element should be triggered
   */
  const shouldTrigger = useCallback(
    (identifier: T | null): boolean => {
      if (!identifier) return false;

      // Check if same as last triggered
      if (identifier === lastTriggeredRef.current) return false;

      // Check throttle
      if (throttleMs > 0) {
        const now = Date.now();
        if (now - lastTriggerTimeRef.current < throttleMs) return false;
      }

      return true;
    },
    [throttleMs]
  );

  /**
   * Trigger element and update tracking
   */
  const triggerElement = useCallback(
    (identifier: T | null) => {
      if (!shouldTrigger(identifier)) return;

      lastTriggeredRef.current = identifier;
      lastTriggerTimeRef.current = Date.now();

      if (identifier) {
        onTrigger(identifier);
      }
    },
    [shouldTrigger, onTrigger]
  );

  /**
   * Find and trigger element at pointer position
   */
  const findAndTriggerAt = useCallback(
    (clientX: number, clientY: number) => {
      const element = document.elementFromPoint(clientX, clientY);
      if (!element) return;

      const targetElement = element.closest(selector);
      if (!targetElement) return;

      const identifier = getIdentifier(targetElement);
      triggerElement(identifier);
    },
    [selector, getIdentifier, triggerElement]
  );

  // ===== Mouse Handlers =====

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (preventDefault) e.preventDefault();

      setIsMouseDown(true);
      lastTriggeredRef.current = null; // Reset for new drag

      // Trigger element under cursor
      findAndTriggerAt(e.clientX, e.clientY);
    },
    [preventDefault, findAndTriggerAt]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isMouseDown) return;
      if (preventDefault) e.preventDefault();

      findAndTriggerAt(e.clientX, e.clientY);
    },
    [isMouseDown, preventDefault, findAndTriggerAt]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (preventDefault) e.preventDefault();
      setIsMouseDown(false);
      lastTriggeredRef.current = null;
    },
    [preventDefault]
  );

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (preventDefault) e.preventDefault();
      setIsMouseDown(false);
      lastTriggeredRef.current = null;
    },
    [preventDefault]
  );

  // ===== Touch Handlers =====

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      if (e.touches.length > 0 && touchId === null) {
        const touch = e.touches[0];
        setTouchId(touch.identifier);
        lastTriggeredRef.current = null; // Reset for new touch

        // Trigger element under touch
        findAndTriggerAt(touch.clientX, touch.clientY);
      }
    },
    [preventDefault, touchId, findAndTriggerAt]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (touchId === null) return;
      if (preventDefault) e.preventDefault();

      // Find the active touch
      const touch = Array.from(e.touches).find((t) => t.identifier === touchId);
      if (!touch) return;

      findAndTriggerAt(touch.clientX, touch.clientY);
    },
    [touchId, preventDefault, findAndTriggerAt]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      const changedTouches = Array.from(e.changedTouches);
      if (touchId !== null && changedTouches.some((t) => t.identifier === touchId)) {
        setTouchId(null);
        lastTriggeredRef.current = null;
      }
    },
    [touchId, preventDefault]
  );

  const handleTouchCancel = useCallback(
    (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      if (touchId !== null) {
        setTouchId(null);
        lastTriggeredRef.current = null;
      }
    },
    [touchId, preventDefault]
  );

  // Manual control
  const activate = useCallback(() => {
    setIsMouseDown(true);
  }, []);

  const deactivate = useCallback(() => {
    setIsMouseDown(false);
    setTouchId(null);
    lastTriggeredRef.current = null;
  }, []);

  return {
    isActive: isMouseDown || touchId !== null,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
    activate,
    deactivate,
  };
}
