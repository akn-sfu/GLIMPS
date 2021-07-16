import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import Stat, { IStatProps } from '../Summary/Stats';
import { createMuiTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
  }),
);

export interface IStatSummaryProps {
  statData: IStatProps[];
}

const tooltipTheme = createMuiTheme({
  typography: {
    fontFamily: 'Mulish',
    fontSize: 16,
  },
});

const StatSummary: React.FC<IStatSummaryProps> = ({ statData }) => {
  const classes = useStyles();
  return (
    <ThemeProvider theme={tooltipTheme}>
      <div className={classes.container}>
        {statData?.map((stat) => (
          <Stat key={stat.name} {...stat} />
        ))}
      </div>
    </ThemeProvider>
  );
};

export default StatSummary;
