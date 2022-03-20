import {
  Commit,
  Diff,
  MergeRequest,
  Repository,
  ScoreOverride,
} from '@ceres/types';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import { ApiResource } from '../../../api/base';
import { useInfiniteDiffs } from '../../../api/diff';
import DiffView from '../DiffView';
import CallMadeIcon from '@material-ui/icons/CallMade';
import Grid from '@material-ui/core/Grid';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import ScoreOverrideForm from './ScoreOverrideForm';
import { useScoreOverrideQueue } from '../contexts/ScoreOverrideQueue';
import { useRepositoryContext } from '../../../contexts/RepositoryContext';
import { useGetRepository } from '../../../api/repository';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import LoadMore from '../LoadMore';
import { useInView } from 'react-intersection-observer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      ...theme.typography.body1,
      color: theme.palette.text.primary,
      wordBreak: 'break-word',
      '& .anchor-link': {
        marginTop: -(96 + 36), // Offset for the anchor.
        position: 'absolute',
      },
      '& pre': {
        margin: theme.spacing(3, 'auto'),
        padding: theme.spacing(2),
        backgroundColor: '#ffffff',
        direction: 'ltr',
        borderRadius: theme.shape.borderRadius,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch', // iOS momentum scrolling.
        maxWidth: 'calc(100vw - 32px)',
        [theme.breakpoints.up('md')]: {
          maxWidth: 'calc(100vw - 32px - 16px)',
        },
      },
      // inline code
      '& code': {
        direction: 'ltr',
        lineHeight: 1.4,
        display: 'inline-block',
        fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace',
        WebkitFontSmoothing: 'subpixel-antialiased',
        padding: '0 3px',
        color: theme.palette.text.primary,
        backgroundColor: 'rgba(27,31,35,.05)',
        fontSize: '.8em',
        borderRadius: '3px',
      },
      '& code[class*="language-"]': {
        backgroundColor: '#272c34',
        color: '#fff',
        // Avoid layout jump after hydration (style injected by prism)
        lineHeight: 1.5,
      },
      // code blocks
      '& pre code': {
        fontSize: '.9em',
      },
      '& .token.operator': {
        background: 'transparent',
      },
      '& h1': {
        ...theme.typography.h3,
        fontSize: 40,
        margin: '16px 0',
      },
      '& .description': {
        ...theme.typography.h5,
        margin: '0 0 40px',
      },
      '& h2': {
        ...theme.typography.h4,
        fontSize: 30,
        margin: '40px 0 16px',
      },
      '& h3': {
        ...theme.typography.h5,
        margin: '40px 0 16px',
      },
      '& h4': {
        ...theme.typography.h6,
        margin: '32px 0 16px',
      },
      '& h5': {
        ...theme.typography.subtitle2,
        margin: '32px 0 16px',
      },
      '& p, & ul, & ol': {
        marginTop: 0,
        marginBottom: 16,
      },
      '& ul': {
        paddingLeft: 30,
      },
      '& h1, & h2, & h3, & h4': {
        '& code': {
          fontSize: 'inherit',
          lineHeight: 'inherit',
          // Remove scroll on small screens.
          wordBreak: 'break-all',
        },
        '&:hover .anchor-link-style': {
          display: 'inline-block',
          padding: '0 8px',
          color: theme.palette.text.secondary,
          '&:hover': {
            color: theme.palette.text.primary,
          },
          '& svg': {
            width: '0.7em',
            height: '0.7em',
            fill: 'currentColor',
          },
        },
      },
      '& table': {
        // Trade display table for scroll overflow
        display: 'block',
        wordBreak: 'normal',
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch', // iOS momentum scrolling.
        borderCollapse: 'collapse',
        marginBottom: '16px',
        borderSpacing: 0,
        overflow: 'hidden',
        '& .prop-name': {
          fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace',
        },
        '& .required': {
          color: theme.palette.type === 'light' ? '#006500' : '#a5ffa5',
        },
        '& .optional': {
          color: theme.palette.type === 'light' ? '#080065' : '#a5b3ff',
        },
        '& .prop-type': {
          fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace',
          color: theme.palette.type === 'light' ? '#932981' : '#ffb6ec',
        },
        '& .prop-default': {
          fontFamily: 'Consolas, "Liberation Mono", Menlo, monospace',
          borderBottom: `1px dotted ${theme.palette.divider}`,
        },
      },
      '& td': {
        ...theme.typography.body2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: 16,
        color: theme.palette.text.primary,
      },
      '& td code': {
        lineHeight: 1.6,
      },
      '& th': {
        lineHeight: theme.typography.pxToRem(24),
        fontWeight: theme.typography.fontWeightMedium,
        color: theme.palette.text.primary,
        whiteSpace: 'pre',
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: 16,
      },
      '& blockquote': {
        borderLeft: '.25em solid #dfe2e5',
        backgroundColor: '#fafafa',
        padding: '4px 24px',
        margin: '24px 0',
        '& p': {
          marginTop: '16px',
          color: '#145561',
        },
      },
      '& a, & a code': {
        // for Link component
        color: '#blue',
      },
      '& img, video': {
        maxWidth: '100%',
      },
      '& img': {
        // Avoid layout jump
        display: 'inline-block',
      },
      '& hr': {
        height: 1,
        margin: theme.spacing(6, 0),
        border: 'none',
        flexShrink: 0,
        backgroundColor: theme.palette.divider,
      },
      '& kbd': {
        // Style taken from GitHub
        padding: '2px 5px',
        font: '11px Consolas,Liberation Mono,Menlo,monospace',
        lineHeight: '10px',
        color: '#564944',
        verticalAlign: 'middle',
        backgroundColor: '#fafbfc',
        border: '1px solid #d1d5da',
        borderRadius: 3,
        boxShadow: 'inset 0 -1px 0 #d1d5da',
      },
    },
  }),
);

interface CodeViewProps {
  mergeRequest?: ApiResource<MergeRequest>;
  commit?: ApiResource<Commit>;
}

const CodeView: React.FC<CodeViewProps> = ({ mergeRequest, commit }) => {
  const classes = useStyles();
  // using infinite diffs to prevent performance slow down of loading all commits at once
  const {
    data: diffs,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteDiffs(
    commit
      ? { commit: commit.meta.id }
      : { merge_request: mergeRequest.meta.id },
  );
  // need to reduce to work with useInfiniteDiffs
  const reducedDiffs =
    diffs?.pages?.reduce(
      (accumulated, current) => [...accumulated, ...current.results],
      [],
    ) || [];
  const { repositoryId } = useRepositoryContext();
  const { data: repository } = useGetRepository(repositoryId);
  const { user } = useAuthContext();
  const isOwner = user?.id === repository?.extensions?.owner?.id;
  const collaborators = repository?.extensions?.collaborators || [];
  const allowEdit =
    isOwner ||
    !!collaborators.find(
      (collaborator) =>
        collaborator.id === user?.id &&
        collaborator.accessLevel === Repository.AccessLevel.editor,
    );
  const [anchor, setAnchor] = useState(null);
  const [openOverride, setOpenOverride] = useState(false);
  const { add } = useScoreOverrideQueue();
  const [expandedDiffs, setExpandedDiffs] = useState<ApiResource<Diff>[]>([]);
  const defaultScore =
    commit?.extensions?.score || mergeRequest?.extensions?.diffScore;
  const score = ScoreOverride.computeScore(
    (commit || mergeRequest)?.extensions?.override,
    defaultScore,
  );
  // allos us to load more files when we scroll to the bottom of the page
  const { ref: loadMoreRef, inView: loadMoreInView } = useInView();

  useEffect(() => {
    if (loadMoreInView) {
      void fetchNextPage();
    }
  }, [loadMoreInView]);

  const onScoreEdit = (e: MouseEvent) => {
    // prevent the accordion from toggling
    e.stopPropagation();
    setOpenOverride(!openOverride);
    setAnchor(anchor ? null : e.currentTarget);
  };

  const onPopperClickAway = () => {
    setOpenOverride(false);
    setAnchor(null);
  };

  useEffect(() => {
    const defaultExpanded = reducedDiffs?.filter(
      (diff) => diff?.lines.length < 500,
    );
    setExpandedDiffs(defaultExpanded || []);
  }, [diffs]);

  const onSubmitPopper = (values: ScoreOverride) => {
    add({
      id: `${commit ? 'Commit' : 'MergeRequest'}/${
        (commit || mergeRequest).meta.id
      }`,
      display: commit
        ? 'Commit: '
        : 'MergeRequest: ' + (commit?.title || mergeRequest?.title),
      previousScore: score,
      defaultScore,
      override: {
        ...values,
        score: values.score ? +values.score : undefined,
      },
    });
    onPopperClickAway();
  };

  return (
    <Container maxWidth={false}>
      <Box my={2}>
        <Grid
          container
          justify='space-between'
          alignItems='flex-start'
          spacing={4}
        >
          <Grid item xs={10}>
            <Typography variant='h2'>
              {commit?.title || mergeRequest?.title}
            </Typography>
          </Grid>
          <Grid container spacing={1} xs={2}>
            <Box mt={2}>
              {mergeRequest?.iid && (
                <Grid item xs={1}>{`MR${mergeRequest.iid}`}</Grid>
              )}
            </Box>
            {allowEdit && (
              <Grid item xs={1}>
                <IconButton onClick={onScoreEdit as any}>
                  <EditIcon />
                </IconButton>
                <ScoreOverrideForm
                  open={openOverride}
                  anchor={anchor}
                  onClickAway={onPopperClickAway}
                  onSubmit={onSubmitPopper}
                  defaultValues={(commit || mergeRequest)?.extensions?.override}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid
          container
          justify='space-between'
          alignItems='flex-start'
          spacing={4}
        >
          <Grid item>
            <Paper variant='outlined'>
              <Box p={2}>
                <Grid container>
                  <ReactMarkdown className={classes.root} remarkPlugins={[gfm]}>
                    {mergeRequest?.description}
                  </ReactMarkdown>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <Box my={2}>
        <Button onClick={() => setExpandedDiffs(reducedDiffs || [])}>
          Expand All
        </Button>
        <Button onClick={() => setExpandedDiffs([])}>Collapse All</Button>
        <Button
          variant='text'
          color={'primary'}
          endIcon={<CallMadeIcon />}
          onClick={
            commit?.web_url
              ? () => window.open(commit.web_url)
              : () => window.open(mergeRequest.web_url)
          }
        >
          View on GitLab
        </Button>
      </Box>
      <Box>
        {reducedDiffs?.map((diff) => {
          const expanded = expandedDiffs.includes(diff);
          return (
            <DiffView
              key={diff.meta.id}
              diffId={diff.meta.id}
              fileName={diff.new_path}
              lines={diff.lines}
              summary={diff.summary}
              expanded={expanded}
              extensions={diff.extensions}
              onSummaryClick={() => {
                if (expanded) {
                  setExpandedDiffs(
                    expandedDiffs.filter((d) => d.meta.id !== diff.meta.id),
                  );
                } else {
                  setExpandedDiffs([...expandedDiffs, diff]);
                }
              }}
              allowEdit={allowEdit}
            />
          );
        })}
      </Box>
      {hasNextPage && (
        <LoadMore
          onClick={() => {
            void fetchNextPage();
          }}
          ref={loadMoreRef}
        />
      )}
    </Container>
  );
};

export default CodeView;
