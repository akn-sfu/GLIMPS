import { Commit, RepositoryMember } from '@ceres/types';
import { isUndefined } from 'lodash';
import { useLinkAuthorToMember } from '../../../api/author';
import { ApiResource } from '../../../api/base';

// longest substring metric
function lcsScore(s1: string, s2: string) {
  const n = s1.length;
  const m = s2.length;

  // DP array
  //reference https://stackoverflow.com/questions/30144580/typescript-multidimensional-array-initialization
  const dp: number[][] = new Array(n).fill(0).map(() => new Array(m).fill(0));

  for (let i = 1; i <= n; ++i) {
    for (let j = 1; j <= m; ++j) {
      dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      if (s1[i - 1] == s2[j - 1]) {
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
    s1_accumulator[s1[i]] = isUndefined(s1_accumulator[s1[i]])
      ? 0
      : s1_accumulator[s1[i]] + 1;
  }

  let score = 0;

  for (let i = 0; i < n; ++i) {
    if (!isUndefined(s1_accumulator[s2[i]]) && s1_accumulator[s2[i]] != 0) {
      s1_accumulator[s1[i]] -= 1;
      score += 1;
    }
  }

  return 0.5 * score * (1 / n + 1 / m);
}

function calSimilarityMetric(s1: string, s2: string) {
  const alpha = 0.3;
  return alpha * lmfScore(s1, s2) + (1 - alpha) * lcsScore(s1, s2);
}

const root = new Map();

// get root of a node in disjoint set data structure
function getRoot(u: string) {
  return u != '' && root[u] != u ? (root[u] = getRoot(root[u])) : u;
}

export function autoLinkAuthorAndMember(
  authors: ApiResource<Commit.Author>[],
  members: ApiResource<RepositoryMember>[],
) {
  if (authors.length == 0 || members.length == 0) return;
  const author_names = authors
    .map((author) => author.author_name)
    .concat(authors.map((author) => author.author_email.split('@')[0]));

  root.clear();

  // initialize with empty value
  author_names.forEach((name) => {
    root[name] = '';
  });

  authors.forEach((author) => {
    const root_l = getRoot(author.author_name);
    const root_r = getRoot(author.author_email.split('@')[0]);
    root[root_l] = root_r;
  });

  const threshold_score = 0.6; // thresholding for determining connection

  author_names.forEach((s1) => {
    let s2 = '';
    let max_score = 0;
    author_names.forEach((temp_s2) => {
      if (temp_s2 != s1) {
        const score = calSimilarityMetric(s1, temp_s2);
        if (score > max_score) {
          s2 = temp_s2;
          max_score = score;
        }
      }
    });
    if (max_score >= threshold_score) {
      root[s1] = getRoot(s2);
    }
  });

  for (let i = 0; i < authors.length; ++i) {
    if (isUndefined(authors[i].repository_member_id)) {
      // if doesn't set repository member
      let max_score_index = 0;
      let max_score = 0;
      for (let j = 0; j < members.length; ++j) {
        const score = Math.max(
          Math.max(
            calSimilarityMetric(authors[i].author_name, members[j].username),
            calSimilarityMetric(
              authors[i].author_email.split('@')[0],
              members[j].username,
            ),
          ),
          Math.max(
            calSimilarityMetric(authors[i].author_name, members[j].name),
            calSimilarityMetric(
              authors[i].author_email.split('@')[0],
              members[j].name,
            ),
          ),
        );

        if (max_score < score) {
          max_score_index = j;
          max_score = score;
        }
      }
      if (max_score >= threshold_score) {
        const { mutate } = useLinkAuthorToMember(authors[i].meta.id);
        mutate(members[max_score_index]);
      }
    }

    const member = members.find((member) => {
      member.meta.id == authors[i].repository_member_id;
    });

    if (!isUndefined(member)) {
      for (let j = 0; j < authors.length; ++j) {
        if (
          i != j &&
          getRoot(authors[i].author_name) == getRoot(authors[j].author_name)
        ) {
          const { mutate } = useLinkAuthorToMember(authors[j].meta.id);
          mutate(member);
        }
      }
    }
  }
}
