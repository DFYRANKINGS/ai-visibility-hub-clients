import { useState } from 'react';
import { CaseStudy } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CasesStepProps {
  caseStudies: CaseStudy[];
  onChange: (caseStudies: CaseStudy[]) => void;
}

const emptyCase: CaseStudy = { case_id: '', title: '', summary: '', outcome_metrics: '' };

export function CasesStep({ caseStudies, onChange }: CasesStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(caseStudies.length > 0 ? 0 : null);

  const addCase = () => { onChange([...caseStudies, { ...emptyCase, case_id: `case-${Date.now()}` }]); setExpandedIndex(caseStudies.length); };
  const removeCase = (index: number) => onChange(caseStudies.filter((_, i) => i !== index));
  const updateCase = (index: number, field: keyof CaseStudy, value: string) => {
    onChange(caseStudies.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  return (
    <FormCard title="Case Studies" description="Showcase successful projects and outcomes.">
      <div className="space-y-4">
        {caseStudies.map((cs, index) => (
          <div key={cs.case_id || index} className="border border-border rounded-xl overflow-hidden bg-background">
            <button type="button" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="flex items-center gap-2"><FolderKanban className="w-4 h-4 text-primary" /><span className="font-medium text-foreground">{cs.title || `Case Study ${index + 1}`}</span></div>
              {expandedIndex === index ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            <div className={cn("transition-all duration-300 overflow-hidden", expandedIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <FormField label="Title" required><Input placeholder="Project Success Story" value={cs.title} onChange={(e) => updateCase(index, 'title', e.target.value)} /></FormField>
                <FormField label="Summary"><Textarea placeholder="Describe the project..." value={cs.summary} onChange={(e) => updateCase(index, 'summary', e.target.value)} /></FormField>
                <FormField label="Outcome Metrics"><Input placeholder="50% increase in sales" value={cs.outcome_metrics} onChange={(e) => updateCase(index, 'outcome_metrics', e.target.value)} /></FormField>
                <div className="flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={() => removeCase(index)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Remove</Button></div>
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addCase} className="w-full h-12 border-dashed"><Plus className="w-5 h-5 mr-2" />Add Case Study</Button>
      </div>
    </FormCard>
  );
}
