import { Commit, MergeRequest } from '@ceres/types';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import styled from 'styled-components';
import { ApiResource } from '../../../api/base';
import { useGetCommits } from '../../../api/commit';
import SmartDate from '../../../components/SmartDate';

interface CommitListProps {
  mergeRequest: ApiResource<MergeRequest>;
  activeCommit?: ApiResource<Commit>;
  setActiveCommit: (commit: ApiResource<Commit>) => void;
}

const Root = styled(Box)`
  &:hover {
    cursor: pointer;
  }
`;

const CommitList: React.FC<CommitListProps> = ({
  mergeRequest,
  activeCommit,
  setActiveCommit,
}) => {
  const { data: commits } = useGetCommits({
    merge_request: mergeRequest.meta.id,
  });
  return (
    <>
      {(commits?.results || []).map((commit) => (
        <Root
          key={commit.meta.id}
          pl={5}
          py={1}
          onClick={() => setActiveCommit(commit)}
          bgcolor={activeCommit?.meta.id === commit.meta.id ? '#D3D3D3' : ''}
        >
          <Grid container>
            <Grid item xs={8}>
              <Typography variant='body2'>{commit.title}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant='body2'>{commit.author_name}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant='body2'>
                <SmartDate>{commit.authored_date}</SmartDate>
              </Typography>
            </Grid>
          </Grid>
        </Root>
      ))}
    </>
  );
};

export default CommitList;
