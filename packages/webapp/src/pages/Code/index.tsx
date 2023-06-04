import { Commit, MergeRequest } from '@ceres/types';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useParams } from 'react-router-dom';
import { ApiResource } from '../../api/base';
import { useInfiniteMergeRequest } from '../../api/mergeRequests';
import DefaultPageLayout from '../../shared/components/DefaultPageLayout';
import Container from '@material-ui/core/Container';
import LoadMore from './LoadMore';
import CodeView from './CommitList/CodeView';
import CommitOrMergeRequestRenderer from './CommitOrMergeRequestRenderer';
import CommitList from './CommitList';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';
import { useFilterContext } from '../../contexts/FilterContext';
import { ScoreOverrideQueueProvider } from './contexts/ScoreOverrideQueue';
import { useInfiniteCommit } from '../../api/commit';
import ScoreOverrideQueueInfo from './CommitList/ScoreOverrideQueueInfo';
import { DateTime } from 'luxon';
import RepoAndDateAlert from '../../shared/components/RepoAndDateAlert';
import StudentDropdown from '../../shared/components/StudentDropdown';

const IndependentScrollGrid = styled(Grid)`
  height: 100vh;
  position: fixed;
  margin-left: 5rem;
  padding-right: 8rem;
  & > * {
    height: 100vh;
    overflow: hidden;

    & > * {
      // hack to hide scrollbar: https://stackoverflow.com/questions/16670931/hide-scroll-bar-but-while-still-being-able-to-scroll
      padding-right: 30px;
      height: 100vh;
      width: 100%;
      overflow-y: scroll;
      box-sizing: content-box;
    }
  }
`;

const CompactTableHeaders: React.FC = () => {
  return (
    <Box pr={6} pl={2} py={1}>
      <Grid container>
        <Grid item xs={8}>
          <Typography>Title</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography align='right'>Score</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography align='right'>Σ Commits</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

const RegularTableHeaders: React.FC = () => {
  return (
    <Box pr={6} pl={2} py={1}>
      <Grid container>
        <Grid item xs={5}>
          <Typography>Title</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography>Author</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography>Date</Typography>
        </Grid>
        <Grid item xs={1}>
          <Typography>Score</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography>Σ Commits</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

const ListMergeRequestPage = () => {
  const { id } = useParams<{ id: string }>();
  const { startDate, endDate } = useFilterContext();
  const [emails, setEmails] = useState<string[]>([]);
  const [activeMergeRequest, setActiveMergeRequest] =
    useState<ApiResource<MergeRequest>>();
  const [activeCommit, setActiveCommit] = useState<ApiResource<Commit>>();
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();
  const {
    data: mergeRequests,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteMergeRequest({
    repository: id,
    author_email: emails,
    commit_start_date: startDate.toString(),
    commit_end_date: endDate.toString(),
  });
  const {
    data: commits,
    fetchNextPage: fetchNextPageCommit,
    hasNextPage: hasNextPageCommit,
  } = useInfiniteCommit({
    repository: id,
    author_email: emails,
    start_date: startDate.toString(),
    end_date: endDate.toString(),
    not_associated_with_any_mr: true,
  });

  useEffect(() => {
    if (loadMoreInView) {
      void fetchNextPage();
      void fetchNextPageCommit();
    }
  }, [emails, loadMoreInView]);

  const reducedMergeRequests =
    mergeRequests?.pages?.reduce(
      (accumulated, current) => [...accumulated, ...current.results],
      [],
    ) || [];

  const reducedCommits =
    commits?.pages?.reduce(
      (accumulated, current) => [...accumulated, ...current.results],
      [],
    ) || [];
  const commitsAndMergeRequests = reducedCommits.concat(reducedMergeRequests);

  commitsAndMergeRequests.sort((a, b) => {
    if (a.meta.resourceType == 'MergeRequest') {
      a = DateTime.fromISO(a.merged_at);
    } else {
      a = DateTime.fromISO(a.committed_date);
    }
    if (b.meta.resourceType == 'MergeRequest') {
      b = DateTime.fromISO(b.merged_at);
    } else {
      b = DateTime.fromISO(b.committed_date);
    }
    return a - b;
  });

  const showSpiltView = activeMergeRequest || activeCommit;

  return (
    <>
      <DefaultPageLayout>
        <ScoreOverrideQueueProvider>
          <IndependentScrollGrid container spacing={3}>
            <Grid item xs={5}>
              <Container maxWidth={false}>
                <ScoreOverrideQueueInfo />
                <Box my={2}>
                  <RepoAndDateAlert />
                </Box>
                <Box my={2}>
                  <Grid container justify='space-between'>
                    <Typography variant='h3' color='primary'>
                      Merge Requests
                    </Typography>
                    <StudentDropdown
                      repositoryId={id}
                      onChange={(newEmails) => {
                        setEmails(newEmails);
                      }}
                    />
                  </Grid>
                </Box>
                {!showSpiltView ? (
                  <RegularTableHeaders />
                ) : (
                  <CompactTableHeaders />
                )}
                {commitsAndMergeRequests.map((commitOrMergeRequest) => {
                  const active =
                    commitOrMergeRequest.meta.id ===
                    (activeMergeRequest || activeCommit)?.meta.id;
                  if (
                    commitOrMergeRequest.meta.resourceType == 'MergeRequest'
                  ) {
                    return (
                      <CommitOrMergeRequestRenderer
                        key={commitOrMergeRequest.meta.id}
                        mergeRequest={commitOrMergeRequest}
                        active={active}
                        shrink={!!showSpiltView}
                        endDate={endDate}
                        filteredAuthorEmails={emails}
                        onClickSummary={() => {
                          setActiveCommit(undefined);
                          setActiveMergeRequest(
                            active && !activeCommit
                              ? undefined
                              : commitOrMergeRequest,
                          );
                        }}
                      >
                        {active && (
                          <CommitList
                            mergeRequest={commitOrMergeRequest}
                            activeCommit={activeCommit}
                            setActiveCommit={setActiveCommit}
                            authorEmails={emails}
                          />
                        )}
                      </CommitOrMergeRequestRenderer>
                    );
                  } else {
                    return (
                      <CommitOrMergeRequestRenderer
                        key={commitOrMergeRequest.meta.id}
                        commit={commitOrMergeRequest}
                        active={active}
                        shrink={!!activeMergeRequest}
                        onClickSummary={() => {
                          setActiveCommit(
                            active ? undefined : commitOrMergeRequest,
                          );
                          setActiveMergeRequest(undefined);
                        }}
                      />
                    );
                  }
                })}
                {hasNextPage && hasNextPageCommit && (
                  <LoadMore
                    onClick={() => {
                      if (hasNextPage) void fetchNextPage();
                      if (hasNextPageCommit) void fetchNextPageCommit();
                    }}
                    ref={loadMoreRef}
                  />
                )}
              </Container>
            </Grid>
            {showSpiltView && (
              <Grid item xs={7}>
                <CodeView
                  mergeRequest={activeMergeRequest}
                  commit={activeCommit}
                />
              </Grid>
            )}
          </IndependentScrollGrid>
        </ScoreOverrideQueueProvider>
      </DefaultPageLayout>
    </>
  );
};

export default ListMergeRequestPage;
