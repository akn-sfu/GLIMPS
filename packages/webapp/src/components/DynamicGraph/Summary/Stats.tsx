import React from 'react';
import { Tooltip } from '@material-ui/core';

import { createStyles, makeStyles } from '@material-ui/core/styles';

import info from '../assets/info.svg';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderLeft: '1px',
      borderColor: 'grey.500',
      borderTop: '1px',
    },
    name: {
      display: 'flex',
      color: 'grey.500',
      margin: 0,
    },

    icon: {
      alignSelf: 'center',
      marginLeft: '5px',
      width: '16px',
      height: '16px',
    },

    value: {
      margin: '6px',
    },
  }),
);

export interface IStatProps {
  name: string;
  rawValue?: string | number;
  value?: string | number;
  description?: string;
}
const Stat: React.FC<IStatProps> = ({ name, value, description }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <p className={classes.name}>
        {name}
        {description && (
          <Tooltip title={description} placement='top' arrow>
            <img className={classes.icon} src={info} />
          </Tooltip>
        )}
      </p>
      <p className={classes.value}>{value}</p>
    </div>
  );
};

export default Stat;
