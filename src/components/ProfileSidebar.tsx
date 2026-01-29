import { FormStep } from '@/types/profile';
import { cn } from '@/lib/utils';
import { Check, Building2, Briefcase, HelpCircle, FileText, Star, Award, Newspaper, FolderKanban, ClipboardCheck, BadgeCheck, Link, Users } from 'lucide-react';

interface ProfileSidebarProps {
  currentStep: FormStep;
  completedSteps: FormStep[];
  onStepClick: (step: FormStep) => void;
}

const steps: { id: FormStep; label: string; description: string; icon: React.ElementType }[] = [
  { id: 'entity', label: 'Organization', description: 'Business info & locations', icon: Building2 },
  { id: 'services', label: 'Services', description: 'What you offer', icon: Briefcase },
  { id: 'team', label: 'Associates', description: 'Team members', icon: Users },
  { id: 'entity_linking', label: 'Entity Linking', description: 'External profiles & links', icon: Link },
  { id: 'credentials', label: 'Credentials', description: 'Certifications & accreditations', icon: BadgeCheck },
  { id: 'faqs', label: 'FAQs', description: 'Common questions', icon: HelpCircle },
  { id: 'help_articles', label: 'Help Articles', description: 'Help content', icon: FileText },
  { id: 'reviews', label: 'Reviews', description: 'Customer testimonials', icon: Star },
  { id: 'awards', label: 'Awards', description: 'Recognition & honors', icon: Award },
  { id: 'media', label: 'Media', description: 'Press mentions', icon: Newspaper },
  { id: 'cases', label: 'Case Studies', description: 'Success stories', icon: FolderKanban },
  { id: 'review', label: 'Review & Submit', description: 'Final review', icon: ClipboardCheck },
];

export function ProfileSidebar({ currentStep, completedSteps, onStepClick }: ProfileSidebarProps) {
  
  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card/50 overflow-y-auto">
      <nav className="p-4 space-y-1">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-4">Profile Sections</h2>
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;
          return (
            <button key={step.id} onClick={() => onStepClick(step.id)}
              className={cn("w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                isCurrent && "bg-primary/10 border border-primary/20", !isCurrent && "hover:bg-muted/50")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                isCompleted && "bg-success text-success-foreground",
                isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                !isCompleted && !isCurrent && "bg-muted text-muted-foreground")}>
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className={cn("block text-sm font-medium transition-colors", isCurrent ? "text-primary" : "text-foreground")}>{step.label}</span>
                <span className="block text-xs text-muted-foreground truncate">{step.description}</span>
              </div>
              {isCompleted && !isCurrent && <Check className="w-4 h-4 text-success shrink-0 mt-1" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
