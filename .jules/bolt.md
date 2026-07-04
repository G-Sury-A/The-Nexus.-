## 2024-06-25 - Bounded Cache for NLP Memoization
**Learning:** Adding memoization caches for expensive NLP tasks (`tokenize` and `extractEntities`) drastically improves the cross-affinity calculation algorithm performance. However, because this is a long-running Express server application processing continuous streams of unique string titles and summaries, unbound `Map` objects create severe memory leaks over time.
**Action:** Always implement a bounded cache mechanism (e.g. tracking `size` and removing the `.keys().next().value`) or an LRU implementation for backend features touching dynamically generated string content.
## 2024-11-20 - O(N^2) Complexity in Token Matching
**Learning:** Using `Array.prototype.includes()` inside a loop over a large set of tokens (like `commonKeys.includes(t)`) introduces $O(N^2)$ complexity, which can severely bottleneck performance during token affinity calculations.
**Action:** Replace arrays with `Set` objects for deduplication or membership checks in hot paths, bringing lookup complexity down to $O(1)$.
