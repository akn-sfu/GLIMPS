import { Repository } from '@ceres/types';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import { Prompt } from 'react-router-dom';

interface ScoringConfigOutdatedWarningProps {
  repository?: Repository;
}

const ScoringConfigOutdatedWarning: React.FC<ScoringConfigOutdatedWarningProps> = ({
  repository,
}) => {
  if (!repository) {
    return null;
  }
  const lastSynced = repository?.extensions?.lastSync;
  const lastEvaluated = repository?.extensions?.scoringConfig?.lastRan;
  if (
    !lastSynced ||
    (lastEvaluated && new Date(lastSynced) <= new Date(lastEvaluated))
  ) {
    return null;
  }
  return (
    <div>
      <Prompt
        message={
          'You have not evaluated this repository since the last sync. Click Ok if you want to proceed.'
        }
      />
      <Alert severity='warning'>
        This repository has not been evaluated since the last sync.
      </Alert>
    </div>
  );
};

export default ScoringConfigOutdatedWarning;
