import { useState } from 'react';
import { FAQ } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQsStepProps {
  faqs: FAQ[];
  onChange: (faqs: FAQ[]) => void;
}

const emptyFAQ: FAQ = {
  keywords: '',
  question: '',
  answer: '',
  slug: '',
};

export function FAQsStep({ faqs, onChange }: FAQsStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(faqs.length > 0 ? 0 : null);

  const addFAQ = () => {
    onChange([...faqs, { ...emptyFAQ }]);
    setExpandedIndex(faqs.length);
  };

  const removeFAQ = (index: number) => {
    const updated = faqs.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    const updated = faqs.map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    );
    onChange(updated);
  };

  return (
    <FormCard 
      title="FAQs" 
      description="Frequently asked questions help AI provide accurate answers about your business."
    >
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border border-border rounded-xl overflow-hidden bg-background"
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <span className="font-medium text-foreground truncate pr-4">
                {faq.question || `FAQ ${index + 1}`}
              </span>
              {expandedIndex === index ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
            
            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              expandedIndex === index ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <FormField label="Question" required>
                  <Input
                    placeholder="What makes your service unique?"
                    value={faq.question}
                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                  />
                </FormField>

                <FormField label="Answer" required>
                  <Textarea
                    placeholder="Provide a detailed answer..."
                    value={faq.answer}
                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                    className="h-24"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Keywords" hint="Comma-separated">
                    <Input
                      placeholder="keyword1, keyword2"
                      value={faq.keywords}
                      onChange={(e) => updateFAQ(index, 'keywords', e.target.value)}
                    />
                  </FormField>

                  <FormField label="URL Slug">
                    <Input
                      placeholder="unique-service"
                      value={faq.slug}
                      onChange={(e) => updateFAQ(index, 'slug', e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFAQ(index)}
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
          onClick={addFAQ}
          className="w-full h-12 border-dashed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add FAQ
        </Button>
      </div>
    </FormCard>
  );
}
