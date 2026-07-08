## 2024-06-25 - Bounded Cache for NLP Memoization
**Learning:** Adding memoization caches for expensive NLP tasks (`tokenize` and `extractEntities`) drastically improves the cross-affinity calculation algorithm performance. However, because this is a long-running Express server application processing continuous streams of unique string titles and summaries, unbound `Map` objects create severe memory leaks over time.
**Action:** Always implement a bounded cache mechanism (e.g. tracking `size` and removing the `.keys().next().value`) or an LRU implementation for backend features touching dynamically generated string content.

## 2024-07-08 - Pre-calculate sort properties
**Learning:** In scenarios involving high-volume or repeated sorting of arrays (like aggregating 100+ RSS feed items), calling `new Date(...).getTime()` inside the sort comparison function forces O(N log N) redundant date parsings. Pre-calculating the numeric timestamp property (`pubDateParsed`) and using it during sorting avoids expensive object instantiation inside the iteration loop.
**Action:** Always pre-calculate expensive sorting keys when constructing the data structure to improve sorting and iteration performance.
