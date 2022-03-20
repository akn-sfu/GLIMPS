import { Module } from '@nestjs/common';
import { SysinfoController } from './sysinfo.controller';

@Module({
  controllers: [SysinfoController],
})
export class SysinfoModule {}
