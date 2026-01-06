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
              value={data.main_website_url || ''}
              onChange={(e) => handleChange('main_website_url', e.target.value)}
            />
          </FormField>

          <FormField label="Logo URL">
            <Input
              type="url"
              placeholder="https://..."
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

          <FormField label="Category">
            <Input
              placeholder="e.g., Technology, Healthcare"
              value={data.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
            />
          </FormField>

          <FormField label="Primary Email">
            <Input
              type="email"
              placeholder="contact@example.com"
              value={data.primary_email || ''}
              onChange={(e) => handleChange('primary_email', e.target.value)}
            />
          </FormField>

          <FormField label="Primary Phone">
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={data.primary_phone || ''}
              onChange={(e) => handleChange('primary_phone', e.target.value)}
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

          <FormField label="Open Hours" hint="e.g., Mon-Fri 9AM-5PM">
            <Input
              placeholder="Mon-Fri 9AM-5PM EST"
              value={data.open_hours || ''}
              onChange={(e) => handleChange('open_hours', e.target.value)}
            />
          </FormField>

          <FormField label="Service Areas" className="md:col-span-2">
            <Input
              placeholder="e.g., New York, Los Angeles, Chicago"
              value={data.service_areas || ''}
              onChange={(e) => handleChange('service_areas', e.target.value)}
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

      <FormCard
        title="Entity Linking" 
        description="Link your business profiles across major platforms."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Google Business Profile URL">
            <Input
              type="url"
              placeholder="https://business.google.com/..."
              value={data.google_business_url || ''}
              onChange={(e) => handleChange('google_business_url', e.target.value)}
            />
          </FormField>

          <FormField label="Google Maps URL">
            <Input
              type="url"
              placeholder="https://maps.google.com/..."
              value={data.google_maps_url || ''}
              onChange={(e) => handleChange('google_maps_url', e.target.value)}
            />
          </FormField>

          <FormField label="Apple Maps URL">
            <Input
              type="url"
              placeholder="https://maps.apple.com/..."
              value={data.apple_maps_url || ''}
              onChange={(e) => handleChange('apple_maps_url', e.target.value)}
            />
          </FormField>

          <FormField label="Yelp URL">
            <Input
              type="url"
              placeholder="https://www.yelp.com/biz/..."
              value={data.yelp_url || ''}
              onChange={(e) => handleChange('yelp_url', e.target.value)}
            />
          </FormField>

          <FormField label="BBB URL">
            <Input
              type="url"
              placeholder="https://www.bbb.org/..."
              value={data.bbb_url || ''}
              onChange={(e) => handleChange('bbb_url', e.target.value)}
            />
          </FormField>

          <FormField label="LinkedIn URL">
            <Input
              type="url"
              placeholder="https://www.linkedin.com/company/..."
              value={data.linkedin_url || ''}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
            />
          </FormField>

          <FormField label="Facebook URL">
            <Input
              type="url"
              placeholder="https://www.facebook.com/..."
              value={data.facebook_url || ''}
              onChange={(e) => handleChange('facebook_url', e.target.value)}
            />
          </FormField>

          <FormField label="Instagram URL">
            <Input
              type="url"
              placeholder="https://www.instagram.com/..."
              value={data.instagram_url || ''}
              onChange={(e) => handleChange('instagram_url', e.target.value)}
            />
          </FormField>

          <FormField label="YouTube URL">
            <Input
              type="url"
              placeholder="https://www.youtube.com/..."
              value={data.youtube_url || ''}
              onChange={(e) => handleChange('youtube_url', e.target.value)}
            />
          </FormField>

          <FormField label="Twitter/X URL">
            <Input
              type="url"
              placeholder="https://www.twitter.com/..."
              value={data.twitter_url || ''}
              onChange={(e) => handleChange('twitter_url', e.target.value)}
            />
          </FormField>

          <FormField label="TikTok URL">
            <Input
              type="url"
              placeholder="https://www.tiktok.com/@..."
              value={data.tiktok_url || ''}
              onChange={(e) => handleChange('tiktok_url', e.target.value)}
            />
          </FormField>

          <FormField label="Pinterest URL">
            <Input
              type="url"
              placeholder="https://www.pinterest.com/..."
              value={data.pinterest_url || ''}
              onChange={(e) => handleChange('pinterest_url', e.target.value)}
            />
          </FormField>

          <FormField label="Other Profiles" className="md:col-span-2" hint="Comma-separated URLs">
            <Input
              placeholder="https://..., https://..."
              value={data.other_profiles || ''}
              onChange={(e) => handleChange('other_profiles', e.target.value)}
            />
          </FormField>
        </div>
      </FormCard>
    </div>
  );
}