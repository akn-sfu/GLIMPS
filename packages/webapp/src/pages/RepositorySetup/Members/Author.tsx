import { Commit, RepositoryMember } from '@ceres/types';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import { useLinkAuthorToMember } from '../../../api/author';
import { ApiResource } from '../../../api/base';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Tooltip from '@material-ui/core/Tooltip';

interface AuthorProps {
  author: ApiResource<Commit.Author>;
  member?: ApiResource<RepositoryMember>;
  allMembers: ApiResource<RepositoryMember>[];
  invalidateMembers: () => Promise<void>;
  invalidateAuthors: () => Promise<void>;
}

function compareMember(a: RepositoryMember, b: RepositoryMember) {
  return a.username.localeCompare(b.username);
}

const Author: React.FC<AuthorProps> = ({
  author,
  member,
  allMembers,
  invalidateMembers,
  invalidateAuthors,
}) => {
  const { mutate: setMemberToThisAuthor, isLoading } = useLinkAuthorToMember(
    author.meta.id,
  );
  const [value, setValue] = useState<string>();
  useEffect(() => {
    setValue(member?.meta.id);
  }, [member?.meta.id]);

  useEffect(() => {
    if (value === '') {
      setMemberToThisAuthor(null, {
        onSuccess: () => {
          invalidateAuthors();
          invalidateMembers();
        },
      }); // empty member
    } else {
      const newMember = allMembers.find((m) => m.meta.id === value);
      if (newMember && member?.meta.id !== newMember.meta.id) {
        setMemberToThisAuthor(newMember, {
          onSuccess: () => {
            invalidateAuthors();
            invalidateMembers();
          },
        });
      }
    }
  }, [value]);

  return (
    <Box my={4}>
      <Grid justify='space-between' xs={12} alignItems='center' container>
        <Grid item xs={6} style={{ paddingLeft: '15%' }}>
          <Typography variant='h4'>{author.author_name}</Typography>
          <Typography variant='body1' style={{ wordWrap: 'break-word' }}>
            {author.author_email}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <FormControl variant='filled' fullWidth>
              <InputLabel>Member</InputLabel>
              <Select
                style={{ minWidth: '18rem' }}
                value={value || ''}
                onChange={(e) => {
                  e.preventDefault();
                  setValue(e.target.value as string);
                }}
              >
                <MenuItem key={'None'} value=''>
                  <em>None</em>
                </MenuItem>
                {allMembers?.sort(compareMember)?.map((m) => (
                  <MenuItem key={m.meta.id} value={m.meta.id}>
                    {m.username} - {m.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Grid>
        <Grid item xs={2} style={{ paddingLeft: '10pt' }}>
          {!author.isSet && author.repository_member_id && (
            <Tooltip title='Auto-match Member'>
              <HelpOutlineIcon color='primary' />
            </Tooltip>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Author;
