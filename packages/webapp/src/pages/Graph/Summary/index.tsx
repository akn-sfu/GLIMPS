import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, Tooltip } from '@material-ui/core';
import Stat, { IStatProps } from './Stats';
import { createMuiTheme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import widths from './PixelWidthArray';
import Clipboard from '../../../app/img/clipboard.svg';
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
  const [copyMessage, setCopyMessage] = useState('Copy stats (Font: Arial)');
  const [csvString, setCsvString] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const copyNodeRef = useRef<HTMLTextAreaElement>(null);
  const clipboardCopyFallback = () => {
    if (!copyNodeRef.current) {
      setCopyMessage('Failed to copy');
      timeoutRef.current = setTimeout(
        () => setCopyMessage('Copy stats (Font: Arial)'),
        5000,
      );
      return;
    }
    copyNodeRef.current.value = csvString;
    copyNodeRef.current.select();
    document.execCommand('copy');
    setCopyMessage('Copied!');
    timeoutRef.current = setTimeout(
      () => setCopyMessage('Copy stats (Font: Arial)'),
      5000,
    );
  };

  //Calculate the pixel width of the string since characters show different pixel width on google sheet
  const measureText = (string: string, fontSize = 10) => {
    if (string == null) {
      return 0;
    }
    const avg = 0.5279276315789471;
    //pixel width for one space since we need a "tab(4 spaces)" between them
    const aSpacePxWidth = 2.796875;
    let totalLen =
      string
        .split('')
        .map((c) =>
          c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg,
        )
        .reduce((cur, acc) => acc + cur) * fontSize;
    totalLen /= aSpacePxWidth;
    return Math.floor(totalLen);
  };

  useEffect(() => {
    setCsvString(
      [
        ...statData.map((stat) => [
          //Pad the strings with spaces to be the same length
          stat.name + new Array(26 - measureText(stat.name) + 5).join(' '),
          stat.rawValue ?? stat.value,
        ]),
      ]
        .map((row) => row.join(''))
        .join('\n'),
    );
  }, [statData]);

  const copyToClipboard = () => {
    navigator.clipboard
      ?.writeText(csvString)
      .then(() => {
        setCopyMessage('Copied!');
        timeoutRef.current = setTimeout(
          () => setCopyMessage('Copy stats (Font: Arial)'),
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
              <img src={Clipboard} />
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
