import { useState } from 'react';
import { Award } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AwardsStepProps {
  awards: Award[];
  onChange: (awards: Award[]) => void;
}

const emptyAward: Award = { award_name: '', issuer: '', date: '' };

export function AwardsStep({ awards, onChange }: AwardsStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(awards.length > 0 ? 0 : null);
  const addAward = () => { onChange([...awards, { ...emptyAward }]); setExpandedIndex(awards.length); };
  const removeAward = (index: number) => onChange(awards.filter((_, i) => i !== index));
  const updateAward = (index: number, field: keyof Award, value: string) => {
    onChange(awards.map((a, i) => i === index ? { ...a, [field]: value } : a));
  };

  return (
    <FormCard title="Awards & Certifications" description="Showcase your achievements and credentials.">
      <div className="space-y-4">
        {awards.map((award, index) => (
          <div key={index} className="border border-border rounded-xl overflow-hidden bg-background">
            <button type="button" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-foreground">{award.award_name || `Award ${index + 1}`}</span>
              </div>
              {expandedIndex === index ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            <div className={cn("transition-all duration-300 overflow-hidden", expandedIndex === index ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0")}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Award Name" required><Input placeholder="Best in Industry" value={award.award_name} onChange={(e) => updateAward(index, 'award_name', e.target.value)} /></FormField>
                  <FormField label="Issuer"><Input placeholder="Industry Association" value={award.issuer} onChange={(e) => updateAward(index, 'issuer', e.target.value)} /></FormField>
                  <FormField label="Date"><Input type="date" value={award.date} onChange={(e) => updateAward(index, 'date', e.target.value)} /></FormField>
                  <FormField label="URL"><Input type="url" placeholder="https://..." value={award.url || ''} onChange={(e) => updateAward(index, 'url', e.target.value)} /></FormField>
                </div>
                <div className="flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={() => removeAward(index)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Remove</Button></div>
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addAward} className="w-full h-12 border-dashed"><Plus className="w-5 h-5 mr-2" />Add Award</Button>
      </div>
    </FormCard>
  );
}