## 2024-06-25 - Bounded Cache for NLP Memoization
**Learning:** Adding memoization caches for expensive NLP tasks (`tokenize` and `extractEntities`) drastically improves the cross-affinity calculation algorithm performance. However, because this is a long-running Express server application processing continuous streams of unique string titles and summaries, unbound `Map` objects create severe memory leaks over time.
**Action:** Always implement a bounded cache mechanism (e.g. tracking `size` and removing the `.keys().next().value`) or an LRU implementation for backend features touching dynamically generated string content.
## 2026-07-09 - Array Sorting with Dates Performance Bottleneck
**Learning:** `new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()` in `Array.prototype.sort()` results in massive O(N*logN) unnecessary object instantiations and parsing. For large datasets, this severely degrades V8 engine performance (from ~7ms to ~150ms for just 250 items due to hidden GC pauses).
**Action:** Always pre-calculate parsed timestamps (`pubDateParsed: number`) during the initial data transformation pass when dealing with large arrays that need sorting by date.
## 2026-07-21 - O(N^2) Bottleneck in NLP Token Matching
**Learning:** Using `Array.includes()` within loops for deduplicating matched NLP tokens (e.g., in `calculateAffinity`) leads to an O(N^2) complexity bottleneck. When dealing with dynamically generated or large string payloads from RSS feeds, this degrades algorithmic processing time significantly.
**Action:** Always utilize a `Set` to track matched items and use `Set.has()` for constant-time O(1) lookups during frequency or affinity calculations in the backend.
## 2024-11-20 - O(N) Bottleneck in NLP Sentence Splitting
**Learning:** Using `nlp(text).sentences().first()` from the `compromise` package within large loops for simple sentence boundary detection introduces a massive O(N) performance bottleneck due to excessive object instantiation and string processing.
**Action:** Always use native string methods like regex `split(/(?<=[.!?])\s+/)` for simple sentence splitting within large loops to optimize CPU utilization and drastically improve performance.
## 2024-10-18 - Redundant Computations in Iteration Loops
**Learning:** Re-computing values via function calls (e.g., `tokenize` and `extractEntities`) that do string concatenation inside an `O(N)` loop creates a performance bottleneck, even if the underlying functions use an O(1) cache. The overhead of string concatenation and map lookups adds up significantly over thousands of iterations.
**Action:** When iterating over a large dataset, pre-compute values if possible or reuse variables containing already processed results. Modify function signatures to accept pre-computed inputs rather than raw data that requires re-processing on every call.
## 2024-11-21 - Redundant Computations in Fallback Loops
**Learning:** In algorithms like `generateNexusBriefing`, if an initial loop processes data and a fallback loop conditionally re-processes the same raw data, it introduces massive O(N) performance overhead (especially with NLP and string operations).
**Action:** Always pre-calculate and cache the parsed results (e.g. into an array like `allParsedArticles`) during the primary iteration pass, and iterate over that cache if the fallback condition is triggered.
## 2024-11-21 - Instantiating Static Arrays and Using `.includes()` Inside Loops
**Learning:** Instantiating static arrays or using `Array.includes()` inside loops (e.g., `calculateAffinity` or `topMatches.forEach` in `src/server/nexusAlgorithm.ts`) causes performance bottlenecks.
**Action:** Always hoist static lookup arrays outside loops and use a `Set` with `Set.has()` for O(1) constant-time lookups.
## 2024-11-21 - O(N^2) Bottleneck in matchingArticles Array Filtering
**Learning:** Using `Array.includes()` for entity matching inside an `.filter()` iteration across an array of objects creates an O(N^2) performance bottleneck, negatively impacting the efficiency of cross-referencing algorithms like `generateNexusBriefing`.
**Action:** Always pre-calculate `entitiesSet: Set<string>` alongside `entities` during the initial object instantiation pass. When filtering inside a loop, use `Set.has()` instead of `Array.includes()` for constant-time O(1) membership lookups to improve CPU performance.
## 2024-11-21 - Debouncing Window Resize Events in React
**Learning:** Attaching standard synchronous event listeners (e.g. `updateDimensions`) directly to the `window`'s `resize` event causes excessive React state updates and forces re-renders on every single pixel adjustment. When a component contains expensive SVG renders or spring physics calculations, this directly impacts frontend performance and causes jank.
**Action:** Always wrap `window.addEventListener('resize', ...)` callbacks with a basic debounce wrapper using `setTimeout` (and `clearTimeout`) in `useEffect` when dealing with UI layouts requiring heavy calculations.
