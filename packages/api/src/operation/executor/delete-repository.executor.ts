import { Operation } from '@ceres/types';
import { Repository as TypeORMRepository } from 'typeorm';
import { MergeRequestService } from '../../gitlab/merge-request/merge-request.service';
import { CommitAuthorService } from '../../gitlab/repository/commit/author/commit-author.service';
import { CommitService } from '../../gitlab/repository/commit/commit.service';
import { RepositoryMember } from '../../gitlab/repository/repository-member/repository-member.entity';
import { RepositoryMemberService } from '../../gitlab/repository/repository-member/repository-member.service';
import { Repository } from '../../gitlab/repository/repository.entity';
import { RepositoryService } from '../../gitlab/repository/repository.service';
import { GitlabTokenService } from '../../gitlab/services/gitlab-token.service';
import { Operation as OperationEntity } from '../operation.entity';
import { BaseExecutor } from './base.executor';
import { IssueService } from '../../gitlab/repository/issue/issue.service';

enum Stage {
  sync = 'sync',
  syncCommits = 'syncCommits',
  syncMergeRequests = 'syncMergeRequests',
  syncIssues = 'syncIssues',
  linkCommitsAndMergeRequests = 'linkCommitsAndMergeRequests',
  linkNotesAndMergeRequests = 'linkNotesAndMergeRequests',
  linkAuthors = 'linkAuthors',
}

export class DeleteRepositoryExecutor extends BaseExecutor<Stage> {
  constructor(
    operation: OperationEntity,
    operationRepository: TypeORMRepository<OperationEntity>,
    private readonly tokenService: GitlabTokenService,
    private readonly repositoryService: RepositoryService,
  ) {
    super(operation, operationRepository);
    this.addStage(Stage.sync, 'Starting sync');
    this.addStage(Stage.syncCommits, 'Sync Commits');
    this.addStage(Stage.syncMergeRequests, 'Sync Merge Requests');
    this.addStage(Stage.syncIssues, 'Sync Issues');
    this.addStage(
      Stage.linkCommitsAndMergeRequests,
      'Link Commits and Merge Requests',
    );
    this.addStage(Stage.linkAuthors, 'Link Authors');
  }

  private repository: Repository;
  private token: string;
  private members: RepositoryMember[] = [];

  async run() {
    await this.startStage(Stage.sync);
    console.log("WE GOT INNNNN");
    
    try{
      await this.init();
    } catch(err){}
    return;
    /*
    try{
      await this.init();
    await Promise.all([
      this.syncResource(Stage.syncCommits, this.commitService),
      this.syncResource(Stage.syncMergeRequests, this.mergeRequestService),
      this.syncResource(Stage.syncIssues, this.issueService),
    ]);
    await Promise.all([this.linkCommitsAndMergeRequests(), this.linkAuthors()]);
    }catch(err){
      console.error(err);
      await this.terminateStage(Stage.sync);
      await this.terminateStage(Stage.syncCommits);
      await this.terminateStage(Stage.syncMergeRequests);
      await this.terminateStage(Stage.syncIssues);
      await this.terminateStage(Stage.linkCommitsAndMergeRequests);
      await this.terminateStage(Stage.linkAuthors);
      return;
    }
    await this.completeStage(Stage.sync);*/
  }

  private async init() {
    const payload = this.operation.resource
      .input as Operation.SyncRepositoryPayload;

    const repository = await this.repositoryService.findOne(
      payload.repository_id,
    );
    const { token } = await this.tokenService.findOneByUserId(
      this.operation.user.id,
    );
    
    this.repository = repository;
    this.token = token;
    console.log("TSTINGREPO")
    console.log(repository)
  }
/*
    this.members = await this.repositoryMemberService.findAllForRepository(
      repository,
    );
    const actualDefaultBranch = await this.repositoryService.getDefaultBranch(
      repository.resource.id,
      token
    );

    if (repository.resource.default_branch != actualDefaultBranch){
      //update resource.default_branch in database  
      try{
        await this.repositoryService.updateDefaultBranch(
          actualDefaultBranch,
          this.repository,
        )
      } catch(err){
        console.error(err);
      }
        //delete all branch related entries
        try{
          await Promise.all([
            this.deleteMergeRequestsResources(this.mergeRequestService),
            this.deleteCommitResources(this.commitService),
            this.deleteIssueResources(this.issueService),
          ])
        }catch(err){
          console.error(err);
        };
    }
    await this.updateLastSync();
  }

  private async updateLastSync() {
    this.repository = await this.repositoryService.updateLastSync(
      this.repository,
    );
  }

  private async syncResource(
    name: Stage,
    service: CommitService | MergeRequestService | IssueService,
  ): Promise<void> {
    await this.startStage(name);
    let resources = [];
    let page = 1;
    do {
      try {
        resources = await service.fetchByPage(
          this.token,
          this.repository,
          page,
        );
        await service.syncForRepositoryPage(
          this.token,
          this.repository,
          resources,
        );
      } catch {}
      page++;
    } while (resources.length > 0);
    await this.completeStage(name);
  }

  private async linkCommitsAndMergeRequests() {
    await this.startStage(Stage.linkCommitsAndMergeRequests);
    try {
      await this.mergeRequestService.linkCommitsForRepository(
        this.token,
        this.repository,
      );
    } catch {}

    await this.completeStage(Stage.linkCommitsAndMergeRequests);
  }

  private async linkAuthors() {
    await this.startStage(Stage.linkAuthors);
    const uniqueAuthors = await this.commitService.getDistinctAuthors(
      this.repository,
    );
    const storedAuthors = await this.commitAuthorService.findAllForRepository(
      this.repository,
    );
    await Promise.all(
      uniqueAuthors.map(async (author) => {
        const authorEntity = storedAuthors.find(
          (a) =>
            a.resource.author_name === author.author_name &&
            a.resource.author_email === author.author_email,
        );
        if (!authorEntity) {
          const repositoryMember = this.members.find((member) => {
            return member.resource.name === author.author_name;
          });
          if (repositoryMember) {
            author.repository_member_id = repositoryMember.id;
          }
          await this.commitAuthorService.create(
            author,
            this.repository,
            repositoryMember,
          );
        }
      }),
    );
    await this.completeStage(Stage.linkAuthors);
  }

  private async deleteCommitResources(
    service: CommitService
  ): Promise<void>{
    const valuesWithCount = await service.findByRepositoryId(this.repository.id,'commit');
    const commits = valuesWithCount[0]
    let i = 0;
    while ( i < valuesWithCount[1]) {
      try {
        await service.deleteCommitEntity(commits[i]);
      } catch{}
      i++;
    } 
  }

  private async deleteMergeRequestsResources(
    service: MergeRequestService
  ): Promise<void>{
    const valuesWithCount = await service.findByRepositoryId(this.repository.id, 'merge_request');
    const merge_requests = valuesWithCount[0]
    let i = 0;
    while ( i < valuesWithCount[1]) {
      try {
        await service.deleteMergeRequestEntity(merge_requests[i]);
      } catch{}
      i++;
    } 
  }

  private async deleteIssueResources(
    service: IssueService
  ): Promise<void>{
    const valuesWithCount = await service.findByRepositoryId(this.repository.id, 'issue');
    const issues = valuesWithCount[0]
    let i = 0;
    while ( i < valuesWithCount[1]) {
      try {
        await service.deleteIssueEntity(issues[i]);
      } catch{}
      i++;
    } 
  }*/
}
