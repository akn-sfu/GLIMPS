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
import DifferentiatingIcon from './DifferentiatingIcon';
import { Collapse, Typography } from '@material-ui/core';
import AlternatePageTitleFormat from '../AlternatePageTitleFormat';
import { Alert, Pagination } from '@material-ui/lab';
import MemberDropdown from '../MemberDropdown';
import ItemPerPageDropdown from './ItemPerPageDropdown';
import { Note } from '@ceres/types';
import RepoAndDateAlert from '../RepoAndDateAlert';

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

enum TabOption {
  codeReview = 'code reviews',
  issueNotes = 'issue notes',
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

  const mergeRequestNotes = allNotes?.results.filter(
    (comment) => comment.noteable_type == 'MergeRequest',
  );

  const issueNotes = allNotes?.results.filter(
    (comment) => comment.noteable_type == 'Issue',
  );

  const [alertOpen, setOpen] = useState(true);
  const [tab, setTab] = useState(TabOption.codeReview);
  const notes =
    tab === TabOption.codeReview ? mergeRequestNotes || [] : issueNotes || [];

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
              Comments can only be filtered for users in the repository
            </Alert>
          </Collapse>
        </Box>
        <AlternatePageTitleFormat>
          <Typography variant='h1' color='primary'>
            Comments
          </Typography>
          <Box className={classes.formControl}>
            <MemberDropdown repositoryId={repositoryId} />
          </Box>
        </AlternatePageTitleFormat>
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
            </Tabs>
            <ItemPerPageDropdown updateItemsPerPage={handleItemChange} />
          </Grid>

          <Grid
            container
            direction={'row'}
            alignItems={'center'}
            style={{ marginTop: 15 }}
          >
            {tab === TabOption.codeReview ? (
              <>
                <Grid
                  container
                  item
                  xs={6}
                  alignItems={'center'}
                  direction={'row'}
                >
                  <DifferentiatingIcon isMine={true} />
                  <Typography style={{ marginLeft: 10, marginRight: 10 }}>
                    Notes on my own merge request(s)
                  </Typography>
                </Grid>
                <Grid
                  container
                  item
                  xs={6}
                  alignItems={'center'}
                  direction={'row'}
                >
                  <DifferentiatingIcon isMine={false} />
                  <Typography style={{ marginLeft: 10, marginRight: 10 }}>
                    Notes on other members&apos; merge request(s)
                  </Typography>
                </Grid>
              </>
            ) : (
              <>
                <Grid
                  container
                  item
                  xs={6}
                  alignItems={'center'}
                  direction={'row'}
                >
                  <DifferentiatingIcon isMine={true} />
                  <Typography style={{ marginLeft: 10, marginRight: 10 }}>
                    Notes on my own issue(s)
                  </Typography>
                </Grid>
                <Grid
                  container
                  item
                  xs={6}
                  alignItems={'center'}
                  direction={'row'}
                >
                  <DifferentiatingIcon isMine={false} />
                  <Typography style={{ marginLeft: 10, marginRight: 10 }}>
                    Notes on other members&apos; issue(s)
                  </Typography>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
        <Grid
          justify={'center'}
          container
          direction={'column'}
          alignItems={'stretch'}
          spacing={1}
        >
          {notes?.map((note) => {
            return <NotePaper key={note.meta.id} noteData={note} />;
          })}
        </Grid>
        {Math.ceil(totalNotes / itemsPerPage) > 0 && (
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
