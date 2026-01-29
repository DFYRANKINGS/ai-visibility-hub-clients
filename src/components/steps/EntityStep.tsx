import { ClientProfile, Location } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EntityStepProps {
  data: Partial<ClientProfile>;
  onChange: (data: Partial<ClientProfile>) => void;
  errors: Record<string, string>;
}

export function EntityStep({ data, onChange, errors }: EntityStepProps) {
  const handleChange = (field: keyof ClientProfile, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  // Get primary location (first location or empty)
  const primaryLocation: Partial<Location> = data.locations?.[0] || {};

  // Update primary location fields - merges into locations[0]
  const handleLocationChange = (field: keyof Location, value: string) => {
    const currentLocations = data.locations || [];
    const updatedPrimary: Location = {
      ...(currentLocations[0] || { street: '', city: '', state: '', postal_code: '' }),
      location_id: currentLocations[0]?.location_id || crypto.randomUUID(),
      location_name: currentLocations[0]?.location_name || 'Primary Location',
      [field]: value,
    };
    const updatedLocations = [updatedPrimary, ...currentLocations.slice(1)];
    onChange({ ...data, locations: updatedLocations });
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

          <FormField label="Category" hint="Your business category">
            <Input
              placeholder="e.g., Technology, Retail, Consulting"
              value={data.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
            />
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

      <FormCard 
        title="Primary Location" 
        description="Enter your main business location, contact info, and hours."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Phone">
            <Input
              type="tel"
              placeholder="(555) 123-4567"
              value={data.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
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

          <FormField label="Street Address" className="md:col-span-2">
            <Input
              placeholder="123 Main Street"
              value={primaryLocation.street || ''}
              onChange={(e) => handleLocationChange('street', e.target.value)}
            />
          </FormField>

          <FormField label="City">
            <Input
              placeholder="New York"
              value={primaryLocation.city || ''}
              onChange={(e) => handleLocationChange('city', e.target.value)}
            />
          </FormField>

          <FormField label="State">
            <Input
              placeholder="NY"
              value={primaryLocation.state || ''}
              onChange={(e) => handleLocationChange('state', e.target.value)}
            />
          </FormField>

          <FormField label="Postal Code">
            <Input
              placeholder="10001"
              value={primaryLocation.postal_code || ''}
              onChange={(e) => handleLocationChange('postal_code', e.target.value)}
            />
          </FormField>

          <FormField label="Hours">
            <Input
              placeholder="Mon-Fri 9AM-5PM"
              value={primaryLocation.hours || ''}
              onChange={(e) => handleLocationChange('hours', e.target.value)}
            />
          </FormField>

          <FormField label="Service Areas" hint="Comma-separated areas served" className="md:col-span-2">
            <Input
              placeholder="Manhattan, Brooklyn, Queens"
              value={(primaryLocation as any).service_areas || ''}
              onChange={(e) => handleLocationChange('service_areas' as keyof Location, e.target.value)}
            />
          </FormField>
        </div>
      </FormCard>
    </div>
  );
}
