import { useState } from 'react';
import { Service } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServicesStepProps {
  services: Service[];
  onChange: (services: Service[]) => void;
}

const emptyService: Service = {
  service_id: '',
  title: '',
  category: '',
  description: '',
  price_range: '',
  slug: '',
  featured: false,
};

export function ServicesStep({ services, onChange }: ServicesStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(services.length > 0 ? 0 : null);

  const addService = () => {
    const newService = { ...emptyService, service_id: `svc-${Date.now()}` };
    onChange([...services, newService]);
    setExpandedIndex(services.length);
  };

  const removeService = (index: number) => {
    const updated = services.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateService = (index: number, field: keyof Service, value: string | boolean | number) => {
    const updated = services.map((svc, i) => 
      i === index ? { ...svc, [field]: value } : svc
    );
    onChange(updated);
  };

  return (
    <FormCard 
      title="Services" 
      description="Add the services your business offers. These will help AI understand what you do."
    >
      <div className="space-y-4">
        {services.map((service, index) => (
          <div 
            key={service.service_id || index} 
            className="border border-border rounded-xl overflow-hidden bg-background"
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-foreground">
                {service.title || `Service ${index + 1}`}
              </span>
              <div className="flex items-center gap-2">
                {service.featured && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Featured
                  </span>
                )}
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>
            
            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              expandedIndex === index ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Service Title" required>
                    <Input
                      placeholder="Web Development"
                      value={service.title}
                      onChange={(e) => updateService(index, 'title', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Category">
                    <Input
                      placeholder="Technology"
                      value={service.category}
                      onChange={(e) => updateService(index, 'category', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Price Range">
                    <Input
                      placeholder="$500 - $5,000"
                      value={service.price_range}
                      onChange={(e) => updateService(index, 'price_range', e.target.value)}
                    />
                  </FormField>

                  <FormField label="URL Slug">
                    <Input
                      placeholder="web-development"
                      value={service.slug}
                      onChange={(e) => updateService(index, 'slug', e.target.value)}
                    />
                  </FormField>

                  <FormField label="License Number">
                    <Input
                      placeholder="Optional"
                      value={service.license_number || ''}
                      onChange={(e) => updateService(index, 'license_number', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Service Area (miles)">
                    <Input
                      type="number"
                      placeholder="50"
                      value={service.service_area_radius_miles || ''}
                      onChange={(e) => updateService(index, 'service_area_radius_miles', parseInt(e.target.value) || undefined)}
                    />
                  </FormField>
                </div>

                <FormField label="Description">
                  <Textarea
                    placeholder="Describe this service..."
                    value={service.description}
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                  />
                </FormField>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={service.featured}
                      onCheckedChange={(checked) => updateService(index, 'featured', checked)}
                    />
                    <span className="text-sm text-muted-foreground">Featured Service</span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeService(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addService}
          className="w-full h-12 border-dashed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Service
        </Button>
      </div>
    </FormCard>
  );
}
