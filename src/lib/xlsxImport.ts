import * as XLSX from 'xlsx';
import { ClientProfile } from '@/types/profile';

type SheetMapper<T> = {
  sheetName: string;
  fieldName: keyof ClientProfile;
  rowMapper: (row: Record<string, any>) => T;
};

const parseOrganizationSheet = (sheet: XLSX.WorkSheet): Partial<ClientProfile> => {
  const result: Partial<ClientProfile> = {};
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
  
  const fieldMap: Record<string, keyof ClientProfile> = {
    'Business Name': 'business_name',
    'Business Vertical': 'vertical',
    'Business URL': 'business_url',
    'Short Description': 'short_description',
    'Long Description': 'long_description',
    'Team Size': 'team_size',
    'Phone': 'phone',
    'Email': 'email',
  };

  for (const row of data) {
    if (!row || row.length < 2) continue;
    const label = String(row[0] || '').trim();
    const value = row[1];
    const fieldKey = fieldMap[label];
    if (fieldKey && value !== undefined && value !== '') {
      if (fieldKey === 'team_size') {
        result[fieldKey] = parseInt(String(value), 10) || undefined;
      } else if (fieldKey === 'vertical') {
        const v = String(value).toLowerCase();
        if (v === 'legal' || v === 'medical' || v === 'general') {
          result[fieldKey] = v as any;
        }
      } else {
        (result as any)[fieldKey] = String(value);
      }
    }
  }
  return result;
};

const parseTabularSheet = <T>(sheet: XLSX.WorkSheet, rowMapper: (row: Record<string, any>) => T | null): T[] => {
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
  return rows.map(rowMapper).filter((item): item is T => item !== null);
};

const sheetMappers: SheetMapper<any>[] = [
  { sheetName: 'Services', fieldName: 'services', rowMapper: (row) => ({ service_id: crypto.randomUUID(), title: row['Name'] || '', description: row['Description'] || '', category: row['Category'] || '' }) },
  { sheetName: 'FAQs', fieldName: 'faqs', rowMapper: (row) => ({ question: row['Question'] || '', answer: row['Answer'] || '', keywords: row['Keywords'] || '' }) },
  { sheetName: 'Help Articles', fieldName: 'help_articles', rowMapper: (row) => ({ article_id: crypto.randomUUID(), title: row['Title'] || '', url: row['URL'] || '', published_date: row['Date Published'] || '', article_content: row['Content'] || '' }) },
  { sheetName: 'Reviews', fieldName: 'reviews', rowMapper: (row) => ({ customer_name: row['Author'] || '', review_body: row['Review Text'] || '', rating: parseInt(row['Rating']) || 5, date: row['Date'] || '' }) },
  { sheetName: 'Locations', fieldName: 'locations', rowMapper: (row) => ({ location_id: crypto.randomUUID(), location_name: row['Name'] || '', street: row['Street'] || '', city: row['City'] || '', state: row['State'] || '', postal_code: row['Postal Code'] || '', phone: row['Phone'] || '', hours: row['Hours'] || '' }) },
  { sheetName: 'Team Members', fieldName: 'team_members', rowMapper: (row) => ({ member_name: row['Name'] || '', role: row['Title'] || '', bio: row['Bio'] || '', specialties: row['Specialties'] ? String(row['Specialties']).split(',').map(s => s.trim()).filter(Boolean) : [] }) },
  { sheetName: 'Awards', fieldName: 'awards', rowMapper: (row) => ({ name: row['Name'] || '', issuer: row['Issuer'] || '', date_awarded: row['Year'] || '' }) },
  { sheetName: 'Media Mentions', fieldName: 'media_mentions', rowMapper: (row) => ({ title: row['Title'] || '', publications: row['Publication'] || '', date: row['Date'] || '', url: row['URL'] || '' }) },
  { sheetName: 'Case Studies', fieldName: 'case_studies', rowMapper: (row) => ({ case_id: crypto.randomUUID(), title: row['Title'] || '', summary: row['Description'] || '', outcome_metrics: row['Outcome'] || '' }) },
  { sheetName: 'Certifications', fieldName: 'certifications', rowMapper: (row) => ({ name: row['Name'] || '', issuing_body: row['Issuer'] || '', date_obtained: row['Year'] || '' }) },
  { sheetName: 'Accreditations', fieldName: 'accreditations', rowMapper: (row) => ({ name: row['Name'] || '', accrediting_body: row['Issuer'] || '', date_obtained: row['Year'] || '' }) },
  { sheetName: 'Practice Areas', fieldName: 'practice_areas', rowMapper: (row) => ({ practice_area_id: crypto.randomUUID(), name: row['Name'] || '', case_types: row['Case Types'] || '', jurisdiction: row['Jurisdiction'] || '', description: row['Description'] || '' }) },
  { sheetName: 'Medical Specialties', fieldName: 'medical_specialties', rowMapper: (row) => ({ specialty_id: crypto.randomUUID(), name: row['Name'] || '', conditions_treated: row['Conditions Treated'] || '', procedures_offered: row['Procedures Offered'] || '', description: row['Description'] || '' }) },
];

export function parseXlsxToProfile(file: ArrayBuffer, existingData: Partial<ClientProfile>): Partial<ClientProfile> {
  const workbook = XLSX.read(file, { type: 'array' });
  const result: Partial<ClientProfile> = { ...existingData };
  
  if (workbook.SheetNames.includes('Organization')) {
    Object.assign(result, parseOrganizationSheet(workbook.Sheets['Organization']));
  }
  
  for (const mapper of sheetMappers) {
    if (workbook.SheetNames.includes(mapper.sheetName)) {
      const items = parseTabularSheet(workbook.Sheets[mapper.sheetName], mapper.rowMapper);
      if (items.length > 0) {
        const existingItems = (result[mapper.fieldName] as any[]) || [];
        const merged = [...existingItems];
        for (const item of items) {
          const nameKey = item.name || item.title || item.member_name || item.question || '';
          if (!nameKey) { merged.push(item); continue; }
          const existingIndex = merged.findIndex((e: any) => (e.name || e.title || e.member_name || e.question || '') === nameKey);
          if (existingIndex >= 0) merged[existingIndex] = { ...merged[existingIndex], ...item };
          else merged.push(item);
        }
        (result as any)[mapper.fieldName] = merged;
      }
    }
  }
  return result;
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
