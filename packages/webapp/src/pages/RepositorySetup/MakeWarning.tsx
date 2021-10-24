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

const MakeWarning: React.FC<MakeWarningProps> = ({
  repository,
  repositoryId,
}) => {
  if (!repository) {
    return null;
  }

  let needsPrompt = false;
  let prompt_msg = 'Warnings: ';

  let UnauthoredWarning = null;
  let NoScoringConfig = null;
  let OutdatedScore = null;
  let OverridedScore = null;

  // check for unauthored commits
  const { data } = useRepositoryAuthors(repositoryId);
  const orphanCount = countOrphanAuthors(data || []);
  if (!(orphanCount === 0)) {
    needsPrompt = true;
    prompt_msg = prompt_msg + '\n->There are unauthored commits';
    UnauthoredWarning = (
      <Alert severity='warning'>
        <AlertTitle>
          <strong>Unauthored commits</strong>
        </AlertTitle>
        There are <strong>{orphanCount}</strong> commit authors that are not
        linked to a repository member.
      </Alert>
    );
  }

  // check scoring config
  const hasScoreConfig = repository?.extensions?.scoringConfig?.id;
  if (!hasScoreConfig) {
    needsPrompt = true;
    prompt_msg = prompt_msg + '\n->Missing scoring config';
    NoScoringConfig = (
      <Alert severity='warning'>
        <AlertTitle>
          <strong>Missing scoring config</strong>
        </AlertTitle>
        This repository has no scoring rubric. Without a rubric, all files will
        have a weight of 1 when calculating scores.
      </Alert>
    );
  }

  // remind for recalculating the score
  const lastSynced = repository?.extensions?.lastSync;
  const lastEvaluated = repository?.extensions?.scoringConfig?.lastRan;
  if (!lastEvaluated || new Date(lastSynced) > new Date(lastEvaluated)) {
    needsPrompt = true;
    prompt_msg =
      prompt_msg + '\n->Have not evaluated the score since the last sync';
    OutdatedScore = (
      <Alert severity='error'>
        <AlertTitle>
          <strong>Missing scoring config</strong>
        </AlertTitle>
        This repository has not been evaluated since the last sync.
      </Alert>
    );
  }

  // check for scoring override
  const { overrides } = useRepositoryScoringContext();
  if (!isEqual(repository?.extensions?.scoringConfig?.overrides, overrides)) {
    needsPrompt = true;
    prompt_msg = prompt_msg + '\n->You have pending scoring config';
    OverridedScore = (
      <Alert severity='error'>
        <AlertTitle>
          <strong>Missing scoring config</strong>
        </AlertTitle>
        You have pending scoring config override changes. These changes will not
        be saved until you re-evaluate this repository snapshot.
      </Alert>
    );
  }

  prompt_msg = prompt_msg + '\nClick Ok if you want to proceed.';

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
