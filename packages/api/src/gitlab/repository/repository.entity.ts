import { Repository as RepositoryResource } from '@ceres/types';
import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base-entity';
import { User } from '../../user/entities/user.entity';
import { MergeRequest } from '../merge-request/merge-request.entity';
import { RepositoryMember } from './repository-member/repository-member.entity';
import { Commit } from './commit/commit.entity';

@Entity('repository')
export class Repository extends BaseEntity<RepositoryResource> {
  @ManyToOne(() => User, (user) => user.repositories)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(
    () => RepositoryMember,
    (repositoryMember) => repositoryMember.repository,
  )
  members: RepositoryMember[];

  @OneToMany(() => Commit, (commit) => commit.repository)
  commits: Commit[];

  @OneToMany(() => MergeRequest, (mergeRequest) => mergeRequest.repository)
  mergeRequests: MergeRequest[];
}
