import React from 'react';
import { Tooltip } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Info from '../../../../assets/info.svg';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      width: '17.5rem',
      lineHeight: '3.5rem',
    },
    name: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9e9e9e',
      margin: 0,
    },

    icon: {
      alignSelf: 'center',
      marginLeft: '5px',
      width: '16px',
      height: '16px',
    },

    value: {
      margin: '6px 0 0',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
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
            <img className={classes.icon} src={Info} />
          </Tooltip>
        )}
      </p>
      <p className={classes.value}>{value}</p>
    </div>
  );
};

export default Stat;
