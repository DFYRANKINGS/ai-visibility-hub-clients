import { useState } from 'react';
import { ClientProfile, Certification, Accreditation, InsuranceAccepted, LegalProfile, MedicalProfile } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp, BadgeCheck, Shield, Heart, Scale, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CredentialsStepProps {
  data: Partial<ClientProfile>;
  onChange: (data: Partial<ClientProfile>) => void;
}

const emptyCertification: Certification = { name: '', issuing_body: '' };
const emptyAccreditation: Accreditation = { name: '', accrediting_body: '' };
const emptyInsurance: InsuranceAccepted = { name: '' };

export function CredentialsStep({ data, onChange }: CredentialsStepProps) {
  const [expandedCert, setExpandedCert] = useState<number | null>(0);
  const [expandedAccred, setExpandedAccred] = useState<number | null>(null);
  const [expandedIns, setExpandedIns] = useState<number | null>(null);

  const certifications = data.certifications || [];
  const accreditations = data.accreditations || [];
  const insuranceAccepted = data.insurance_accepted || [];
  const vertical = data.vertical || 'general';
  const legalProfile = data.legal_profile || {};
  const medicalProfile = data.medical_profile || {};

  const updateCertifications = (certs: Certification[]) => onChange({ ...data, certifications: certs });
  const updateAccreditations = (accreds: Accreditation[]) => onChange({ ...data, accreditations: accreds });
  const updateInsurance = (ins: InsuranceAccepted[]) => onChange({ ...data, insurance_accepted: ins });
  const updateLegalProfile = (profile: LegalProfile) => onChange({ ...data, legal_profile: profile });
  const updateMedicalProfile = (profile: MedicalProfile) => onChange({ ...data, medical_profile: profile });

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

  const addInsurance = () => { updateInsurance([...insuranceAccepted, { ...emptyInsurance }]); setExpandedIns(insuranceAccepted.length); };
  const removeInsurance = (index: number) => updateInsurance(insuranceAccepted.filter((_, i) => i !== index));
  const updateIns = (index: number, field: keyof InsuranceAccepted, value: string) => {
    updateInsurance(insuranceAccepted.map((ins, i) => i === index ? { ...ins, [field]: value } : ins));
  };

  return (
    <div className="space-y-6">
      {/* Show current vertical selection */}
      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <span className="text-muted-foreground">Business Vertical: </span>
        <span className="font-medium text-foreground capitalize">{vertical === 'general' ? 'General Business' : vertical === 'legal' ? 'Legal Services' : vertical === 'medical' ? 'Medical/Healthcare' : vertical}</span>
        {vertical !== 'general' && (
          <span className="text-muted-foreground ml-2">— Scroll down for {vertical}-specific fields</span>
        )}
      </div>

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
                      <Input placeholder="e.g., ISO 9001" value={cert.name} onChange={(e) => updateCert(index, 'name', e.target.value)} />
                    </FormField>
                    <FormField label="Issuing Body">
                      <Input placeholder="e.g., ISO" value={cert.issuing_body} onChange={(e) => updateCert(index, 'issuing_body', e.target.value)} />
                    </FormField>
                    <FormField label="Date Obtained">
                      <Input type="date" value={cert.date_obtained || ''} onChange={(e) => updateCert(index, 'date_obtained', e.target.value)} />
                    </FormField>
                    <FormField label="Expiration Date">
                      <Input type="date" value={cert.expiration_date || ''} onChange={(e) => updateCert(index, 'expiration_date', e.target.value)} />
                    </FormField>
                    <FormField label="Credential ID">
                      <Input placeholder="Optional" value={cert.credential_id || ''} onChange={(e) => updateCert(index, 'credential_id', e.target.value)} />
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
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-foreground">{accred.name || `Accreditation ${index + 1}`}</span>
                </div>
                {expandedAccred === index ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
              <div className={cn("transition-all duration-300 overflow-hidden", expandedAccred === index ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="p-4 pt-0 space-y-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Accreditation Name" required>
                      <Input placeholder="e.g., AAAHC" value={accred.name} onChange={(e) => updateAccred(index, 'name', e.target.value)} />
                    </FormField>
                    <FormField label="Accrediting Body">
                      <Input placeholder="e.g., AAAHC" value={accred.accrediting_body} onChange={(e) => updateAccred(index, 'accrediting_body', e.target.value)} />
                    </FormField>
                    <FormField label="Date Obtained">
                      <Input type="date" value={accred.date_obtained || ''} onChange={(e) => updateAccred(index, 'date_obtained', e.target.value)} />
                    </FormField>
                    <FormField label="Expiration Date">
                      <Input type="date" value={accred.expiration_date || ''} onChange={(e) => updateAccred(index, 'expiration_date', e.target.value)} />
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

      {/* Insurance Accepted */}
      <FormCard title="Insurance Accepted" description="Insurance plans you accept.">
        <div className="space-y-4">
          {insuranceAccepted.map((ins, index) => (
            <div key={index} className="border border-border rounded-xl overflow-hidden bg-background">
              <button type="button" onClick={() => setExpandedIns(expandedIns === index ? null : index)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-foreground">{ins.name || `Insurance ${index + 1}`}</span>
                </div>
                {expandedIns === index ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>
              <div className={cn("transition-all duration-300 overflow-hidden", expandedIns === index ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0")}>
                <div className="p-4 pt-0 space-y-4 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Insurance Name" required>
                      <Input placeholder="e.g., Blue Cross Blue Shield" value={ins.name} onChange={(e) => updateIns(index, 'name', e.target.value)} />
                    </FormField>
                    <FormField label="Plan Types">
                      <Input placeholder="e.g., PPO, HMO" value={ins.plan_types || ''} onChange={(e) => updateIns(index, 'plan_types', e.target.value)} />
                    </FormField>
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeInsurance(index)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addInsurance} className="w-full h-12 border-dashed">
            <Plus className="w-5 h-5 mr-2" />Add Insurance
          </Button>
        </div>
      </FormCard>

      {/* Legal Profile - only shown when vertical is 'legal' */}
      {vertical === 'legal' && (
        <FormCard title="Legal Profile" description="Legal-specific credentials and practice information.">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Scale className="w-4 h-4" />
              <span>Legal Services specific fields</span>
            </div>
            <FormField label="Bar Numbers" hint="Comma-separated list">
              <Input
                placeholder="e.g., NY12345, CA67890"
                value={legalProfile.bar_numbers?.join(', ') || ''}
                onChange={(e) => updateLegalProfile({ ...legalProfile, bar_numbers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </FormField>
            <FormField label="Practice Areas" hint="Comma-separated list">
              <Input
                placeholder="e.g., Personal Injury, Family Law"
                value={legalProfile.practice_areas?.join(', ') || ''}
                onChange={(e) => updateLegalProfile({ ...legalProfile, practice_areas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </FormField>
            <FormField label="Jurisdictions" hint="Comma-separated list">
              <Input
                placeholder="e.g., New York, California"
                value={legalProfile.jurisdictions?.join(', ') || ''}
                onChange={(e) => updateLegalProfile({ ...legalProfile, jurisdictions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </FormField>
            <FormField label="Court Admissions" hint="Comma-separated list">
              <Input
                placeholder="e.g., U.S. Supreme Court, NY State Courts"
                value={legalProfile.court_admissions?.join(', ') || ''}
                onChange={(e) => updateLegalProfile({ ...legalProfile, court_admissions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </FormField>
          </div>
        </FormCard>
      )}

      {/* Medical Profile - only shown when vertical is 'medical' */}
      {vertical === 'medical' && (
        <FormCard title="Medical Profile" description="Medical-specific credentials and practice information.">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Stethoscope className="w-4 h-4" />
              <span>Healthcare specific fields</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="NPI Number">
                <Input
                  placeholder="e.g., 1234567890"
                  value={medicalProfile.npi_number || ''}
                  onChange={(e) => updateMedicalProfile({ ...medicalProfile, npi_number: e.target.value })}
                />
              </FormField>
              <FormField label="Medical License">
                <Input
                  placeholder="e.g., MD12345"
                  value={medicalProfile.medical_license || ''}
                  onChange={(e) => updateMedicalProfile({ ...medicalProfile, medical_license: e.target.value })}
                />
              </FormField>
            </div>
            <FormField label="Specialties" hint="Comma-separated list">
              <Input
                placeholder="e.g., Cardiology, Internal Medicine"
                value={medicalProfile.specialties?.join(', ') || ''}
                onChange={(e) => updateMedicalProfile({ ...medicalProfile, specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </FormField>
            <FormField label="Hospital Affiliations" hint="Comma-separated list">
              <Input
                placeholder="e.g., Mayo Clinic, Cleveland Clinic"
                value={medicalProfile.hospital_affiliations?.join(', ') || ''}
                onChange={(e) => updateMedicalProfile({ ...medicalProfile, hospital_affiliations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </FormField>
            <FormField label="Board Certifications" hint="Comma-separated list">
              <Input
                placeholder="e.g., American Board of Internal Medicine"
                value={medicalProfile.board_certifications?.join(', ') || ''}
                onChange={(e) => updateMedicalProfile({ ...medicalProfile, board_certifications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </FormField>
          </div>
        </FormCard>
      )}
    </div>
  );
}
