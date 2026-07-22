## 2024-06-25 - Bounded Cache for NLP Memoization
**Learning:** Adding memoization caches for expensive NLP tasks (`tokenize` and `extractEntities`) drastically improves the cross-affinity calculation algorithm performance. However, because this is a long-running Express server application processing continuous streams of unique string titles and summaries, unbound `Map` objects create severe memory leaks over time.
**Action:** Always implement a bounded cache mechanism (e.g. tracking `size` and removing the `.keys().next().value`) or an LRU implementation for backend features touching dynamically generated string content.
## 2026-07-09 - Array Sorting with Dates Performance Bottleneck
**Learning:** `new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()` in `Array.prototype.sort()` results in massive O(N*logN) unnecessary object instantiations and parsing. For large datasets, this severely degrades V8 engine performance (from ~7ms to ~150ms for just 250 items due to hidden GC pauses).
**Action:** Always pre-calculate parsed timestamps (`pubDateParsed: number`) during the initial data transformation pass when dealing with large arrays that need sorting by date.
## 2026-07-21 - O(N^2) Bottleneck in NLP Token Matching
**Learning:** Using `Array.includes()` within loops for deduplicating matched NLP tokens (e.g., in `calculateAffinity`) leads to an O(N^2) complexity bottleneck. When dealing with dynamically generated or large string payloads from RSS feeds, this degrades algorithmic processing time significantly.
**Action:** Always utilize a `Set` to track matched items and use `Set.has()` for constant-time O(1) lookups during frequency or affinity calculations in the backend.
