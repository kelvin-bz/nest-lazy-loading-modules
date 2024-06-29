// src/jobs/data-processing-job/data-processing-job.module.ts
import { Module } from '@nestjs/common';
import { DataProcessingJobService } from './data-processing-job.service';

@Module({
  providers: [DataProcessingJobService],
  exports: [DataProcessingJobService],
})
export class DataProcessingJobModule {}
