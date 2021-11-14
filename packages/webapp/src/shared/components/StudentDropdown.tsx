import { Commit } from '@ceres/types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { uniq } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useRepositoryAuthors } from '../../api/author';
import { ApiResource } from '../../api/base';
import { useRepositoryMembers } from '../../api/repo_members';
import { useFilterContext } from '../../contexts/FilterContext';

function findEmailsForMember(
  memberId: string,
  authors: ApiResource<Commit.Author>[],
) {
  const filtered = (authors || []).filter(
    (author) => author.repository_member_id === memberId,
  );
  return filtered.map((author) => author.author_email);
}

interface StudentDropdownProps {
  repositoryId: string;
  onChange?: (emails: string[]) => void;
}

const StudentDropdown: React.FC<StudentDropdownProps> = ({
  repositoryId,
  onChange,
}) => {
  const { author, setAuthor } = useFilterContext();
  const [value, setValue] = useState(author);
  const { data: members } = useRepositoryMembers(repositoryId);
  const { data: authors } = useRepositoryAuthors(repositoryId);

  useEffect(() => {
    if (value !== 'all') {
      const emails = findEmailsForMember(value, authors);
      setAuthor(value);
      onChange(emails.length > 0 ? uniq(emails) : ['doesnotexist@email.com']);
    } else {
      setAuthor(value);
      onChange([]);
    }
  }, [value]);

  return (
    <FormControl variant='filled'>
      <InputLabel> Show results for: </InputLabel>
      <Select
        style={{ minWidth: '15rem' }}
        value={value || 'None'}
        onChange={(e) => {
          e.preventDefault();
          setValue(e.target.value as string);
        }}
        label='show results for'
        inputProps={{
          name: 'Show results for:',
          id: 'outlined-age-native-simple',
        }}
      >
        <MenuItem value='all'>All students</MenuItem>
        {(members || [])?.map((m) => (
          <MenuItem key={m.meta.id} value={m.meta.id}>
            {m.username}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default StudentDropdown;
