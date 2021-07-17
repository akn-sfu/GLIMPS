import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import DefaultPageTitleFormat from '../DefaultPageTitleFormat';
import { useFilterContext } from '../../contexts/FilterContext';
import DynamicBarChart from './BarChartComponent';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import { useRepositoryContext } from '../../contexts/RepositoryContext';
import { useGetCountMergeRequests } from '../../api/mergeRequests';
import { useGetCountCommits } from '../../api/commit';
import { Commit, MergeRequest, Note, RepositoryMember } from '@ceres/types';
import { uniq } from 'lodash';
import { DateTime } from 'luxon';
import { isSameDay } from 'date-fns';
import { useGetWordCount } from '../../api/note';
import { useRepositoryMembers } from '../../api/repo_members';
import { ApiResource } from '../../api/base';
import StudentDropdown from '../../components/StudentDropdown';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import StatSummary from './Summary/Summary';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& > *': {
        margin: theme.spacing(1),
      },
    },
  }),
);

function combineData(
  startDate: string,
  endDate: string,
  commitCounts: Commit.DailyCount[] = [],
  mergeRequestCounts: MergeRequest.DailyCount[] = [],
  issueWordCounts: Note.DailyCount[] = [],
  mergeRequestWordCounts: Note.DailyCount[] = [],
) {
  const allDates = uniq([
    ...commitCounts.map((count) => count.date),
    ...mergeRequestCounts.map((count) => count.date),
    ...issueWordCounts.map((count) => count.date),
    ...mergeRequestWordCounts.map((count) => count.date),
  ]).sort((a, b) => a.localeCompare(b));
  const startDateRounded = DateTime.fromISO(startDate)
    .startOf('day')
    .toJSDate();
  const earliestDateDatset = new Date(allDates[0]);
  const endDateRounded = DateTime.fromISO(endDate).startOf('day').toJSDate();
  let date =
    startDateRounded < earliestDateDatset
      ? startDateRounded
      : earliestDateDatset;
  const dates: Date[] = [];
  while (date <= endDateRounded) {
    dates.push(date);
    date = DateTime.fromISO(date.toISOString()).plus({ days: 1 }).toJSDate();
  }
  return dates.map((date) => ({
    date: date.toISOString(),
    commitCount:
      commitCounts.find((count) => isSameDay(date, new Date(count.date)))
        ?.count || 0,
    commitScore:
      commitCounts.find((count) => isSameDay(date, new Date(count.date)))
        ?.score || 0,
    mergeRequestCount:
      -mergeRequestCounts.find((count) => isSameDay(date, new Date(count.date)))
        ?.count || 0,
    mergeRequestScore:
      -mergeRequestCounts.find((count) => isSameDay(date, new Date(count.date)))
        ?.score || 0,
    issueWordCount:
      -issueWordCounts.find((count) => isSameDay(date, new Date(count.date)))
        ?.wordCount || 0,
    mergeRequestWordCount:
      mergeRequestWordCounts.find((count) =>
        isSameDay(date, new Date(count.date)),
      )?.wordCount || 0,
  }));
}

export enum GraphTab {
  code = 'code',
  scores = 'scores',
  comments = 'comments',
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

const DynamicGraph: React.FC = () => {
  const classes = useStyles();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { startDate, endDate, author } = useFilterContext();
  const { repositoryId } = useRepositoryContext();
  const { data: members } = useRepositoryMembers(repositoryId);
  const authorIds = findRepoMemberId(author, members);
  const [emails, setEmails] = useState<string[]>([]);
  const { data: commitCounts } = useGetCountCommits({
    repository: repositoryId,
    author_email: emails,
    start_date: startDate,
    end_date: endDate,
    timezone: timezone,
    sort: '+authored_date',
  });
  const { data: mergeRequestCounts } = useGetCountMergeRequests({
    repository: repositoryId,
    author_email: emails,
    merged_start_date: startDate,
    merged_end_date: endDate,
    timezone: timezone,
  });
  const { data: issueWordCounts } = useGetWordCount({
    repository_id: repositoryId,
    created_start_date: startDate,
    created_end_date: endDate,
    author_id: authorIds,
    type: Note.Type.issueComment,
    timezone: timezone,
  });
  const { data: mergeRequestWordCounts } = useGetWordCount({
    repository_id: repositoryId,
    created_start_date: startDate,
    created_end_date: endDate,
    author_id: authorIds,
    type: Note.Type.mergeRequestComment,
    timezone: timezone,
  });

  const [graphTab, setGraphTab] = useState(GraphTab.code);
  const graphData = combineData(
    startDate,
    endDate,
    commitCounts || [],
    mergeRequestCounts || [],
    issueWordCounts || [],
    mergeRequestWordCounts || [],
  );

  const handleTabs = (event: React.ChangeEvent<unknown>, newTab: GraphTab) => {
    setGraphTab(newTab);
  };

  const totalMrScore = graphData.reduce(
    (n, { mergeRequestScore }) => n + mergeRequestScore,
    0,
  );
  const totalCommitScore = graphData.reduce(
    (n, { commitScore }) => n + commitScore,
    0,
  );
  const totalMrCount = graphData.reduce(
    (n, { mergeRequestCount }) => n + mergeRequestCount,
    0,
  );
  const totalCommitCount = graphData.reduce(
    (n, { commitCount }) => n + commitCount,
    0,
  );
  const totalIssueWordCount = graphData.reduce(
    (n, { issueWordCount }) => n + issueWordCount,
    0,
  );
  const totalmergeRequestWordCount = graphData.reduce(
    (n, { mergeRequestWordCount }) => n + mergeRequestWordCount,
    0,
  );

  return (
    <>
      <Container>
        <Grid container justify='space-between' alignItems='center'>
          <Grid item>
            <DefaultPageTitleFormat>Contribution Graph</DefaultPageTitleFormat>
          </Grid>
          <Grid item>
            <Box position='relative' className={classes.root}>
              <Button variant='contained' color='primary' size='medium'>
                COPY
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Container maxWidth='md'>
          <Grid container justify='flex-end' alignItems='flex-end' spacing={1}>
            <Grid item>
              <Box mb={1}>
                <StudentDropdown
                  repositoryId={repositoryId}
                  onChange={(newEmails) => {
                    setEmails(newEmails);
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
        <Box my={2}>
          <Tabs
            value={graphTab}
            onChange={handleTabs}
            indicatorColor='primary'
            textColor='primary'
            centered
          >
            <Tab label='Codes' value={GraphTab.code} />
            <Tab label='Scores' value={GraphTab.scores} />
            <Tab label='Comments' value={GraphTab.comments} />
          </Tabs>
        </Box>
        <Grid container justify='space-between' alignItems='center'>
          <Grid item>
            <DynamicBarChart graphData={graphData} graphTab={graphTab} />
          </Grid>
          <Grid item>
            <StatSummary
              statData={[
                {
                  name: 'Merge request score',
                  value: Math.abs(totalMrScore).toFixed(1),
                  description:
                    'Sum of merge request diff scores for mrs for selected date range.',
                },
                {
                  name: 'Commit score',
                  value: totalCommitScore.toFixed(1),
                  description: 'Sum of commit scores for selected date range',
                },
                {
                  name: 'Total Merge request',
                  value: Math.abs(totalMrCount),
                  description: 'Number of mrs made for selected date range',
                },
                {
                  name: 'Total commits',
                  value: totalCommitCount,
                  description: 'Number of commits made for selected date range',
                },
                {
                  name: 'Comments word count',
                  value: totalIssueWordCount + totalmergeRequestWordCount,
                  description:
                    'Sum of words in all comments for selected date range',
                },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default DynamicGraph;
