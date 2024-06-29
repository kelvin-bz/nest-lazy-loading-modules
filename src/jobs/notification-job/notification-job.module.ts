// src/jobs/notification-job/notification-job.module.ts
import { Module } from '@nestjs/common';
import { NotificationJobService } from './notification-job.service';

@Module({
  providers: [NotificationJobService],
  exports: [NotificationJobService],
})
export class NotificationJobModule {}
