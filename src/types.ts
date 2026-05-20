export type Category = 'Job' | 'Sports' | 'Entertainment' | 'Society' | 'Geopolitics';

export type NotificationStyle = 'Bullets' | 'Narrative' | 'Data-driven';

export interface UserPreferences {
  name: string;
  jobIndustry: string;
  favoriteSports: string[];
  entertainmentInterests: string[];
  societyFocus: string[];
  region: string;
  notificationTime: string;
  notificationStyle: NotificationStyle;
}

export interface NewsNode {
  id: string;
  category: Category;
  headline: string;
  summary: string;
  bullets: string[];
  dataPoints: string[];
  causalLinkToNext?: string | null;
  icon: string;
  style?: string;
  sourceUrl?: string;
  topArticles?: {
    title: string;
    summary: string;
    link: string;
  }[];
}

export interface DailyBriefing {
  date: string;
  chain: NewsNode[];
}
