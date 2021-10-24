import { Commit } from '@ceres/types';
import { Repository } from '@ceres/types';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import { useRepositoryAuthors } from '../../api/author';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { Prompt } from 'react-router-dom';
import { useRepositoryScoringContext } from './ScoringConfig/RepositoryScoringContext';
import { isEqual } from 'lodash';

interface MakeWarningProps {
  repository: Repository;
  repositoryId: string;
}

function countOrphanAuthors(authors: Commit.Author[]) {
  return authors.filter((author) => !author.repository_member_id).length;
}

function makeAlert(Severity: any, Title: string, Msg: string) {
  return (
    <Alert severity={Severity} variant='standard'>
      <AlertTitle>
        <strong>{Title}</strong>
      </AlertTitle>
      {Msg}
    </Alert>
  );
}

const MakeWarning: React.FC<MakeWarningProps> = ({
  repository,
  repositoryId,
}) => {
  if (!repository) {
    return null;
  }

  let needsPrompt = false;
  let prompt_msg = '****Warnings****\n';

  let UnauthoredWarning = null;
  let NoScoringConfig = null;
  let OutdatedScore = null;
  let OverridedScore = null;

  // check for unauthored commits
  const { data } = useRepositoryAuthors(repositoryId);
  const orphanCount = countOrphanAuthors(data || []);
  if (!(orphanCount === 0)) {
    needsPrompt = true;
    prompt_msg += '\n-->There are unauthored commits.';
    const warning =
      'There are ' +
      orphanCount +
      ' commit authors that are not linked to a repository member.';
    UnauthoredWarning = makeAlert('warning', 'Unauthored commits', warning);
  }

  // check scoring config
  const hasScoreConfig = repository?.extensions?.scoringConfig?.id;
  if (!hasScoreConfig) {
    needsPrompt = true;
    prompt_msg += '\n-->The scoring config is missing.';
    const warning =
      'This repository has no scoring rubric. Without a rubric, all files will have a weight of 1 when calculating scores.';
    NoScoringConfig = makeAlert('warning', 'Missing scoring config', warning);
  }

  // remind for recalculating the score
  const lastSynced = repository?.extensions?.lastSync;
  const lastEvaluated = repository?.extensions?.scoringConfig?.lastRan;
  if (!lastEvaluated || new Date(lastSynced) > new Date(lastEvaluated)) {
    needsPrompt = true;
    prompt_msg += '\n-->You have not evaluated the score since the last sync';
    const warning =
      'This repository has not been evaluated since the last sync.';
    OutdatedScore = makeAlert('error', 'Outdated scores', warning);
  }

  // check for pending scoring override
  const { overrides } = useRepositoryScoringContext();
  if (!isEqual(repository?.extensions?.scoringConfig?.overrides, overrides)) {
    needsPrompt = true;
    prompt_msg += '\n-->You have pending scoring config';
    const warning =
      'You have pending scoring config override changes. These changes will not' +
      'be saved until you re-evaluate this repository snapshot.';
    OverridedScore = makeAlert('error', 'Pending scoring config', warning);
  }

  prompt_msg += '\n\nClick OK if you want to proceed.';

  return (
    <div>
      <Prompt when={needsPrompt} message={prompt_msg} />
      {UnauthoredWarning}
      {NoScoringConfig}
      {OutdatedScore}
      {OverridedScore}
    </div>
  );
};

export default MakeWarning;
