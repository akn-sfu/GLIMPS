import { Commit } from '@ceres/types';
import { Repository } from '@ceres/types';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import { useRepositoryAuthors } from '../../api/author';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { Prompt } from 'react-router-dom';

interface MakeWarningProps {
  repository?: Repository;
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
  let UnauthoredWarning = null;

  let msg = 'You have the following warnings: ';

  // check for unauthored commits
  const { data } = useRepositoryAuthors(repositoryId);
  const orphanCount = countOrphanAuthors(data || []);
  if (!(orphanCount === 0)) {
    needsPrompt = true;
    msg = msg + '\n(1) There are unauthored commits';
    UnauthoredWarning = (
      <Alert severity='warning'>
        <AlertTitle>
          <strong>Better update</strong>
        </AlertTitle>
        There are <strong>{orphanCount}</strong> commit authors that are not
        linked to a repository member.
      </Alert>
    );
  }

  return (
    <div>
      <Prompt when={needsPrompt} message={msg} />
      {UnauthoredWarning}
    </div>
  );
};

export default MakeWarning;
