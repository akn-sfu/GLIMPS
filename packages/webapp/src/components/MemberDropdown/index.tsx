import { Commit } from '@ceres/types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
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

interface MemberDropdownProps {
  repositoryId: string;
  onChange?: (emails: string[]) => void;
}

const MemberDropdown: React.FC<MemberDropdownProps> = ({
  repositoryId,
  onChange,
}) => {
  const { author, setAuthor } = useFilterContext();
  const [value, setValue] = useState(author);

  const { data: members } = useRepositoryMembers(repositoryId);
  const { data: authors } = useRepositoryAuthors(repositoryId);

  const handleChangeAuthor = (author) => {
    setAuthor(author);
  };

  // const handleEmailChange = (emails) => {
  //   setEmail(emails);
  // };

  useEffect(() => {
    if (value !== 'all') {
      const newEmails = findEmailsForMember(value, authors);
      handleChangeAuthor(value);
      onChange(newEmails.length > 0 ? newEmails : ['']);
    } else {
      handleChangeAuthor(value);
      onChange([]);
    }
  }, [value]);

  return (
    <FormControl variant='filled' fullWidth>
      <InputLabel>Show results for:</InputLabel>
      <Select
        value={value || 'None'}
        fullWidth
        onChange={(e) => {
          e.preventDefault();
          setValue(e.target.value as string);
        }}
      >
        <MenuItem value='all'>All students</MenuItem>
        {(members || [])?.map((m) => (
          <MenuItem key={m.meta.id} value={m.meta.id}>
            {m.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MemberDropdown;
