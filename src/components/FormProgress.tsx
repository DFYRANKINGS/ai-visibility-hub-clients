import { FormStep, BusinessVertical } from '@/types/profile';
import { cn } from '@/lib/utils';
import { Check, Building2, Briefcase, HelpCircle, FileText, Star, Award, Newspaper, FolderKanban, BadgeCheck, Scale, Stethoscope, Link, Users } from 'lucide-react';

interface FormProgressProps {
  currentStep: FormStep;
  completedSteps: FormStep[];
  vertical?: BusinessVertical;
}

const getSteps = (vertical?: BusinessVertical): { id: FormStep; label: string; icon: React.ElementType }[] => [
  { id: 'entity', label: 'Organization', icon: Building2 },
  { id: 'team', label: vertical === 'legal' ? 'Lawyers' : vertical === 'medical' ? 'Healthcare Providers' : 'Associates', icon: Users },
  { id: 'entity_linking', label: 'Entity Linking', icon: Link },
  { id: 'credentials', label: 'Credentials', icon: BadgeCheck },
  { id: 'services', label: vertical === 'legal' ? 'Practice Areas' : vertical === 'medical' ? 'Specialties' : 'Services', icon: vertical === 'legal' ? Scale : vertical === 'medical' ? Stethoscope : Briefcase },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'help_articles', label: 'Help Articles', icon: FileText },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'awards', label: 'Awards', icon: Award },
  { id: 'media', label: 'Media', icon: Newspaper },
  { id: 'cases', label: 'Case Studies', icon: FolderKanban },
  { id: 'review', label: 'Review', icon: Check },
];

export function FormProgress({ currentStep, completedSteps, vertical }: FormProgressProps) {
  const steps = getSteps(vertical);
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full py-6">
      <div className="hidden lg:flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-border z-0" />
        <div className="absolute left-0 top-5 h-0.5 bg-primary transition-all duration-500 z-0" style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }} />
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                isCompleted && "bg-success text-success-foreground",
                isCurrent && !isCompleted && "bg-primary text-primary-foreground shadow-glow",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground")}>
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={cn("mt-2 text-xs font-medium transition-colors", isCurrent ? "text-primary" : "text-muted-foreground")}>{step.label}</span>
            </div>
          );
        })}
      </div>
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{steps.find((s) => s.id === currentStep)?.label}</span>
          <span className="text-sm text-muted-foreground">{currentIndex + 1} of {steps.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-primary transition-all duration-500 rounded-full" style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
