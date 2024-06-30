import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppService } from './app.service';
import { JobProcessorModule } from './job-processor/job-processor.module';
import { AppController } from "./app.controller";

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'jobQueue',
    }),
    JobProcessorModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
