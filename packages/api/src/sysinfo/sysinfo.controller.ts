import { Controller, Get } from '@nestjs/common';
import { getManager } from 'typeorm';

@Controller('sysinfo')
export class SysinfoController {
  @Get('diskusage')
  async getDiskUsage() {
    const manager = getManager();
    const spaceUsed = await manager.query(`SELECT total_bytes AS total
    FROM (
    SELECT *, total_bytes-index_bytes-coalesce(toast_bytes,0) AS table_bytes FROM (
        SELECT c.oid,nspname AS table_schema, relname AS table_name
                , c.reltuples AS row_estimate
                , pg_total_relation_size(c.oid) AS total_bytes
                , pg_indexes_size(c.oid) AS index_bytes
                , pg_total_relation_size(reltoastrelid) AS toast_bytes
            FROM pg_class c
            LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE relkind = 'r'
    ) a
    ) a WHERE "table_schema"='public';`);
    return { used: spaceUsed };
  }
}
