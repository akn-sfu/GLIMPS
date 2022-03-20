import { DeepPartial, Repository, SelectQueryBuilder } from 'typeorm';
import alwaysArray from './alwaysArray';
import { BaseEntity } from './base-entity';
import { paginate, QueryDto, withDefaults } from './query-dto';
import { HttpService } from '@nestjs/common';
import { Fetch } from './fetchWithRetry';

export abstract class BaseService<
  TResource,
  TEntity extends BaseEntity<TResource>,
  TFilters extends QueryDto,
> extends Fetch {
  protected constructor(
    protected readonly serviceRepository: Repository<TEntity>,
    protected readonly tableName: string,
    readonly httpService: HttpService,
  ) {
    super(httpService);
  }

  search(filters: TFilters, isPaginated = true) {
    filters = withDefaults(filters);
    let query = this.serviceRepository.createQueryBuilder(this.tableName);
    query = this.buildFilters(query, filters);
    const sort = filters.sort && alwaysArray(filters.sort);
    if (sort?.length > 0) {
      const { sortKey, order } = this.determineSort(sort[0]);
      query = this.buildSort(query, sortKey, order as 'ASC' | 'DESC');
    } else {
      query = this.buildSort(query);
    }
    if (this.tableName === 'note') {
      query.orderBy("note.resource #>> '{created_at}'", 'ASC');
    }
    if (isPaginated) {
      paginate(query, filters);
    }
    return query.getManyAndCount();
  }

  findOne(id: string) {
    return this.serviceRepository.findOne(id);
  }

  findByRepositoryId(repo_id: string, table_name: string) {
    let query = this.serviceRepository.createQueryBuilder(table_name);
    query.where('repository_id = :repositoryId', { repositoryId: repo_id });
    return query.getManyAndCount();
  }

  create<T extends DeepPartial<TEntity>>(data: T) {
    const entity = this.serviceRepository.create(data);
    return this.serviceRepository.save(entity as any);
  }

  async update<T extends DeepPartial<TEntity>>(data: T) {
    const entity = await this.serviceRepository.preload(data);
    return this.serviceRepository.save(entity as any);
  }

  async delete<T extends DeepPartial<TEntity>>(data: T) {
    const entity = await this.serviceRepository.preload(data);
    return this.serviceRepository.remove(entity as any);
  }

  abstract buildFilters(
    query: SelectQueryBuilder<TEntity>,
    filters: TFilters,
  ): SelectQueryBuilder<TEntity>;

  abstract buildSort(
    query: SelectQueryBuilder<TEntity>,
    sortKey?: string,
    order?: 'ASC' | 'DESC',
  ): SelectQueryBuilder<TEntity>;

  private determineSort(sort: string) {
    const firstChar = sort.charAt(0);
    const sortKey = sort.substr(1);
    return {
      sortKey,
      order: firstChar === '+' ? 'ASC' : 'DESC',
    };
  }
}
