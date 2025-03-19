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

CREATE UNIQUE INDEX `invite_link` ON `team` (`invite_link`);

CREATE INDEX `teamid` ON `tmembers` (`teamid`);

CREATE INDEX `uemail` ON `tmembers` (`uemail`);

CREATE INDEX `teamid` ON `project` (`teamid`);

CREATE UNIQUE INDEX `token` ON `invitations` (`token`);

CREATE INDEX `teamid` ON `invitations` (`teamid`);

CREATE INDEX `projectid` ON `user_tabs` (`projectid`);

CREATE INDEX `email` ON `user_tabs` (`email`);

ALTER TABLE `invitations` ADD FOREIGN KEY (`teamid`) REFERENCES `team` (`teamid`) ON DELETE CASCADE;

ALTER TABLE `project` ADD FOREIGN KEY (`teamid`) REFERENCES `team` (`teamid`) ON DELETE SET NULL;

ALTER TABLE `tmembers` ADD FOREIGN KEY (`teamid`) REFERENCES `team` (`teamid`) ON DELETE CASCADE;

ALTER TABLE `tmembers` ADD FOREIGN KEY (`uemail`) REFERENCES `users` (`email`) ON DELETE CASCADE;

ALTER TABLE `user_tabs` ADD FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE;

ALTER TABLE `user_tabs` ADD FOREIGN KEY (`projectid`) REFERENCES `project` (`id`) ON DELETE CASCADE;
