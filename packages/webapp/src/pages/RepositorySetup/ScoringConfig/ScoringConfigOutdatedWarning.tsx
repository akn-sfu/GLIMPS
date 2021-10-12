import { Repository } from '@ceres/types';
import Alert from '@material-ui/lab/Alert';
import React from 'react';

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
    <Alert severity='warning'>
      This repository has not been evaluated since the last sync.
    </Alert>
  );
};

export default ScoringConfigOutdatedWarning;
