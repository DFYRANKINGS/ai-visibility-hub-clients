import * as XLSX from 'xlsx';
import { ClientProfile, TeamMemberProfileUrl, TeamMemberCertification } from '@/types/profile';

type SheetMapper<T> = {
  sheetName: string;
  fieldName: keyof ClientProfile;
  rowMapper: (row: Record<string, any>) => T;
};

const parseOrganizationSheet = (sheet: XLSX.WorkSheet): Partial<ClientProfile> => {
  const result: Partial<ClientProfile> = {};
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
  
  if (rows.length === 0) return result;
  const row = rows[0]; // First data row contains the org info

  const fieldMap: Record<string, { key: keyof ClientProfile; transform?: (val: any) => any }> = {
    'business_name': { key: 'business_name' },
    'main_website_url': { key: 'business_url' },
    'logo_url': { key: 'logo_url' },
    'year_established': { key: 'year_established' },
    'team_size': { key: 'team_size' },
    'short_description': { key: 'short_description' },
    'long_description': { key: 'long_description' },
    'category': { key: 'category' },
    'google_business_url': { key: 'google_business_url' },
    'google_maps_url': { key: 'google_maps_url' },
    'apple_maps_url': { key: 'apple_maps_url' },
    'yelp_url': { key: 'yelp_url' },
    'bbb_url': { key: 'bbb_url' },
    'linkedin_url': { key: 'linkedin_url' },
    'facebook_url': { key: 'facebook_url' },
    'instagram_url': { key: 'instagram_url' },
    'youtube_url': { key: 'youtube_url' },
    'twitter_url': { key: 'twitter_url' },
    'tiktok_url': { key: 'tiktok_url' },
    'pinterest_url': { key: 'pinterest_url' },
    'other_profiles': { 
      key: 'other_profiles', 
      transform: (val: string) => val ? val.split(',').map(v => ({ url: v.trim() })).filter(p => p.url) : [] 
    },
    'primary_phone': { key: 'phone' },
    'primary_email': { key: 'email' },
  };

  for (const [xlsxCol, mapping] of Object.entries(fieldMap)) {
    const value = row[xlsxCol];
    if (value !== undefined && value !== '') {
      (result as any)[mapping.key] = mapping.transform ? mapping.transform(value) : String(value);
    }
  }

  return result;
};

const parseProfileLinks = (val: any): TeamMemberProfileUrl[] => {
  if (!val) return [];
  return String(val).split(',').map(v => ({ url: v.trim() })).filter(p => p.url);
};

const parseCertifications = (val: any): TeamMemberCertification[] => {
  if (!val) return [];
  return String(val).split(',').map(v => ({ name: v.trim(), issuing_body: '', date_obtained: '' })).filter(c => c.name);
};

const parseTabularSheet = <T>(sheet: XLSX.WorkSheet, rowMapper: (row: Record<string, any>) => T | null): T[] => {
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
  return rows.map(rowMapper).filter((item): item is T => item !== null);
};

const sheetMappers: SheetMapper<any>[] = [
  // Locations
  { 
    sheetName: 'Locations', 
    fieldName: 'locations', 
    rowMapper: (row) => ({ 
      location_id: crypto.randomUUID(), 
      location_name: row['location_name'] || '', 
      street: row['address_street'] || '', 
      city: row['address_city'] || '', 
      state: row['address_state'] || '', 
      postal_code: row['address_postal'] || '', 
      phone: row['phone'] || '', 
      hours: row['open_hours'] || '',
      service_areas: row['service_areas'] || '',
      gmb_url: row['gmb_url'] || ''
    }) 
  },
  // Services/Expertise
  { 
    sheetName: 'Services', 
    fieldName: 'services', 
    rowMapper: (row) => ({ 
      service_id: crypto.randomUUID(), 
      title: row['expertise_name'] || '', 
      description: row['description'] || '' 
    }) 
  },
  // Also support 'Expertise' sheet name for backwards compatibility
  { 
    sheetName: 'Expertise', 
    fieldName: 'services', 
    rowMapper: (row) => ({ 
      service_id: crypto.randomUUID(), 
      title: row['expertise_name'] || '', 
      description: row['description'] || '' 
    }) 
  },
  // FAQs
  { 
    sheetName: 'FAQs', 
    fieldName: 'faqs', 
    rowMapper: (row) => ({ 
      question: row['question'] || '', 
      answer: row['answer'] || '', 
      url: row['url'] || '' 
    }) 
  },
  // Help Articles
  { 
    sheetName: 'Articles', 
    fieldName: 'help_articles', 
    rowMapper: (row) => ({ 
      article_id: row['article_id'] || crypto.randomUUID(), 
      title: row['title'] || '', 
      article_type: row['article_type'] || '',
      article_content: row['article_content'] || '',
      published_date: row['published_date'] || '', 
      url: row['url'] || '',
      keywords: row['keywords'] || '',
      slug: row['slug'] || ''
    }) 
  },
  // Also support 'Help Articles' sheet name
  { 
    sheetName: 'Help Articles', 
    fieldName: 'help_articles', 
    rowMapper: (row) => ({ 
      article_id: row['article_id'] || crypto.randomUUID(), 
      title: row['title'] || '', 
      article_type: row['article_type'] || '',
      article_content: row['article_content'] || '',
      published_date: row['published_date'] || '', 
      url: row['url'] || '',
      keywords: row['keywords'] || '',
      slug: row['slug'] || ''
    }) 
  },
  // Reviews
  { 
    sheetName: 'Reviews', 
    fieldName: 'reviews', 
    rowMapper: (row) => ({ 
      review_title: row['review_title'] || '',
      date: row['date'] || '', 
      rating: parseInt(row['rating']) || 5, 
      review_body: row['review'] || ''
    }) 
  },
  // Case Studies
  { 
    sheetName: 'Case Studies', 
    fieldName: 'case_studies', 
    rowMapper: (row) => ({ 
      case_id: crypto.randomUUID(), 
      title: row['title'] || '', 
      summary: row['summary'] || '', 
      outcome_metrics: row['outcome'] || '' 
    }) 
  },
  // Media Mentions
  { 
    sheetName: 'Media', 
    fieldName: 'media_mentions', 
    rowMapper: (row) => ({ 
      title: row['title'] || '', 
      publications: row['publication'] || '', 
      date: row['date'] || '', 
      url: row['url'] || '' 
    }) 
  },
  // Also support 'Media Mentions' sheet name
  { 
    sheetName: 'Media Mentions', 
    fieldName: 'media_mentions', 
    rowMapper: (row) => ({ 
      title: row['title'] || '', 
      publications: row['publication'] || '', 
      date: row['date'] || '', 
      url: row['url'] || '' 
    }) 
  },
  // Awards
  { 
    sheetName: 'Awards', 
    fieldName: 'awards', 
    rowMapper: (row) => ({ 
      name: row['award_name'] || '', 
      issuer: row['issuer'] || '', 
      date_awarded: row['date'] || '',
      url: row['url'] || '' 
    }) 
  },
  // Certifications - Business level
  { 
    sheetName: 'Certifications', 
    fieldName: 'certifications', 
    rowMapper: (row) => ({ 
      name: row['certification_name'] || '', 
      issuing_body: row['issuer'] || '', 
      date_obtained: row['date'] || '',
      url: row['url'] || ''
    }) 
  },
  // Accreditations
  { 
    sheetName: 'Accreditations', 
    fieldName: 'accreditations', 
    rowMapper: (row) => ({ 
      name: row['accreditation_name'] || '', 
      accrediting_body: row['organization'] || '', 
      date_obtained: row['date'] || '',
      url: row['url'] || ''
    }) 
  },
];

// Team member sheet (business vertical only)
const parseTeamSheet = (sheet: XLSX.WorkSheet): any[] => {
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
  return rows.map(row => {
    const member: any = {
      member_name: row['full_name'] || '',
      role: row['role_title'] || '',
      linkedin_url: row['linkedin_url'] || '',
      photo_url: row['photo_url'] || '',
      bio: row['bio'] || '',
      license_number: row['license_number'] || '',
      profile_urls: parseProfileLinks(row['profile_links']),
      certifications: parseCertifications(row['certifications']),
      specialties: row['areas_of_expertise'] ? String(row['areas_of_expertise']).split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    return member;
  }).filter(m => m.member_name);
};

export function parseXlsxToProfile(file: ArrayBuffer, existingData: Partial<ClientProfile>): Partial<ClientProfile> {
  const workbook = XLSX.read(file, { type: 'array' });
  const result: Partial<ClientProfile> = { ...existingData };
  
  // Parse Organization sheet (first sheet)
  const orgSheetName = workbook.SheetNames[0];
  if (orgSheetName) {
    Object.assign(result, parseOrganizationSheet(workbook.Sheets[orgSheetName]));
  }
  
  // Try to find and parse team sheet
  const teamSheetNames = ['Team Members', 'Team - General'];
  for (const sheetName of teamSheetNames) {
    if (workbook.SheetNames.includes(sheetName)) {
      const teamMembers = parseTeamSheet(workbook.Sheets[sheetName]);
      if (teamMembers.length > 0) {
        const existingTeam = (result.team_members as any[]) || [];
        const merged = [...existingTeam];
        for (const member of teamMembers) {
          const existingIndex = merged.findIndex((e: any) => e.member_name === member.member_name);
          if (existingIndex >= 0) merged[existingIndex] = { ...merged[existingIndex], ...member };
          else merged.push(member);
        }
        result.team_members = merged;
      }
      break; // Only process one team sheet
    }
  }
  
  // Parse other tabular sheets
  for (const mapper of sheetMappers) {
    if (workbook.SheetNames.includes(mapper.sheetName)) {
      const items = parseTabularSheet(workbook.Sheets[mapper.sheetName], mapper.rowMapper);
      if (items.length > 0) {
        const existingItems = (result[mapper.fieldName] as any[]) || [];
        const merged = [...existingItems];
        for (const item of items) {
          const nameKey = item.name || item.title || item.member_name || item.question || item.location_name || '';
          if (!nameKey) { merged.push(item); continue; }
          const existingIndex = merged.findIndex((e: any) => 
            (e.name || e.title || e.member_name || e.question || e.location_name || '') === nameKey
          );
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
