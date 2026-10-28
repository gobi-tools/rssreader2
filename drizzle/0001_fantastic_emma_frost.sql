CREATE TABLE `feed` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`site_url` text,
	`author` text,
	`etag` text,
	`last_modified` text,
	`last_fetched_at` integer,
	`last_error` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feed_url_unique` ON `feed` (`url`);