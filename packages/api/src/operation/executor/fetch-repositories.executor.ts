import { Repository as TypeORMRepository } from 'typeorm/repository/Repository';
import { RepositoryService } from '../../gitlab/repository/repository.service';
import { GitlabTokenService } from '../../gitlab/services/gitlab-token.service';
import { Operation as OperationEntity } from '../operation.entity';
import { BaseExecutor } from './base.executor';

enum Stage {
  fetch = 'fetch',
}

export class FetchRepositoriesExecutor extends BaseExecutor<Stage> {
  constructor(
    operation: OperationEntity,
    operationRepository: TypeORMRepository<OperationEntity>,
    private readonly tokenService: GitlabTokenService,
    private readonly repositoryService: RepositoryService,
  ) {
    super(operation, operationRepository);
    this.addStage(Stage.fetch, 'Fetch Repositories');
  }

  private token: string;

  async run() {
    await this.init();
    if(!this.token){
      console.error("Gitlab token is missed");
      return;
    }
    await this.startStage(Stage.fetch);

    try {
      await this.repositoryService.fetchFromGitlabForUser(
        this.operation.user,
        this.token,
      );
    } catch (e) {
      //Error is: 'could not fetch resources from GitLab', usually happens with an incorrect API key
      console.error('Error fetching Resources', e);
      await this.terminateStage(Stage.fetch);
      return;
    }
    await this.completeStage(Stage.fetch);
  }

  async init() {
    try {
      const { token } = await this.tokenService.findOneByUserId(
        this.operation.user.id,
      );
      this.token = token;
    } catch (e){
      console.error('Error finding token', e);
    }
  }
}
