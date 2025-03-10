-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 29, 2024 at 06:13 PM
-- Server version: 8.0.31
-- PHP Version: 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `loginajax`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
CREATE TABLE IF NOT EXISTS `account` (
  `email` varchar(50) NOT NULL COMMENT 'This is the email section. It''s unique for every user.',
  `fname` varchar(25) NOT NULL COMMENT 'This is the user''s First Name.',
  `lname` varchar(25) NOT NULL COMMENT 'This is the user''s Last Name.',
  `psw` varchar(255) DEFAULT NULL COMMENT 'This column stores a bcrypt-hashed password with added salt and pepper.',
  `salt` varchar(20) DEFAULT NULL COMMENT 'This column stores a random salt key, the pepper key is classified.',
  `phone` varchar(20) DEFAULT NULL COMMENT 'This is the users phone number',
  PRIMARY KEY (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='This is the accounts section, will be updated mdogo mdogo.';

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`email`, `fname`, `lname`, `psw`, `salt`, `phone`) VALUES
('tawinia6@gmail.com', 'Timothy', 'Awinia', '$2y$10$3CO.5l4D/dNyQT79ryJdcu945DslbCPS5GyrKC9yWn7h7DHijWGnK', '80c70ce57d6a39c040a7', '');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
