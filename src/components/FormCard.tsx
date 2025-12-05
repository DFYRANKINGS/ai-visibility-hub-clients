import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormCard({ title, description, children, className }: FormCardProps) {
  return (
    <div className={cn("bg-card rounded-2xl shadow-card p-6 md:p-8 animate-fade-in", className)}>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-2 text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
