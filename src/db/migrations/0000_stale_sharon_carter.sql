CREATE TABLE `checkpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`unit_id` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp),
	`created_at` text DEFAULT (current_timestamp),
	FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` text PRIMARY KEY NOT NULL,
	`updated_at` text DEFAULT (current_timestamp),
	`created_at` text DEFAULT (current_timestamp)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` text PRIMARY KEY NOT NULL,
	`shipment_id` text NOT NULL,
	`updated_at` text DEFAULT (current_timestamp),
	`created_at` text DEFAULT (current_timestamp),
	FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON UPDATE no action ON DELETE no action
);
