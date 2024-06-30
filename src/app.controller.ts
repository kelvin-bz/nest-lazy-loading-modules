// src/app.controller.ts
import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('jobs')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('trigger')
  async triggerJobs() {
    await this.appService.triggerJobs();
    return { message: 'Jobs have been added to the queue' };
  }
}
