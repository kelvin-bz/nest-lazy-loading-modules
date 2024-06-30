# NestJS Lazy Loading Modules 

## Lazy loading vs. Eager loading

###  Lazy Loading


```mermaid
flowchart TD
    A[Lazy Loading vs. Eager Loading]:::root
    A --> B[Large App or Serverless?]

    B -- Yes --> C[Lazy Loading]:::lazyloading
    B -- No --> D[Frequent Use or Critical at Startup?]

    D -- Yes --> E[Eager Loading]:::eagerloading
    D -- No --> C

    C --> F["Benefits:\n- Faster initial load time\n- Reduced memory use\n- Better performance on low-end devices"]:::lazyloading
    C --> G["Drawbacks:\n- Increased complexity\n- 'Cold start' delays"]:::lazyloading

    E --> H["Benefits:\n- Simpler\n- No dynamic loading overhead\n- Predictable"]:::eagerloading
    E --> I["Drawbacks:\n- Slower startup\n- Higher memory use"]:::eagerloading

    classDef root fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef lazyloading fill:#ffd666,stroke:#d48806,stroke-width:2px;
    classDef eagerloading fill:#ffccc7,stroke:#cf1322,stroke-width:2px;

```
**Large Application with Many Modules**: If your application has a complex structure with numerous modules, the initial startup time can be significant if all modules are loaded eagerly. Lazy loading becomes beneficial here, as it only loads modules when they are actually needed, resulting in a faster initial startup.

**Serverless Environment**: Serverless platforms charge based on execution time. Lazy loading is crucial here because it reduces the cold start time (the time it takes for a function to initialize before executing). By only loading necessary modules for each request, you optimize performance and reduce costs.


## LazyModuleLoader

This is a utility class provided by NestJS to facilitate lazy loading. It handles the dynamic loading of modules at runtime.
When a lazily loaded module is requested, the LazyModuleLoader fetches it from the file system (or cache) and loads it into memory, making it available for use.

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

Imagine you have a NestJS worker responsible for processing various types of jobs:

- **EmailJob**: Sends promotional emails to customers.
- **DataProcessingJob**: Analyzes large datasets for insights.
- **NotificationJob**: Pushes notifications to users.

Since each job type has its own dependencies and may not be executed frequently, eager loading all modules at startup could lead to unnecessary resource consumption. Instead, we can use **lazy loading** to load the required modules only when needed.

```mermaid
graph LR
    subgraph Worker
        A[Worker] --> B[EmailJob]
        A[Worker] --> C[DataProcessingJob]
        A[Worker] --> D[NotificationJob]

        style A fill:#f9e79f,stroke:#873600
    end

    subgraph Job Modules
        B[EmailJob] --> E[Email Dependencies]
        C[DataProcessingJob] --> F[Data Processing\nDependencies]
        D[NotificationJob] --> G[Notification\nDependencies]

        style B fill:#ffcccb,stroke:#ff4444
        style C fill:#a2d2ff,stroke:#007bff
        style D fill:#d1f2eb,stroke:#74c69d
        style E fill:#ffd666,stroke:#d48806
        style F fill:#d6e9c6,stroke:#4cae4c
        style G fill:#ebdef0,stroke:#8e44ad
    end

```

## Solution
```mermaid
graph TD
    subgraph App
        A[AppModule] -- Configures --> C[Queue]
        A[AppModule] -- Provides --> B(AppService)
        B(AppService) -- Enqueues Jobs --> C[Queue]
        style A fill:#8ec6c5,stroke:#2a9d8f,stroke-width:2px
        style B fill:#ffcccb,stroke:#ff4444,stroke-width:2px
        style C fill:#f9d423,stroke:#ff6600,stroke-width:2px
    end

    C[Queue] -- Job Data --> D["JobProcessor\nModule"]
    style D fill:#9966cc,stroke:#663399,stroke-width:2px

    subgraph JobProcessorModule
        D["JobProcessor\nModule"] -- Processes Jobs --> E[JobProcessor]
        style E fill:#ffcccb,stroke:#ff4444,stroke-width:2px
    end

    E[JobProcessor] -- Loads Modules on Demand --> F[LazyModuleLoader]
    style F fill:#85c1e9,stroke:#2980b9
    E[JobProcessor] -.->|Lazy Loads| G[EmailJobModule]
    style G fill:#d1f2eb,stroke:#74c69d,stroke-width:2px
    E[JobProcessor] -.->|Lazy Loads| H[DataProcessingJobModule]
    style H fill:#a2d2ff,stroke:#007bff,stroke-width:2px
    E[JobProcessor] -.->|Lazy Loads| I[NotificationJobModule]
    style I fill:#fcf4d4,stroke:#f08c00,stroke-width:2px

    G[EmailJobModule] -- Provides --> J(EmailJobService)
    H[DataProcessingJobModule] -- Provides --> K(DataProcessingJobService)
    I[NotificationJobModule] -- Provides --> L(NotificationJobService)

    style J fill:#ffd666,stroke:#d48806,stroke-width:2px
    style K fill:#d6e9c6,stroke:#4cae4c,stroke-width:2px
    style L fill:#ebdef0,stroke:#8e44ad,stroke-width:2px

    J(EmailJobService) -- Executes --> M["Send Email"]
    K(DataProcessingJobService) -- Executes --> N["Process Data"]
    L(NotificationJobService) -- Executes --> O["Send Notification"]


```

The NestJS worker, a versatile task orchestrator, dynamically allocates resources through lazy loading. Leveraging the powerful **Bull queueing system**, it efficiently manages incoming jobs.  
Instead of preemptively loading all job-specific modules, it employs the LazyModuleLoader to load dependencies on demand, triggered by the arrival of a job in the Bull queue. This streamlined approach not only optimizes memory consumption and minimizes startup time but also ensures efficient execution tailored to each specific job, akin to a surgical team assembling tools for a particular procedure. The worker's dynamic resource allocation, combined with Bull's robust queue management, promotes scalability and resource efficiency while maintaining the flexibility to handle a variety of tasks.

#### JobProcessor: The Coordinator
In our scenario, the JobProcessor serves as the core of the worker application, performing the following tasks:

- **Queue Listening**: Subscribes to the Bull queue, awaiting new jobs.
- **Job Reception**: Receives job data, including job type and payload.
- **Job Type Identification**: Determines the job type from the received data.
- **Lazy Loading Modules**: Utilizes LazyModuleLoader to dynamically load the appropriate module (e.g., EmailJobModule) based on the job type.
- **Service Retrieval**: Retrieves the corresponding service (e.g., EmailJobService) from the loaded module.
- **Job Execution**: Delegates job execution to the service, passing the job data for processing.


```mermaid
sequenceDiagram
    participant AppModule
    participant AppService
    participant Queue
    participant JobProcessorModule
    participant JobProcessor
    participant LazyModuleLoader

    AppModule->>AppService: inject()
    AppModule->>Queue: configure()
    AppService->>Queue: add(JobData)
    Queue->>JobProcessorModule: Job Data
    JobProcessorModule->>JobProcessor: process(JobData)
    JobProcessor->>LazyModuleLoader: load(JobModule)
    LazyModuleLoader->>JobModule: dynamically load
    JobProcessor->>JobService: get(JobService)
    JobProcessor->>JobService: executeJob(JobData)

```

## Implementation

```bash
src
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── job-processor
│   ├── job-processor.module.ts
│   └── job-processor.processor.ts
├── jobs
│   ├── data-processing-job
│   │   ├── data-processing-job.module.ts
│   │   └── data-processing-job.service.ts
│   ├── email-job
│   │   ├── email-job.module.ts
│   │   └── email-job.service.ts
│   └── notification-job
│       ├── notification-job.module.ts
│       └── notification-job.service.ts
└── main.ts

```

### JobProcessor Module

The **JobProcessorModule** class is responsible for importing the JobProcessor class and the BullModule to create a queue for processing jobs.

```typescript
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
```


The **JobProcessor** class is responsible for processing different types of jobs. We use dynamic imports to load the required job services lazily when a job is processed.

```typescript
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


```
### Jobs

Each job type has its own module and service class. 
The service class contains the logic for processing the job.

#### EmailJobModule

```typescript
// src/jobs/email-job/email-job.module.ts
import { Module } from '@nestjs/common';
import { EmailJobService } from './email-job.service';

@Module({
  providers: [EmailJobService],
  exports: [EmailJobService],
})
export class EmailJobModule {}

```
#### EmailJobService
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
### AppController
The AppController class is responsible for triggering the different types of jobs.
```typescript
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

```

### AppService
The AppService class is responsible for adding jobs to the queue.
```typescript
// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AppService {
  constructor(@InjectQueue('jobQueue') private readonly jobQueue: Queue) {}

  async triggerJobs() {
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

### Install Redis

If you don't have Redis installed, you can install it using the following commands:

On **macOS** using Homebrew:
```bash
brew install redis
```

Start Redis:
```bash
brew services start redis
```

On **Ubuntu**:
```bash
sudo apt update
sudo apt install redis-server
```

Start Redis:
```typescript
sudo service redis-server start
```

On **Window**

You can download Redis from the official Redis here: [Redis](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/install-redis-on-windows/)

#### Verify Redis Installation
```bash
redis-cli ping
```
### Start Application

Start the application by running the following command:
```bash
npm run start
```

#### Trigger Jobs

```bash
POST http://localhost:3000/jobs/trigger
```

**Response**:
```json
{
  "message": "Jobs have been added to the queue"
}
```

**Logs**: 
should be displayed in the console, indicating that the application has started successfully and is processing the different types of jobs:
```bash
[Nest] 45900  - 06/30/2024, 10:45:41 AM     LOG [LazyModuleLoader] EmailJobModule dependencies initialized
Handling Email Job with data: {"data":"some data for email job"}
Processing DataProcessingJob...
[Nest] 45900  - 06/30/2024, 10:45:41 AM     LOG [LazyModuleLoader] DataProcessingJobModule dependencies initialized
Handling Data Processing Job with data: {"data":"some data for data processing job"}
Processing NotificationJob...
[Nest] 45900  - 06/30/2024, 10:45:41 AM     LOG [LazyModuleLoader] NotificationJobModule dependencies initialized
Handling Notification Job with data: {"data":"some data for notification job"}

```
## Conclusion
Lazy loading is beneficial for large, modular applications, optimizing performance and resource use. Eager loading suits smaller applications where critical features must be immediately available. Choosing the right approach depends on application size, usage patterns, and performance requirements. Each strategy has its own benefits and drawbacks to consider. Balancing lazy and eager loading can optimize application performance and resource utilization.
