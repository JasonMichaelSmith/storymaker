export enum TaskStatus {
	Pending = "pending", // The task is waiting to be executed in the queue
	Staged = "staged", // The task is cached, not in the queue yet
	Processing = "processing", // The task is being executed
	Finished = "finished", // The task has been completed
	Failed = "failed", // The task execution failed
	Retry = "retry", // The task is waiting in the queue to be retried
}
