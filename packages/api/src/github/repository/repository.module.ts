import { Module } from '@nestjs/common';
import { IssueService } from './issue/issue.service';

@Module({
  providers: [IssueService]
})
export class RepositoryModule {}
