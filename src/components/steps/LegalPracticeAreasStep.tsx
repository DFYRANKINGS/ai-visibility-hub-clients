import { useState } from 'react';
import { PracticeArea } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LegalPracticeAreasStepProps {
  practiceAreas: PracticeArea[];
  onChange: (practiceAreas: PracticeArea[]) => void;
}

const emptyPracticeArea: PracticeArea = {
  practice_area_id: '',
  name: '',
  case_types: '',
  jurisdiction: '',
  service_areas: '',
  description: '',
  featured: false,
};

export function LegalPracticeAreasStep({ practiceAreas, onChange }: LegalPracticeAreasStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(practiceAreas.length > 0 ? 0 : null);

  const addPracticeArea = () => {
    const newPracticeArea: PracticeArea = { 
      ...emptyPracticeArea, 
      practice_area_id: `pa-${Date.now()}` 
    };
    onChange([...practiceAreas, newPracticeArea]);
    setExpandedIndex(practiceAreas.length);
  };

  const removePracticeArea = (index: number) => {
    const updated = practiceAreas.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updatePracticeArea = (index: number, field: keyof PracticeArea, value: string | boolean) => {
    const updated = practiceAreas.map((pa, i) => 
      i === index ? { ...pa, [field]: value } : pa
    );
    onChange(updated);
  };

  return (
    <FormCard 
      title="Legal Practice Areas" 
      description="Define the practice areas for your legal entity. These help AI understand your legal expertise."
    >
      <div className="space-y-4">
        {practiceAreas.map((practiceArea, index) => (
          <div 
            key={practiceArea.practice_area_id || index} 
            className="border border-border rounded-xl overflow-hidden bg-background"
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">
                  {practiceArea.name || `Practice Area ${index + 1}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {practiceArea.featured && (
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
                  <FormField label="Practice Area Name" required>
                    <Input
                      placeholder="Personal Injury"
                      value={practiceArea.name}
                      onChange={(e) => updatePracticeArea(index, 'name', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Case Types" hint="Comma-separated">
                    <Input
                      placeholder="Car Accidents, Slip & Fall, Medical Malpractice"
                      value={practiceArea.case_types}
                      onChange={(e) => updatePracticeArea(index, 'case_types', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Jurisdiction">
                    <Input
                      placeholder="State of California"
                      value={practiceArea.jurisdiction}
                      onChange={(e) => updatePracticeArea(index, 'jurisdiction', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Service Areas" hint="Cities/Counties">
                    <Input
                      placeholder="Los Angeles County, Orange County"
                      value={practiceArea.service_areas}
                      onChange={(e) => updatePracticeArea(index, 'service_areas', e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Description">
                  <Textarea
                    placeholder="Describe this practice area and your expertise..."
                    value={practiceArea.description}
                    onChange={(e) => updatePracticeArea(index, 'description', e.target.value)}
                  />
                </FormField>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={practiceArea.featured}
                      onCheckedChange={(checked) => updatePracticeArea(index, 'featured', checked)}
                    />
                    <span className="text-sm text-muted-foreground">Featured Practice Area</span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePracticeArea(index)}
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
          onClick={addPracticeArea}
          className="w-full h-12 border-dashed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Practice Area
        </Button>
      </div>
    </FormCard>
  );
}
