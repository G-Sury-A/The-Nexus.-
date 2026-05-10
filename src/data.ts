import { DailyBriefing } from './types';

export const mockScenarios: DailyBriefing[] = [
  {
    date: new Date().toISOString(),
    chain: [
      {
        id: 'geo-1',
        category: 'Geopolitics',
        icon: 'Globe2',
        headline: 'Global Silicon Trade Pact Signed',
        summary: 'Major global powers reached a landmark agreement in Geneva, stabilizing the silicon supply chain and reducing import tariffs by 12%.',
        bullets: ['Agreement signed in Geneva', 'Silicon tariffs reduced by 12%', 'Supply chain stabilized for 10 years'],
        dataPoints: ['12% Tariff Reduction', '$50B Market Impact'],
        causalLinkToNext: 'This secures vital tech supply chains, directly causing...'
      },
      {
        id: 'job-1',
        category: 'Job',
        icon: 'Briefcase',
        headline: 'Tech Sector Hiring Surges 15%',
        summary: 'Bolstered by hardware availability, technology firms worldwide are expanding their R&D divisions, leading to a massive hiring spree.',
        bullets: ['15% increase in tech hiring', 'Focus on R&D and hardware engineering', 'Remote work options remaining stable'],
        dataPoints: ['+15% Job Growth', '120k New Roles'],
        causalLinkToNext: 'With heightened economic activity and more disposable income in urban tech hubs...'
      },
      {
        id: 'soc-1',
        category: 'Society',
        icon: 'Users',
        headline: 'Urban Infrastructure Revival',
        summary: 'City councils are heavily investing in public transit and community spaces to accommodate the influx of new tech workers.',
        bullets: ['Public transit budgets increased', 'New community parks announced', 'Focus on sustainable urban living'],
        dataPoints: ['$2B Public Investment', '+8% Transit Ridership'],
        causalLinkToNext: 'Improved city living and community focus leads to...'
      },
      {
        id: 'ent-1',
        category: 'Entertainment',
        icon: 'Film',
        headline: 'Boom in Local Live Festivals',
        summary: 'A renaissance of local arts and music festivals is sweeping through major cities, drawing crowds back to downtown areas.',
        bullets: ['Live music scenes thriving', 'Downtown cultural events up 40%', 'Support for indie artists growing'],
        dataPoints: ['40% Event Increase', '2M+ Attendees'],
        causalLinkToNext: 'Drawing massive weekend crowds, which naturally spills over into...'
      },
      {
        id: 'spo-1',
        category: 'Sports',
        icon: 'Trophy',
        headline: 'Record Attendance for Local Sports',
        summary: 'Local sports franchises are reporting record-breaking ticket sales and fan engagement as community spirit reaches an all-time high.',
        bullets: ['Stadium attendances hit 10-year high', 'Merchandise sales doubled', 'Community sports initiatives funded'],
        dataPoints: ['10-yr High Attendance', '+100% Merch Sales'],
      }
    ]
  }
];

export const emptyPreferences = {
  name: '',
  jobIndustry: '',
  favoriteSports: [],
  entertainmentInterests: [],
  societyFocus: [],
  region: '',
  notificationTime: '08:00',
  notificationStyle: 'Bullets' as const
};
