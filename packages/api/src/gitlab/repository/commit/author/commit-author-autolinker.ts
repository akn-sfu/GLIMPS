import { Commit } from '@ceres/types';
import { RepositoryMember } from '../../repository-member/repository-member.entity';
import { CommitAuthor } from './commit-author.entity';

// longest substring metric
function lcsScore(s1: string, s2: string) {
  if (!s1 || !s2) return -1;

  const n = s1.length;
  const m = s2.length;

  // DP array
  //reference https://stackoverflow.com/questions/30144580/typescript-multidimensional-array-initialization
  const dp: number[][] = new Array(n + 1)
    .fill(0)
    .map(() => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; ++i) {
    for (let j = 1; j <= m; ++j) {
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = Math.max(dp[i][j], dp[i - 1][j - 1] + 1);
      }
    }
  }
  return 0.5 * dp[n][m] * (1 / n + 1 / m);
}

//letter matching frequency metric
function lmfScore(s1: string, s2: string) {
  const n = s1.length;
  const m = s2.length;

  const s1_accumulator = new Map<string, number>();
  for (let i = 0; i < n; ++i) {
    const s1_value = s1_accumulator.get(s1[i]);
    s1_accumulator.set(s1[i], s1_value === undefined ? 1 : s1_value + 1);
  }
  let score = 0;

  for (let i = 0; i < m; ++i) {
    if (
      s1_accumulator.get(s2[i]) !== undefined &&
      s1_accumulator.get(s2[i]) != 0
    ) {
      s1_accumulator.set(s2[i], s1_accumulator.get(s2[i]) - 1);
      score += 1;
    }
  }

  return 0.5 * score * (1 / n + 1 / m);
}

function calSimilarityMetric(s1: string, s2: string): number {
  const alpha = 0.3;
  return alpha * lmfScore(s1, s2) + (1 - alpha) * lcsScore(s1, s2);
}

const root = new Map<string, string>();

// get root of a node in disjoint set data structure
function getRoot(u: string): string {
  return root.get(u) !== '' && root.get(u) !== u
    ? root.set(u, getRoot(root.get(u))).get(u)
    : u;
}

export function autoLinkAuthorsMembersHelper(
  modified_author: CommitAuthor,
  authors: CommitAuthor[],
  members: RepositoryMember[],
) {
  const author_names = authors
    .map((author) => author.resource.author_name.toLowerCase())
    .concat(
      authors.map((author) =>
        author.resource.author_email.split('@')[0].toLowerCase(),
      ),
    );

  root.clear();

  // initialize with empty value
  author_names.forEach((name) => {
    root.set(name, '');
  });

  authors.forEach((author) => {
    const root_l = getRoot(author.resource.author_name.toLowerCase());
    const root_r = getRoot(
      author.resource.author_email.split('@')[0].toLowerCase(),
    );

    if (root_l !== root_r) {
      root.set(root_l, root_r);
    }
  });

  const threshold_score = 0.6; // thresholding for determining connection

  for (let i = 0; i < author_names.length; ++i) {
    const s1 = author_names[i];
    let s2 = '';
    let max_score = 0;

    for (let j = 0; j < author_names.length; ++j) {
      if (author_names[j] !== s1) {
        const score = calSimilarityMetric(s1, author_names[j]);
        if (score > max_score) {
          s2 = author_names[j];
          max_score = score;
        }
      }
    }

    const root_s1 = getRoot(s1);
    const root_s2 = getRoot(s2);
    if (max_score > threshold_score && root_s1 !== root_s2)
      root.set(root_s1, root_s2);
  }

  let result_array: CommitAuthor[] = new Array();
  const linked_member = members.find(
    (member) => member.id === modified_author.resource.repository_member_id,
  );
  for (let i = 0; i < authors.length; ++i) {
    // if author i and author j are in the same cluster, and author j is not set, set the repository member to repository member of author i
    if (
      modified_author.id !== authors[i].id &&
      !authors[i].resource.isSet &&
      getRoot(authors[i].resource.author_name.toLowerCase()) ===
        getRoot(modified_author.resource.author_name.toLowerCase())
    ) {
      if (linked_member) {
        authors[i].owner = linked_member;
        authors[i].resource.repository_member_id = linked_member.id;
      } else {
        authors[i].owner = null;
        delete authors[i].resource.repository_member_id;
      }

      result_array.push(authors[i]);
    }
  }
  return result_array;
}

export function findBestMatchedMember(
  author: Commit.Author,
  members: RepositoryMember[],
) {
  const author_name = author.author_name.toLowerCase();
  const author_email_username = author.author_email.split('@')[0].toLowerCase();

  let max_score_index = 0;
  let max_score = 0;
  const threshold_score = 0.6;

  // find the member that matches best the author i base on the similarity metric
  for (let j = 0; j < members.length; ++j) {
    const member_username = members[j].resource.username.toLowerCase();
    const member_name = members[j].resource.name.toLowerCase();
    const score = Math.max(
      Math.max(
        calSimilarityMetric(author_name, member_name),
        calSimilarityMetric(author_name, member_username),
      ),
      Math.max(
        calSimilarityMetric(author_email_username, member_name),
        calSimilarityMetric(author_email_username, member_username),
      ),
    );

    if (max_score < score) {
      max_score_index = j;
      max_score = score;
    }
  }

  if (max_score >= threshold_score) {
    // set the author to repository member that has the highest matching score
    return members[max_score_index];
  } else return undefined;
}
