import { useState } from 'react';
import { TeamMember, TeamMemberProfileUrl, TeamMemberCertification, BusinessVertical } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp, User, Link, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamStepProps {
  teamMembers: TeamMember[];
  onChange: (teamMembers: TeamMember[]) => void;
  vertical?: BusinessVertical;
}

const emptyMember: TeamMember = {
  member_name: '',
  role: '',
  bio: '',
  profile_urls: [],
  certifications: [],
};

export function TeamStep({ teamMembers, onChange, vertical = 'general' }: TeamStepProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(teamMembers.length > 0 ? 0 : null);
  const [specialtiesLocal, setSpecialtiesLocal] = useState<Record<number, string>>({});

  const getLabel = () => {
    switch (vertical) {
      case 'legal': return 'Lawyers';
      case 'medical': return 'Healthcare Providers';
      default: return 'Associates';
    }
  };

  const getDescription = () => {
    switch (vertical) {
      case 'legal': return 'Add lawyers and legal staff';
      case 'medical': return 'Add healthcare providers and medical staff';
      default: return 'Add team members and associates';
    }
  };

  const addMember = () => {
    onChange([...teamMembers, { ...emptyMember, profile_urls: [], certifications: [] }]);
    setExpandedIndex(teamMembers.length);
  };

  const removeMember = (index: number) => {
    const updated = teamMembers.filter((_, i) => i !== index);
    onChange(updated);
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  const updateMember = (index: number, field: keyof TeamMember, value: any) => {
    const updated = teamMembers.map((member, i) => i === index ? { ...member, [field]: value } : member);
    onChange(updated);
  };

  // Profile URLs
  const addProfileUrl = (memberIndex: number) => {
    const member = teamMembers[memberIndex];
    const urls = member.profile_urls || [];
    updateMember(memberIndex, 'profile_urls', [...urls, { platform: '', url: '' }]);
  };

  const removeProfileUrl = (memberIndex: number, urlIndex: number) => {
    const member = teamMembers[memberIndex];
    const urls = (member.profile_urls || []).filter((_, i) => i !== urlIndex);
    updateMember(memberIndex, 'profile_urls', urls);
  };

  const updateProfileUrl = (memberIndex: number, urlIndex: number, field: keyof TeamMemberProfileUrl, value: string) => {
    const member = teamMembers[memberIndex];
    const urls = (member.profile_urls || []).map((url, i) => 
      i === urlIndex ? { ...url, [field]: value } : url
    );
    updateMember(memberIndex, 'profile_urls', urls);
  };

  // Certifications
  const addCertification = (memberIndex: number) => {
    const member = teamMembers[memberIndex];
    const certs = member.certifications || [];
    updateMember(memberIndex, 'certifications', [...certs, { name: '', issuing_body: '', date_obtained: '' }]);
  };

  const removeCertification = (memberIndex: number, certIndex: number) => {
    const member = teamMembers[memberIndex];
    const certs = (member.certifications || []).filter((_, i) => i !== certIndex);
    updateMember(memberIndex, 'certifications', certs);
  };

  const updateCertification = (memberIndex: number, certIndex: number, field: keyof TeamMemberCertification, value: string) => {
    const member = teamMembers[memberIndex];
    const certs = (member.certifications || []).map((cert, i) => 
      i === certIndex ? { ...cert, [field]: value } : cert
    );
    updateMember(memberIndex, 'certifications', certs);
  };

  return (
    <FormCard title={getLabel()} description={getDescription()}>
      <div className="space-y-4">
        {teamMembers.map((member, index) => (
          <div key={index} className="border border-border rounded-xl overflow-hidden bg-background">
            <button type="button" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground block">{member.member_name || member.name || `${getLabel().slice(0, -1)} ${index + 1}`}</span>
                  {(member.role || member.title) && <span className="text-sm text-muted-foreground">{member.role || member.title}</span>}
                </div>
              </div>
              {expandedIndex === index ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>
            <div className={cn("transition-all duration-300 overflow-hidden", expandedIndex === index ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
              <div className="p-4 pt-0 space-y-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Full Name" required>
                    <Input placeholder="John Smith" value={member.member_name || member.name || ''} onChange={(e) => updateMember(index, 'member_name', e.target.value)} />
                  </FormField>
                  <FormField label="Role/Title" required>
                    <Input placeholder="Partner, Associate, etc." value={member.role || member.title || ''} onChange={(e) => updateMember(index, 'role', e.target.value)} />
                  </FormField>
                  {vertical === 'general' && (
                    <FormField label="License Number">
                      <Input placeholder="Optional" value={member.license_number || ''} onChange={(e) => updateMember(index, 'license_number', e.target.value)} />
                    </FormField>
                  )}
                  {vertical === 'medical' && (
                    <FormField label="NPI Number">
                      <Input placeholder="Optional" value={member.npi_number || ''} onChange={(e) => updateMember(index, 'npi_number', e.target.value)} />
                    </FormField>
                  )}
                  {vertical === 'legal' && (
                    <FormField label="Bar Number">
                      <Input placeholder="Optional" value={member.bar_number || ''} onChange={(e) => updateMember(index, 'bar_number', e.target.value)} />
                    </FormField>
                  )}
                  <FormField label="LinkedIn URL">
                    <Input type="url" placeholder="https://linkedin.com/in/..." value={member.linkedin_url || ''} onChange={(e) => updateMember(index, 'linkedin_url', e.target.value)} />
                  </FormField>
                  <FormField label="Photo URL">
                    <Input type="url" placeholder="https://..." value={member.photo_url || ''} onChange={(e) => updateMember(index, 'photo_url', e.target.value)} />
                  </FormField>
                  <FormField label="Specialties" hint="Comma-separated" className="md:col-span-2">
                    <Input
                      placeholder="Corporate Law, M&A, etc."
                      value={specialtiesLocal[index] ?? (member.specialties?.join(', ') || '')}
                      onChange={(e) => setSpecialtiesLocal({ ...specialtiesLocal, [index]: e.target.value })}
                      onBlur={() => {
                        const val = specialtiesLocal[index];
                        if (val !== undefined) updateMember(index, 'specialties', val.split(',').map(s => s.trim()).filter(Boolean));
                      }}
                    />
                  </FormField>
                </div>
                <FormField label="Bio">
                  <Textarea placeholder="Brief biography..." value={member.bio || ''} onChange={(e) => updateMember(index, 'bio', e.target.value)} className="h-24" />
                </FormField>

                {/* Profile URLs Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Profile URLs</span>
                  </div>
                  {(member.profile_urls || []).map((profileUrl, urlIndex) => (
                    <div key={urlIndex} className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/30">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                        <Link className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Platform (e.g., Avvo, Super Lawyers...)"
                          value={profileUrl.platform || ''}
                          onChange={(e) => updateProfileUrl(index, urlIndex, 'platform', e.target.value)}
                        />
                        <Input
                          type="url"
                          placeholder="https://..."
                          value={profileUrl.url || ''}
                          onChange={(e) => updateProfileUrl(index, urlIndex, 'url', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProfileUrl(index, urlIndex)}
                        className="text-destructive hover:text-destructive shrink-0 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addProfileUrl(index)}
                    className="w-full border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Profile URL
                  </Button>
                </div>

                {/* Certifications Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Certifications</span>
                  </div>
                  {(member.certifications || []).map((cert, certIndex) => (
                    <div key={certIndex} className="flex items-start gap-3 p-3 border border-border rounded-lg bg-muted/30">
                      <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-1">
                        <BadgeCheck className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="Certification Name"
                          value={cert.name || ''}
                          onChange={(e) => updateCertification(index, certIndex, 'name', e.target.value)}
                        />
                        <Input
                          placeholder="Issuing Body"
                          value={cert.issuing_body || ''}
                          onChange={(e) => updateCertification(index, certIndex, 'issuing_body', e.target.value)}
                        />
                        <Input
                          type="date"
                          placeholder="Date Obtained"
                          value={cert.date_obtained || ''}
                          onChange={(e) => updateCertification(index, certIndex, 'date_obtained', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCertification(index, certIndex)}
                        className="text-destructive hover:text-destructive shrink-0 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCertification(index)}
                    className="w-full border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeMember(index)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addMember} className="w-full h-12 border-dashed">
          <Plus className="w-5 h-5 mr-2" />Add {getLabel().slice(0, -1)}
        </Button>
      </div>
    </FormCard>
  );
}
