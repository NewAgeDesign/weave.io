-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: sql312.infinityfree.com
-- Generation Time: Mar 17, 2025 at 05:51 AM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `if0_38536489_weaveio`
--

-- --------------------------------------------------------

--
-- Table structure for table `invitations`
--

DROP TABLE IF EXISTS `invitations`;
CREATE TABLE `invitations` (
  `invid` int NOT NULL AUTO_INCREMENT COMMENT 'Unique ID for each invitation',
  `teamid` int NOT NULL COMMENT 'The group to which the invitation belongs',
  `token` varchar(64) NOT NULL COMMENT 'A unique invitation token for the user',
  `expat` datetime NOT NULL COMMENT 'Expiration date and time of the invitation',
  PRIMARY KEY (`invid`),
  UNIQUE KEY `token` (`token`),
  KEY `teamid` (`teamid`)
);

-- --------------------------------------------------------

--
-- Table structure for table `pmembers`
--

DROP TABLE IF EXISTS `pmembers`;
CREATE TABLE `pmembers` (
  `projectid` int NOT NULL AUTO_INCREMENT,
  `uemail` int NOT NULL,
  `assigned_date` int NOT NULL,
  PRIMARY KEY (`projectid`)
);

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
CREATE TABLE `project` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Unique identifier for each project',
  `name` varchar(255) NOT NULL COMMENT 'The name of the project (max 255 characters)',
  `description` text COMMENT 'Detailed description of the project (optional)',
  `teamid` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp for when the project was created',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp for when the project was last updated',
  PRIMARY KEY (`id`)
);

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`id`, `name`, `description`, `teamid`, `created_at`, `updated_at`) VALUES
(70, 'Second Attempt', '', 23, '2025-03-14 13:05:50', '2025-03-14 13:05:50'),
(69, 'Multicore', 'This is where we throw out random ideas for SaaS projects and implement them if we decide its viable, so feel free to share your ideas.', 23, '2025-03-14 08:13:48', '2025-03-14 08:13:48'),
(71, 'Dennis', '', 23, '2025-03-16 09:58:20', '2025-03-16 09:58:20');

-- --------------------------------------------------------

--
-- Table structure for table `team`
--

DROP TABLE IF EXISTS `team`;
CREATE TABLE `team` (
  `teamid` int NOT NULL AUTO_INCREMENT COMMENT 'This is the Team Identification.',
  `invite_link` varchar(200) DEFAULT NULL,
  `name` varchar(50) NOT NULL COMMENT 'This is the team name, It has a character Limit.',
  `descr` varchar(250) NOT NULL COMMENT 'This is the Team description, also limited character.',
  `owemail` varchar(50) NOT NULL COMMENT 'This is the owners email, Identifies whose the team admin/leader/supervisor.',
  PRIMARY KEY (`teamid`),
  UNIQUE KEY `invite_link` (`invite_link`)
);

--
-- Dumping data for table `team`
--

INSERT INTO `team` (`teamid`, `invite_link`, `name`, `descr`, `owemail`) VALUES
(23, '237908141e509dee', 'New Age Design TZ', 'This is my Companies organization.', 'tawinia6@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `tmembers`
--

DROP TABLE IF EXISTS `tmembers`;
CREATE TABLE `tmembers` (
  `teamid` int NOT NULL COMMENT 'Foreign Key referencing Teams.',
  `uemail` varchar(50) NOT NULL COMMENT 'Foreign Key referencing Users.',
  `role` varchar(20) NOT NULL COMMENT 'Title role of the member',
  `djoin` date NOT NULL COMMENT 'Date the member joined.'
);

--
-- Dumping data for table `tmembers`
--

INSERT INTO `tmembers` (`teamid`, `uemail`, `role`, `djoin`) VALUES
(8, 'tawinia6@gmail.com', 'member', '2025-03-13');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `email` varchar(50) NOT NULL COMMENT 'This is the email, it''s the primary key.',
  `fname` varchar(50) NOT NULL COMMENT 'This is the first name.',
  `lname` varchar(50) NOT NULL COMMENT 'This is the Last Name',
  `color` varchar(8) DEFAULT NULL,
  `plan` varchar(10) DEFAULT NULL,
  `psw` varchar(255) NOT NULL COMMENT 'This is the password.',
  `salt` varchar(255) NOT NULL COMMENT 'This is the salt',
  PRIMARY KEY (`email`)
);

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`email`, `fname`, `lname`, `color`, `plan`, `psw`, `salt`) VALUES
('tawinia6@gmail.com', 'Timothy', 'Awinia', '#D85509', 'Founder', '$2y$10$pAyf7cVPVrluqqXwWvq2seXFYTn9EGy0gnRZqO3oEt.diZKA.CUuq', '5b3e2fd2ac0d29beecc5eb216427f38c'),
('travisscott@gmail.com', 'Travis', 'Scott', '#D85509', 'AB Tester', '$2y$10$NFHJxcDwZlFDWvjnzBSlU.BWKUzVCYLyGCt5dyXbZVT7PJ0P8PyfW', 'c5659e47977c7f09b329eb21aeb5b8b4');

-- --------------------------------------------------------

--
-- Table structure for table `user_tabs`
--

DROP TABLE IF EXISTS `user_tabs`;
CREATE TABLE `user_tabs` (
  `email` varchar(255) DEFAULT NULL,
  `projectid` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `projectid` (`projectid`(250))
);

--
-- Dumping data for table `user_tabs`
--

INSERT INTO `user_tabs` (`email`, `projectid`, `created_at`) VALUES
('tawinia6@gmail.com', '71', '2025-03-17 05:13:09'),
('tawinia6@gmail.com', '69', '2025-03-16 19:44:24'),
('tawinia6@gmail.com', '70', '2025-03-16 19:44:25');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
