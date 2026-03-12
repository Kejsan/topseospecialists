const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('firestore_export.json', 'utf8'));
const specialists = [
  ...(data.specialists || []),
  ...(data['pending-specialists'] || []),
];

const columns = [
  'record_id',
  'name',
  'slug',
  'status',
  'platform_category',
  'current_role',
  'current_company',
  'headline',
  'bio_short',
  'bio_long',
  'country',
  'city',
  'region',
  'timezone',
  'primary_category',
  'secondary_categories',
  'specialties',
  'seniority_level',
  'engagement_type',
  'industry_focus',
  'market_focus',
  'company_size_focus',
  'languages',
  'years_experience',
  'key_contribution',
  'notable_achievements',
  'notable_clients_or_brands',
  'speaking_engagements',
  'podcasts_or_interviews',
  'books_or_newsletters',
  'case_studies',
  'certifications',
  'services_offered',
  'problems_they_solve',
  'ideal_for',
  'personal_website',
  'company_website',
  'linkedin_url',
  'x_url',
  'github_url',
  'other_social_urls',
  'profile_image_url',
  'source_urls',
  'source_notes',
  'confidence_score',
  'last_verified_at',
  'crawl_seed_query',
  'crawl_priority',
  'manual_review_notes'
];

const escapeCsv = (value) => {
  const text = value == null ? '' : String(value);
  return '"' + text.replace(/"/g, '""') + '"';
};

const inferCompanyFromRole = (role) => {
  if (!role) return '';
  const text = String(role).trim();
  const commaMatch = text.match(/^.+?,\s*(.+)$/);
  if (commaMatch) return commaMatch[1].trim();
  const atMatch = text.match(/^.+?\s+at\s+(.+)$/i);
  if (atMatch) return atMatch[1].trim();
  return '';
};

const rows = specialists
  .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
  .map((item, index) => {
    const role = item.role || '';
    const social = item.social || '';
    return {
      record_id: item.id || item.slug || `row-${index + 1}`,
      name: item.name || '',
      slug: item.slug || '',
      status: item.status || '',
      platform_category: item.category || '',
      current_role: role,
      current_company: inferCompanyFromRole(role),
      headline: '',
      bio_short: item.summary || item.contribution || '',
      bio_long: '',
      country: '',
      city: '',
      region: '',
      timezone: '',
      primary_category: item.category || '',
      secondary_categories: '',
      specialties: '',
      seniority_level: '',
      engagement_type: '',
      industry_focus: '',
      market_focus: '',
      company_size_focus: '',
      languages: '',
      years_experience: '',
      key_contribution: item.contribution || '',
      notable_achievements: '',
      notable_clients_or_brands: '',
      speaking_engagements: '',
      podcasts_or_interviews: '',
      books_or_newsletters: '',
      case_studies: '',
      certifications: '',
      services_offered: '',
      problems_they_solve: '',
      ideal_for: '',
      personal_website: item.website || '',
      company_website: '',
      linkedin_url: /linkedin\.com/i.test(social) ? social : '',
      x_url: /(x\.com|twitter\.com)/i.test(social) ? social : '',
      github_url: /github\.com/i.test(social) ? social : '',
      other_social_urls: social && !/(linkedin\.com|x\.com|twitter\.com|github\.com)/i.test(social) ? social : '',
      profile_image_url: item.avatar || '',
      source_urls: [item.website, social].filter(Boolean).join(' | '),
      source_notes: 'Populate with verifiable public data only.',
      confidence_score: '',
      last_verified_at: '',
      crawl_seed_query: [item.name, role, item.category, 'SEO'].filter(Boolean).join(' '),
      crawl_priority: 'normal',
      manual_review_notes: ''
    };
  });

const csv = [
  columns.map(escapeCsv).join(','),
  ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(','))
].join('\n');

fs.writeFileSync(path.join('enrichment', 'profile-enrichment-scaffold.csv'), csv, 'utf8');
console.log(`Wrote ${rows.length} rows.`);
