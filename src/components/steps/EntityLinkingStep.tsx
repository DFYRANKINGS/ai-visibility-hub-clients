import { ClientProfile, OtherProfile } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Link, ExternalLink } from 'lucide-react';

interface EntityLinkingStepProps {
  data: Partial<ClientProfile>;
  onChange: (data: Partial<ClientProfile>) => void;
}

export function EntityLinkingStep({ data, onChange }: EntityLinkingStepProps) {
  const handleChange = (field: keyof ClientProfile, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const otherProfiles = data.other_profiles || [];

  const addOtherProfile = () => {
    onChange({ 
      ...data, 
      other_profiles: [...otherProfiles, { platform: '', url: '' }] 
    });
  };

  const removeOtherProfile = (index: number) => {
    const updated = otherProfiles.filter((_, i) => i !== index);
    onChange({ ...data, other_profiles: updated });
  };

  const updateOtherProfile = (index: number, field: keyof OtherProfile, value: string) => {
    const updated = otherProfiles.map((profile, i) => 
      i === index ? { ...profile, [field]: value } : profile
    );
    onChange({ ...data, other_profiles: updated });
  };

  return (
    <div className="space-y-6">
      <FormCard 
        title="Business Profile Links" 
        description="Link your business directory profiles and review sites."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Google Business Profile">
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

          <FormField label="Yelp Profile">
            <Input
              type="url"
              placeholder="https://yelp.com/biz/..."
              value={data.yelp_url || ''}
              onChange={(e) => handleChange('yelp_url', e.target.value)}
            />
          </FormField>

          <FormField label="BBB Profile">
            <Input
              type="url"
              placeholder="https://bbb.org/..."
              value={data.bbb_url || ''}
              onChange={(e) => handleChange('bbb_url', e.target.value)}
            />
          </FormField>

          <FormField label="Apple Maps">
            <Input
              type="url"
              placeholder="https://maps.apple.com/..."
              value={data.apple_maps_url || ''}
              onChange={(e) => handleChange('apple_maps_url', e.target.value)}
            />
          </FormField>
        </div>
      </FormCard>

      <FormCard 
        title="Social Media Links" 
        description="Connect your social media profiles."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="LinkedIn">
            <Input
              type="url"
              placeholder="https://linkedin.com/company/..."
              value={data.linkedin_url || ''}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
            />
          </FormField>

          <FormField label="Facebook">
            <Input
              type="url"
              placeholder="https://facebook.com/..."
              value={data.facebook_url || ''}
              onChange={(e) => handleChange('facebook_url', e.target.value)}
            />
          </FormField>

          <FormField label="Instagram">
            <Input
              type="url"
              placeholder="https://instagram.com/..."
              value={data.instagram_url || ''}
              onChange={(e) => handleChange('instagram_url', e.target.value)}
            />
          </FormField>

          <FormField label="YouTube">
            <Input
              type="url"
              placeholder="https://youtube.com/..."
              value={data.youtube_url || ''}
              onChange={(e) => handleChange('youtube_url', e.target.value)}
            />
          </FormField>

          <FormField label="X (Twitter)">
            <Input
              type="url"
              placeholder="https://x.com/..."
              value={data.twitter_url || ''}
              onChange={(e) => handleChange('twitter_url', e.target.value)}
            />
          </FormField>

          <FormField label="TikTok">
            <Input
              type="url"
              placeholder="https://tiktok.com/@..."
              value={data.tiktok_url || ''}
              onChange={(e) => handleChange('tiktok_url', e.target.value)}
            />
          </FormField>

          <FormField label="Pinterest">
            <Input
              type="url"
              placeholder="https://pinterest.com/..."
              value={data.pinterest_url || ''}
              onChange={(e) => handleChange('pinterest_url', e.target.value)}
            />
          </FormField>
        </div>
      </FormCard>

      <FormCard 
        title="Other Profiles" 
        description="Add any additional profile links not listed above."
      >
        <div className="space-y-4">
          {otherProfiles.map((profile, index) => (
            <div key={index} className="flex items-start gap-3 p-4 border border-border rounded-lg bg-background">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Link className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Platform Name">
                  <Input
                    placeholder="e.g., Avvo, FindLaw, Healthgrades..."
                    value={profile.platform || ''}
                    onChange={(e) => updateOtherProfile(index, 'platform', e.target.value)}
                  />
                </FormField>
                <FormField label="Profile URL">
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={profile.url || ''}
                    onChange={(e) => updateOtherProfile(index, 'url', e.target.value)}
                  />
                </FormField>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOtherProfile(index)}
                className="text-destructive hover:text-destructive shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={addOtherProfile} 
            className="w-full h-12 border-dashed"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Another Profile
          </Button>
        </div>
      </FormCard>
    </div>
  );
}
