import { Diff } from '@ceres/types';
import { useApiInfiniteQuery } from './base';

interface DiffSearchParams {
  commit?: string;
  merge_request?: string;
}

// Following naming convention of useInfinite____
// get ${pageSize} files while returning function fetchNextPage and value hasNextPage
// to load subsequent pages
export function useInfiniteDiffs(params: DiffSearchParams, pageSize = 15) {
  return useApiInfiniteQuery<Diff>('/diff', params, pageSize);
}

// if in the future you need to get a single page of file diffs
// create a similar function with `usePaginatedQuery`
