CREATE TABLE `section_feed` (
	`section_id` text NOT NULL,
	`subscription_id` text NOT NULL,
	PRIMARY KEY(`section_id`, `subscription_id`),
	FOREIGN KEY (`section_id`) REFERENCES `section`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscription`(`id`) ON UPDATE no action ON DELETE cascade
);
