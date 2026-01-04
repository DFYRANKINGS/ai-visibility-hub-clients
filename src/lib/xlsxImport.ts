import * as XLSX from 'xlsx';
import { ClientProfile } from '@/types/profile';

/**
 * XLSX Import Utility for Client Portal
 * 
 * Maps sheets from the canonical XLSX template to JSONB fields.
 * - Ignores unknown columns
 * - Merges with existing data (add/update only, never deletes)
 * - Returns a partial ClientProfile for upsert
 */

type SheetMapper<T> = {
  sheetName: string;
  fieldName: keyof ClientProfile;
  rowMapper: (row: Record<string, any>) => T;
};

// Organization sheet is key-value pairs, not tabular
const parseOrganizationSheet = (sheet: XLSX.WorkSheet): Partial<ClientProfile> => {
  const result: Partial<ClientProfile> = {};
  const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
  
  const fieldMap: Record<string, keyof ClientProfile> = {
    'Business Name': 'business_name',
    'Legal Name': 'legal_name',
    'Business Vertical': 'vertical',
    'Business URL': 'business_url',
    'Short Description': 'short_description',
    'Long Description': 'long_description',
    'Hours': 'hours',
    'Team Size': 'team_size',
    'Phone': 'phone',
    'Email': 'email',
    // NOTE: address_* fields are NOT mapped - all address data lives in locations[]
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

// Generic tabular sheet parser
const parseTabularSheet = <T>(
  sheet: XLSX.WorkSheet,
  rowMapper: (row: Record<string, any>) => T | null
): T[] => {
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
  return rows.map(rowMapper).filter((item): item is T => item !== null);
};

// Sheet mappers for JSONB array fields
const sheetMappers: SheetMapper<any>[] = [
  {
    sheetName: 'Services',
    fieldName: 'services',
    rowMapper: (row) => ({
      service_id: crypto.randomUUID(),
      title: row['Name'] || row['Title'] || '',
      description: row['Description'] || '',
      category: row['Category'] || '',
      slug: '',
      featured: false,
    }),
  },
  {
    sheetName: 'Products',
    fieldName: 'products',
    rowMapper: (row) => ({
      product_id: crypto.randomUUID(),
      name: row['Name'] || '',
      short_description: row['Description'] || row['Short Description'] || '',
      description: row['Description'] || '',
      features: [],
      sku: row['SKU'] || '',
      brand: row['Brand'] || '',
    }),
  },
  {
    sheetName: 'FAQs',
    fieldName: 'faqs',
    rowMapper: (row) => ({
      question: row['Question'] || '',
      answer: row['Answer'] || '',
      keywords: row['Keywords'] || '',
      slug: '',
    }),
  },
  {
    sheetName: 'Articles',
    fieldName: 'articles',
    rowMapper: (row) => ({
      article_id: crypto.randomUUID(),
      title: row['Title'] || '',
      url: row['URL'] || '',
      published_date: row['Date Published'] || row['Date'] || '',
      article: row['Description'] || row['Content'] || '',
      article_type: row['Type'] || '',
      keywords: row['Keywords'] || '',
      slug: '',
    }),
  },
  {
    sheetName: 'Reviews',
    fieldName: 'reviews',
    rowMapper: (row) => ({
      customer_name: row['Author'] || row['Customer Name'] || '',
      review_title: row['Title'] || '',
      review_body: row['Review Text'] || row['Review'] || '',
      rating: parseInt(row['Rating']) || 5,
      date: row['Date'] || '',
      reviewer_profession: row['Source'] || '',
    }),
  },
  {
    sheetName: 'Locations',
    fieldName: 'locations',
    rowMapper: (row) => ({
      location_id: crypto.randomUUID(),
      location_name: row['Name'] || row['Location Name'] || '',
      street: row['Street'] || row['Address Street'] || '',
      city: row['City'] || row['Address City'] || '',
      state: row['State'] || row['Address State'] || '',
      postal_code: row['Postal Code'] || row['Zip'] || '',
      phone: row['Phone'] || '',
      hours: row['Hours'] || '',
    }),
  },
  {
    sheetName: 'Team Members',
    fieldName: 'team_members',
    rowMapper: (row) => ({
      member_name: row['Name'] || '',
      role: row['Title'] || row['Role'] || '',
      bio: row['Bio'] || '',
      linkedin_url: row['LinkedIn'] || row['LinkedIn URL'] || '',
      photo_url: row['Photo URL'] || row['Photo'] || '',
      license_number: row['License Number'] || '',
      npi_number: row['NPI Number'] || row['NPI'] || '',
      bar_number: row['Bar Number'] || '',
      specialties: row['Specialties'] 
        ? String(row['Specialties']).split(',').map(s => s.trim()).filter(Boolean)
        : [],
    }),
  },
  {
    sheetName: 'Awards',
    fieldName: 'awards',
    rowMapper: (row) => ({
      name: row['Name'] || row['Award Name'] || '',
      issuer: row['Issuer'] || row['Awarded By'] || '',
      date_awarded: row['Year'] || row['Date Awarded'] || row['Date'] || '',
      award_url: row['URL'] || '',
    }),
  },
  {
    sheetName: 'Media Mentions',
    fieldName: 'media_mentions',
    rowMapper: (row) => ({
      title: row['Title'] || '',
      publications: row['Publication'] || row['Source'] || '',
      date: row['Date'] || '',
      url: row['URL'] || '',
      mention_type: row['Type'] || 'press',
    }),
  },
  {
    sheetName: 'Case Studies',
    fieldName: 'case_studies',
    rowMapper: (row) => ({
      case_id: crypto.randomUUID(),
      title: row['Title'] || '',
      summary: row['Description'] || row['Summary'] || '',
      outcome_metrics: row['Outcome'] || row['Outcome Metrics'] || '',
    }),
  },
  {
    sheetName: 'Certifications',
    fieldName: 'certifications',
    rowMapper: (row) => ({
      name: row['Name'] || '',
      issuing_body: row['Issuer'] || row['Issuing Body'] || '',
      date_obtained: row['Year'] || row['Date Obtained'] || '',
      credential_id: row['Credential ID'] || '',
    }),
  },
  {
    sheetName: 'Accreditations',
    fieldName: 'accreditations',
    rowMapper: (row) => ({
      name: row['Name'] || '',
      accrediting_body: row['Issuer'] || row['Accrediting Body'] || '',
      date_obtained: row['Year'] || row['Date Obtained'] || '',
    }),
  },
  {
    sheetName: 'Practice Areas',
    fieldName: 'practice_areas',
    rowMapper: (row) => ({
      practice_area_id: crypto.randomUUID(),
      name: row['Name'] || '',
      case_types: row['Case Types'] || '',
      jurisdiction: row['Jurisdiction'] || '',
      service_areas: row['Service Areas'] || '',
      description: row['Description'] || '',
      featured: false,
    }),
  },
  {
    sheetName: 'Medical Specialties',
    fieldName: 'medical_specialties',
    rowMapper: (row) => ({
      specialty_id: crypto.randomUUID(),
      name: row['Name'] || '',
      conditions_treated: row['Conditions Treated'] || '',
      procedures_offered: row['Procedures Offered'] || '',
      patient_population: row['Patient Population'] || '',
      description: row['Description'] || '',
      featured: false,
    }),
  },
];

/**
 * Parse an XLSX file and return a partial ClientProfile.
 * Merges imported data with existing data (add/update, never delete).
 */
export function parseXlsxToProfile(
  file: ArrayBuffer,
  existingData: Partial<ClientProfile>
): Partial<ClientProfile> {
  const workbook = XLSX.read(file, { type: 'array' });
  const result: Partial<ClientProfile> = { ...existingData };
  
  // Parse Organization sheet if present
  if (workbook.SheetNames.includes('Organization')) {
    const orgSheet = workbook.Sheets['Organization'];
    const orgData = parseOrganizationSheet(orgSheet);
    Object.assign(result, orgData);
  }
  
  // Parse tabular sheets
  for (const mapper of sheetMappers) {
    if (workbook.SheetNames.includes(mapper.sheetName)) {
      const sheet = workbook.Sheets[mapper.sheetName];
      const items = parseTabularSheet(sheet, mapper.rowMapper);
      
      if (items.length > 0) {
        // Merge: add imported items to existing (no duplicates by name/title)
        const existingItems = (result[mapper.fieldName] as any[]) || [];
        const merged = [...existingItems];
        
        for (const item of items) {
          const nameKey = item.name || item.title || item.member_name || item.question || '';
          if (!nameKey) {
            merged.push(item);
            continue;
          }
          
          const existingIndex = merged.findIndex((e: any) => 
            (e.name || e.title || e.member_name || e.question || '') === nameKey
          );
          
          if (existingIndex >= 0) {
            // Update existing item
            merged[existingIndex] = { ...merged[existingIndex], ...item };
          } else {
            // Add new item
            merged.push(item);
          }
        }
        
        (result as any)[mapper.fieldName] = merged;
      }
    }
  }
  
  return result;
}

/**
 * Read file as ArrayBuffer for XLSX parsing
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
