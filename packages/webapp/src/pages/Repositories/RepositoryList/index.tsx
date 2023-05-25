import { Operation, Repository } from '@ceres/types';
import Tabs from '@material-ui/core/Tabs';
import React, { useState } from 'react';
import {
  useFetchRepositories,
  useGetOperations,
  useSyncRepository,
  useDeleteRepository,
} from '../../../api/operation';
import { useRepository } from '../../../api/repository';
import { useAuthContext } from '../../../contexts/AuthContext';
import RepositoryCard from './RepositoryCard';
import DefaultPageTitleFormat from '../../../shared/components/DefaultPageTitleFormat';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import { TextField } from '@material-ui/core';
import Tab from '@material-ui/core/Tab/Tab';
import { useInterval } from '../../../shared/util/useInterval';
import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { getDiskSpace } from '../../../api/sysinfo';

function hasPendingSync(operations: Operation[], id: string) {
  return (
    operations.filter((operation) => operation.input.repository_id === id)
      .length > 0
  );
}

enum TabOption {
  all = 'all',
  owned = 'owned',
  shared = 'shared',
}

const tabToRoleMappings = {
  [TabOption.all]: [Repository.Role.owner, Repository.Role.collaborator],
  [TabOption.owned]: [Repository.Role.owner],
  [TabOption.shared]: [Repository.Role.collaborator],
};

const RepositoryList: React.FC = () => {
  const [openError, setOpenError] = useState(false);
  const [sort, setSort] = useState('-project_created');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(TabOption.all);
  const { data: data, invalidate: invalidateData } = useRepository({
    sort,
    name: search,
    role: tabToRoleMappings[tab],
  });
  const { user } = useAuthContext();
  const { data: operationsData, invalidate: invalidateOperations } =
    useGetOperations({
      status: [Operation.Status.PROCESSING, Operation.Status.PENDING],
      type: [Operation.Type.SYNC_REPOSITORY, Operation.Type.DELETE_REPOSITORY],
    });
  const { data: pendingFetches, invalidate: invalidatePendingFetches } =
    useGetOperations({
      status: [Operation.Status.PROCESSING, Operation.Status.PENDING],
      type: [Operation.Type.FETCH_REPOSITORIES],
    });

  const { sync } = useSyncRepository();
  const { delete2 } = useDeleteRepository();
  const { fetch } = useFetchRepositories();
  const isFetchingRepositories = pendingFetches?.total > 0;
  const isSyncingRepositories = operationsData?.total > 0;
  const syncRepository = (id: string, name: string) => {
    sync(id, name, {
      onSuccess: () => {
        void invalidateOperations();
      },
    });
  };
  const deleteRepository = (id: string) => {
    delete2(id, {
      onSuccess: () => {
        void invalidateOperations();
      },
    });
  };
  const fetchRepositories = () => {
    fetch({
      onSuccess: () => {
        void invalidatePendingFetches();
      },
      onError: () => {
        void invalidatePendingFetches();
        setOpenError(true);
      },
    });
  };
  const [spaceUsed, setSpaceUsed] = useState('');
  // potentially turn into a useEffect hook
  (async () => {
    const space = await getDiskSpace();
    if (space.data) {
      setSpaceUsed(`${space.data.used} used`);
    }
  })();

  useInterval(
    () => {
      void invalidatePendingFetches();
      void invalidateData();
    },
    isFetchingRepositories ? 1000 * 4 : null,
  );
  useInterval(
    () => {
      void invalidateOperations();
      void invalidateData();
    },
    isSyncingRepositories ? 1000 * 5 : null,
  );
  const message =
    data?.results.length == 0 ? (
      <Typography>No repositories found.</Typography>
    ) : null;
  return (
    <Container>
      <Snackbar
        open={openError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenError(false)} severity='error'>
          Repository fetch has failed
        </Alert>
      </Snackbar>
      <Grid container justify='space-between' alignItems='center'>
        <Grid item>
          <DefaultPageTitleFormat>Repositories</DefaultPageTitleFormat>
        </Grid>
        <Grid item>
          <Box position='relative'>
            <Button
              variant='contained'
              color='primary'
              size='large'
              onClick={fetchRepositories}
              disabled={isFetchingRepositories}
            >
              Fetch
            </Button>
            {isFetchingRepositories && (
              <Box position='absolute' top='.25rem' left='1.5rem'>
                <CircularProgress color='secondary' />
              </Box>
            )}
          </Box>
          {spaceUsed}
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <TextField
            label='Search'
            variant='outlined'
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl variant='filled' fullWidth>
            <InputLabel shrink id='sort-order-label'>
              Sort
            </InputLabel>
            <Select
              labelId='sort-order-label'
              id='sort-order-label-options'
              value={sort}
              onChange={(e) => setSort(e.target.value as string)}
              style={{ minWidth: '15rem' }}
              fullWidth
            >
              <MenuItem value='-project_synced'>Recently Synced</MenuItem>
              <MenuItem value='+project_synced'>Oldest Synced</MenuItem>
              <MenuItem value='-project_created'>Recently Created</MenuItem>
              <MenuItem value='+project_created'>Oldest Created</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Tabs
        value={tab}
        onChange={(_e, newTab) => {
          setTab(newTab);
        }}
        indicatorColor='primary'
        textColor='primary'
        centered
      >
        <Tab value={TabOption.all} label='All' />
        <Tab value={TabOption.owned} label='Owned by me' />
        <Tab value={TabOption.shared} label='Shared with me' />
      </Tabs>
      {message}
      <React.Fragment>
        {data?.results.map((repo) => {
          const isSyncing = hasPendingSync(
            operationsData?.results || [],
            repo.meta.id,
          );
          return (
            <RepositoryCard
              repository={repo}
              isShared={user?.id !== repo?.extensions?.owner?.id}
              isSyncing={isSyncing}
              syncRepository={syncRepository}
              deleteRepository={deleteRepository}
              key={repo.meta.id}
            />
          );
        })}
      </React.Fragment>
    </Container>
  );
};

export default RepositoryList;
