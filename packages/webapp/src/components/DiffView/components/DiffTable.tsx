import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import { Line } from '@ceres/types';
import Color from 'color';

// import highlight from 'highlight.js';

const LINE_COLOR_MAP = {
  [Line.Type.add]: '#ccffd8',
  [Line.Type.delete]: '#ffdce0',
  [Line.Type.noChange]: '#ffffff',
  [Line.Type.syntaxChange]: '#c3ddff',
  [Line.Type.spaceChange]: '#c3ddff',
  [Line.Type.comment]: '#e8d9fe',
  [Line.Type.syntaxLine]: '#c3ddff',
  [Line.Type.blank]: '#c3ddff',
};

const DiffTable = ({ lines, weight }) => {
  const classes = useStyles();
  console.log(weight);

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label='diff view table'>
        <TableBody>
          {lines.map((line, index) => {
            return (
              <TableRow key={index}>
                {line.left ? (
                  <>
                    <TableCell
                      style={{
                        backgroundColor: LINE_COLOR_MAP[line.type],
                      }}
                      className={classes.number}
                    >
                      {line.left.lineNumber}
                    </TableCell>
                    <TableCell
                      style={{
                        backgroundColor: Color(LINE_COLOR_MAP[line.type]).alpha(
                          0.7,
                        ),
                      }}
                      className={classes.tableCell}
                    >
                      <pre className={classes.pre}>{line.left.lineContent}</pre>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className={classes.empty} />
                    <TableCell className={classes.empty} />
                  </>
                )}
                {line.right ? (
                  <>
                    <TableCell className={classes.number}>
                      {line.right.lineNumber}
                    </TableCell>
                    <TableCell className={classes.tableCell}>
                      <pre className={classes.pre}>
                        {line.right.lineContent}
                      </pre>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className={classes.empty} />
                    <TableCell className={classes.empty} />
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  tableCell: {
    borderBottom: 'none',
    paddingTop: 4,
    paddingBottom: 4,
  },
  pre: {
    margin: 0,
  },
  number: {
    backgroundColor: '#f5f5f5',
    borderBottom: 'none',
    paddingTop: 4,
    paddingBottom: 4,
  },
  empty: {
    backgroundColor: '#f5f5f5',
    borderBottom: 'none',
    paddingTop: 4,
    paddingBottom: 4,
  },
});

export default DiffTable;
