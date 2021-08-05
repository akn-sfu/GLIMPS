import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, Tooltip } from '@material-ui/core';
import Stat, { IStatProps } from '../Summary/Stats';
import { createMuiTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import clipboard from '../../../assets/clipboard.svg';
const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    statTools: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '5px 10px',
    },
    copyButton: {
      width: '24px',
      height: '24px',
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
  const [copyMessage, setCopyMessage] = useState('Copy stats');
  const [csvString, setCsvString] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const copyNodeRef = useRef<HTMLTextAreaElement>(null);
  const clipboardCopyFallback = () => {
    if (!copyNodeRef.current) {
      setCopyMessage('Failed to copy');
      timeoutRef.current = setTimeout(() => setCopyMessage('Copy stats'), 5000);
      return;
    }
    copyNodeRef.current.value = csvString;
    copyNodeRef.current.select();
    document.execCommand('copy');
    setCopyMessage('Copied!');
    timeoutRef.current = setTimeout(() => setCopyMessage('Copy stats'), 5000);
  };

  useEffect(() => {
    setCsvString(
      [
        ...statData.map((stat) => [
          stat.name + new Array(15 - stat.name.length + 4).join(' '),
          stat.rawValue ?? stat.value,
        ]),
      ]
        .map((row) => row.join('\t'))
        .join('\n'),
    );
  }, [statData]);

  const copyToClipboard = () => {
    navigator.clipboard
      ?.writeText(csvString)
      .then(() => {
        setCopyMessage('Copied!');
        timeoutRef.current = setTimeout(
          () => setCopyMessage('Copy stats'),
          5000,
        );
      })
      .catch(() => {
        clipboardCopyFallback();
      }) ?? clipboardCopyFallback();
  };

  useEffect(() => {
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  return (
    <ThemeProvider theme={tooltipTheme}>
      <div className={classes.container}>
        {statData?.map((stat) => (
          <Stat key={stat.name} {...stat} />
        ))}
        <div className={classes.statTools}>
          <Tooltip title={copyMessage} arrow>
            <button onClick={copyToClipboard} className={classes.copyButton}>
              <img src={clipboard} />
            </button>
          </Tooltip>
        </div>
        <textarea
          style={{ position: 'fixed', left: '-10000000px' }}
          ref={copyNodeRef}
        />
      </div>
    </ThemeProvider>
  );
};

export default StatSummary;
