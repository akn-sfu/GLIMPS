import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useGetNotesByRepository, useGetTotalNotes } from '../../api/note';
import NotePaper from './NotePaper';
import { useRepositoryContext } from '../../contexts/RepositoryContext';
import { useFilterContext } from '../../contexts/FilterContext';
import { ApiResource } from '../../api/base';
import { RepositoryMember } from '@ceres/types';
import { useRepositoryMembers } from '../../api/repo_members';
import { Collapse, Typography } from '@material-ui/core';
import { Alert, Pagination } from '@material-ui/lab';
import MemberDropdown from '../../shared/components/MemberDropdown';
import ItemPerPageDropdown from './ItemPerPageDropdown';
import { Note } from '@ceres/types';
import RepoAndDateAlert from '../../shared/components/RepoAndDateAlert';
import { useGetIssueByRepo } from '../../api/issue';
import MakeIconTitle from './iconTitle';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
      color: '#25476d',
    },
    active_code_review_tab: {
      backgroundColor: '#b8d8be',
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      fontWeight: 'bold',
    },
    inactive_code_review_tab: {
      backgroundColor: '#e8f4ea',
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      fontWeight: 'bold',
    },
    active_issue_note_tab: {
      backgroundColor: '#d0c9ea',
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      fontWeight: 'bold',
    },
    inactive_issue_note_tab: {
      backgroundColor: '#f3eef8',
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      fontWeight: 'bold',
    },
    active_creating_issue_tab: {
      backgroundColor: '#ea8f88',
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      fontWeight: 'bold',
    },
    inactive_creating_issue_tab: {
      backgroundColor: '#f8cecb',
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
      fontWeight: 'bold',
    },
    pagination: {
      margin: 'auto',
      padding: '30px',
      display: 'flex',
      justifyContent: 'center',
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 200,
    },
    alert: {
      marginTop: 5,
    },
  }),
);

export enum TabOption {
  codeReview = 'code reviews',
  issueNotes = 'issue notes',
  createdIssues = 'issuse created',
}

function findRepoMemberId(
  filtered_id: string,
  members: ApiResource<RepositoryMember>[],
) {
  const filtered = (members || []).filter(
    (member) => member.meta.id === filtered_id,
  );
  return filtered.map((member) => member.id);
}

const CommentList: React.FC = () => {
  const classes = useStyles();
  const [itemsPerPage, setItemPerPage] = useState(20);
  const [noteType, setNoteType] = useState(Note.Type.mergeRequestComment);
  const [page, setPage] = useState(0);
  const { startDate, endDate, author } = useFilterContext();
  const { repositoryId } = useRepositoryContext();
  const { data: members } = useRepositoryMembers(repositoryId);
  const authorIds = findRepoMemberId(author, members);
  const { data: allNotes } = useGetNotesByRepository(
    {
      repository_id: repositoryId,
      created_start_date: startDate,
      created_end_date: endDate,
      author_id: authorIds,
      type: noteType,
    },
    page,
    itemsPerPage,
  );
  const { data: totalNotes } = useGetTotalNotes({
    repository_id: repositoryId,
    created_start_date: startDate,
    created_end_date: endDate,
    author_id: authorIds,
    type: noteType,
  });

  // collect all the comments on MR
  const mergeRequestNotes = allNotes?.results.filter(
    (comment) => comment.noteable_type == 'MergeRequest',
  );

  // collect all the comments on issues
  const issueNotes = allNotes?.results.filter(
    (comment) => comment.noteable_type == 'Issue',
  );

  // collect all the created issues
  const { data: totalIssues } = useGetIssueByRepo({
    repository_id: repositoryId,
  });
  const allIssuesNotes =
    author == 'all'
      ? totalIssues?.results
      : totalIssues?.results.filter((issue) =>
          authorIds.includes(issue.author.id),
        );
  const createdIssuesNotes = allIssuesNotes?.filter(
    (issue) =>
      Date.parse(startDate) <= Date.parse(issue.created_at) &&
      Date.parse(endDate) >= Date.parse(issue.created_at),
  );
  let newIssues = 0;
  let wordsInDescriptions = 0;
  createdIssuesNotes?.forEach(function (issue) {
    newIssues += 1;
    if (issue.description)
      wordsInDescriptions += issue.description
        .replace(/\*([^*]+)\*$/g, '')
        .trim()
        .split(' ').length;
  });

  const [alertOpen, setOpen] = useState(true);
  const [tab, setTab] = useState(TabOption.codeReview);

  let notes;
  switch (tab) {
    case TabOption.codeReview:
      notes = mergeRequestNotes;
      break;
    case TabOption.createdIssues:
      notes = createdIssuesNotes;
      break;
    case TabOption.issueNotes:
      notes = issueNotes;
  }

  const handleTabs = (event: React.ChangeEvent<unknown>, newTab: any) => {
    const type =
      newTab == 'issue notes'
        ? Note.Type.issueComment
        : Note.Type.mergeRequestComment;
    setNoteType(type);
    setTab(newTab);
  };

  const handleItemChange = (value: number) => {
    setItemPerPage(value);
  };

  return (
    <>
      <Container>
        <Box my={2}>
          <RepoAndDateAlert />
          <Collapse in={alertOpen}>
            <Alert
              className={classes.alert}
              severity='info'
              onClose={() => setOpen(!alertOpen)}
            >
              Comments can only be filtered for current users in the repository
            </Alert>
          </Collapse>
        </Box>
        <Box my={4}>
          <Grid container justify='space-between'>
            <Typography variant='h3' color='primary'>
              Comments
            </Typography>
            <Box className={classes.formControl}>
              <MemberDropdown repositoryId={repositoryId} />
            </Box>
          </Grid>
        </Box>
        <Box my={1} className={classes.root}>
          <Grid container justify='space-between'>
            <Tabs
              value={tab}
              onChange={handleTabs}
              textColor='primary'
              centered
            >
              <Tab
                value={TabOption.codeReview}
                label='Code Reviews'
                className={
                  tab === TabOption.codeReview
                    ? classes.active_code_review_tab
                    : classes.inactive_code_review_tab
                }
              />
              <Tab
                value={TabOption.issueNotes}
                label='Issue Notes'
                className={
                  tab === TabOption.issueNotes
                    ? classes.active_issue_note_tab
                    : classes.inactive_issue_note_tab
                }
              />
              <Tab
                value={TabOption.createdIssues}
                label='New Issues'
                className={
                  tab === TabOption.createdIssues
                    ? classes.active_creating_issue_tab
                    : classes.inactive_creating_issue_tab
                }
              />
            </Tabs>
            {tab != TabOption.createdIssues && (
              <ItemPerPageDropdown updateItemsPerPage={handleItemChange} />
            )}
          </Grid>
        </Box>
        <MakeIconTitle tab={tab} css={classes.root} />
        {tab == TabOption.createdIssues && (
          <Box mt={1} mb={1}>
            <Alert severity='warning'>
              There are <strong> {newIssues} </strong> new issues with{' '}
              <strong> {wordsInDescriptions} </strong>words in their
              descriptions.
            </Alert>
          </Box>
        )}
        <Grid
          justify={'center'}
          container
          direction={'column'}
          alignItems={'stretch'}
          spacing={1}
        >
          {notes?.map((note) => {
            return <NotePaper key={note.meta.id} noteData={note} tab={tab} />;
          })}
        </Grid>
        {tab != TabOption.createdIssues &&
          Math.ceil(totalNotes / itemsPerPage) > 0 && (
            <Pagination
              className={classes.pagination}
              page={page + 1}
              count={Math.ceil(totalNotes / itemsPerPage)}
              onChange={(e, page) => {
                setPage(page - 1);
                window.scrollTo(0, 0);
              }}
              color='primary'
              size='large'
            />
          )}
      </Container>
    </>
  );
};

export default CommentList;
