import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import HomeLogin from './HomeLogin';

const useStyles = makeStyles(() => ({
  root: {
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundImage: `url('/landing-bg.jpg')`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  },
}));

const Login: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <HomeLogin />
    </div>
  );
};

export default Login;
