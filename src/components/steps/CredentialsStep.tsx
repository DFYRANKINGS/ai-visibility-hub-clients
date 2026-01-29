import { useState } from 'react';
import { ClientProfile, Certification, Accreditation } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp, BadgeCheck, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CredentialsStepProps {
  data: Partial<ClientProfile>;
  onChange: (data: Partial<ClientProfile>) => void;
}

const emptyCertification: Certification = { name: '', issuer: '' };
const emptyAccreditation: Accreditation = { name: '', organization: '' };

export function CredentialsStep({ data, onChange }: CredentialsStepProps) {
  const [expandedCert, setExpandedCert] = useState<number | null>(0);
  const [expandedAccred, setExpandedAccred] = useState<number | null>(null);

  const certifications = data.certifications || [];
  const accreditations = data.accreditations || [];

  const updateCertifications = (certs: Certification[]) => onChange({ ...data, certifications: certs });
  const updateAccreditations = (accreds: Accreditation[]) => onChange({ ...data, accreditations: accreds });

  const addCertification = () => { updateCertifications([...certifications, { ...emptyCertification }]); setExpandedCert(certifications.length); };
  const removeCertification = (index: number) => updateCertifications(certifications.filter((_, i) => i !== index));
  const updateCert = (index: number, field: keyof Certification, value: string) => {
    updateCertifications(certifications.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addAccreditation = () => { updateAccreditations([...accreditations, { ...emptyAccreditation }]); setExpandedAccred(accreditations.length); };
  const removeAccreditation = (index: number) => updateAccreditations(accreditations.filter((_, i) => i !== index));
  const updateAccred = (index: number, field: keyof Accreditation, value: string) => {
    updateAccreditations(accreditations.map((a, i) => i === index ? { ...a, [field]: value } : a));
  };

  return (
    <div className="space-y-6">
      {/* Certifications */}
      <FormCard title="Certifications" description="Professional certifications and credentials.">
        <div className="space-y-4">
          {certifications.map((cert, index) => (
            <div key={index} className="border border-border rounded-xl overflow-hidden bg-background">
              <button type="button" onClick={() => setExpandedCert(expandedCert === index ? null : index)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{cert.name || `Certification ${index + 1}`}</span>
                </div>
                {expandedCert === index ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
              <div className={cn("transition-all duration-300 overflow-hidden", expandedCert === index ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="p-4 pt-0 space-y-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Certification Name" required>
                      <Input placeholder="e.g., ISO 9001 Certified" value={cert.name} onChange={(e) => updateCert(index, 'name', e.target.value)} />
                    </FormField>
                    <FormField label="Issuer">
                      <Input placeholder="e.g., ISO" value={cert.issuer || ''} onChange={(e) => updateCert(index, 'issuer', e.target.value)} />
                    </FormField>
                    <FormField label="Date">
                      <Input type="date" value={cert.date || ''} onChange={(e) => updateCert(index, 'date', e.target.value)} />
                    </FormField>
                    <FormField label="Credential ID">
                      <Input placeholder="e.g., ABC-12345" value={cert.credential_id || ''} onChange={(e) => updateCert(index, 'credential_id', e.target.value)} />
                    </FormField>
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeCertification(index)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addCertification} className="w-full h-12 border-dashed">
            <Plus className="w-5 h-5 mr-2" />Add Certification
          </Button>
        </div>
      </FormCard>

      {/* Accreditations */}
      <FormCard title="Accreditations" description="Industry accreditations and approvals.">
        <div className="space-y-4">
          {accreditations.map((accred, index) => (
            <div key={index} className="border border-border rounded-xl overflow-hidden bg-background">
              <button type="button" onClick={() => setExpandedAccred(expandedAccred === index ? null : index)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{accred.name || `Accreditation ${index + 1}`}</span>
                </div>
                {expandedAccred === index ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
              <div className={cn("transition-all duration-300 overflow-hidden", expandedAccred === index ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="p-4 pt-0 space-y-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Accreditation Name" required>
                      <Input placeholder="e.g., Better Business Bureau Accreditation" value={accred.name} onChange={(e) => updateAccred(index, 'name', e.target.value)} />
                    </FormField>
                    <FormField label="Organization">
                      <Input placeholder="e.g., Better Business Bureau" value={accred.organization || ''} onChange={(e) => updateAccred(index, 'organization', e.target.value)} />
                    </FormField>
                    <FormField label="Date Obtained">
                      <Input type="date" value={accred.date_obtained || ''} onChange={(e) => updateAccred(index, 'date_obtained', e.target.value)} />
                    </FormField>
                    <FormField label="Accreditation URL">
                      <Input placeholder="e.g., https://www.bbb.org/profile/example" value={accred.url || ''} onChange={(e) => updateAccred(index, 'url', e.target.value)} />
                    </FormField>
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeAccreditation(index)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addAccreditation} className="w-full h-12 border-dashed">
            <Plus className="w-5 h-5 mr-2" />Add Accreditation
          </Button>
        </div>
      </FormCard>
    </div>
  );
}
