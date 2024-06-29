// src/job-processor/job-processor.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { LazyModuleLoader } from '@nestjs/core';

@Processor('jobQueue')
export class JobProcessor {
  constructor(private readonly lazyModuleLoader: LazyModuleLoader) {}

  @Process('EmailJob')
  async handleEmailJob(job: Job) {
    try {
      const { EmailJobModule } = await import(
        '../jobs/email-job/email-job.module'
      );
      const moduleRef = await this.lazyModuleLoader.load(() => EmailJobModule);
      const { EmailJobService } = await import(
        '../jobs/email-job/email-job.service'
      );
      const emailJobService = moduleRef.get(EmailJobService);
      emailJobService.handleJob(job.data);
    } catch (e) {
      // Do some retry logic here, handling the error
      console.log(e);
    }
  }

  @Process('DataProcessingJob')
  async handleDataProcessingJob(job: Job) {
    console.log('Processing DataProcessingJob...');
    try {
      const { DataProcessingJobModule } = await import(
        '../jobs/data-processing-job/data-processing-job.module'
      );
      const moduleRef = await this.lazyModuleLoader.load(
        () => DataProcessingJobModule,
      );
      const { DataProcessingJobService } = await import(
        '../jobs/data-processing-job/data-processing-job.service'
      );
      const dataProcessingJobService = moduleRef.get(DataProcessingJobService);
      dataProcessingJobService.handleJob(job.data);
    } catch (e) {
      // Do some retry logic here, handling the error
      console.log(e);
    }
  }

  @Process('NotificationJob')
  async handleNotificationJob(job: Job) {
    console.log('Processing NotificationJob...');
    try {
      const { NotificationJobModule } = await import(
        '../jobs/notification-job/notification-job.module'
      );
      const moduleRef = await this.lazyModuleLoader.load(
        () => NotificationJobModule,
      );
      const { NotificationJobService } = await import(
        '../jobs/notification-job/notification-job.service'
      );
      const notificationJobService = moduleRef.get(NotificationJobService);
      notificationJobService.handleJob(job.data);
    } catch (e) {
      // Do some retry logic here, handling the error
      console.log(e);
    }
  }
}
