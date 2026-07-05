## 2024-05-18 - [Date Parsing in Array Sort]
**Learning:** Using `new Date(string).getTime()` inside a `sort` comparator callback on a large array is significantly slower than parsing the date once and sorting on the pre-calculated number.
**Action:** When sorting arrays of objects by date strings, pre-calculate the numeric timestamp first to avoid O(N log N) `Date` object instantiations.
