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
  /*
  if (tab == TabOption.codeReview){
    const my_comments = 'Notes on my own merge request(s)';
    const other_comments = 'Notes on other members&apos; merge request(s)';
  } else {
    const my_comments = 'Notes on my own issue(s)';
    const other_comments = 'Notes on other members\'s issue(s)';
  }
  */
  return (
    <Box className={css}>
      <Grid
        container
        direction={'row'}
        alignItems={'center'}
        style={{ marginTop: 15 }}
      >
        {tab === TabOption.codeReview ? (
          <>
            <Grid container item xs={6} alignItems={'center'} direction={'row'}>
              <DifferentiatingIcon isMine={true} />
              <Typography style={{ marginLeft: 10, marginRight: 10 }}>
                Notes on my own merge request(s)
              </Typography>
            </Grid>
            <Grid container item xs={6} alignItems={'center'} direction={'row'}>
              <DifferentiatingIcon isMine={false} />
              <Typography style={{ marginLeft: 10, marginRight: 10 }}>
                Notes on other members&apos; merge request(s)
              </Typography>
            </Grid>
          </>
        ) : (
          <>
            <Grid container item xs={6} alignItems={'center'} direction={'row'}>
              <DifferentiatingIcon isMine={true} />
              <Typography style={{ marginLeft: 10, marginRight: 10 }}>
                Notes on my own issue(s)
              </Typography>
            </Grid>
            <Grid container item xs={6} alignItems={'center'} direction={'row'}>
              <DifferentiatingIcon isMine={false} />
              <Typography style={{ marginLeft: 10, marginRight: 10 }}>
                Notes on other members&apos; issue(s)
              </Typography>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default MakeIconTitle;
