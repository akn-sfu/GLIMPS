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

function getAuthorMergeSumCommitScore(
  filteredAuthorEmails: string[],
  commitScoreSum: number,
  mergeRequest: ApiResource<MergeRequest>,
): string {
  let mergeScore = 0;
  if (filteredAuthorEmails.length > 0) {
    for (const email of filteredAuthorEmails) {
      if (mergeRequest?.extensions?.commitScoreSums?.[email]) {
        mergeScore += mergeRequest.extensions.commitScoreSums[email].sum;
      }
    }
  } else {
    mergeScore = commitScoreSum;
  }
  return mergeScore.toFixed(1);
}

const CommitOrMergeRequestRenderer: React.FC<
  CommitOrMergeRequestRendererProps
> = ({
  active,
  mergeRequest,
  commit,
  filteredAuthorEmails,
  onClickSummary,
  children,
  shrink,
}) => {
  const theme = useTheme();
  const title = mergeRequest?.title || commit?.title;
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
  const { emails } = useFilterContext();
  const { hasOverride: commitHasOverride, score: commitScoreSum } =
    getSumAndHasOverride(
      emails || [],
      mergeRequest?.extensions?.commitScoreSums || {},
    );

  const mergeScore = mergeRequest
    ? getAuthorMergeSumCommitScore(
        filteredAuthorEmails,
        commitScoreSum,
        mergeRequest,
      )
    : null;

  return (
    <Accordion
      expanded={active}
      TransitionProps={{ timeout: 0, unmountOnExit: true }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        onClick={onClickSummary}
        style={{
          background: active ? theme.palette.primary.light : accordionColor,
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
