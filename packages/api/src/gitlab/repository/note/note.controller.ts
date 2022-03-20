import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { IdParam } from '../../../common/id-param';
import { MergeRequestService } from '../../merge-request/merge-request.service';
import { paginatedToResponse } from '../../../common/pagination';
import { NoteQueryDto } from './note-query.dto';
import { query } from 'express';

@Controller('note')
export class NoteController {
  constructor(
    private readonly noteService: NoteService,
    private readonly mergeRequestService: MergeRequestService,
  ) {}

  @Get()
  search(@Query() query: NoteQueryDto) {
    const { issue, merge_request, repository_id } = query;
    if (!issue && !merge_request && !repository_id) {
      throw new BadRequestException(
        'merge request or issue or repository id must be provided',
      );
    }
    return paginatedToResponse(
      this.noteService.search({ ...query, sort: '+updated_at' }),
    );
  }

  @Get('total')
  totalNotes(@Query() query: NoteQueryDto) {
    return this.noteService.getTotalCounts(query);
  }

  @Get('count')
  dailyCounts(@Query() query: NoteQueryDto) {
    return this.noteService.buildDailyCounts(query);
  }

  @Get('/merge_request/:id')
  async findAllForMergeRequest(@Param() { id }: IdParam) {
    const mergeRequest = await this.mergeRequestService.findOne(id);
    if (mergeRequest) {
      return this.noteService.findAllForMergeRequest(mergeRequest);
    }
    throw new NotFoundException(
      `Could not find any notes for merge request with id: ${id}`,
    );
  }

  @Get(':id')
  async findOne(@Param() { id }: IdParam) {
    const note = await this.noteService.findOne(id);
    if (note) {
      return note;
    }
    throw new NotFoundException(`Could not find a note with id: ${id}`);
  }
}
