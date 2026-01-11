import { useEffect, useState } from 'react';
import { ClientProfile, Certification, Accreditation, LegalProfile, MedicalProfile } from '@/types/profile';
import { FormCard } from '@/components/FormCard';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronDown, ChevronUp, BadgeCheck, Shield, Scale, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CredentialsStepProps {
  data: Partial<ClientProfile>;
  onChange: (data: Partial<ClientProfile>) => void;
}

const emptyCertification: Certification = { name: '', issuing_body: '' };
const emptyAccreditation: Accreditation = { name: '', organization: '' };

const parseCommaList = (raw: string) =>
  raw.split(',').map((s) => s.trim()).filter(Boolean);

export function CredentialsStep({ data, onChange }: CredentialsStepProps) {
  const [expandedCert, setExpandedCert] = useState<number | null>(0);
  const [expandedAccred, setExpandedAccred] = useState<number | null>(null);

  const certifications = data.certifications || [];
  const accreditations = data.accreditations || [];
  const vertical = data.vertical || 'general';
  const legalProfile = data.legal_profile || {};
  const medicalProfile = data.medical_profile || {};

  const [barNumbersText, setBarNumbersText] = useState(legalProfile.bar_numbers?.join(', ') || '');
  const [jurisdictionsText, setJurisdictionsText] = useState(legalProfile.jurisdictions?.join(', ') || '');
  const [courtAdmissionsText, setCourtAdmissionsText] = useState(legalProfile.court_admissions?.join(', ') || '');
  const [hospitalAffiliationsText, setHospitalAffiliationsText] = useState(medicalProfile.hospital_affiliations?.join(', ') || '');
  const [boardCertificationsText, setBoardCertificationsText] = useState(medicalProfile.board_certifications?.join(', ') || '');

  useEffect(() => {
    setBarNumbersText(legalProfile.bar_numbers?.join(', ') || '');
    setJurisdictionsText(legalProfile.jurisdictions?.join(', ') || '');
    setCourtAdmissionsText(legalProfile.court_admissions?.join(', ') || '');
  }, [legalProfile.bar_numbers, legalProfile.jurisdictions, legalProfile.court_admissions]);

  useEffect(() => {
    setHospitalAffiliationsText(medicalProfile.hospital_affiliations?.join(', ') || '');
    setBoardCertificationsText(medicalProfile.board_certifications?.join(', ') || '');
  }, [medicalProfile.hospital_affiliations, medicalProfile.board_certifications]);

  const updateCertifications = (certs: Certification[]) => onChange({ ...data, certifications: certs });
  const updateAccreditations = (accreds: Accreditation[]) => onChange({ ...data, accreditations: accreds });
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

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 rounded-lg p-3 text-sm">
        <span className="text-muted-foreground">Business Vertical: </span>
        <span className="font-medium text-foreground capitalize">{vertical === 'general' ? 'General Business' : vertical === 'legal' ? 'Legal Services' : 'Medical/Healthcare'}</span>
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
                      <Input placeholder="e.g., ISO" value={cert.issuing_body || ''} onChange={(e) => updateCert(index, 'issuing_body', e.target.value)} />
                    </FormField>
                    <FormField label="Date Obtained">
                      <Input type="date" value={cert.date_obtained || ''} onChange={(e) => updateCert(index, 'date_obtained', e.target.value)} />
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

      {/* Legal Profile */}
      {vertical === 'legal' && (
        <FormCard title="Legal Profile" description="Legal-specific credentials and practice information.">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Scale className="w-4 h-4" /><span>Legal Services specific fields</span>
            </div>
            <FormField label="Bar Numbers" hint="Comma-separated list">
              <Input placeholder="e.g., NY12345, CA67890" value={barNumbersText} onChange={(e) => setBarNumbersText(e.target.value)}
                onBlur={() => updateLegalProfile({ ...legalProfile, bar_numbers: parseCommaList(barNumbersText) })} />
            </FormField>
            <FormField label="Jurisdictions" hint="Comma-separated list">
              <Input placeholder="e.g., New York, California" value={jurisdictionsText} onChange={(e) => setJurisdictionsText(e.target.value)}
                onBlur={() => updateLegalProfile({ ...legalProfile, jurisdictions: parseCommaList(jurisdictionsText) })} />
            </FormField>
            <FormField label="Court Admissions" hint="Comma-separated list">
              <Input placeholder="e.g., U.S. Supreme Court, NY State Courts" value={courtAdmissionsText} onChange={(e) => setCourtAdmissionsText(e.target.value)}
                onBlur={() => updateLegalProfile({ ...legalProfile, court_admissions: parseCommaList(courtAdmissionsText) })} />
            </FormField>
          </div>
        </FormCard>
      )}

      {/* Medical Profile */}
      {vertical === 'medical' && (
        <FormCard title="Medical Profile" description="Medical-specific credentials and practice information.">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Stethoscope className="w-4 h-4" /><span>Healthcare specific fields</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="NPI Number">
                <Input placeholder="e.g., 1234567890" value={medicalProfile.npi_number || ''} onChange={(e) => updateMedicalProfile({ ...medicalProfile, npi_number: e.target.value })} />
              </FormField>
              <FormField label="Medical License">
                <Input placeholder="e.g., MD12345" value={medicalProfile.medical_license || ''} onChange={(e) => updateMedicalProfile({ ...medicalProfile, medical_license: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Hospital Affiliations" hint="Comma-separated list">
              <Input placeholder="e.g., Mayo Clinic, Cleveland Clinic" value={hospitalAffiliationsText} onChange={(e) => setHospitalAffiliationsText(e.target.value)}
                onBlur={() => updateMedicalProfile({ ...medicalProfile, hospital_affiliations: parseCommaList(hospitalAffiliationsText) })} />
            </FormField>
            <FormField label="Board Certifications" hint="Comma-separated list">
              <Input placeholder="e.g., American Board of Internal Medicine" value={boardCertificationsText} onChange={(e) => setBoardCertificationsText(e.target.value)}
                onBlur={() => updateMedicalProfile({ ...medicalProfile, board_certifications: parseCommaList(boardCertificationsText) })} />
            </FormField>
          </div>
        </FormCard>
      )}
    </div>
  );
}
