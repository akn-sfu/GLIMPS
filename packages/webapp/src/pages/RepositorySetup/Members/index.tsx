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
}

function findSelectedMember(
  author: ApiResource<Commit.Author>,
  members: ApiResource<RepositoryMember>[],
) {
  return members.find(
    (member) => member.meta.id === author.repository_member_id,
  );
}

// Sort level 1: Authors without an associated repository member come first
// Sort level 2: Sort by author name
function compareCommitAuthors(a: Commit.Author, b: Commit.Author) {
  // disable sort level
  // if (a.repository_member_id && !b.repository_member_id) {
  //   return 1;
  // } else if (!a.repository_member_id && b.repository_member_id) {
  //   return -1;
  // }

  if (a.author_name.localeCompare(b.author_name) === 0)
    return a.author_email.localeCompare(b.author_email);
  return a.author_name.localeCompare(b.author_name);
}

const Members: React.FC<MembersProps> = ({ id }) => {
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
              />
            );
          })}
      </Box>
    </Container>
  );
};

export default Members;
