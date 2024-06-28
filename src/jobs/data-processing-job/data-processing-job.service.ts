import { Injectable } from '@nestjs/common';

@Injectable()
export class DataProcessingJobService {
  handleJob(data: any) {
    console.log(
      `Handling Data Processing Job with data: ${JSON.stringify(data)}`,
    );
    // Logic for analyzing large datasets
  }
}
