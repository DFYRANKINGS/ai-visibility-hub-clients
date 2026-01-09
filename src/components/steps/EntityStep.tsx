import { ClientProfile, BusinessVertical } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EntityStepProps {
  data: Partial<ClientProfile>;
  onChange: (data: Partial<ClientProfile>) => void;
  errors: Record<string, string>;
}

export function EntityStep({ data, onChange, errors }: EntityStepProps) {
  const handleChange = (field: keyof ClientProfile, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <FormCard 
        title="Organization Information" 
        description="Enter the basic details about your business or organization."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Business Name" required error={errors.business_name}>
            <Input
              placeholder="Your Company Name"
              value={data.business_name || ''}
              onChange={(e) => handleChange('business_name', e.target.value)}
            />
          </FormField>

          <FormField label="Alternate Name" hint="DBA or other name">
            <Input
              placeholder="Also known as..."
              value={data.alternate_name || ''}
              onChange={(e) => handleChange('alternate_name', e.target.value)}
            />
          </FormField>

          <FormField label="Business Vertical" hint="Select your industry type">
            <Select
              value={data.vertical || 'general'}
              onValueChange={(value: BusinessVertical) => handleChange('vertical', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vertical" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Business</SelectItem>
                <SelectItem value="legal">Legal Services</SelectItem>
                <SelectItem value="medical">Medical/Healthcare</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Website URL">
            <Input
              type="url"
              placeholder="https://www.example.com"
              value={data.business_url || ''}
              onChange={(e) => handleChange('business_url', e.target.value)}
            />
          </FormField>

          <FormField label="Logo URL">
            <Input
              type="text"
              placeholder="https://www.example.com/logo.png"
              value={data.logo_url || ''}
              onChange={(e) => handleChange('logo_url', e.target.value)}
            />
          </FormField>

          <FormField label="Year Established">
            <Input
              type="number"
              placeholder="2010"
              min="1800"
              max={new Date().getFullYear()}
              value={data.year_established || ''}
              onChange={(e) => handleChange('year_established', parseInt(e.target.value) || '')}
            />
          </FormField>

          <FormField label="Email">
            <Input
              type="email"
              placeholder="contact@example.com"
              value={data.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </FormField>

          <FormField label="Phone">
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={data.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </FormField>

          <FormField label="Team Size">
            <Input
              type="number"
              placeholder="10"
              min="1"
              value={data.team_size || ''}
              onChange={(e) => handleChange('team_size', parseInt(e.target.value) || '')}
            />
          </FormField>
        </div>

        <div className="mt-6 space-y-6">
          <FormField label="Short Description" hint="A brief tagline (max 160 characters)">
            <Textarea
              placeholder="A brief description of your business..."
              maxLength={160}
              value={data.short_description || ''}
              onChange={(e) => handleChange('short_description', e.target.value)}
              className="h-20"
            />
          </FormField>

          <FormField label="Long Description" hint="Detailed description of your business">
            <Textarea
              placeholder="A comprehensive description of your business, services, and what makes you unique..."
              value={data.long_description || ''}
              onChange={(e) => handleChange('long_description', e.target.value)}
              className="h-32"
            />
          </FormField>
        </div>
      </FormCard>
    </div>
  );
}
