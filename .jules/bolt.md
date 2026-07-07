## 2024-06-25 - Bounded Cache for NLP Memoization
**Learning:** Adding memoization caches for expensive NLP tasks (`tokenize` and `extractEntities`) drastically improves the cross-affinity calculation algorithm performance. However, because this is a long-running Express server application processing continuous streams of unique string titles and summaries, unbound `Map` objects create severe memory leaks over time.
**Action:** Always implement a bounded cache mechanism (e.g. tracking `size` and removing the `.keys().next().value`) or an LRU implementation for backend features touching dynamically generated string content.

## 2024-07-07 - Avoid O(N^2) Array Includes for Sets
**Learning:** During cross-affinity calculations (`calculateAffinity`), using `Array.includes()` inside a loop over tokens to maintain uniqueness creates an O(N^2) complexity bottleneck. Benchmarks show this takes ~4.7s for large token sets.
**Action:** Always use a `Set` to collect unique tokens during loop iterations, then convert to an array at the end (`Array.from(set)`), reducing complexity to O(N) and dropping execution time to ~600ms.
