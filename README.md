# NestJS Lazy Loading Modules 

## Lazy loading vs. Eager loading

```mermaid
mindmap
  root((Lazy Loading vs. Eager Loading))
    sub("Use Cases")
      branch("Lazy Loading")
        Large applications with many modules
        Serverless environments (e.g., AWS Lambda)
        Modules with infrequent usage
        Optional features
      branch("Eager Loading")
        Small applications
        Modules with frequent usage
        Critical features required at startup
    sub("Benefits")
      branch("Lazy Loading")
        Faster initial load time
        Reduced memory consumption
        Improved performance on low-powered devices
        Better user experience (faster interactions)
      branch("Eager Loading")
        Simpler implementation
        No runtime overhead for dynamic loading
        All modules available immediately
        Predictable behavior
    sub("Drawbacks")
      branch("Lazy Loading")
        Increased complexity
        Potential for "cold starts"
      branch("Eager Loading")
        Slower startup time
        Higher memory consumption 

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


