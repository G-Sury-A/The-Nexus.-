## 2024-06-25 - Bounded Cache for NLP Memoization
**Learning:** Adding memoization caches for expensive NLP tasks (`tokenize` and `extractEntities`) drastically improves the cross-affinity calculation algorithm performance. However, because this is a long-running Express server application processing continuous streams of unique string titles and summaries, unbound `Map` objects create severe memory leaks over time.
**Action:** Always implement a bounded cache mechanism (e.g. tracking `size` and removing the `.keys().next().value`) or an LRU implementation for backend features touching dynamically generated string content.
## 2026-07-09 - Array Sorting with Dates Performance Bottleneck
**Learning:** `new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()` in `Array.prototype.sort()` results in massive O(N*logN) unnecessary object instantiations and parsing. For large datasets, this severely degrades V8 engine performance (from ~7ms to ~150ms for just 250 items due to hidden GC pauses).
**Action:** Always pre-calculate parsed timestamps (`pubDateParsed: number`) during the initial data transformation pass when dealing with large arrays that need sorting by date.
## 2026-07-18 - Set vs Array.includes() for NLP Deduplication
**Learning:** Using `Array.includes()` inside loops for deduplication in NLP token matching (like in `calculateAffinity`) causes a severe O(N^2) performance bottleneck, especially when cross-referencing large batches of summaries.
**Action:** Always use a `Set` for tracking common keys and `Set.has()` for constant-time lookups to maintain optimal execution speed when doing NLP entity and token matching.
