import { performance } from 'perf_hooks';

interface RawArticle {
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  pubDateParsed?: number;
  category: string;
  id: string;
}

const numArticles = 10000;
const articles: RawArticle[] = Array.from({ length: numArticles }, (_, i) => {
  const pubDate = new Date(Date.now() - Math.random() * 10000000000).toISOString();
  return {
    title: `Article ${i}`,
    summary: `Summary ${i}`,
    link: `http://example.com/${i}`,
    pubDate,
    pubDateParsed: new Date(pubDate).getTime(),
    category: 'Test',
    id: `${i}`
  };
});

function originalSort(arr: RawArticle[]) {
  const copy = [...arr];
  copy.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return copy.slice(0, 100);
}

function optimizedSort(arr: RawArticle[]) {
  const copy = [...arr];
  copy.sort((a, b) => (b.pubDateParsed ?? new Date(b.pubDate).getTime()) - (a.pubDateParsed ?? new Date(a.pubDate).getTime()));
  return copy.slice(0, 100);
}

// Warmup
for (let i = 0; i < 10; i++) {
  originalSort(articles);
  optimizedSort(articles);
}

const originalTimes: number[] = [];
for (let i = 0; i < 100; i++) {
  const start = performance.now();
  originalSort(articles);
  originalTimes.push(performance.now() - start);
}
const originalAvg = originalTimes.reduce((a, b) => a + b, 0) / originalTimes.length;

const optimizedTimes: number[] = [];
for (let i = 0; i < 100; i++) {
  const start = performance.now();
  optimizedSort(articles);
  optimizedTimes.push(performance.now() - start);
}
const optimizedAvg = optimizedTimes.reduce((a, b) => a + b, 0) / optimizedTimes.length;

console.log(`Original Sort: ${originalAvg.toFixed(2)} ms`);
console.log(`Optimized Sort: ${optimizedAvg.toFixed(2)} ms`);
console.log(`Improvement: ${((originalAvg - optimizedAvg) / originalAvg * 100).toFixed(2)}%`);
