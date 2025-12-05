import { useState } from 'react';
import { MediaMention } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaStepProps {
  mediaMentions: MediaMention[];
  onChange: (mediaMentions: MediaMention[]) => void;
}

const emptyMention: MediaMention = { title: '', publications: '', date: '', mention_type: '' };

export function MediaStep({ mediaMentions, onChange }: MediaStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(mediaMentions.length > 0 ? 0 : null);

  const addMention = () => { onChange([...mediaMentions, { ...emptyMention }]); setExpandedIndex(mediaMentions.length); };
  const removeMention = (index: number) => onChange(mediaMentions.filter((_, i) => i !== index));
  const updateMention = (index: number, field: keyof MediaMention, value: string) => {
    onChange(mediaMentions.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  return (
    <FormCard title="Media Mentions" description="Add press coverage and media appearances.">
      <div className="space-y-4">
        {mediaMentions.map((mention, index) => (
          <div key={index} className="border border-border rounded-xl overflow-hidden bg-background">
            <button type="button" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="flex items-center gap-2"><Newspaper className="w-4 h-4 text-primary" /><span className="font-medium text-foreground">{mention.title || `Mention ${index + 1}`}</span></div>
              {expandedIndex === index ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            <div className={cn("transition-all duration-300 overflow-hidden", expandedIndex === index ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0")}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Title" required><Input placeholder="Featured in Forbes" value={mention.title} onChange={(e) => updateMention(index, 'title', e.target.value)} /></FormField>
                  <FormField label="Publication"><Input placeholder="Forbes" value={mention.publications} onChange={(e) => updateMention(index, 'publications', e.target.value)} /></FormField>
                  <FormField label="Date"><Input type="date" value={mention.date} onChange={(e) => updateMention(index, 'date', e.target.value)} /></FormField>
                  <FormField label="Type"><Input placeholder="Interview, Feature" value={mention.mention_type} onChange={(e) => updateMention(index, 'mention_type', e.target.value)} /></FormField>
                  <FormField label="URL" className="md:col-span-2"><Input type="url" placeholder="https://..." value={mention.url || ''} onChange={(e) => updateMention(index, 'url', e.target.value)} /></FormField>
                </div>
                <div className="flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={() => removeMention(index)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Remove</Button></div>
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addMention} className="w-full h-12 border-dashed"><Plus className="w-5 h-5 mr-2" />Add Media Mention</Button>
      </div>
    </FormCard>
  );
}
