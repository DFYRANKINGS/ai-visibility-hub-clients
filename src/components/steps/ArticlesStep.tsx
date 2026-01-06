import { useState } from 'react';
import { Article } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticlesStepProps {
  articles: Article[];
  onChange: (articles: Article[]) => void;
}

const emptyArticle: Article = {
  title: '',
  article_type: '',
  article_content: '',
  published_date: '',
  url: '',
  keywords: '',
  slug: '',
};

export function ArticlesStep({ articles, onChange }: ArticlesStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(articles.length > 0 ? 0 : null);

  const addArticle = () => {
    onChange([...articles, { ...emptyArticle }]);
    setExpandedIndex(articles.length);
  };

  const removeArticle = (index: number) => {
    const updated = articles.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateArticle = (index: number, field: keyof Article, value: string) => {
    const updated = articles.map((article, i) => 
      i === index ? { ...article, [field]: value } : article
    );
    onChange(updated);
  };

  return (
    <FormCard 
      title="Articles & Blog Posts" 
      description="Add articles, blog posts, or content pieces that showcase your expertise."
    >
      <div className="space-y-4">
        {articles.map((article, index) => (
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
                {article.title || `Article ${index + 1}`}
              </span>
              <div className="flex items-center gap-2">
                {article.article_type && (
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                    {article.article_type}
                  </span>
                )}
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            </button>
            
            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              expandedIndex === index ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Title" required>
                    <Input
                      placeholder="Article Title"
                      value={article.title}
                      onChange={(e) => updateArticle(index, 'title', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Type">
                    <Input
                      placeholder="Blog, News, Guide"
                      value={article.article_type}
                      onChange={(e) => updateArticle(index, 'article_type', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Published Date">
                    <Input
                      type="date"
                      value={article.published_date}
                      onChange={(e) => updateArticle(index, 'published_date', e.target.value)}
                    />
                  </FormField>

                  <FormField label="URL">
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={article.url}
                      onChange={(e) => updateArticle(index, 'url', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Keywords" hint="Comma-separated">
                    <Input
                      placeholder="keyword1, keyword2"
                      value={article.keywords}
                      onChange={(e) => updateArticle(index, 'keywords', e.target.value)}
                    />
                  </FormField>

                  <FormField label="URL Slug">
                    <Input
                      placeholder="article-title"
                      value={article.slug}
                      onChange={(e) => updateArticle(index, 'slug', e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Article Content">
                  <Textarea
                    placeholder="Write or paste your article content..."
                    value={article.article_content}
                    onChange={(e) => updateArticle(index, 'article_content', e.target.value)}
                    className="h-40"
                  />
                </FormField>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArticle(index)}
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
          onClick={addArticle}
          className="w-full h-12 border-dashed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Article
        </Button>
      </div>
    </FormCard>
  );
}