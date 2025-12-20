import { useState } from 'react';
import { MedicalSpecialty } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ChevronDown, ChevronUp, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MedicalSpecialtiesStepProps {
  medicalSpecialties: MedicalSpecialty[];
  onChange: (medicalSpecialties: MedicalSpecialty[]) => void;
}

const emptySpecialty: MedicalSpecialty = {
  specialty_id: '',
  name: '',
  conditions_treated: '',
  procedures_offered: '',
  patient_population: '',
  description: '',
  featured: false,
};

export function MedicalSpecialtiesStep({ medicalSpecialties, onChange }: MedicalSpecialtiesStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(medicalSpecialties.length > 0 ? 0 : null);

  const addSpecialty = () => {
    const newSpecialty: MedicalSpecialty = { 
      ...emptySpecialty, 
      specialty_id: `ms-${Date.now()}` 
    };
    onChange([...medicalSpecialties, newSpecialty]);
    setExpandedIndex(medicalSpecialties.length);
  };

  const removeSpecialty = (index: number) => {
    const updated = medicalSpecialties.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateSpecialty = (index: number, field: keyof MedicalSpecialty, value: string | boolean) => {
    const updated = medicalSpecialties.map((sp, i) => 
      i === index ? { ...sp, [field]: value } : sp
    );
    onChange(updated);
  };

  return (
    <FormCard 
      title="Medical Specialties" 
      description="Define the medical specialties for your practice. These help AI understand your clinical expertise."
    >
      <div className="space-y-4">
        {medicalSpecialties.map((specialty, index) => (
          <div 
            key={specialty.specialty_id || index} 
            className="border border-border rounded-xl overflow-hidden bg-background"
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Stethoscope className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">
                  {specialty.name || `Specialty ${index + 1}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {specialty.featured && (
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
                  <FormField label="Specialty Name" required>
                    <Input
                      placeholder="Cardiology"
                      value={specialty.name}
                      onChange={(e) => updateSpecialty(index, 'name', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Patient Population">
                    <Input
                      placeholder="Adults, Pediatrics, Geriatrics"
                      value={specialty.patient_population}
                      onChange={(e) => updateSpecialty(index, 'patient_population', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Conditions Treated" hint="Comma-separated">
                    <Input
                      placeholder="Heart Disease, Arrhythmia, Hypertension"
                      value={specialty.conditions_treated}
                      onChange={(e) => updateSpecialty(index, 'conditions_treated', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Procedures Offered" hint="Comma-separated">
                    <Input
                      placeholder="EKG, Echocardiogram, Stress Test"
                      value={specialty.procedures_offered}
                      onChange={(e) => updateSpecialty(index, 'procedures_offered', e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Description">
                  <Textarea
                    placeholder="Describe this specialty and your expertise..."
                    value={specialty.description}
                    onChange={(e) => updateSpecialty(index, 'description', e.target.value)}
                  />
                </FormField>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={specialty.featured}
                      onCheckedChange={(checked) => updateSpecialty(index, 'featured', checked)}
                    />
                    <span className="text-sm text-muted-foreground">Featured Specialty</span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSpecialty(index)}
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
          onClick={addSpecialty}
          className="w-full h-12 border-dashed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Specialty
        </Button>
      </div>
    </FormCard>
  );
}
