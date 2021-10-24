// import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useSnackbar } from 'notistack';
import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  AddCollaboratorPayload,
  RemoveCollaboratorPayload,
  useAddCollaborator,
  useGetRepository,
  useRemoveCollaborator,
} from '../../api/repository';
import DefaultPageLayout from '../../shared/components/DefaultPageLayout';
import DefaultPageTitleFormat from '../../shared/components/DefaultPageTitleFormat';
import SmartDate from '../../shared/components/SmartDate';
import { useAuthContext } from '../../contexts/AuthContext';
import Collaborators from './Collaborator/Collaborators';
import LeaveRepository from './Collaborator/LeaveRepository';
import ScoringConfigSelector from './ScoringConfig/ScoringConfigSelector';
import { useUpdateScoring } from '../../api/scoring';
import { ApiResource } from '../../api/base';
import { GlobWeight, Repository, ScoringConfig } from '@ceres/types';
import RepoFilter from './RepoFilter';
import styled from 'styled-components';
import AccordionMenu from './AccordionMenu';
import Members from './Members';
import ScoringConfigOverrides from './ScoringConfig/ScoringConfigOverrides';
import ScoringConfigDialog from './ScoringConfig/ScoringConfigDialog';
import ScrollToTop from '../../shared/components/ScrollToTop';
import { useRepositoryContext } from '../../contexts/RepositoryContext';
import MakeWarning from './MakeWarning';

const MainContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 1rem;
`;

const RepoSetupPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { push } = useHistory();
  const {
    mutate: updateScoring,
    isLoading: updateScoreLoading,
  } = useUpdateScoring();
  const { user } = useAuthContext();
  const { setRepositoryId } = useRepositoryContext();
  const { data, invalidate } = useGetRepository(id);
  const { mutate: addCollaborator } = useAddCollaborator(id);
  const { mutate: removeCollaborator } = useRemoveCollaborator(id);
  const { enqueueSnackbar } = useSnackbar();
  const isOwner = user?.id === data?.extensions?.owner?.id;
  const collaborators = data?.extensions?.collaborators || [];
  const isEditor =
    isOwner ||
    !!collaborators.find(
      (collaborator) =>
        collaborator.id === user?.id &&
        collaborator.accessLevel === Repository.AccessLevel.editor,
    );
  const handleUpdateScore = (
    scoringConfig: ApiResource<ScoringConfig>,
    overrides: GlobWeight[],
  ) => {
    updateScoring(
      {
        repositoryId: id,
        scoringConfigId: isOwner
          ? scoringConfig?.meta?.id
          : data?.extensions?.scoringConfig?.id,
        overrides,
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

  useEffect(() => {
    setRepositoryId(id);
  }, []);

  return (
    <DefaultPageLayout>
      <Container>
        <ScrollToTop />
        <Grid container justify='space-between' alignItems='center'>
          <Grid item>
            <DefaultPageTitleFormat>
              {data?.name_with_namespace}
            </DefaultPageTitleFormat>
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
          <MakeWarning repository={data} repositoryId={id} />
          <AccordionMenu title='Filter Config' color='#e4f5ba'>
            <Grid item xs={12}>
              <RepoFilter />
            </Grid>
          </AccordionMenu>
          {isEditor && (
            <AccordionMenu title='Members' color='#ffd9cf'>
              <Members id={id} />
            </AccordionMenu>
          )}
          <AccordionMenu title='Scoring Rubric' color='#cff4fc'>
            {data && (
              <ScoringConfigSelector
                isLoading={updateScoreLoading}
                onSubmit={handleUpdateScore}
                repository={data}
                isEditor={isEditor}
                isOwner={isOwner}
              />
            )}
          </AccordionMenu>
          <AccordionMenu
            title={`Sharing · ${collaborators.length} Collaborator(s)`}
            color='#e6d9ff'
          >
            {data && isOwner && (
              <Collaborators
                repository={data}
                onAddCollaborator={handleAddCollaborator}
                onRemoveCollaborator={handleRemoveCollaborator}
              />
            )}
            {data && !isOwner && (
              <LeaveRepository repository={data} onLeave={handleLeave} />
            )}
          </AccordionMenu>
        </MainContainer>
        {data && <ScoringConfigOverrides />}
        {data && <ScoringConfigDialog repository={data} />}
      </Container>
    </DefaultPageLayout>
  );
};

export default RepoSetupPage;
