import { SearchResults, useApiQuery } from './base';
import { Issue } from '@ceres/types';

interface IssueSearchParams {
  repository: string;
  note_id?: string;
}

export function useGetIssueById(issueId) {
  return useApiQuery<Issue>(`/issue/${issueId}`);
}

export function useGetIssueByRepo(params) {
  return useApiQuery<SearchResults<Issue>>(
    `/issue?repository=${params.repositoryId}`,
  );
}

export function useGetIssueByNoteId(params: IssueSearchParams) {
  return useApiQuery<SearchResults<Issue>>(
    `/issue?repository=${params.repository}&note_id=${params.note_id}`,
  );
}
