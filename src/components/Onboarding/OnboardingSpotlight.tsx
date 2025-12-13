interface OnboardingSpotlightProps {
  targetRect: DOMRect | null;
}

export function OnboardingSpotlight({ targetRect }: OnboardingSpotlightProps) {
  // No target = solid dark backdrop (centered modals)
  if (!targetRect) {
    return <div className="onboarding-backdrop" />;
  }

  // With target = SVG provides darkness WITH a transparent hole
  // No background on wrapper - the SVG masked rect is the only dark layer
  const padding = 8;
  const borderRadius = 8;

  return (
    <>
      <svg className="onboarding-spotlight-svg" width="100%" height="100%">
        <defs>
          <mask id="spotlight-mask">
            {/* White = show the dark overlay, Black = cut a hole */}
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - padding}
              y={targetRect.top - padding}
              width={targetRect.width + padding * 2}
              height={targetRect.height + padding * 2}
              rx={borderRadius}
              ry={borderRadius}
              fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.75)" mask="url(#spotlight-mask)" />
      </svg>

      <div
        className="onboarding-highlight-ring"
        style={{
          left: targetRect.left - padding,
          top: targetRect.top - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
          borderRadius: borderRadius,
        }}
      />
    </>
  );
}
