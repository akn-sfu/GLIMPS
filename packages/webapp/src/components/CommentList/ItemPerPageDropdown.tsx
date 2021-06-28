import React, { useState } from 'react';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 200,
    },
  }),
);

const ItemPerPageDropdown = ({ updateItemsPerPage }) => {
  const styles = useStyles();
  const [itemPerPage, setItemPerPage] = useState(20);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as number;
    setItemPerPage(value);
    updateItemsPerPage(value);
  };

  const menuOptions = [5, 10, 15, 20];

  return (
    <FormControl className={styles.formControl} variant='filled'>
      <InputLabel>Show comments:</InputLabel>
      <Select fullWidth value={itemPerPage} onChange={handleChange}>
        {menuOptions.map((option, index) => {
          return (
            <MenuItem key={index} value={option}>
              {option}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default ItemPerPageDropdown;
