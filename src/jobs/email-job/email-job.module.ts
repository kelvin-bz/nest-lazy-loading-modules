// src/jobs/email-job/email-job.module.ts
import { Module } from '@nestjs/common';
import { EmailJobService } from './email-job.service';

@Module({
  providers: [EmailJobService],
  exports: [EmailJobService],
})
export class EmailJobModule {}
