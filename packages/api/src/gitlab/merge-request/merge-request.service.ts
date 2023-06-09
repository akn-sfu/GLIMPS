import {
  Commit,
  Extensions,
  GlobWeight,
  MergeRequest,
  ScoreOverride,
} from '@ceres/types';
import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import alwaysArray from 'src/common/alwaysArray';
import { Repository as TypeORMRepository, SelectQueryBuilder } from 'typeorm';
import { CommitService } from '../repository/commit/commit.service';
import { DiffService } from '../repository/diff/diff.service';
import { Repository } from '../repository/repository.entity';
import { MergeRequestParticipantService } from './merge-request-participant/merge-request-participant.service';
import { MergeRequestQueryDto } from './merge-request-query.dto';
import { MergeRequest as MergeRequestEntity } from './merge-request.entity';
import { NoteService } from '../repository/note/note.service';
import { BaseService } from 'src/common/base.service';
import { groupBy, mapValues } from 'lodash';

@Injectable()
export class MergeRequestService extends BaseService<
  MergeRequest,
  MergeRequestEntity,
  MergeRequestQueryDto
> {
  constructor(
    @InjectRepository(MergeRequestEntity)
    serviceRepository: TypeORMRepository<MergeRequestEntity>,
    private readonly diffService: DiffService,
    private readonly commitService: CommitService,
    private readonly participantService: MergeRequestParticipantService,
    private readonly noteService: NoteService,
    readonly httpService: HttpService,
  ) {
    super(serviceRepository, 'merge_request', httpService);
  }

  buildFilters(
    query: SelectQueryBuilder<MergeRequestEntity>,
    filters: MergeRequestQueryDto,
  ): SelectQueryBuilder<MergeRequestEntity> {
    const { repository } = filters;
    query.andWhere('merge_request.repository_id = :repository', { repository });

    if (filters.author_email) {
      query.andWhere(
        `
          merge_request.id IN  (
            SELECT "mrc"."mergeRequestId"
            FROM merge_request_commits_commit mrc
            INNER JOIN (
              SELECT * FROM commit
              WHERE commit.resource #>> '{author_email}' IN (:...authorEmail)
            ) c ON c.id = "mrc"."commitId"
          )
        `,
        { authorEmail: alwaysArray(filters.author_email) },
      );
    }

    if (filters.commit_start_date) {
      query.andWhere(
        `merge_request.id IN (
          SELECT mr.id
          FROM commit c, merge_request_commits_commit mrc, merge_request mr
          WHERE c.id = mrc."commitId" AND mrc."mergeRequestId" = mr.id
          AND (c.resource #>> '{committed_date}')::timestamptz >= ((:startDate)::timestamptz)
        )`,
        {
          startDate: filters.commit_start_date,
        },
      );
    }

    if (filters.commit_end_date) {
      query.andWhere(
        `merge_request.id IN (
          SELECT mr.id
          FROM commit c, merge_request_commits_commit mrc, merge_request mr
          WHERE c.id = mrc."commitId" AND mrc."mergeRequestId" = mr.id
          AND (c.resource #>> '{committed_date}')::timestamptz <= ((:endDate)::timestamptz)
        )`,
        {
          endDate: filters.commit_end_date,
        },
      );
    }

    if (filters.merged_start_date) {
      query.andWhere(
        "(merge_request.resource #>> '{merged_at}')::timestamptz >= ((:startDate)::timestamptz)",
        {
          startDate: filters.merged_start_date,
        },
      );
    }

    if (filters.merged_end_date) {
      query.andWhere(
        "(merge_request.resource #>> '{merged_at}')::timestamptz <= ((:endDate)::timestamptz)",
        {
          endDate: filters.merged_end_date,
        },
      );
    }
    if (filters.note_id) {
      query.andWhere(
        'merge_request.id in (select merge_request_id from note where id = :note_id)',
        {
          note_id: filters.note_id,
        },
      );
    }
    return query;
  }

  buildSort(
    query: SelectQueryBuilder<MergeRequestEntity>,
  ): SelectQueryBuilder<MergeRequestEntity> {
    return query.orderBy("merge_request.resource #>> '{merged_at}'", 'ASC');
  }

  async buildDailyCounts(
    filters: MergeRequestQueryDto,
  ): Promise<MergeRequest.DailyCount[]> {
    let query = this.serviceRepository.createQueryBuilder('merge_request');
    query = this.buildFilters(query, filters);
    query.select(
      "DATE((merge_request.resource #>>'{merged_at}')::timestamptz AT time zone" +
        " '" +
        filters.timezone +
        "' " +
        "AT time zone 'utc')",
      'date',
    );
    query.addSelect('count(*)::integer', 'count');
    query.addSelect(
      `sum(
        case when merge_request.resource #>> '{extensions,override,exclude}' = 'true'
        then 0::float
        else coalesce(
          merge_request.resource #>> '{extensions,override,score}',
          merge_request.resource #>> '{extensions,diffScore}'
        )::float
        end
      )`,
      'score',
    );
    query.groupBy('date');
    query.orderBy('date', 'ASC');
    return query.getRawMany<MergeRequest.DailyCount>();
  }

  async updateOverride(id: string, override: ScoreOverride) {
    const mergeRequest = await this.serviceRepository.findOne({ id });
    mergeRequest.resource = Extensions.updateExtensions(mergeRequest.resource, {
      override: override,
    });
    return this.serviceRepository.save(mergeRequest);
  }

  async fetchAllParticipantsForRepository(
    repository: Repository,
    token: string,
  ) {
    const mergeRequests = await this.findAllForRepository(repository);
    return await Promise.all(
      mergeRequests.map(async (mergeRequest) => {
        return await this.participantService.syncForMergeRequest(
          mergeRequest,
          token,
        );
      }),
    );
  }

  async findAllParticipantsForRepository(repository: Repository) {
    const mergeRequests = await this.findAllForRepository(repository);
    return await Promise.all(
      mergeRequests.map(async (mergeRequest) => {
        return await this.participantService.findAllForMergeRequest(
          mergeRequest,
        );
      }),
    );
  }

  async findAllForRepository(repository: Repository) {
    return this.serviceRepository.find({ where: { repository } });
  }

  async findOne(id: string) {
    return this.serviceRepository.findOne({
      where: { id },
    });
  }

  async fetchForRepository(repository: Repository, token: string) {
    let mergeRequests: MergeRequest[] = [];
    let page = 1;
    do {
      mergeRequests = await this.fetchByPage(token, repository, page);
      await this.syncForRepositoryPage(token, repository, mergeRequests);
      page++;
    } while (mergeRequests.length > 0);
  }

  async linkCommitsForRepository(token: string, repository: Repository) {
    let page = 0;
    let mergeRequests = [];
    do {
      mergeRequests = await this.serviceRepository.find({
        where: { repository },
        take: 10,
        skip: page,
        order: { id: 'ASC' },
      });
      await Promise.all(
        mergeRequests.map((mergeRequest) =>
          this.linkCommitsForMergeRequest(token, repository, mergeRequest),
        ),
      );
      page++;
    } while (mergeRequests.length > 0);
  }

  private async linkCommitsForMergeRequest(
    token: string,
    repository: Repository,
    mergeRequest: MergeRequestEntity,
  ) {
    const commits = await this.fetchCommitsFromGitlab(
      token,
      repository,
      mergeRequest.resource,
    );
    if (mergeRequest.resource.squash) {
      // if commits of a MR have been squashed they won't show up when we fetch the repo commits so fetch here instead
      await this.commitService.syncForRepositoryPage(
        token,
        repository,
        commits,
        true,
      );

      // when you squash a MR, git replaces them all with a single squash commit
      // we actually want to display the squashed commits instead of the single one so we delete the single one
      const squashCommit = await this.commitService.findByGitlabId(
        repository,
        mergeRequest.resource.squash_commit_sha,
      );
      if (squashCommit) {
        await this.commitService.deleteCommitEntity(squashCommit);
      }
    }
    mergeRequest.commits = await Promise.all(
      commits.map((commit) =>
        this.commitService.findByGitlabId(repository, commit.id),
      ),
    );
    await this.serviceRepository.save(mergeRequest);
  }

  async syncForRepositoryPage(
    token: string,
    repository: Repository,
    mergeRequests: MergeRequest[],
  ): Promise<void> {
    const { created } = await this.createIfNotExists(repository, mergeRequests);
    await Promise.all(
      created
        .map((mergeRequest) => ({ ...mergeRequest, repository }))
        .map((mergeRequest) =>
          this.diffService.syncForMergeRequest(mergeRequest, token),
        ),
    );
    await Promise.all(
      created.map((mergeRequest) =>
        this.noteService.syncForMergeRequest(mergeRequest, token),
      ),
    );
  }

  private async createIfNotExists(
    repository: Repository,
    mergeRequests: MergeRequest[],
  ) {
    const entities = await Promise.all(
      mergeRequests.map(async (mergeRequest) => {
        const found = await this.serviceRepository
          .createQueryBuilder()
          .where('resource @> :resource', {
            resource: {
              id: mergeRequest.id,
            },
          })
          .andWhere('repository_id = :repositoryId', {
            repositoryId: repository.id,
          })
          .getOne();
        if (found) {
          return { mergeRequest: found, created: false };
        }
        return {
          mergeRequest: this.serviceRepository.create({
            repository: repository,
            resource: mergeRequest,
          }),
          created: true,
        };
      }),
    );
    return {
      existing: entities
        .filter(({ created }) => !created)
        .map(({ mergeRequest }) => mergeRequest),
      created: await this.serviceRepository.save(
        entities
          .filter(({ created }) => created)
          .map(({ mergeRequest }) => mergeRequest),
      ),
    };
  }

  async fetchByPage(
    token: string,
    repo: Repository,
    page: number,
  ): Promise<MergeRequest[]> {
    const axiosResponse = await this.fetchFromGitlab(token, repo, page);
    return axiosResponse.data;
  }

  async fetchCommitsFromGitlab(
    token: string,
    repository: Repository,
    mergeRequest: MergeRequest,
  ): Promise<Commit[]> {
    const url = `projects/${repository.resource.id}/merge_requests/${mergeRequest.iid}/commits`;
    const axiosResponse = await this.fetchWithRetries<Commit>(
      token,
      url,
      undefined,
    );
    let commitData = axiosResponse.data;
    if (axiosResponse.headers?.['x-total-pages']) {
      const pages = parseInt(axiosResponse.headers['x-total-pages']);
      // first request gets us the first page and lets us know if there are more to fetch
      // if there are, enter the for loop and fetch the remaining pages
      if (pages > 1) {
        const remainingPagePromises = [];
        for (let curPage = 2; curPage <= pages; curPage++) {
          const params = {
            page: curPage,
          };
          const pageUrl = `projects/${repository.resource.id}/merge_requests/${mergeRequest.iid}/commits`;
          const pagePromise = this.fetchWithRetries<Commit>(
            token,
            pageUrl,
            params,
          );
          remainingPagePromises.push(pagePromise);
        }
        const remainingPages = await Promise.all(remainingPagePromises);
        remainingPages.forEach((page) => {
          commitData = commitData.concat(page.data);
        });
      }
    }
    return commitData;
  }

  private async fetchFromGitlab(
    token: string,
    repo: Repository,
    page: number,
    pageSize = 10,
  ): Promise<AxiosResponse<MergeRequest[]>> {
    const url = `projects/${repo.resource.id}/merge_requests`;
    const params = {
      page: page,
      per_page: pageSize,
      state: 'merged',
      target_branch: repo.resource.default_branch,
    };
    return this.fetchWithRetries(token, url, params);
  }

  public async getSumScoreForMergeRequest(
    mergeRequest: MergeRequestEntity,
    weights?: GlobWeight[],
  ) {
    const [commits] = await this.commitService.search(
      {
        merge_request: mergeRequest.id,
      },
      false,
    );
    const commitScores = await Promise.all(
      commits.map(async (commit) => {
        const score = await this.diffService.calculateDiffScore(
          {
            commit: commit.id,
          },
          weights,
          false,
        );
        const override = commit.resource?.extensions?.override;
        score.score = ScoreOverride.computeScore(override, score.score);
        score.hasOverride =
          ScoreOverride.hasOverride(override) || score.hasOverride;
        return {
          authorEmail: commit.resource.author_email,
          ...score,
        };
      }),
    );
    // Group commits by author email, and then sum each group individually
    const groupedScores = groupBy(
      commitScores,
      (commitScore) => commitScore.authorEmail,
    );
    return mapValues(groupedScores, (authorScore) => {
      const sum = authorScore
        .map(({ score }) => score)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      const hasOverride = authorScore.some(({ hasOverride }) => hasOverride);
      return {
        sum,
        hasOverride,
      };
    });
  }

  async storeScore(mergeRequest: MergeRequestEntity, weights?: GlobWeight[]) {
    const { score: diffScore, hasOverride: diffHasOverride } =
      await this.diffService.calculateDiffScore(
        {
          merge_request: mergeRequest.id,
        },
        weights,
        false,
      );
    const commitScoreSums = await this.getSumScoreForMergeRequest(
      mergeRequest,
      weights,
    );
    mergeRequest.resource = Extensions.updateExtensions(mergeRequest.resource, {
      diffScore,
      diffHasOverride,
      commitScoreSums,
    });
    mergeRequest.diffScore = diffScore;
    await this.serviceRepository.save(mergeRequest);
  }

  async updateMergeRequestScoreByRepository(
    repositoryId: string,
    weights?: GlobWeight[],
  ) {
    const [mergeRequests] = await this.search({
      repository: repositoryId,
      pageSize: 500000,
    });
    await Promise.all(
      mergeRequests.map(async (mergeRequest) => {
        await this.storeScore(mergeRequest, weights);
      }),
    );
  }

  async deleteMergeRequestEntity(merge_request: MergeRequestEntity) {
    return this.delete(merge_request);
  }
}
