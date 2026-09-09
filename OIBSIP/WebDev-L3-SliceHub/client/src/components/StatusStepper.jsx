import React from 'react';
import { Check, Clock, ChefHat, Truck } from 'lucide-react';

const STEPS = [
  { id: 'Order Received', label: 'Order Received', icon: Clock, desc: 'Kitchen notified' },
  { id: 'In Kitchen', label: 'In Kitchen', icon: ChefHat, desc: 'Baking in stone oven' },
  { id: 'Sent to Delivery', label: 'Sent to Delivery', icon: Truck, desc: 'Hot & on the way' },
];

const StatusStepper = ({ currentStatus }) => {
  const getStepIndex = (status) => {
    switch (status) {
      case 'Order Received':
        return 0;
      case 'In Kitchen':
        return 1;
      case 'Sent to Delivery':
        return 2;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Connecting Progress Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-surface-elevated -z-0 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Step Circles */}
        {STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isPending = index > activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-success text-white shadow-warm'
                    : isCurrent
                    ? 'bg-accent text-white ring-4 ring-accent/30 shadow-accent-glow animate-pulse-subtle'
                    : 'bg-surface border border-border text-primary-muted'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[2.5]" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Text Labels */}
              <div className="text-center mt-2">
                <p
                  className={`text-xs sm:text-sm font-semibold tracking-tight ${
                    isCurrent
                      ? 'text-accent'
                      : isCompleted
                      ? 'text-primary-text'
                      : 'text-primary-muted'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-primary-muted hidden sm:block">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusStepper;
