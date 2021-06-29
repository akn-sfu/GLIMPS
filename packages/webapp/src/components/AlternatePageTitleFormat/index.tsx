import React from 'react';
import { Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';

const AlternatePageTitleFormat: React.FC = ({ children }) => {
  return (
    <Box my={4}>
      <Grid container justify='space-between'>
        {children}
      </Grid>
    </Box>
  );
};

export default AlternatePageTitleFormat;
