import { Operation } from '@ceres/types';
import { RepositoryMemberService } from 'src/gitlab/repository/repository-member/repository-member.service';
import { GitlabTokenService } from 'src/gitlab/services/gitlab-token.service';
import { Repository as TypeORMRepository } from 'typeorm';
import { Repository } from '../../gitlab/repository/repository.entity';
import { RepositoryService } from '../../gitlab/repository/repository.service';
import { Operation as OperationEntity } from '../operation.entity';
import { BaseExecutor } from './base.executor';

enum Stage {
  deleteRepo = 'delete repository',
}

export class DeleteRepositoryExecutor extends BaseExecutor<Stage> {
  constructor(
    operation: OperationEntity,
    operationRepository: TypeORMRepository<OperationEntity>,
    private readonly repositoryService: RepositoryService,
    private readonly tokenService: GitlabTokenService,
    private readonly repositoryMemberService: RepositoryMemberService,
  ) {
    super(operation, operationRepository);
    this.addStage(Stage.deleteRepo, 'Deleting Repository');
  }

  private repository: Repository;
  private token: string;

  async run() {
    await this.startStage(Stage.deleteRepo);
    try {
      await this.init();
      await this.deleteRepository(this.repositoryService);
    } catch (err) {
      console.error('Error running delete repository executor', err);
      await this.terminateStage(Stage.deleteRepo);
      return;
    }
    await this.completeStage(Stage.deleteRepo);
  }

  private async init() {
    const payload = this.operation.resource
      .input as Operation.SyncRepositoryPayload;

    const repository = await this.repositoryService.findOne(
      payload.repository_id,
    );
    this.repository = repository;

    const { token } = await this.tokenService.findOneByUserId(
      this.operation.user.id,
    );
    this.token = token;
  }

  private async deleteRepository(service: RepositoryService): Promise<void> {
    try {
      await service.deleteRepositoryEntity(this.repository);
      // somewhat hacky approach to prevent the repository from being deleted from the repository list
      this.repository.resource.extensions.lastSync = undefined;
      const repo = await service.addRepositoryEntity(
        this.repository,
        this.operation.user,
      );
      if (repo?.[0]) {
        await this.repositoryMemberService.syncForRepository(
          repo[0],
          this.token,
        );
      } else {
        throw 'Unable to re-add repository after deleting';
      }
    } catch (e) {
      console.error('Error Deleting Repository', e);
    }
  }
}
