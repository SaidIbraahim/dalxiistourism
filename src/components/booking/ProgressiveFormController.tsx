import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

export interface FormStep {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  isVisible: (formData: any, selectedServices: any[]) => boolean;
  isValid: (formData: any) => boolean;
  component: React.ComponentType<any>;
}

interface ProgressiveFormControllerProps {
  steps: FormStep[];
  formData: any;
  selectedServices: any[];
  onFormDataChange: (data: any) => void;
  onStepChange: (stepId: string, isFirstStep: boolean) => void;
  onSubmit: () => void;
  className?: string;
  /**
   * When this numeric value changes, the controller will navigate to the previous step (if possible).
   * Use this from a parent to programmatically trigger a "go back" action.
   */
  prevTrigger?: number;
}

export const ProgressiveFormController: React.FC<ProgressiveFormControllerProps> = ({
  steps,
  formData,
  selectedServices,
  onFormDataChange,
  onStepChange,
  onSubmit,
  className = '',
  prevTrigger,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set());

  // Filter visible steps based on selected services and form data
  const visibleSteps = steps.filter(step => step.isVisible(formData, selectedServices));
  const currentStep = visibleSteps[currentStepIndex];

  // Update completed steps when form data changes
  useEffect(() => {
    const newCompletedSteps = new Set<string>();
    visibleSteps.forEach(step => {
      if (step.isValid(formData)) {
        newCompletedSteps.add(step.id);
      }
    });
    setCompletedSteps(newCompletedSteps);
  }, [formData, visibleSteps]);

  // Mark current step as visited
  useEffect(() => {
    if (currentStep) {
      setVisitedSteps(prev => new Set([...prev, currentStep.id]));
      onStepChange(currentStep.id, currentStepIndex === 0);
    }
  }, [currentStep, onStepChange]);

  // Respond to external prevTrigger changes by navigating to previous step
  useEffect(() => {
    if (typeof prevTrigger === 'number') {
      // Trigger previous when prevTrigger changes (value itself not used)
      handlePrevious();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevTrigger]);

  // Auto-advance to next step if current step becomes invalid due to service changes
  useEffect(() => {
    if (currentStepIndex >= visibleSteps.length && visibleSteps.length > 0) {
      setCurrentStepIndex(Math.max(0, visibleSteps.length - 1));
    }
  }, [visibleSteps.length, currentStepIndex]);

  const handleNext = () => {
    // Enforce validation for required steps
    if (currentStep?.isRequired && !completedSteps.has(currentStep.id)) {
      // Show inline feedback by toggling a local flag via state update below
      setShowValidationMessage(true);
      return;
    }

    if (currentStepIndex < visibleSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setShowValidationMessage(false);
    } else {
      // Last step - signal completion to parent (navigate to review page)
      onSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to any visited step or the next unvisited step
    const targetStep = visibleSteps[stepIndex];
    if (visitedSteps.has(targetStep.id) || stepIndex <= currentStepIndex + 1) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const getStepStatus = (step: FormStep, index: number) => {
    if (completedSteps.has(step.id)) {
      return 'completed';
    } else if (index === currentStepIndex) {
      return 'current';
    } else if (visitedSteps.has(step.id)) {
      return 'visited';
    } else if (index < currentStepIndex) {
      return 'skipped';
    } else {
      return 'upcoming';
    }
  };

  const canProceed = () => {
    return !currentStep?.isRequired || completedSteps.has(currentStep.id);
  };

  const isLastStep = currentStepIndex === visibleSteps.length - 1;
  const progress = ((currentStepIndex + 1) / visibleSteps.length) * 100;

  // Local validation banner toggle
  const [showValidationMessage, setShowValidationMessage] = useState(false);

  if (visibleSteps.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-600">No form steps available. Please select services first.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 md:space-y-4 ${className}`}>
      {/* Header: Progress + Step Navigation */}
      <div className="w-full rounded-lg bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm ring-1 ring-gray-200 p-2.5 md:p-3">
        {/* Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2 md:mb-2.5">
            <span className="text-[11px] md:text-xs font-semibold text-gray-800">
              Step {currentStepIndex + 1} of {visibleSteps.length}
            </span>
            <span className="text-[11px] md:text-xs text-gray-600 font-medium">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
            <div
              className="bg-blue-600 h-1.5 md:h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="hidden md:block mt-2.5">
          <nav className="flex flex-wrap gap-2 md:gap-2.5 overflow-x-visible">
            {visibleSteps.map((step, index) => {
            const status = getStepStatus(step, index);
            const isClickable = visitedSteps.has(step.id) || index <= currentStepIndex + 1;
            
            return (
              <button
                key={step.id}
                onClick={() => isClickable && handleStepClick(index)}
                disabled={!isClickable}
                className={`
                  flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap
                  ${status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' : ''}
                  ${status === 'current' ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''}
                  ${status === 'visited' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : ''}
                  ${status === 'upcoming' ? 'bg-gray-100 text-gray-700 border border-gray-200' : ''}
                  ${isClickable ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed opacity-60'}
                `}
              >
                {status === 'completed' && <Check size={14} />}
                <span className="flex-shrink-0">
                  {index + 1}. {step.title}
                </span>
              </button>
            );
          })}
          </nav>
        </div>
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden">
        <div className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 text-xs">{currentStep.title}</h3>
              <p className="text-[10px] text-gray-600">{currentStep.description}</p>
            </div>
            {completedSteps.has(currentStep.id) && (
              <div className="text-green-600">
                <Check size={16} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <div>
        <div className="hidden md:block mb-2 md:mb-3">
          <h2 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-1.5">
            {currentStep.title}
          </h2>
          <p className="text-gray-600 text-xs md:text-sm">{currentStep.description}</p>
        </div>

        {/* Render Current Step Component */}
        <div>
          <currentStep.component
            formData={formData}
            onFormDataChange={onFormDataChange}
            selectedServices={selectedServices}
          />
        </div>

        {/* Validation Banner */}
        {showValidationMessage && currentStep.isRequired && !completedSteps.has(currentStep.id) && (
          <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs md:text-xs text-red-700" role="alert" aria-live="assertive">
            Please complete the required fields on this step to continue.
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className={`
            flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-md font-medium transition-colors text-sm md:text-sm
            ${currentStepIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          <ChevronLeft size={14} className="md:h-4 md:w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2.5 md:space-x-3">
          {/* Step Validation Status */}
          {currentStep.isRequired && (
            <div className="hidden sm:flex items-center space-x-1.5 text-[11px] md:text-xs">
              {completedSteps.has(currentStep.id) ? (
                <div className="flex items-center text-green-600">
                  <Check size={12} className="mr-1 md:h-3.5 md:w-3.5" />
                  <span>Step completed</span>
                </div>
              ) : (
                <div className="text-amber-600">
                  <span>Required step - please complete to continue</span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={currentStep.isRequired && !completedSteps.has(currentStep.id)}
            className={`
              flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-md font-medium transition-colors text-sm md:text-sm
              ${!canProceed()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isLastStep
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            <span>{isLastStep ? 'Continue to Review' : 'Next'}</span>
            {!isLastStep && <ChevronRight size={14} className="md:h-4 md:w-4" />}
          </button>
        </div>
      </div>

    </div>
  );
};