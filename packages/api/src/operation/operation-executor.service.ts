import { Operation } from '@ceres/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MergeRequestService } from '../gitlab/merge-request/merge-request.service';
import { CommitAuthorService } from '../gitlab/repository/commit/author/commit-author.service';
import { CommitService } from '../gitlab/repository/commit/commit.service';
import { RepositoryMemberService } from '../gitlab/repository/repository-member/repository-member.service';
import { RepositoryService } from '../gitlab/repository/repository.service';
import { GitlabTokenService } from '../gitlab/services/gitlab-token.service';
import { FetchRepositoriesExecutor } from './executor/fetch-repositories.executor';
import { SyncRepositoryExecutor } from './executor/sync-repository.executor';
import { DeleteRepositoryExecutor } from './executor/delete-repository.executor';
import { Operation as OperationEntity } from './operation.entity';
import { Injectable } from '@nestjs/common';
import { IssueService } from '../gitlab/repository/issue/issue.service';

@Injectable()
export class OperationExecutorService {
  constructor(
    @InjectRepository(OperationEntity)
    private readonly operationRepository: Repository<OperationEntity>,
    private readonly tokenService: GitlabTokenService,
    private readonly commitService: CommitService,
    private readonly mergeRequestService: MergeRequestService,
    private readonly issueService: IssueService,
    private readonly repositoryService: RepositoryService,
    private readonly commitAuthorService: CommitAuthorService,
    private readonly repositoryMemberService: RepositoryMemberService,
  ) {}

  async execute(operation: OperationEntity) {
    console.log(`Starting execution for operation: ${operation.id}`);
    operation.resource = OperationExecutorService.startOperation(
      operation.resource,
    );
    await this.operationRepository.save(operation);
    switch (operation.resource.type) {
      case Operation.Type.SYNC_REPOSITORY:
        await this.executeSyncRepositoryOperation(operation);
        break;
      case Operation.Type.FETCH_REPOSITORIES:
        await this.executeFetchRepositoriesOperation(operation);
        break;
      case Operation.Type.DELETE_REPOSITORY:
        await this.executeDeleteRepositoryOperation(operation);
        break;
    }
    operation.resource = OperationExecutorService.completeOperation(
      operation.resource,
    );
    return this.operationRepository.save(operation);
  }

  private static startOperation(operation: Operation) {
    operation.start_time = new Date().toISOString();
    operation.status = Operation.Status.PROCESSING;
    return operation;
  }

  private static completeOperation(operation: Operation) {
    operation.end_time = new Date().toISOString();
    operation.status = Operation.Status.COMPLETED;
    return operation;
  }

  private executeSyncRepositoryOperation(operation: OperationEntity) {
    const executor = new SyncRepositoryExecutor(
      operation,
      this.operationRepository,
      this.tokenService,
      this.commitService,
      this.mergeRequestService,
      this.issueService,
      this.repositoryService,
      this.commitAuthorService,
      this.repositoryMemberService,
    );
    return executor.run();
  }

  private executeFetchRepositoriesOperation(operation: OperationEntity) {
    const executor = new FetchRepositoriesExecutor(
      operation,
      this.operationRepository,
      this.tokenService,
      this.repositoryService,
    );
    return executor.run();
  }

  private executeDeleteRepositoryOperation(operation: OperationEntity) {
    const executor = new DeleteRepositoryExecutor(
      operation,
      this.operationRepository,
      this.repositoryService,
      this.tokenService,
      this.repositoryMemberService,
    );
    return executor.run();
  }
}
