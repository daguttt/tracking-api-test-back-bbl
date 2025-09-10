CREATE TABLE `checkpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`unitId` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp),
	`created_at` text DEFAULT (current_timestamp),
	FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'CREATED' NOT NULL,
	`updated_at` text DEFAULT (current_timestamp),
	`created_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`shipmentId` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp),
	`created_at` text DEFAULT (current_timestamp),
	FOREIGN KEY (`shipmentId`) REFERENCES `shipments`(`id`) ON UPDATE no action ON DELETE no action
);
