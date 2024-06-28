import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('jobQueue')
export class JobProcessor {
  @Process('EmailJob')
  async handleEmailJob(job: Job) {
    console.log('Processing EmailJob...');
    const { EmailJobService } = await import(
      '../jobs/email-job/email-job.service'
    );
    const emailJobService = new EmailJobService();
    emailJobService.handleJob(job.data);
  }

  @Process('DataProcessingJob')
  async handleDataProcessingJob(job: Job) {
    console.log('Processing DataProcessingJob...');
    const { DataProcessingJobService } = await import(
      '../jobs/data-processing-job/data-processing-job.service'
    );
    const dataProcessingJobService = new DataProcessingJobService();
    dataProcessingJobService.handleJob(job.data);
  }

  @Process('NotificationJob')
  async handleNotificationJob(job: Job) {
    console.log('Processing NotificationJob...');
    const { NotificationJobService } = await import(
      '../jobs/notification-job/notification-job.service'
    );
    const notificationJobService = new NotificationJobService();
    notificationJobService.handleJob(job.data);
  }
}
