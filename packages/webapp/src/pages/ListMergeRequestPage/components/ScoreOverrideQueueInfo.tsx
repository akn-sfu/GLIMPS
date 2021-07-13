import React from 'react';
import { useUpdateScoreOverrides } from '../../../api/scoring';
import { useRepositoryContext } from '../../../contexts/RepositoryContext';
import { useScoreOverrideQueue } from '../contexts/ScoreOverrideQueue';

const ScoreOverrideQueueInfo: React.FC = () => {
  const { queue, reset } = useScoreOverrideQueue();
  const { mutate: update } = useUpdateScoreOverrides();
  const { repositoryId } = useRepositoryContext();

  const handleUpdate = () => {
    update(
      {
        repositoryId,
        overrides: queue,
      },
      {
        onSuccess: () => {
          window.location.reload();
        },
      },
    );
  };

  return <>{queue.length > 0 && (handleUpdate(), reset())}</>;
};

export default ScoreOverrideQueueInfo;
