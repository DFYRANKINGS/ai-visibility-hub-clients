import { useState } from 'react';
import { Location } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationsStepProps {
  locations: Location[];
  onChange: (locations: Location[]) => void;
}

const emptyLocation: Location = {
  location_id: '',
  location_name: '',
  street: '',
  city: '',
  state: '',
  postal_code: '',
  phone: '',
  hours: '',
};

export function LocationsStep({ locations, onChange }: LocationsStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(locations.length > 0 ? 0 : null);

  const addLocation = () => {
    const newLocation = { ...emptyLocation, location_id: `loc-${Date.now()}` };
    onChange([...locations, newLocation]);
    setExpandedIndex(locations.length);
  };

  const removeLocation = (index: number) => {
    const updated = locations.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateLocation = (index: number, field: keyof Location, value: string | number) => {
    const updated = locations.map((loc, i) => 
      i === index ? { ...loc, [field]: value } : loc
    );
    onChange(updated);
  };

  return (
    <FormCard 
      title="Locations" 
      description="Add your business locations if you have multiple offices or branches."
    >
      <div className="space-y-4">
        {locations.map((location, index) => (
          <div 
            key={location.location_id || index} 
            className="border border-border rounded-xl overflow-hidden bg-background"
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">
                  {location.location_name || `Location ${index + 1}`}
                </span>
              </div>
              {expandedIndex === index ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
            
            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              expandedIndex === index ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Location Name" required>
                    <Input
                      placeholder="Main Office"
                      value={location.location_name}
                      onChange={(e) => updateLocation(index, 'location_name', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Phone">
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={location.phone}
                      onChange={(e) => updateLocation(index, 'phone', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Street Address" className="md:col-span-2">
                    <Input
                      placeholder="123 Main Street"
                      value={location.street}
                      onChange={(e) => updateLocation(index, 'street', e.target.value)}
                    />
                  </FormField>

                  <FormField label="City">
                    <Input
                      placeholder="New York"
                      value={location.city}
                      onChange={(e) => updateLocation(index, 'city', e.target.value)}
                    />
                  </FormField>

                  <FormField label="State">
                    <Input
                      placeholder="NY"
                      value={location.state}
                      onChange={(e) => updateLocation(index, 'state', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Postal Code">
                    <Input
                      placeholder="10001"
                      value={location.postal_code}
                      onChange={(e) => updateLocation(index, 'postal_code', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Hours">
                    <Input
                      placeholder="Mon-Fri 9AM-5PM"
                      value={location.hours}
                      onChange={(e) => updateLocation(index, 'hours', e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLocation(index)}
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
          onClick={addLocation}
          className="w-full h-12 border-dashed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Location
        </Button>
      </div>
    </FormCard>
  );
}
