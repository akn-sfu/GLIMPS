import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  AddCollaboratorPayload,
  RemoveCollaboratorPayload,
  useAddCollaborator,
  useGetRepository,
  useRemoveCollaborator,
} from '../../api/repository';
import DefaultPageLayout from '../../components/DefaultPageLayout';
import DefaultPageTitleFormat from '../../components/DefaultPageTitleFormat';
import SmartDate from '../../components/SmartDate';
import CancelIcon from '@material-ui/icons/Cancel';
import { useAuthContext } from '../../contexts/AuthContext';
import Collaborators from './components/Collaborators';
import LeaveRepository from './components/LeaveRepository';
import LinkGrid from './components/LinkGrid';
import MembersWarning from './components/MembersWarning';
import ScoringConfigWarning from './components/ScoringConfigWarning';
import ScoringConfigSelector from './components/ScoringConfigSelector';
import { useUpdateScoring } from '../../api/scoring';
import { ApiResource } from '../../api/base';
import { ScoringConfig } from '@ceres/types';
import RepoFilter from '../../components/RepositoryFilter';
import styled from 'styled-components';

const MainContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 1rem;
`;

const RepositoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useHistory();
  const {
    mutate: updateScoring,
    isLoading: updateScoreLoading,
  } = useUpdateScoring();
  const { user } = useAuthContext();
  const { data, invalidate } = useGetRepository(id);
  const { mutate: addCollaborator } = useAddCollaborator(id);
  const { mutate: removeCollaborator } = useRemoveCollaborator(id);
  const { enqueueSnackbar } = useSnackbar();
  const isOwner = user?.id === data?.extensions?.owner?.id;

  const handleUpdateScore = (scoringConfig: ApiResource<ScoringConfig>) => {
    updateScoring(
      {
        repositoryId: id,
        scoringConfigId: scoringConfig?.meta?.id,
      },
      {
        onSuccess: () => {
          void invalidate();
        },
      },
    );
  };

  const handleAddCollaborator = (payload: AddCollaboratorPayload) => {
    addCollaborator(payload, {
      onSuccess: invalidate,
    });
  };

  const handleRemoveCollaborator = (payload: RemoveCollaboratorPayload) => {
    removeCollaborator(payload, {
      onSuccess: invalidate,
    });
  };

  const handleLeave = () => {
    removeCollaborator(
      { collaboratorId: user.id },
      {
        onSuccess: () => {
          push('/repository');
          enqueueSnackbar('You have left the snapshot.', {
            variant: 'success',
          });
        },
      },
    );
  };

  return (
    <DefaultPageLayout>
      <Container>
        <Grid container justify='space-between' alignItems='center'>
          <Grid item>
            <DefaultPageTitleFormat>
              {data?.name_with_namespace}
            </DefaultPageTitleFormat>
          </Grid>
          <Grid item>
            <IconButton onClick={() => push('/repository')}>
              <CancelIcon fontSize='large' />
            </IconButton>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography>
              <strong>Created at:</strong>{' '}
              <SmartDate>{data?.created_at}</SmartDate>
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>
              <strong>Last synced:</strong>{' '}
              <SmartDate>{data?.extensions?.lastSync}</SmartDate>
            </Typography>
          </Grid>
        </Grid>
        <MainContainer>
          <MembersWarning repositoryId={id} />
          <ScoringConfigWarning repository={data} />
          {data && !isOwner && (
            <LeaveRepository repository={data} onLeave={handleLeave} />
          )}
          {data && isOwner && (
            <Collaborators
              repository={data}
              onAddCollaborator={handleAddCollaborator}
              onRemoveCollaborator={handleRemoveCollaborator}
            />
          )}
          {data && isOwner && (
            <ScoringConfigSelector
              isLoading={updateScoreLoading}
              onSubmit={handleUpdateScore}
              repository={data}
            />
          )}
          <Grid item xs={12}>
            <RepoFilter />
          </Grid>
          <LinkGrid repositoryId={id} />
        </MainContainer>
      </Container>
    </DefaultPageLayout>
  );
};

export default RepositoryPage;