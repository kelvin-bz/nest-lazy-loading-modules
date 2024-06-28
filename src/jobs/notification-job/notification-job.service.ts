import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationJobService {
  handleJob(data: any) {
    console.log(`Handling Notification Job with data: ${JSON.stringify(data)}`);
    // Logic for pushing notifications
  }
}
