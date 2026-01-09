import { useState } from 'react';
import { Service } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServicesStepProps {
  services: Service[];
  onChange: (services: Service[]) => void;
}

const emptyService: Service = {
  title: '',
  description: '',
  category: '',
};

export function ServicesStep({ services, onChange }: ServicesStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(services.length > 0 ? 0 : null);

  const addService = () => {
    onChange([...services, { ...emptyService, service_id: crypto.randomUUID(), name: '' }]);
    setExpandedIndex(services.length);
  };

  const removeService = (index: number) => {
    const updated = services.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    const updated = services.map((svc, i) => {
      if (i !== index) return svc;
      // Keep both 'title' and 'name' in sync for Agency App compatibility
      if (field === 'title') {
        return { ...svc, title: value, name: value };
      }
      return { ...svc, [field]: value };
    });
    onChange(updated);
  };

  return (
    <FormCard title="Services / Expertise" description="Add the services or areas of expertise your business offers.">
      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={service.service_id || index} className="border border-border rounded-xl overflow-hidden bg-background">
            <button type="button" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{service.title || service.name || `Service ${index + 1}`}</span>
              </div>
              {expandedIndex === index ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            <div className={cn("transition-all duration-300 overflow-hidden", expandedIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Service Name" required>
                    <Input placeholder="Web Development" value={service.title || service.name || ''} onChange={(e) => updateService(index, 'title', e.target.value)} />
                  </FormField>
                  <FormField label="Category">
                    <Input placeholder="e.g., Technology" value={service.category || ''} onChange={(e) => updateService(index, 'category', e.target.value)} />
                  </FormField>
                </div>
                <FormField label="Description">
                  <Textarea placeholder="Describe this service..." value={service.description || ''} onChange={(e) => updateService(index, 'description', e.target.value)} />
                </FormField>
                <div className="flex justify-end pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeService(index)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addService} className="w-full h-12 border-dashed">
          <Plus className="w-5 h-5 mr-2" />Add Service
        </Button>
      </div>
    </FormCard>
  );
}
