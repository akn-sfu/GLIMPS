import { Extensions, Note } from '@ceres/types';
import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { Note as NoteEntity } from './note.entity';
import { MergeRequest as MergeRequestEntity } from '../../merge-request/merge-request.entity';
import { Issue as IssueEntity } from '../issue/issue.entity';
import alwaysArray from '../../../common/alwaysArray';
import { NoteQueryDto } from './note-query.dto';
import { BaseService } from '../../../common/base.service';
import { Repository as TypeORMRepository } from 'typeorm/repository/Repository';

@Injectable()
export class NoteService extends BaseService<Note, NoteEntity, NoteQueryDto> {
  constructor(
    readonly httpService: HttpService,
    @InjectRepository(NoteEntity)
    serviceRepository: TypeORMRepository<NoteEntity>,
  ) {
    super(serviceRepository, 'note', httpService);
  }

  buildFilters(
    query: SelectQueryBuilder<NoteEntity>,
    filters: NoteQueryDto,
  ): SelectQueryBuilder<NoteEntity> {
    query.andWhere("note.resource #>> '{system}' <> 'true'");

    if (filters.merge_request) {
      query.andWhere('note.merge_request_id = :merge_request', {
        merge_request: filters.merge_request,
      });
    }

    if (filters.issue) {
      query.andWhere('note.issue_id = :issue', {
        issue: filters.issue,
      });
    }

    if (filters.author_id) {
      query.andWhere("note.resource #> '{author}'->>'id' IN (:...authorIds)", {
        authorIds: alwaysArray(filters.author_id),
      });
    }

    if (filters.created_start_date) {
      query.andWhere(
        "(note.resource #>> '{created_at}')::timestamptz >= ((:startDate))::timestamptz",
        {
          startDate: filters.created_start_date,
        },
      );
    }

    if (filters.created_end_date) {
      query.andWhere(
        "(note.resource #>> '{created_at}')::timestamptz <= ((:endDate))::timestamptz",
        {
          endDate: filters.created_end_date,
        },
      );
    }

    if (filters.repository_id) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where(
            'note.merge_request_id in (select id from merge_request where repository_id = :repository_id)',
            {
              repository_id: filters.repository_id,
            },
          ).orWhere(
            'note.issue_id in (select id from issue where repository_id = :repository_id)',
            {
              repository_id: filters.repository_id,
            },
          );
        }),
      );
    }

    if (filters.type) {
      if (filters.type === Note.Type.issueComment) {
        query.andWhere('note.issue_id IS NOT NULL');
      } else if (filters.type === Note.Type.mergeRequestComment) {
        query.andWhere('note.merge_request_id IS NOT NULL');
      }
    }

    return query;
  }

  buildSort(
    query: SelectQueryBuilder<NoteEntity>,
  ): SelectQueryBuilder<NoteEntity> {
    return query.orderBy("note.resource #>> '{created_at}'", 'DESC');
  }

  async getTotalCounts(filters: NoteQueryDto): Promise<number> {
    let query = this.serviceRepository.createQueryBuilder('note');
    query = this.buildFilters(query, filters);
    return query.getCount();
  }

  async buildDailyCounts(filters: NoteQueryDto): Promise<Note.DailyCount[]> {
    let query = this.serviceRepository.createQueryBuilder('note');
    query = this.buildFilters(query, filters);
    query.select(
      "DATE((note.resource #>>'{created_at}')::timestamptz AT time zone" +
        " '" +
        filters.timezone +
        "' " +
        "AT time zone 'utc')",
      'date',
    );
    query.addSelect('count(*)::integer', 'count');
    query.addSelect(
      "sum((note.resource #>> '{extensions,wordCount}')::float)",
      'wordCount',
    );
    query.groupBy('date');
    query.orderBy('date', 'ASC');
    return query.getRawMany<Note.DailyCount>();
  }

  async findAllForMergeRequest(mergeRequest: MergeRequestEntity) {
    return this.serviceRepository.find({
      where: { mergeRequest: mergeRequest },
    });
  }

  async findAllForIssue(issue: IssueEntity) {
    return this.serviceRepository.find({
      where: { issue: issue },
    });
  }

  async syncForMergeRequest(mergeRequest: MergeRequestEntity, token: string) {
    const note = await this.fetchForMergeRequest(mergeRequest, token);
    return this.saveMergeRequestNote(mergeRequest, note);
  }

  async syncForIssue(issue: IssueEntity, token: string) {
    const note = await this.fetchForIssue(issue, token);
    return this.saveIssueNote(issue, note);
  }

  async fetchForMergeRequest(mergeRequest: MergeRequestEntity, token: string) {
    const url = `/projects/${mergeRequest.resource.project_id}/merge_requests/${mergeRequest.resource.iid}/notes`;
    const params = { per_page: 50 };
    const axiosResponse = await this.fetchWithRetries<Note>(
      token,
      url,
      params,
      5,
    );
    return axiosResponse.data;
  }

  async fetchForIssue(issue: IssueEntity, token: string) {
    const url = `/projects/${issue.resource.project_id}/issues/${issue.resource.iid}/notes`;
    const params = { per_page: 50 };
    const axiosResponse = await this.fetchWithRetries<Note>(
      token,
      url,
      params,
      5,
    );
    return axiosResponse.data;
  }

  async saveMergeRequestNote(mergeRequest: MergeRequestEntity, notes: Note[]) {
    const entities = await Promise.all(
      notes.map(async (note) => {
        return this.createOrUpdateMergeRequestNote(mergeRequest, note);
      }),
    );
    await this.serviceRepository.save(entities);
    await this.updateWordCount({ merge_request: mergeRequest.id });
  }

  async saveIssueNote(issue: IssueEntity, notes: Note[]) {
    const entities = await Promise.all(
      notes.map(async (note) => {
        return this.createOrUpdateIssueNote(issue, note);
      }),
    );
    await this.serviceRepository.save(entities);
    await this.updateWordCount({ issue: issue.id });
  }

  private async createOrUpdateMergeRequestNote(
    mergeRequest: MergeRequestEntity,
    note: Note,
  ) {
    let entity = await this.queryNoteForMergeRequest(mergeRequest, note);
    if (!entity) {
      entity = this.createNoteForMergeRequest(mergeRequest, note);
    } else {
      entity.resource = note;
    }
    return entity;
  }

  private async createOrUpdateIssueNote(issue: IssueEntity, note: Note) {
    let entity = await this.queryNoteForIssue(issue, note);
    if (!entity) {
      entity = this.createNoteForIssue(issue, note);
    } else {
      entity.resource = note;
    }
    return entity;
  }

  private queryNoteForMergeRequest(
    mergeRequest: MergeRequestEntity,
    note: Note,
  ) {
    return this.serviceRepository
      .createQueryBuilder()
      .where('resource @> :resource', {
        resource: {
          id: note.id,
        },
      })
      .andWhere('merge_request_id = :mr_Id', {
        mr_Id: mergeRequest.id,
      })
      .getOne();
  }

  private queryNoteForIssue(issue: IssueEntity, note: Note) {
    return this.serviceRepository
      .createQueryBuilder()
      .where('resource @> :resource', {
        resource: {
          id: note.id,
        },
      })
      .andWhere('issue_id = :is_Id', {
        is_Id: issue.id,
      })
      .getOne();
  }

  private createNoteForMergeRequest(
    mergeRequest: MergeRequestEntity,
    note: Note,
  ) {
    return this.serviceRepository.create({
      mergeRequest: mergeRequest,
      resource: note,
    });
  }

  private createNoteForIssue(issue: IssueEntity, note: Note) {
    return this.serviceRepository.create({
      issue: issue,
      resource: note,
    });
  }

  async updateWordCount(filters: NoteQueryDto) {
    const [notes] = await this.search(filters);
    const updatedNotes = notes.map((note) => {
      const wordCount = this.countWords(note.resource.body);
      note.resource = Extensions.updateExtensions(note.resource, {
        wordCount: wordCount,
      });
      return note;
    });
    return this.serviceRepository.save(updatedNotes);
  }

  private countWords(noteBody: string) {
    const contentByRepoMember = this.excludeContentGeneratedBySystem(noteBody);
    const words = contentByRepoMember.trim().split(/\s+/);
    return words.length;
  }

  private excludeContentGeneratedBySystem(noteBody: string) {
    return noteBody.replace(/\*([^*]+)\*$/g, '');
  }
}
