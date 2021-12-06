import { DiskUsage } from '@ceres/types';
import { useApiQuery } from './base';

export function getDiskSpace() {
  return useApiQuery<DiskUsage>('/sysinfo/diskusage');
}
