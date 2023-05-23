import { Operation } from '@ceres/types';
import { MutateOptions } from 'react-query';
import { useApiMutation, usePaginatedQuery } from './base';

interface OperationInput {
  type: Operation.Type;
}

export function useSyncRepository() {
  const mutation = useCreateOperation();
  const sync = (
    id: string,
    name?: string,
    options?: MutateOptions<Operation, any, OperationInput>,
  ) => {
    mutation.mutate(Operation.buildSyncRepositoryPayload(id, name), options);
  };
  return {
    ...mutation,
    sync,
  };
}

export function useDeleteRepository() {
  const mutation = useCreateOperation();
  const delete2 = (
    id: string,
    options?: MutateOptions<Operation, any, OperationInput>,
  ) => {
    mutation.mutate(Operation.buildDeleteRepositoryPayload(id), options);
  };
  return {
    ...mutation,
    delete2,
  };
}

export function useFetchRepositories() {
  const mutation = useCreateOperation();
  const fetch = (options?: MutateOptions<Operation, any, OperationInput>) =>
    mutation.mutate({ type: Operation.Type.FETCH_REPOSITORIES }, options);
  return {
    ...mutation,
    fetch,
  };
}

interface QueryParams {
  subscribers?: string[];
  type?: Operation.Type[];
  status?: Operation.Status[];
}

export function useGetOperations(
  params: QueryParams,
  page?: number,
  pageSize?: number,
) {
  return usePaginatedQuery<Operation>('/operation', params, page, pageSize);
}

export function useCreateOperation<T extends OperationInput>() {
  return useApiMutation<Operation, T>('/operation', 'POST');
}
