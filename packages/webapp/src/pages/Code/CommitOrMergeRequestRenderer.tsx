import { MergeRequest, Commit, ScoreOverride } from '@ceres/types';
import { useTheme } from '@material-ui/core';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ExpandMore from '@material-ui/icons/ExpandMore';
import React from 'react';
import { ApiResource } from '../../api/base';
import ScoringChip from './ScoringChip';
import SmartDate from '../../shared/components/SmartDate';
import { useFilterContext } from '../../contexts/FilterContext';
import OverridePopper from './OverridePopper';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { useGetCommits } from '../../api/commit';

const StyledAccordionDetails = styled(AccordionDetails)`
  &&& {
    display: block;
  }
`;

interface CommitOrMergeRequestRendererProps {
  mergeRequest?: ApiResource<MergeRequest>;
  commit?: ApiResource<Commit>;
  active?: boolean;
  filteredAuthorEmails?: string[];
  onClickSummary?: () => void;
  shrink?: boolean;
  endDate?: string;
}

function shortenTitle(title: string, shrink?: boolean) {
  const maxLength = shrink ? 50 : 50;
  if (title.length < maxLength) {
    return title;
  }
  return title.substr(0, maxLength) + '...';
}

function getSumAndHasOverride(
  emails: string[],
  commitScoreSums: MergeRequest['extensions']['commitScoreSums'],
) {
  let hasOverride = false;
  let score = 0;
  Object.keys(commitScoreSums).forEach((authorEmail) => {
    if (emails.length === 0 || emails.includes(authorEmail)) {
      hasOverride = commitScoreSums[authorEmail].hasOverride || hasOverride;
      score += commitScoreSums[authorEmail].sum;
    }
  });
  return {
    hasOverride,
    score,
  };
}

function getSumCommitScore(commits: ApiResource<Commit>[]): string {
  const sumCommitScore = commits?.reduce((accummulator: number, commit) => {
    return (
      accummulator +
      ScoreOverride.computeScore(
        commit.extensions?.override,
        commit?.extensions?.score,
      )
    );
  }, 0);

  return sumCommitScore?.toFixed(1);
}

const CommitOrMergeRequestRenderer: React.FC<
  CommitOrMergeRequestRendererProps
> = ({
  active,
  mergeRequest,
  commit,
  onClickSummary,
  children,
  shrink,
  endDate,
}) => {
  const theme = useTheme();
  const isMerged =
    DateTime.fromISO(mergeRequest?.merged_at) <= DateTime.fromISO(endDate);
  const title =
    commit?.title ||
    (isMerged ? mergeRequest?.title : '(Unmerged) ' + mergeRequest?.title);
  const author = mergeRequest?.author.name || commit?.committer_name;
  const extensions = (commit || mergeRequest).extensions;
  const isExcluded = extensions?.override?.exclude;
  const hasOverride = ScoreOverride.hasOverride(extensions?.override);
  const fileNameTextDecoration = isExcluded ? 'line-through' : '';

  const date = mergeRequest?.merged_at || commit?.created_at;
  // Check if merge request or commit, or one of it's diffs has an override
  const diffHasOverride =
    mergeRequest?.extensions?.diffHasOverride ||
    commit?.extensions?.diffHasOverride ||
    hasOverride;

  const diffScoreSum = ScoreOverride.computeScore(
    extensions?.override,
    mergeRequest?.extensions?.diffScore || commit?.extensions?.score,
  ).toFixed(1);

  const accordionColor = mergeRequest ? '' : '#f7ebef';
  const warningColor = '#Fba2a2';
  const { emails } = useFilterContext();
  const { hasOverride: commitHasOverride } = getSumAndHasOverride(
    emails || [],
    mergeRequest?.extensions?.commitScoreSums || {},
  );

  const { data: commits } = useGetCommits({
    merge_request: mergeRequest?.meta.id,
    end_date: endDate,
  });

  const mergeScore = mergeRequest ? getSumCommitScore(commits?.results) : null;

  return (
    <Accordion
      expanded={active}
      TransitionProps={{ timeout: 0, unmountOnExit: true }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        onClick={onClickSummary}
        style={{
          background: active
            ? theme.palette.primary.light
            : isMerged
            ? accordionColor
            : warningColor,
        }}
      >
        <Grid container>
          <Grid item xs={shrink ? 8 : 5}>
            <Grid container alignItems='center' spacing={2}>
              {hasOverride && (
                <Grid item>
                  <OverridePopper override={extensions.override} />
                </Grid>
              )}
              <Grid item>
                <Typography
                  style={{
                    textDecoration: fileNameTextDecoration,
                  }}
                >
                  {shortenTitle(title, shrink)}
                </Typography>
              </Grid>
            </Grid>
            {shrink && (
              <Grid container justify='space-between'>
                <Typography variant='body2' color='textSecondary'>
                  {author}
                </Typography>
                <Box pr={4}>
                  <Typography variant='body2' color='textSecondary'>
                    <SmartDate>{date}</SmartDate>
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
          {shrink ? (
            <>
              <Grid item xs={2}>
                <Typography align='right'>
                  <ScoringChip hasOverride={diffHasOverride}>
                    {diffScoreSum}
                  </ScoringChip>
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography align='right'>
                  <ScoringChip hasOverride={commitHasOverride}>
                    {mergeScore}
                  </ScoringChip>
                </Typography>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={2}>
                <Typography>{author}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography>
                  <SmartDate>{date}</SmartDate>
                </Typography>
              </Grid>
              <Grid item xs={1}>
                <Typography align='right'>
                  <ScoringChip hasOverride={diffHasOverride}>
                    {diffScoreSum}
                  </ScoringChip>
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography align='right'>
                  <ScoringChip hasOverride={commitHasOverride}>
                    {mergeScore}
                  </ScoringChip>
                </Typography>
              </Grid>
            </>
          )}
        </Grid>
      </AccordionSummary>
      {mergeRequest && (
        <StyledAccordionDetails>{children}</StyledAccordionDetails>
      )}
    </Accordion>
  );
};

export default CommitOrMergeRequestRenderer;
