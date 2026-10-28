CREATE TABLE `item` (
	`id` text PRIMARY KEY NOT NULL,
	`feed_id` text NOT NULL,
	`guid` text NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`author` text,
	`published_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`feed_id`) REFERENCES `feed`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `item_feedId_publishedAt_idx` ON `item` (`feed_id`,`published_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `item_feedId_quid_unique` ON `item` (`feed_id`,`guid`);--> statement-breakpoint
CREATE TABLE `item_read` (
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	`read_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `item_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `item`(`id`) ON UPDATE no action ON DELETE cascade
);
