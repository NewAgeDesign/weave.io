CREATE TABLE `users` (
  `email` varchar(50) PRIMARY KEY NOT NULL COMMENT 'Primary key - User email',
  `fname` varchar(50) NOT NULL COMMENT 'User''s first name',
  `lname` varchar(50) NOT NULL COMMENT 'User''s last name',
  `color` varchar(8) DEFAULT null COMMENT 'User''s preferred theme color',
  `plan` varchar(10) DEFAULT null COMMENT 'Subscription plan',
  `psw` varchar(255) NOT NULL COMMENT 'Hashed password',
  `salt` varchar(255) NOT NULL COMMENT 'Salt for password hashing'
);

CREATE TABLE `team` (
  `teamid` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for each team',
  `invite_link` varchar(200) UNIQUE DEFAULT null COMMENT 'Unique invitation link for the team',
  `name` varchar(50) NOT NULL COMMENT 'Team name with character limit',
  `descr` varchar(250) NOT NULL COMMENT 'Short description of the team',
  `owemail` varchar(50) NOT NULL COMMENT 'Foreign Key referencing users (Team Owner)'
);

CREATE TABLE `tmembers` (
  `teamid` int NOT NULL COMMENT 'Foreign Key referencing team',
  `uemail` varchar(50) NOT NULL COMMENT 'Foreign Key referencing users',
  `role` varchar(20) NOT NULL COMMENT 'Role/title of the team member',
  `djoin` date NOT NULL COMMENT 'Date the member joined the team'
);

CREATE TABLE `project` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for each project',
  `name` varchar(255) NOT NULL COMMENT 'The name of the project (max 255 characters)',
  `description` text COMMENT 'Detailed description of the project (optional)',
  `teamid` int DEFAULT null COMMENT 'Foreign Key referencing the team (if any)',
  `type` enum(general,web_builder) DEFAULT 'general' COMMENT 'Type of project',
  `status` enum(draft,in_progress,completed) DEFAULT 'draft' COMMENT 'Project status',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP) COMMENT 'Timestamp when the project was created',
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP) COMMENT 'Timestamp when the project was last updated'
);

CREATE TABLE `pages` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL COMMENT 'Foreign Key referencing projects',
  `page_name` varchar(255) NOT NULL,
  `page_slug` varchar(255) UNIQUE NOT NULL COMMENT 'Unique URL slug',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `generated_code` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL COMMENT 'Foreign Key referencing projects',
  `language` varchar(20) NOT NULL COMMENT 'e.g., HTML, CSS, JS, PHP',
  `code` text NOT NULL COMMENT 'The generated source code',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `components` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL COMMENT 'Foreign Key referencing projects',
  `component_type` varchar(50) NOT NULL,
  `content` text NOT NULL COMMENT 'JSON or HTML structure',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `pmembers` (
  `projectid` int NOT NULL COMMENT 'Foreign Key referencing project',
  `uemail` varchar(50) NOT NULL COMMENT 'Foreign Key referencing users',
  `assigned_date` date NOT NULL COMMENT 'Date when the user was assigned to the project'
);

CREATE TABLE `invitations` (
  `invid` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Unique ID for each invitation',
  `teamid` int NOT NULL COMMENT 'Foreign Key referencing the team that the invitation belongs to',
  `token` varchar(64) UNIQUE NOT NULL COMMENT 'A unique invitation token for the user',
  `expat` datetime NOT NULL COMMENT 'Expiration date and time of the invitation'
);

CREATE TABLE `user_tabs` (
  `email` varchar(50) NOT NULL COMMENT 'Foreign Key referencing users',
  `projectid` int NOT NULL COMMENT 'Foreign Key referencing projects',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP) COMMENT 'Timestamp when the record was created'
);

CREATE TABLE `activity_logs` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Unique log ID',
  `user_email` varchar(50) NOT NULL COMMENT 'Foreign Key referencing users',
  `action` text NOT NULL COMMENT 'Description of user action',
  `timestamp` timestamp DEFAULT (CURRENT_TIMESTAMP) COMMENT 'Time the action was performed'
);

CREATE TABLE `roles` (
  `role_id` int PRIMARY KEY NOT NULL AUTO_INCREMENT COMMENT 'Unique ID for each role',
  `role_name` varchar(50) UNIQUE NOT NULL COMMENT 'Role name (e.g., Admin, Editor, Viewer)'
);

CREATE TABLE `user_roles` (
  `user_email` varchar(50) NOT NULL COMMENT 'Foreign Key referencing users',
  `teamid` int NOT NULL COMMENT 'Foreign Key referencing teams',
  `role_id` int NOT NULL COMMENT 'Foreign Key referencing roles'
);

CREATE UNIQUE INDEX `invite_link` ON `team` (`invite_link`);

CREATE INDEX `teamid` ON `tmembers` (`teamid`);

CREATE INDEX `uemail` ON `tmembers` (`uemail`);

CREATE INDEX `teamid` ON `project` (`teamid`);

CREATE INDEX `projectid` ON `pmembers` (`projectid`);

CREATE INDEX `uemail` ON `pmembers` (`uemail`);

CREATE UNIQUE INDEX `token` ON `invitations` (`token`);

CREATE INDEX `teamid` ON `invitations` (`teamid`);

CREATE INDEX `projectid` ON `user_tabs` (`projectid`);

CREATE INDEX `email` ON `user_tabs` (`email`);

CREATE INDEX `user_email` ON `activity_logs` (`user_email`);

CREATE INDEX `user_email` ON `user_roles` (`user_email`);

CREATE INDEX `teamid` ON `user_roles` (`teamid`);

CREATE INDEX `role_id` ON `user_roles` (`role_id`);

ALTER TABLE `generated_code` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE;

ALTER TABLE `invitations` ADD FOREIGN KEY (`teamid`) REFERENCES `team` (`teamid`) ON DELETE CASCADE;

ALTER TABLE `pmembers` ADD FOREIGN KEY (`projectid`) REFERENCES `project` (`id`) ON DELETE CASCADE;

ALTER TABLE `pmembers` ADD FOREIGN KEY (`uemail`) REFERENCES `users` (`email`) ON DELETE CASCADE;

ALTER TABLE `project` ADD FOREIGN KEY (`teamid`) REFERENCES `team` (`teamid`) ON DELETE SET NULL;

ALTER TABLE `pages` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE;

ALTER TABLE `components` ADD FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE;

ALTER TABLE `team` ADD FOREIGN KEY (`owemail`) REFERENCES `users` (`email`) ON DELETE CASCADE;

ALTER TABLE `tmembers` ADD FOREIGN KEY (`teamid`) REFERENCES `team` (`teamid`) ON DELETE CASCADE;

ALTER TABLE `tmembers` ADD FOREIGN KEY (`uemail`) REFERENCES `users` (`email`) ON DELETE CASCADE;

ALTER TABLE `user_tabs` ADD FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE;

ALTER TABLE `user_tabs` ADD FOREIGN KEY (`projectid`) REFERENCES `project` (`id`) ON DELETE CASCADE;

ALTER TABLE `activity_logs` ADD FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE;

ALTER TABLE `user_roles` ADD FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE;

ALTER TABLE `user_roles` ADD FOREIGN KEY (`teamid`) REFERENCES `team` (`teamid`) ON DELETE CASCADE;

ALTER TABLE `user_roles` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE;
