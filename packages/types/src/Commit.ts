import { ScoreOverride } from './ScoreOverride';
import { WithExtensions } from './WithExtensions';

interface CommitExtensions {
  score?: number;
  // Indicates a diff in this commit has a score override
  diffHasOverride?: boolean;
  override?: ScoreOverride;
  // Indicate if this commit was part of a squash MR
  squashed?: boolean;
}

export interface Commit extends WithExtensions<CommitExtensions> {
  id: string;
  short_id: string;
  created_at: string;
  parent_ids: string[];
  title: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
  web_url: string;
  stats: number[];
}

export namespace Commit {
  export interface Author {
    author_name: string;
    author_email: string;
    repository_member_id?: string;
  }

  export interface DailyCount {
    date: string;
    count: number;
    score: number;
  }
}
