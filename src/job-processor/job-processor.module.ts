// src/job-processor/job-processor.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobProcessor } from './job-processor.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'jobQueue',
    }),
  ],
  providers: [JobProcessor],
})
export class JobProcessorModule {}
