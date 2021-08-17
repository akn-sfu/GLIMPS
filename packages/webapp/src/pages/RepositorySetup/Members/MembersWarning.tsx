import { Commit } from '@ceres/types';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import { Prompt } from 'react-router-dom';
import { useRepositoryAuthors } from '../../../api/author';

interface MembersWarningProps {
  repositoryId: string;
}

function countOrphanAuthors(authors: Commit.Author[]) {
  return authors.filter((author) => !author.repository_member_id).length;
}

const MembersWarning: React.FC<MembersWarningProps> = ({ repositoryId }) => {
  const { data } = useRepositoryAuthors(repositoryId);
  const orphanCount = countOrphanAuthors(data || []);
  if (orphanCount === 0) {
    return null;
  }
  return (
    <div>
      <Prompt
        when={orphanCount > 0}
        message={`There are ${orphanCount} commit authors that are not linked to a repository member. Click Ok if you want to proceed.`}
      />
      <Alert severity='warning'>
        There are <strong>{orphanCount}</strong> commit authors that are not
        linked to a repository member.
      </Alert>
    </div>
  );
};

export default MembersWarning;
