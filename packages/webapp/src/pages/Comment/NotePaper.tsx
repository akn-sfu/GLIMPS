import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Paper } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
//import { ApiResource } from '../../api/base';
//import { /*Issue,*/ /*MergeRequest*/ Note } from '@ceres/types';
import SmartDate from '../../shared/components/SmartDate';
import { useGetMergeRequestByNoteId } from '../../api/mergeRequests';
import { useGetIssueByNoteId } from '../../api/issue';
import { useRepositoryContext } from '../../contexts/RepositoryContext';
import DifferentiatingIcon from './DifferentiatingIcon';
import { TabOption } from './CommentList';

interface NoteProps {
  noteData: any;
  tab: TabOption;
}

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      width: '100%',
      marginLeft: 5,
      marginTop: 5,
      marginBottom: 5,
      color: '#25476d',
    },
    merge_request_note_header_row: {
      backgroundColor: '#e8f4ea',
      padding: 10,
    },
    issue_note_header_row: {
      backgroundColor: '#f3eef8',
      padding: 10,
    },
    created_issue_header_row: {
      backgroundColor: '#f8cecb',
      padding: 10,
    },
    clickable_text_hyperlink: {
      color: '#0f4c81',
      textDecoration: 'underline',
      letterSpacing: 0.5,
      cursor: 'pointer',
      textUnderlineOffset: '15%',
      textUnderlinePosition: 'under',
    },
  }),
);

const extractNoteContent = (noteBody: string) => {
  return noteBody.replace(/\*([^*]+)\*$/g, '').trim();
};

const NotePaper: React.FC<NoteProps> = (NoteProps) => {
  const { repositoryId } = useRepositoryContext();
  const classes = useStyles();

  let onMyOwn: boolean,
    wordCount: number,
    createdDate: string,
    cssClass: any,
    startWords: string,
    webUrl: string,
    title: string,
    body: string;
  switch (NoteProps.tab) {
    case TabOption.codeReview: {
      // check whether it is on my own MR or other members' MR
      const { data: mergeRequest } = useGetMergeRequestByNoteId({
        repository: repositoryId,
        note_id: NoteProps.noteData.meta.id,
      });
      onMyOwn =
        mergeRequest?.results.length != 0 &&
        NoteProps.noteData.author.id ===
          mergeRequest?.results.find((element) => element).author.id;
      // meta data
      cssClass = classes.merge_request_note_header_row;
      startWords = 'On merge request ';
      webUrl = mergeRequest?.results.find((element) => element).web_url;
      title = mergeRequest?.results.find((element) => element).title;
      createdDate = NoteProps.noteData.created_at;
      body = extractNoteContent(NoteProps.noteData.body);
      wordCount = NoteProps.noteData.extensions?.wordCount;
      break;
    }

    case TabOption.issueNotes: {
      const { data: issue } = useGetIssueByNoteId({
        repository: repositoryId,
        note_id: NoteProps.noteData.meta.id,
      });
      onMyOwn =
        issue?.results.length != 0 &&
        NoteProps.noteData.author.id ===
          issue?.results.find((element) => element).author.id;
      //meta data
      cssClass = classes.issue_note_header_row;
      startWords = 'On issue ';
      webUrl = issue?.results.find((element) => element).web_url;
      title = issue?.results.find((element) => element).title;
      createdDate = NoteProps.noteData.created_at;
      body = extractNoteContent(NoteProps.noteData.body);
      wordCount = NoteProps.noteData.extensions?.wordCount;
      break;
    }

    case TabOption.createdIssues: {
      onMyOwn = true;
      cssClass = classes.created_issue_header_row;
      startWords = 'New issue ';
      webUrl = NoteProps.noteData.web_url;
      title = NoteProps.noteData.title;
      createdDate = NoteProps.noteData.created_at;
      //console.log(title);
      console.log(NoteProps.noteData);
      body = extractNoteContent(NoteProps.noteData.description);
      wordCount = NoteProps.noteData.description.trim().split(' ').length;
      break;
    }
  }

  return (
    <Paper elevation={3} className={classes.paper} key={NoteProps.noteData.id}>
      <Grid
        id='header-row'
        justify={'space-between'}
        alignItems={'center'}
        direction={'row'}
        container
        className={cssClass}
      >
        <Grid item>
          <Typography>
            <Box fontSize={18}>
              {startWords}
              <Box fontWeight='fontWeightBold' display='inline'>
                <a
                  className={classes.clickable_text_hyperlink}
                  onClick={() => {
                    window.open(webUrl);
                  }}
                >
                  {title}
                </a>
              </Box>
            </Box>
          </Typography>
        </Grid>
        <Grid item>
          <DifferentiatingIcon isMine={onMyOwn} />
        </Grid>
      </Grid>

      <Grid
        id='content-row'
        alignItems={'flex-start'}
        container
        direction={'row'}
        spacing={2}
        style={{
          padding: 10,
        }}
      >
        <Grid
          item
          xs={2}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Typography>
            <Box fontWeight='fontWeightBold' display='inline'>
              {NoteProps.noteData.author.name}
            </Box>{' '}
            wrote:
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography>{body}</Typography>
          <Typography variant={'body2'} align={'right'}>
            <Box fontSize={16} fontStyle={'italic'} marginTop={2}>
              <SmartDate>{createdDate}</SmartDate>
            </Box>
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography align={'right'}>
            <Box fontWeight={'fontWeightBold'} fontSize={20} marginRight={2}>
              {wordCount} words
            </Box>
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default NotePaper;
