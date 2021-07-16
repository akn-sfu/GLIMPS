import React from 'react';
import { Tooltip } from '@material-ui/core';

import styles from '../../../css/Stat.module.css';

import info from '../assets/info.svg';

export interface IStatProps {
  name: string;
  rawValue?: string | number;
  value?: string | number;
  description?: string;
}

const Stat = ({ name, value, description }: IStatProps) => {
  return (
    <div className={styles.container}>
      <p className={styles.name}>
        {name}
        {description && (
          <Tooltip title={description} placement='top' arrow>
            <img className={styles.icon} src={info} />
          </Tooltip>
        )}
      </p>
      <p className={styles.value}>{value}</p>
    </div>
  );
};

export default Stat;
