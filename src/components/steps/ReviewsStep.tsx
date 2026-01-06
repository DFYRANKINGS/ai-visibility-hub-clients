import { useState } from 'react';
import { Review } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewsStepProps {
  reviews: Review[];
  onChange: (reviews: Review[]) => void;
}

const emptyReview: Review = {
  review_title: '',
  date: '',
  rating: 5,
  review: '',
};

export function ReviewsStep({ reviews, onChange }: ReviewsStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(reviews.length > 0 ? 0 : null);

  const addReview = () => {
    onChange([...reviews, { ...emptyReview }]);
    setExpandedIndex(reviews.length);
  };

  const removeReview = (index: number) => {
    const updated = reviews.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateReview = (index: number, field: keyof Review, value: string | number) => {
    const updated = reviews.map((review, i) => 
      i === index ? { ...review, [field]: value } : review
    );
    onChange(updated);
  };

  const renderStars = (rating: number, index: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => updateReview(index, 'rating', star)} className="focus:outline-none">
          <Star className={cn("w-5 h-5 transition-colors", star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
        </button>
      ))}
    </div>
  );

  return (
    <FormCard title="Customer Reviews" description="Add testimonials and reviews from your customers.">
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={index} className="border border-border rounded-xl overflow-hidden bg-background">
            <button type="button" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <span className="font-medium text-foreground">{review.review_title || `Review ${index + 1}`}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={cn("w-4 h-4", star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted")} />
                  ))}
                </div>
              </div>
              {expandedIndex === index ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            <div className={cn("transition-all duration-300 overflow-hidden", expandedIndex === index ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0")}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Review Title" required>
                    <Input placeholder="Excellent Service!" value={review.review_title} onChange={(e) => updateReview(index, 'review_title', e.target.value)} />
                  </FormField>
                  <FormField label="Date">
                    <Input type="date" value={review.date} onChange={(e) => updateReview(index, 'date', e.target.value)} />
                  </FormField>
                </div>
                <FormField label="Rating">{renderStars(review.rating, index)}</FormField>
                <FormField label="Review" required>
                  <Textarea placeholder="Share the customer's experience..." value={review.review} onChange={(e) => updateReview(index, 'review', e.target.value)} className="h-24" />
                </FormField>
                <div className="flex justify-end pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeReview(index)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addReview} className="w-full h-12 border-dashed">
          <Plus className="w-5 h-5 mr-2" />Add Review
        </Button>
      </div>
    </FormCard>
  );
}