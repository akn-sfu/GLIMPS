import Grid from '@material-ui/core/Grid';
import DifferentiatingIcon from './DifferentiatingIcon';
import { Typography } from '@material-ui/core';
import { TabOption } from './CommentList';
import React from 'react';
import Box from '@material-ui/core/Box';

interface MakeIconTitleProps {
  tab: TabOption;
  css: any;
}
const MakeIconTitle: React.FC<MakeIconTitleProps> = ({ tab, css }) => {
  if (tab == TabOption.createdIssues) return null;

  let my_comments, other_comments;
  if (tab == TabOption.codeReview) {
    my_comments = 'Notes on my own merge request(s)';
    other_comments = "Notes on other members's merge request(s)";
  } else {
    my_comments = 'Notes on my own issue(s)';
    other_comments = "Notes on other members's issue(s)";
  }

  return (
    <Box className={css}>
      <Grid
        container
        direction={'row'}
        alignItems={'center'}
        style={{ marginTop: 15 }}
      >
        {
          <>
            <Grid container item xs={6} alignItems={'center'} direction={'row'}>
              <DifferentiatingIcon isMine={true} />
              <Typography style={{ marginLeft: 10, marginRight: 10 }}>
                {my_comments}
              </Typography>
            </Grid>
            <Grid container item xs={6} alignItems={'center'} direction={'row'}>
              <DifferentiatingIcon isMine={false} />
              <Typography style={{ marginLeft: 10, marginRight: 10 }}>
                {other_comments}
              </Typography>
            </Grid>
          </>
        }
      </Grid>
    </Box>
  );
};

export default MakeIconTitle;
