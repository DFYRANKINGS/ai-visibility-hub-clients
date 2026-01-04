import { useState } from 'react';
import { Product } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductsStepProps {
  products: Product[];
  onChange: (products: Product[]) => void;
}

const emptyProduct: Product = {
  product_id: '',
  name: '',
  short_description: '',
  description: '',
  features: [],
  sku: '',
  brand: '',
};

export function ProductsStep({ products, onChange }: ProductsStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(products.length > 0 ? 0 : null);

  const addProduct = () => {
    const newProduct = { ...emptyProduct, product_id: `prod-${Date.now()}` };
    onChange([...products, newProduct]);
    setExpandedIndex(products.length);
  };

  const removeProduct = (index: number) => {
    const updated = products.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex !== null && expandedIndex > index) {
      setExpandedIndex(expandedIndex - 1);
    }
  };

  const updateProduct = (index: number, field: keyof Product, value: string | number | string[]) => {
    const updated = products.map((prod, i) => 
      i === index ? { ...prod, [field]: value } : prod
    );
    onChange(updated);
  };

  return (
    <FormCard 
      title="Products" 
      description="Add products your business sells."
    >
      <div className="space-y-4">
        {products.map((product, index) => (
          <div 
            key={product.product_id || index} 
            className="border border-border rounded-xl overflow-hidden bg-background"
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium text-foreground">
                {product.name || `Product ${index + 1}`}
              </span>
              {expandedIndex === index ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              expandedIndex === index ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Product Name" required>
                    <Input
                      placeholder="Product Name"
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Brand">
                    <Input
                      placeholder="Brand Name"
                      value={product.brand}
                      onChange={(e) => updateProduct(index, 'brand', e.target.value)}
                    />
                  </FormField>

                  <FormField label="SKU">
                    <Input
                      placeholder="SKU-12345"
                      value={product.sku}
                      onChange={(e) => updateProduct(index, 'sku', e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Short Description">
                  <Input
                    placeholder="Brief product description"
                    value={product.short_description}
                    onChange={(e) => updateProduct(index, 'short_description', e.target.value)}
                  />
                </FormField>

                <FormField label="Full Description">
                  <Textarea
                    placeholder="Detailed product description..."
                    value={product.description}
                    onChange={(e) => updateProduct(index, 'description', e.target.value)}
                  />
                </FormField>

                <FormField label="Features" hint="Comma-separated list">
                  <Input
                    placeholder="Feature 1, Feature 2, Feature 3"
                    value={product.features.join(', ')}
                    onChange={(e) => updateProduct(index, 'features', e.target.value.split(',').map(f => f.trim()))}
                  />
                </FormField>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProduct(index)}
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
          onClick={addProduct}
          className="w-full h-12 border-dashed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
      </div>
    </FormCard>
  );
}
