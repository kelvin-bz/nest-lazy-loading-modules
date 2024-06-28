# NestJS Lazy Loading Modules 

## Lazy loading vs. Eager loading

```mermaid
flowchart LR
    A([Lazy Loading vs. Eager Loading]):::root

    A --> B[Use Cases]:::usecase
    B --> C[Lazy Loading]:::lazyloading
    B --> D[Eager Loading]:::eagerloading

    C --> C1[Large applications with many modules]:::lazyloading
    C --> C2["Serverless environments (e.g., AWS Lambda)"]:::lazyloading
    C --> C3[Modules with infrequent usage]:::lazyloading
    C --> C4[Optional features]:::lazyloading

    D --> D1[Small applications]:::eagerloading
    D --> D2[Modules with frequent usage]:::eagerloading
    D --> D3[Critical features required at startup]:::eagerloading

    A --> E[Benefits]:::benefits
    E --> F[Lazy Loading]:::lazyloading
    E --> G[Eager Loading]:::eagerloading

    F --> F1[Faster initial load time]:::lazyloading
    F --> F2[Reduced memory consumption]:::lazyloading
    F --> F3[Improved performance on low-powered devices]:::lazyloading
    F --> F4["Better user experience (faster interactions)"]:::lazyloading

    G --> G1[Simpler implementation]:::eagerloading
    G --> G2[No runtime overhead for dynamic loading]:::eagerloading
    G --> G3[All modules available immediately]:::eagerloading
    G --> G4[Predictable behavior]:::eagerloading

    A --> H[Drawbacks]:::drawbacks
    H --> I[Lazy Loading]:::lazyloading
    H --> J[Eager Loading]:::eagerloading

    I --> I1[Increased complexity]:::lazyloading
    I --> I2["Potential for 'cold starts'"]:::lazyloading

    J --> J1[Slower startup time]:::eagerloading
    J --> J2[Higher memory consumption]:::eagerloading

    classDef root fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef usecase fill:#d9f7be,stroke:#5b8c00,stroke-width:2px;
    classDef lazyloading fill:#ffd666,stroke:#d48806,stroke-width:2px;
    classDef eagerloading fill:#ffccc7,stroke:#cf1322,stroke-width:2px;
    classDef benefits fill:#91d5ff,stroke:#096dd9,stroke-width:2px;
    classDef drawbacks fill:#ffecb3,stroke:#ff9800,stroke-width:2px;

```

## LazyModuleLoader

```mermaid
graph TD
    subgraph Eager Loading ["Eager Loading (Default)"]
        A["All Modules Loaded\n at Startup"]
        style A fill:#f9e79f,stroke:#873600
    end

    subgraph Lazy Loading
        B["Modules Loaded\nOn-Demand"]
        style B fill:#82e0aa,stroke:#1e8449
    end

    subgraph LazyModuleLoader
        C["LazyModuleLoader"]
        style C fill:#85c1e9,stroke:#2980b9
    end

    subgraph Module Cache
        D["Module Cache"]
        style D fill:#d7bde2,stroke:#6c3483
    end

    A --> ColdStart["Cold Start\n (Slow)"]
    B --> WarmStart["Warm Start\n (Faster)"]
    C --> B -- Loads --> D

```

## Scenario

```mermaid
graph TD
    A[AppService] -.->|Lazy Load| B[EmailJobService]
    A[AppService] -.->|Lazy Load| C[DataProcessingJobService]
    A[AppService] -.->|Lazy Load| D[NotificationJobService]

    A[AppService]
    style A fill:#8ec6c5,stroke:#2a9d8f,stroke-width:2px

    subgraph Bull
        E[BullModule]
        style E fill:#f9d423,stroke:#ff6600,stroke-width:2px
    end

    F[JobProcessor]
    style F fill:#ffcccb,stroke:#ff4444,stroke-width:2px

    subgraph Jobs
        B[EmailJobService]
        style B fill:#ffcccb,stroke:#ff4444,stroke-width:2px
        C[DataProcessingJobService]
        style C fill:#d4a5a5,stroke:#a64d79,stroke-width:2px
        D[NotificationJobService]
        style D fill:#c9e4de,stroke:#0a9396,stroke-width:2px
    end

    E -->|Uses| F
    F -->|Processes| B
    F -->|Processes| C
    F -->|Processes| D


```

Imagine you have a NestJS worker responsible for processing various types of jobs:

- EmailJob: Sends promotional emails to customers.
- DataProcessingJob: Analyzes large datasets for insights.
- NotificationJob: Pushes notifications to users.

Since each job type has its own dependencies and may not be executed frequently, eager loading all modules at startup could lead to unnecessary resource consumption. Instead, we can use lazy loading to load the required modules only when needed.

## Implementation

```bash
nest-lazy-loading-modules
│
├── dist
├── node_modules
├── src
│   ├── job-processor
│   │   ├── job-processor.module.ts
│   │   └── job-processor.processor.ts
│   ├── jobs
│   │   ├── data-processing-job
│   │   │   └── data-processing-job.service.ts
│   │   ├── email-job
│   │   │   └── email-job.service.ts
│   │   └── notification-job
│   │       └── notification-job.service.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts

```

### JobProcessor
The JobProcessor class is responsible for processing different types of jobs. We use dynamic imports to load the required job services lazily when a job is processed.
```typescript
// src/job-processor/job-processor.processor.ts
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

```
### Job Service
Each job service class contains the logic for processing a specific type of job. For example, the EmailJobService class handles the logic for sending promotional emails to customers.
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailJobService {
  handleJob(data: any) {
    console.log(`Handling Email Job with data: ${JSON.stringify(data)}`);
    // Logic for sending promotional emails
  }
}

```

### AppService
The AppService class is responsible for adding jobs to the queue when the application starts. We use the OnModuleInit lifecycle hook to add jobs to the queue.
```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(@InjectQueue('jobQueue') private readonly jobQueue: Queue) {}

  async onModuleInit() {
    // Adding jobs to the queue
    console.log('Adding jobs to the queue');
    try {
      await this.jobQueue.add('EmailJob', { data: 'some data for email job' });
      await this.jobQueue.add('DataProcessingJob', {
        data: 'some data for data processing job',
      });
      await this.jobQueue.add('NotificationJob', {
        data: 'some data for notification job',
      });
    } catch (error) {
      console.error('Error adding jobs to the queue', error);
    }
  }
}

```

## TEST
Start the application by running the following command:
```bash
npm run start
```
Logs should be displayed in the console, indicating that the application has started successfully and is processing the different types of jobs:
```bash
Adding jobs to the queue
[Nest] 29036  - 06/28/2024, 9:48:55 AM     LOG [NestApplication] Nest application successfully started +16ms
Processing EmailJob...
Processing DataProcessingJob...
Handling Email Job with data: {"data":"some data for email job"}
Handling Data Processing Job with data: {"data":"some data for data processing job"}
Processing NotificationJob...
Handling Notification Job with data: [object Object]
```
## Conclusion
Lazy loading is beneficial for large, modular applications, optimizing performance and resource use. Eager loading suits smaller applications where critical features must be immediately available. Choosing the right approach depends on application size, usage patterns, and performance requirements. Each strategy has its own benefits and drawbacks to consider. Balancing lazy and eager loading can optimize application performance and resource utilization.
