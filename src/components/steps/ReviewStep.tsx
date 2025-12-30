import { ClientProfile } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { Check, Building2, Briefcase, Package, HelpCircle, FileText, Star, MapPin, Users, Award, Newspaper, FolderKanban, BadgeCheck } from 'lucide-react';

interface ReviewStepProps {
  data: Partial<ClientProfile>;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const credentialsCount = (data.certifications?.length || 0) + (data.accreditations?.length || 0) + (data.insurance_accepted?.length || 0);
  
  const sections = [
    { icon: Building2, label: 'Organization', filled: !!data.business_name },
    { icon: BadgeCheck, label: 'Credentials', count: credentialsCount },
    { icon: Briefcase, label: 'Services', count: data.services?.length || 0 },
    { icon: Package, label: 'Products', count: data.products?.length || 0 },
    { icon: HelpCircle, label: 'FAQs', count: data.faqs?.length || 0 },
    { icon: FileText, label: 'Articles', count: data.articles?.length || 0 },
    { icon: Star, label: 'Reviews', count: data.reviews?.length || 0 },
    { icon: MapPin, label: 'Locations', count: data.locations?.length || 0 },
    { icon: Users, label: 'Team', count: data.team_members?.length || 0 },
    { icon: Award, label: 'Awards', count: data.awards?.length || 0 },
    { icon: Newspaper, label: 'Media', count: data.media_mentions?.length || 0 },
    { icon: FolderKanban, label: 'Cases', count: data.case_studies?.length || 0 },
  ];

  return (
    <FormCard title="Review Your Profile" description="Review your information before submitting.">
      <div className="space-y-6">
        {data.business_name && (
          <div className="p-4 bg-accent/50 rounded-xl">
            <h3 className="font-heading text-xl font-semibold text-foreground">{data.business_name}</h3>
            {data.short_description && <p className="text-muted-foreground mt-1">{data.short_description}</p>}
            {data.business_url && <p className="text-primary text-sm mt-2">{data.business_url}</p>}
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sections.map(({ icon: Icon, label, filled, count }) => (
            <div key={label} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{label}</span>
              {filled !== undefined ? (
                filled && <Check className="w-4 h-4 text-success ml-auto" />
              ) : (
                <span className="ml-auto text-sm font-medium text-primary">{count}</span>
              )}
            </div>
          ))}
        </div>
        
        <p className="text-sm text-muted-foreground text-center pt-4">
          Click "Submit Profile" to save your AI Visibility Profile. You can edit it later from the main app.
        </p>
      </div>
    </FormCard>
  );
}
