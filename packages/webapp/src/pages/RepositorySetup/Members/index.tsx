import { Commit, RepositoryMember } from '@ceres/types';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import React from 'react';
import { useRepositoryAuthors } from '../../../api/author';
import { ApiResource } from '../../../api/base';
import { useRepositoryMembers } from '../../../api/repo_members';
import Author from './Author';

interface MembersProps {
  id: string;
  invalidateCalculation: () => void;
}

function findSelectedMember(
  author: ApiResource<Commit.Author>,
  members: ApiResource<RepositoryMember>[],
) {
  return members.find(
    (member) => member.meta.id === author.repository_member_id,
  );
}

// sort author by strings
function compareCommitAuthors(a: Commit.Author, b: Commit.Author) {
  if (a.author_name.localeCompare(b.author_name) === 0)
    return a.author_email.localeCompare(b.author_email);
  return a.author_name.localeCompare(b.author_name);
}

const Members: React.FC<MembersProps> = ({ id, invalidateCalculation }) => {
  const { data: members, invalidate: invalidateMembers } =
    useRepositoryMembers(id);
  const { data: authors, invalidate: invalidateAuthors } =
    useRepositoryAuthors(id);

  return (
    <Container maxWidth='md'>
      <Box>
        {members &&
          authors?.sort(compareCommitAuthors).map((author) => {
            const member = findSelectedMember(author, members);
            return (
              <Author
                key={author.meta.id}
                author={author}
                member={member}
                allMembers={members}
                invalidateMembers={invalidateMembers}
                invalidateAuthors={invalidateAuthors}
                invalidateCalculation={invalidateCalculation}
                id={id}
              />
            );
          })}
      </Box>
    </Container>
  );
};

export default Members;
