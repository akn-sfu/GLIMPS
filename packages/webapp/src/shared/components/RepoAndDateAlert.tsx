import React from 'react';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { useRepositoryContext } from '../../contexts/RepositoryContext';
import { useGetRepository } from '../../api/repository';
import { useFilterContext } from '../../contexts/FilterContext';

const RepoAndDateAlert: React.FC = () => {
  const { repositoryId } = useRepositoryContext();
  const { data } = useGetRepository(repositoryId);
  const { startDate, endDate } = useFilterContext();
  return (
    <>
      <div>
        <Alert variant='outlined' severity='info'>
          <AlertTitle>
            <strong>{data?.name_with_namespace}</strong>
          </AlertTitle>
          {'Iteration: "'}
          {data?.name_with_namespace}
          {'"  ('}
          {startDate?.split('T')[0]} to {endDate?.split('T')[0]}
          {')'}
        </Alert>
      </div>
    </>
  );
};

export default RepoAndDateAlert;
