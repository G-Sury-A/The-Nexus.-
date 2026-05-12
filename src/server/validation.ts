import { UserPreferences, NotificationStyle } from '../types.js';

export function validateUserPreferences(data: any): { valid: boolean; errors?: string[]; cleaned?: UserPreferences } {
  const errors: string[] = [];
  const validStyles: NotificationStyle[] = ['Bullets', 'Narrative', 'Data-driven', 'Executive'];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid input data'] };
  }

  const cleaned: Partial<UserPreferences> = {};

  // name: string
  if (typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Name is required and must be a string');
  } else if (data.name.length > 100) {
    errors.push('Name is too long');
  } else {
    cleaned.name = data.name.trim();
  }

  // jobIndustry: string
  if (typeof data.jobIndustry !== 'string' || data.jobIndustry.trim() === '') {
    errors.push('Job Industry is required and must be a string');
  } else if (data.jobIndustry.length > 100) {
    errors.push('Job Industry is too long');
  } else {
    cleaned.jobIndustry = data.jobIndustry.trim();
  }

  // favoriteSports: string[]
  if (!Array.isArray(data.favoriteSports)) {
    errors.push('Favorite Sports must be an array');
  } else if (data.favoriteSports.length > 50) {
    errors.push('Too many favorite sports');
  } else {
    cleaned.favoriteSports = data.favoriteSports
      .filter((s: any) => typeof s === 'string')
      .map((s: string) => s.trim().slice(0, 100));
  }

  // entertainmentInterests: string[]
  if (!Array.isArray(data.entertainmentInterests)) {
    errors.push('Entertainment Interests must be an array');
  } else if (data.entertainmentInterests.length > 50) {
    errors.push('Too many entertainment interests');
  } else {
    cleaned.entertainmentInterests = data.entertainmentInterests
      .filter((s: any) => typeof s === 'string')
      .map((s: string) => s.trim().slice(0, 100));
  }

  // societyFocus: string[]
  if (!Array.isArray(data.societyFocus)) {
    errors.push('Society Focus must be an array');
  } else if (data.societyFocus.length > 50) {
    errors.push('Too many society focus items');
  } else {
    cleaned.societyFocus = data.societyFocus
      .filter((s: any) => typeof s === 'string')
      .map((s: string) => s.trim().slice(0, 100));
  }

  // region: string
  if (typeof data.region !== 'string' || data.region.trim() === '') {
    errors.push('Region is required and must be a string');
  } else if (data.region.length > 100) {
    errors.push('Region is too long');
  } else {
    cleaned.region = data.region.trim();
  }

  // notificationTime: string (HH:mm format ideally, but we'll just check string for now)
  if (typeof data.notificationTime !== 'string' || data.notificationTime.trim() === '') {
    errors.push('Notification Time is required and must be a string');
  } else {
    cleaned.notificationTime = data.notificationTime.trim();
  }

  // notificationStyle: NotificationStyle
  if (!validStyles.includes(data.notificationStyle)) {
    errors.push(`Invalid Notification Style. Must be one of: ${validStyles.join(', ')}`);
  } else {
    cleaned.notificationStyle = data.notificationStyle;
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, cleaned: cleaned as UserPreferences };
}
