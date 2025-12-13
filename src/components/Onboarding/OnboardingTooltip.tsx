import type { ReactNode } from 'react';
import { useFloating, offset, shift, flip, autoUpdate } from '@floating-ui/react';
import type { OnboardingStep } from '../../types/onboarding';

interface OnboardingTooltipProps {
  step: OnboardingStep;
  targetRect: DOMRect | null;
  currentIndex: number;
  totalSteps: number;
  showHint: boolean;
  onNext: () => void;
  onSkip: () => void;
  children?: ReactNode;
  dynamicButtonText?: string;
}

interface TooltipContentProps {
  step: OnboardingStep;
  currentIndex: number;
  totalSteps: number;
  showHint: boolean;
  onNext: () => void;
  onSkip: () => void;
  children?: ReactNode;
  buttonText: string | null;
}

function TooltipContent({
  step,
  currentIndex,
  totalSteps,
  showHint,
  onNext,
  onSkip,
  children,
  buttonText,
}: TooltipContentProps) {
  return (
    <>
      <div className="onboarding-progress">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`progress-dot ${i === currentIndex ? 'active' : ''} ${i < currentIndex ? 'completed' : ''}`}
          />
        ))}
      </div>

      <h2 id="onboarding-title" className="onboarding-title">
        {step.title}
      </h2>
      <p id="onboarding-body" className="onboarding-body">
        {step.body}
      </p>

      {children}

      {showHint && step.hintText && <p className="onboarding-hint">{step.hintText}</p>}

      <div className="onboarding-actions">
        {step.showSkip && (
          <button className="onboarding-skip" onClick={onSkip}>
            Skip
          </button>
        )}
        {buttonText && (
          <button className="onboarding-primary" onClick={onNext}>
            {buttonText}
          </button>
        )}
      </div>
    </>
  );
}

export function OnboardingTooltip({
  step,
  targetRect,
  currentIndex,
  totalSteps,
  showHint,
  onNext,
  onSkip,
  children,
  dynamicButtonText,
}: OnboardingTooltipProps) {
  const isCentered = !targetRect || step.tooltipPosition === 'center';

  const { refs, floatingStyles } = useFloating({
    placement: step.tooltipPosition === 'top' ? 'top' : 'bottom',
    middleware: [
      offset(16),
      flip({ fallbackPlacements: ['top', 'bottom'] }),
      shift({ padding: 16 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const buttonText = dynamicButtonText ?? step.primaryButton;

  const contentProps = {
    step,
    currentIndex,
    totalSteps,
    showHint,
    onNext,
    onSkip,
    children,
    buttonText,
  };

  if (isCentered) {
    return (
      <div
        className="onboarding-tooltip centered"
        role="alertdialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-body"
      >
        <TooltipContent {...contentProps} />
      </div>
    );
  }

  return (
    <>
      {targetRect && (
        <div
          ref={refs.setReference}
          style={{
            position: 'fixed',
            left: targetRect.left,
            top: targetRect.top,
            width: targetRect.width,
            height: targetRect.height,
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        ref={refs.setFloating}
        className="onboarding-tooltip positioned"
        style={floatingStyles}
        role="alertdialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-body"
      >
        <TooltipContent {...contentProps} />
      </div>
    </>
  );
}
