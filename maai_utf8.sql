
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `announcement_reads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcement_reads` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `announcement_id` int unsigned NOT NULL,
  `user_id` int unsigned NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `announcement_reads_unique` (`announcement_id`,`user_id`),
  KEY `announcement_reads_user_lookup` (`user_id`,`read_at`),
  CONSTRAINT `announcement_reads_announcement_fk` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `announcement_reads_user_fk` FOREIGN KEY (`user_id`) REFERENCES `volunteers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `announcement_reads` WRITE;
/*!40000 ALTER TABLE `announcement_reads` DISABLE KEYS */;
INSERT INTO `announcement_reads` VALUES (1,3,3,'2026-05-21 07:42:51','2026-05-21 07:42:51');
/*!40000 ALTER TABLE `announcement_reads` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(220) NOT NULL,
  `body` text,
  `audience` enum('volunteers','ngos','all','admins','event_participants') NOT NULL DEFAULT 'all',
  `send_email` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `message` text NOT NULL,
  `announcement_type` enum('general','membership','event','camp','certificate','system') NOT NULL DEFAULT 'general',
  `priority` enum('info','important','urgent') NOT NULL DEFAULT 'info',
  `publish_at` timestamp NULL DEFAULT NULL,
  `expire_at` timestamp NULL DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `event_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `announcements_audience_created` (`audience`,`created_at`),
  KEY `announcements_created_by_fk` (`created_by`),
  KEY `announcements_event_lookup` (`event_id`,`audience`,`status`),
  CONSTRAINT `announcements_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `volunteers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,'YouthCon Registration Open','YouthCon registration is now open for Maai members and partner organisations.','all',0,NULL,'2026-05-19 13:44:45','2026-05-21 08:08:55','YouthCon registration is now open for Maai members and partner organisations.','event','important','2026-05-19 13:44:45',NULL,'archived',NULL),(2,'Project Bandhan Applications',NULL,'volunteers',0,NULL,'2026-05-19 13:46:22','2026-05-21 08:08:57','Applications for Project Bandhan are open. Interested volunteers can apply from the opportunities section.','general','info','2026-05-19 13:46:22',NULL,'archived',NULL),(3,'Membership Verification Update',NULL,'volunteers',0,NULL,'2026-05-19 13:46:22','2026-05-21 08:08:56','Membership verification updates will be sent through your notification center and email where applicable.','membership','important','2026-05-19 13:46:22',NULL,'archived',NULL);
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `actor_id` int unsigned DEFAULT NULL,
  `action` varchar(180) NOT NULL,
  `entity_type` varchar(120) NOT NULL,
  `entity_id` varchar(120) DEFAULT NULL,
  `metadata_json` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `audit_logs_actor_lookup` (`actor_id`,`created_at`),
  KEY `audit_logs_entity_lookup` (`entity_type`,`entity_id`,`created_at`),
  CONSTRAINT `audit_logs_actor_fk` FOREIGN KEY (`actor_id`) REFERENCES `volunteers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,7,'volunteer.membership.verified','volunteer','12','{}','2026-05-17 20:36:58'),(2,7,'PATCH','volunteers','12','{\"body\": {\"membershipStatus\": \"verified\"}, \"path\": \"/api/admin/volunteers/12/status\", \"params\": {\"id\": \"12\"}}','2026-05-17 20:36:58'),(3,7,'cms.team.delete','team_member','1','{}','2026-05-19 14:04:46'),(4,7,'cms.team.delete','team_member','2','{}','2026-05-19 14:04:49'),(5,7,'cms.team.delete','team_member','3','{}','2026-05-20 03:05:58'),(6,7,'cms.team.delete','team_member','4','{}','2026-05-20 03:06:00'),(7,7,'cms.mentors.delete','mentor','1','{}','2026-05-20 03:10:07'),(8,7,'cms.mentors.delete','mentor','2','{}','2026-05-20 03:10:09'),(9,7,'cms.initiatives.delete','initiative','1','{}','2026-05-20 03:10:13'),(10,7,'cms.initiatives.delete','initiative','2','{}','2026-05-20 03:10:15'),(11,7,'cms.initiatives.delete','initiative','3','{}','2026-05-20 03:10:17'),(12,7,'cms.reels.delete','reel','1','{}','2026-05-20 03:10:21'),(13,7,'cms.reels.delete','reel','2','{}','2026-05-20 03:10:22'),(14,7,'cms.reels.delete','reel','3','{}','2026-05-20 03:10:24'),(15,7,'cms.id-templates.create','id_card_template','2','{\"status\": \"draft\", \"isDefault\": false}','2026-05-20 12:48:15'),(16,7,'cms.id-templates.publish','id_card_template','2','{}','2026-05-20 12:48:21'),(17,7,'cms.id-templates.archive','id_card_template','1','{}','2026-05-20 12:48:24'),(18,7,'volunteer.payment.paid','volunteer','13','{}','2026-05-20 12:49:45'),(19,7,'PATCH','volunteers','13','{\"body\": {\"paymentStatus\": \"paid\"}, \"path\": \"/api/admin/volunteers/13/payment-status\", \"params\": {\"id\": \"13\"}}','2026-05-20 12:49:45'),(20,7,'id_cards.issue','volunteer_id','11','{\"templateId\": 2, \"volunteerId\": \"13\"}','2026-05-20 12:49:51'),(21,7,'volunteer.membership.verified','volunteer','13','{}','2026-05-20 12:49:51'),(22,7,'PATCH','volunteers','13','{\"body\": {\"membershipStatus\": \"verified\"}, \"path\": \"/api/admin/volunteers/13/status\", \"params\": {\"id\": \"13\"}}','2026-05-20 12:49:51'),(23,13,'certificates.claim','event_certificate','25','{\"eventId\": null}','2026-05-20 12:50:08'),(24,7,'id_cards.issue','volunteer_id','12','{\"templateId\": 2, \"volunteerId\": \"14\"}','2026-05-20 13:22:27'),(25,7,'volunteer.membership.verified','volunteer','14','{}','2026-05-20 13:22:27'),(26,7,'PATCH','volunteers','14','{\"body\": {\"membershipStatus\": \"verified\"}, \"path\": \"/api/admin/volunteers/14/status\", \"params\": {\"id\": \"14\"}}','2026-05-20 13:22:27'),(27,7,'cms.certificate-templates.edit','certificate_template','1','{\"status\": \"published\", \"isDefault\": true}','2026-05-20 14:10:55'),(28,7,'cms.certificate-templates.publish','certificate_template','1','{}','2026-05-20 14:10:55'),(29,7,'cms.certificate-templates.default','certificate_template','1','{}','2026-05-20 14:10:55'),(30,7,'cms.id-templates.edit','id_card_template','2','{\"status\": \"published\", \"isDefault\": false}','2026-05-20 14:13:11'),(31,7,'cms.id-templates.publish','id_card_template','2','{}','2026-05-20 14:13:11'),(32,7,'cms.id-templates.edit','id_card_template','2','{\"status\": \"published\", \"isDefault\": true}','2026-05-20 14:13:18'),(33,7,'cms.id-templates.publish','id_card_template','2','{}','2026-05-20 14:13:18'),(34,7,'cms.id-templates.edit','id_card_template','2','{\"status\": \"published\", \"isDefault\": true}','2026-05-20 17:33:32'),(35,7,'cms.id-templates.publish','id_card_template','2','{}','2026-05-20 17:33:32'),(36,7,'cms.id-templates.delete','id_card_template','1','{}','2026-05-21 06:09:24'),(37,7,'cms.id-templates.delete','id_card_template','1','{}','2026-05-21 06:09:28'),(38,7,'cms.certificate-templates.edit','certificate_template','1','{\"status\": \"published\", \"isDefault\": true}','2026-05-21 06:09:43'),(39,7,'cms.certificate-templates.publish','certificate_template','1','{}','2026-05-21 06:09:43'),(40,7,'cms.certificate-templates.default','certificate_template','1','{}','2026-05-21 06:09:43'),(41,7,'cms.id-templates.edit','id_card_template','2','{\"status\": \"published\", \"isDefault\": true}','2026-05-21 06:36:13'),(42,7,'cms.id-templates.publish','id_card_template','2','{}','2026-05-21 06:36:13'),(43,7,'cms.id-templates.edit','id_card_template','2','{\"status\": \"published\", \"isDefault\": true}','2026-05-21 06:36:53'),(44,7,'cms.id-templates.publish','id_card_template','2','{}','2026-05-21 06:36:53'),(45,7,'cms.id-templates.edit','id_card_template','2','{\"status\": \"published\", \"isDefault\": true}','2026-05-21 06:39:09'),(46,7,'cms.id-templates.publish','id_card_template','2','{}','2026-05-21 06:39:09'),(47,7,'cms.id-templates.edit','id_card_template','2','{\"status\": \"published\", \"isDefault\": true}','2026-05-21 06:43:17'),(48,7,'cms.id-templates.publish','id_card_template','2','{}','2026-05-21 06:43:17'),(49,7,'volunteer.payment.paid','volunteer','13','{}','2026-05-21 07:14:13'),(50,7,'PATCH','volunteers','13','{\"body\": {\"paymentStatus\": \"paid\"}, \"path\": \"/api/admin/volunteers/13/payment-status\", \"params\": {\"id\": \"13\"}}','2026-05-21 07:14:13'),(51,7,'announcement.archive','announcement','1','{}','2026-05-21 08:08:55'),(52,7,'DELETE','announcements','1','{\"body\": {}, \"path\": \"/api/admin/announcements/1\", \"params\": {\"id\": \"1\"}}','2026-05-21 08:08:55'),(53,7,'announcement.archive','announcement','3','{}','2026-05-21 08:08:56'),(54,7,'DELETE','announcements','3','{\"body\": {}, \"path\": \"/api/admin/announcements/3\", \"params\": {\"id\": \"3\"}}','2026-05-21 08:08:56'),(55,7,'announcement.archive','announcement','2','{}','2026-05-21 08:08:57'),(56,7,'DELETE','announcements','2','{\"body\": {}, \"path\": \"/api/admin/announcements/2\", \"params\": {\"id\": \"2\"}}','2026-05-21 08:08:57'),(57,7,'events.create','event','5','{\"status\": \"upcoming\", \"eventType\": \"camp\"}','2026-05-21 09:47:37'),(58,7,'events.publish','event','5','{}','2026-05-21 09:47:37'),(59,7,'events.create','event','6','{\"status\": \"upcoming\", \"eventType\": \"camp\"}','2026-05-21 09:47:42'),(60,7,'events.publish','event','6','{}','2026-05-21 09:47:42'),(61,7,'events.create','event','7','{\"status\": \"upcoming\", \"eventType\": \"camp\"}','2026-05-21 09:47:50'),(62,7,'events.publish','event','7','{}','2026-05-21 09:47:50'),(63,7,'events.create','event','8','{\"status\": \"upcoming\", \"eventType\": \"camp\"}','2026-05-21 09:47:50'),(64,7,'events.publish','event','8','{}','2026-05-21 09:47:50'),(65,7,'events.create','event','9','{\"status\": \"upcoming\", \"eventType\": \"camp\"}','2026-05-21 09:47:50'),(66,7,'events.publish','event','9','{}','2026-05-21 09:47:50'),(67,7,'events.create','event','10','{\"status\": \"upcoming\", \"eventType\": \"camp\"}','2026-05-21 09:51:53'),(68,7,'events.publish','event','10','{}','2026-05-21 09:51:53'),(69,7,'events.create','event','11','{\"status\": \"upcoming\", \"eventType\": \"camp\"}','2026-05-21 09:52:17'),(70,7,'events.publish','event','11','{}','2026-05-21 09:52:17'),(71,7,'events.create','event','12','{\"status\": \"upcoming\", \"eventType\": \"camp\"}','2026-05-21 09:52:31'),(72,7,'events.publish','event','12','{}','2026-05-21 09:52:31'),(73,7,'events.create','event','13','{\"status\": \"upcoming\", \"eventType\": \"camp\"}','2026-05-21 10:10:40'),(74,7,'events.publish','event','13','{}','2026-05-21 10:10:40'),(75,7,'events.create','event','14','{\"status\": \"upcoming\", \"eventType\": \"camp\"}','2026-05-21 10:11:54'),(76,7,'events.publish','event','14','{}','2026-05-21 10:11:54'),(77,7,'events.participation','event','14','{\"participantId\": \"94\", \"participationStatus\": \"approved\"}','2026-05-21 10:22:02');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `camp_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `camp_registrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(180) NOT NULL,
  `email` varchar(180) NOT NULL,
  `whatsapp` varchar(40) NOT NULL,
  `organization_name` varchar(180) NOT NULL,
  `organization_type` varchar(120) NOT NULL,
  `website` text,
  `camp_title` varchar(220) NOT NULL,
  `camp_type` varchar(140) NOT NULL,
  `location` varchar(220) NOT NULL,
  `beneficiaries` varchar(120) NOT NULL,
  `proposed_date` date NOT NULL,
  `description` text NOT NULL,
  `additional_notes` text,
  `status` enum('pending','reviewed','approved','rejected','contacted') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `camp_registrations_admin_sort` (`status`,`proposed_date`,`created_at`),
  KEY `camp_registrations_search` (`full_name`,`organization_name`,`camp_title`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `camp_registrations` WRITE;
/*!40000 ALTER TABLE `camp_registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `camp_registrations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `camp_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `camp_requests` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `volunteer_id` int unsigned DEFAULT NULL,
  `camp_name` varchar(180) NOT NULL,
  `location` varchar(220) NOT NULL,
  `camp_type` enum('health','awareness','screening','research','education','community','other') NOT NULL DEFAULT 'other',
  `beneficiaries` varchar(120) NOT NULL,
  `description` text NOT NULL,
  `status` enum('submitted','under_review','approved','rejected','completed') NOT NULL DEFAULT 'submitted',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ngo_id` int unsigned DEFAULT NULL,
  `title` varchar(220) DEFAULT NULL,
  `city` varchar(120) DEFAULT NULL,
  `state` varchar(120) DEFAULT NULL,
  `expected_beneficiaries` int DEFAULT NULL,
  `volunteers_required` int DEFAULT NULL,
  `resources_needed` text,
  `proposed_date` date DEFAULT NULL,
  `review_notes` text,
  `reviewed_by` int unsigned DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `camp_requests_volunteer_lookup` (`volunteer_id`,`status`,`created_at`),
  KEY `camp_requests_ngo_lookup` (`ngo_id`,`status`,`created_at`),
  CONSTRAINT `camp_requests_volunteer_fk` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `camp_requests` WRITE;
/*!40000 ALTER TABLE `camp_requests` DISABLE KEYS */;
INSERT INTO `camp_requests` VALUES (1,NULL,'Community Health Camp','Community Center','health','150','Primary health awareness and screening camp.','submitted','2026-05-19 10:33:00',1,'Community Health Camp','Delhi','Delhi',150,12,'Basic screening desks, volunteer support','2026-05-26',NULL,NULL,NULL,'2026-05-19 10:33:00'),(2,NULL,'Awareness Camp','School Auditorium','awareness','200','Public awareness session for preventive healthcare.','under_review','2026-05-19 10:33:00',1,'Awareness Camp','Delhi','Delhi',200,8,'Projector, registration desk','2026-05-31',NULL,NULL,NULL,'2026-05-19 10:33:00');
/*!40000 ALTER TABLE `camp_requests` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `careers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `careers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(180) NOT NULL,
  `department` varchar(160) DEFAULT NULL,
  `type` varchar(120) DEFAULT NULL,
  `employmentType` varchar(120) DEFAULT NULL,
  `location` varchar(180) DEFAULT NULL,
  `short_description` text,
  `description` text,
  `application_deadline` date DEFAULT NULL,
  `bannerUrl` text,
  `category` varchar(120) DEFAULT NULL,
  `apply_url` text,
  `applyLink` text,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `slug` varchar(220) DEFAULT NULL,
  `role_type` enum('volunteer','internship','leadership','research','operations','design','it','community','other') NOT NULL DEFAULT 'volunteer',
  `requirements` text,
  `responsibilities` text,
  `image_url` text,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
  `order_index` int NOT NULL DEFAULT '0',
  `visibility` enum('public','members_only','internal') NOT NULL DEFAULT 'public',
  `application_form_url` text,
  `max_positions` int DEFAULT NULL,
  `chapter` varchar(180) DEFAULT NULL,
  `certificate_enabled` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `careers_public_sort` (`active`,`featured`,`display_order`,`created_at`),
  KEY `careers_status_featured_order` (`status`,`visibility`,`featured`,`order_index`,`created_at`),
  KEY `careers_slug_lookup` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `careers` WRITE;
/*!40000 ALTER TABLE `careers` DISABLE KEYS */;
INSERT INTO `careers` VALUES (1,'Research Volunteer','Research','research','research','Remote / Hybrid','Support field studies, data collection, and community health research documentation.','Support field studies, data collection, and community health research documentation.',NULL,'https://placehold.co/900x600?text=Research+Volunteer',NULL,NULL,NULL,1,1,1,1,'2026-05-19 10:32:59','2026-05-19 10:32:59','research-volunteer','research','Interest in public health research and responsible documentation.','Coordinate research notes, compile observations, and support impact reports.','https://placehold.co/900x600?text=Research+Volunteer','published',1,'public',NULL,NULL,NULL,0),(2,'Design Team Member','Design','design','design','Remote','Create campaign visuals, awareness material, and volunteer communication assets.','Create campaign visuals, awareness material, and volunteer communication assets.',NULL,'https://placehold.co/900x600?text=Design+Team+Member',NULL,NULL,NULL,0,1,1,2,'2026-05-19 10:32:59','2026-05-19 10:32:59','design-team-member','design','Comfort with design tools and clear visual communication.','Prepare posters, social graphics, and campaign templates.','https://placehold.co/900x600?text=Design+Team+Member','published',2,'public',NULL,NULL,NULL,0),(3,'Community Outreach Volunteer','Operations','community','community','Field / Hybrid','Help Maai connect with communities, volunteers, and local partners.','Help Maai connect with communities, volunteers, and local partners.',NULL,'https://placehold.co/900x600?text=Community+Outreach',NULL,NULL,NULL,0,1,1,3,'2026-05-19 10:32:59','2026-05-19 10:32:59','community-outreach-volunteer','community','Good communication skills and willingness to coordinate on ground.','Support outreach calls, camp coordination, and beneficiary communication.','https://placehold.co/900x600?text=Community+Outreach','published',3,'public',NULL,NULL,NULL,0),(4,'Operations Coordinator','Operations','operations','operations','Hybrid','Coordinate logistics, schedules, and field readiness for Maai programs.','Coordinate logistics, schedules, and field readiness for Maai programs.',NULL,'https://placehold.co/900x600?text=Operations+Coordinator',NULL,NULL,NULL,0,1,1,4,'2026-05-19 10:32:59','2026-05-19 10:32:59','operations-coordinator','operations','Organized working style and ability to track tasks across teams.','Maintain checklists, coordinate supplies, and update program leads.','https://placehold.co/900x600?text=Operations+Coordinator','published',4,'public',NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `careers` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `certificate_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificate_templates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `certificate_type` enum('membership','event','participation','leadership','recognition','volunteer_hours','other') NOT NULL DEFAULT 'other',
  `background_url` text,
  `logo_url` text,
  `header_text` varchar(220) DEFAULT NULL,
  `body_template` text,
  `footer_text` varchar(500) DEFAULT NULL,
  `signature_name` varchar(180) DEFAULT NULL,
  `signature_designation` varchar(180) DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `field_config` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `certificate_templates_lookup` (`certificate_type`,`status`,`is_default`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `certificate_templates` WRITE;
/*!40000 ALTER TABLE `certificate_templates` DISABLE KEYS */;
INSERT INTO `certificate_templates` VALUES (1,'Membership Certificate','membership','https://placehold.co/1200x850/e0f2fe/0f172a?text=Membership%20Certificate','https://placehold.co/160x160/ffffff/0891b2?text=Maai','Maai Membership Certificate','This certifies that {{full_name}} is a verified member of Maai organisation. Membership: {{membership_number}} Certificate ID: {{certificate_id}}','Issued by Maai organisation.','Maai Team','Membership Cell','published',1,'2026-05-19 10:33:01','2026-05-21 06:09:43','{\"qr\": {\"x\": 947, \"y\": 529, \"side\": \"front\", \"type\": \"qr\", \"color\": \"#000000\", \"width\": 145, \"height\": 135, \"enabled\": true, \"fontSize\": 18}, \"role\": {\"x\": 78, \"y\": 711, \"side\": \"front\", \"color\": \"#000000\", \"width\": 300, \"height\": 54, \"enabled\": false, \"fontSize\": 20}, \"status\": {\"x\": 133, \"y\": 243, \"side\": \"front\", \"color\": \"#000000\", \"width\": 260, \"height\": 44, \"enabled\": true, \"fontSize\": 28}, \"barcode\": {\"x\": 558, \"y\": 637, \"side\": \"front\", \"type\": \"barcode\", \"color\": \"#000000\", \"width\": 260, \"height\": 44, \"enabled\": false, \"fontSize\": 18}, \"college\": {\"x\": 284, \"y\": 642, \"side\": \"front\", \"color\": \"#000000\", \"width\": 420, \"height\": 38, \"enabled\": true, \"fontSize\": 22}, \"full_name\": {\"x\": 133, \"y\": 421, \"side\": \"front\", \"color\": \"#000000\", \"width\": 917, \"height\": 59, \"enabled\": true, \"fontSize\": 26}, \"issue_date\": {\"x\": 100, \"y\": 635, \"side\": \"front\", \"color\": \"#000000\", \"width\": 260, \"height\": 34, \"enabled\": false, \"fontSize\": 18}, \"membership_number\": {\"x\": 185, \"y\": 578, \"side\": \"front\", \"color\": \"#000000\", \"width\": 360, \"height\": 38, \"enabled\": true, \"fontSize\": 22}, \"verification_code\": {\"x\": 200, \"y\": 582, \"side\": \"front\", \"color\": \"#000000\", \"width\": 360, \"height\": 34, \"enabled\": false, \"fontSize\": 20}}'),(2,'Event Participation','event','https://placehold.co/1200x850/e0f2fe/0f172a?text=Event%20Participation','https://placehold.co/160x160/ffffff/0891b2?text=Maai','Certificate of Participation','This certifies that {{full_name}} participated in {{event_name}} on {{date}}.\nCertificate ID: {{certificate_id}}','Thank you for serving with Maai.','Maai Events','Operations','published',1,'2026-05-19 10:33:01','2026-05-19 10:33:01',NULL),(3,'Recognition Certificate','recognition','https://placehold.co/1200x850/e0f2fe/0f172a?text=Recognition%20Certificate','https://placehold.co/160x160/ffffff/0891b2?text=Maai','Certificate of Recognition','This certificate recognizes {{full_name}} for meaningful contribution to {{event_name}}.\nCertificate ID: {{certificate_id}}','Presented by Maai organisation.','Maai Leadership','Recognition Committee','published',1,'2026-05-19 10:33:01','2026-05-19 10:33:01',NULL);
/*!40000 ALTER TABLE `certificate_templates` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `cms_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cms_entries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `module` varchar(80) NOT NULL,
  `title` varchar(220) NOT NULL,
  `slug` varchar(240) NOT NULL,
  `description` text,
  `image_url` text,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `order_index` int NOT NULL DEFAULT '0',
  `tags_json` json DEFAULT NULL,
  `metadata_json` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cms_entries_module_slug_unique` (`module`,`slug`),
  KEY `cms_entries_module_status_order` (`module`,`status`,`order_index`),
  KEY `cms_entries_updated_lookup` (`module`,`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `cms_entries` WRITE;
/*!40000 ALTER TABLE `cms_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_entries` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `email_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `template_id` int unsigned DEFAULT NULL,
  `email_type` varchar(80) NOT NULL,
  `recipient_email` varchar(180) NOT NULL,
  `recipient_type` varchar(80) DEFAULT NULL,
  `recipient_id` int unsigned DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text,
  `status` enum('sent','failed','queued') NOT NULL DEFAULT 'queued',
  `error_message` text,
  `metadata_json` json DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `email_logs_type_status_created` (`email_type`,`status`,`created_at`),
  KEY `email_logs_recipient_lookup` (`recipient_type`,`recipient_id`,`created_at`),
  KEY `email_logs_template_fk` (`template_id`),
  CONSTRAINT `email_logs_template_fk` FOREIGN KEY (`template_id`) REFERENCES `email_templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `email_logs` WRITE;
/*!40000 ALTER TABLE `email_logs` DISABLE KEYS */;
INSERT INTO `email_logs` VALUES (1,NULL,'membership_verified','volunteer2@maai.org',NULL,NULL,'Your Maai membership is verified',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-20 12:49:51'),(2,NULL,'membership_verified','volunteer3@gmail.com',NULL,NULL,'Your Maai membership is verified',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-20 13:22:27'),(3,NULL,'event_created','volunteer@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:37'),(4,NULL,'event_created','volunteer3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:37'),(5,NULL,'event_created','test@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:37'),(6,NULL,'event_created','test3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:37'),(7,NULL,'event_created','volunteer2@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:37'),(8,NULL,'event_created','volunteer@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:42'),(9,NULL,'event_created','volunteer2@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:42'),(10,NULL,'event_created','volunteer3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:42'),(11,NULL,'event_created','test3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:42'),(12,NULL,'event_created','test@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:42'),(13,NULL,'event_created','volunteer@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(14,NULL,'event_created','volunteer2@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(15,NULL,'event_created','test3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(16,NULL,'event_created','volunteer3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(17,NULL,'event_created','test@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(18,NULL,'event_created','volunteer@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(19,NULL,'event_created','volunteer2@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(20,NULL,'event_created','volunteer3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(21,NULL,'event_created','test3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(22,NULL,'event_created','test@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(23,NULL,'event_created','volunteer@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(24,NULL,'event_created','volunteer2@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(25,NULL,'event_created','volunteer3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(26,NULL,'event_created','test3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(27,NULL,'event_created','test@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:47:50'),(28,NULL,'event_created','volunteer@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:51:53'),(29,NULL,'event_created','volunteer2@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:51:53'),(30,NULL,'event_created','volunteer3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:51:53'),(31,NULL,'event_created','test3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:51:53'),(32,NULL,'event_created','test@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:51:53'),(33,NULL,'event_created','volunteer@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:52:17'),(34,NULL,'event_created','volunteer2@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:52:17'),(35,NULL,'event_created','test3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:52:17'),(36,NULL,'event_created','volunteer3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:52:17'),(37,NULL,'event_created','test@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:52:17'),(38,NULL,'event_created','volunteer@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:52:31'),(39,NULL,'event_created','volunteer2@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:52:31'),(40,NULL,'event_created','volunteer3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:52:31'),(41,NULL,'event_created','test@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:52:31'),(42,NULL,'event_created','test3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 09:52:31'),(43,NULL,'event_created','volunteer@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 10:10:40'),(44,NULL,'event_created','volunteer2@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 10:10:40'),(45,NULL,'event_created','volunteer3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 10:10:40'),(46,NULL,'event_created','test@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 10:10:40'),(47,NULL,'event_created','test3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 10:10:40'),(48,NULL,'event_created','volunteer@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 10:11:54'),(49,NULL,'event_created','volunteer2@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 10:11:54'),(50,NULL,'event_created','volunteer3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 10:11:54'),(51,NULL,'event_created','test3@gmail.com',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 10:11:54'),(52,NULL,'event_created','test@maai.org',NULL,NULL,'New Maai event: Project Vrudhar',NULL,'queued','SMTP is not configured.',NULL,NULL,'2026-05-21 10:11:54');
/*!40000 ALTER TABLE `email_logs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `email_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_templates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `email_type` enum('membership_verified','membership_rejected','membership_under_review','certificate_issued','certificate_revoked','camp_approved','camp_rejected','ngo_verified','announcement','event_created') NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body_template` text NOT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `email_templates_type_status_updated` (`email_type`,`status`,`updated_at`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `email_templates` WRITE;
/*!40000 ALTER TABLE `email_templates` DISABLE KEYS */;
INSERT INTO `email_templates` VALUES (1,'Membership Verified','membership_verified','Your Maai membership is verified','Hello {{full_name}},\n\nYour Maai membership has been verified.\n\nMembership status: {{membership_status}}\n\nYou can now access your membership benefits and certificate from your dashboard.','published','2026-05-19 10:32:59','2026-05-19 10:32:59',0),(2,'Membership Rejected','membership_rejected','Update on your Maai membership','Hello {{full_name}},\n\nYour Maai membership request was not approved at this time.\n\nMembership status: {{membership_status}}\n\nYou may contact Maai organisation for more details.','published','2026-05-19 10:32:59','2026-05-19 10:32:59',0),(3,'Certificate Issued','certificate_issued','{{certificate_name}} is ready','Hello {{full_name}},\n\nYour {{certificate_name}} for {{event_name}} has been issued and is ready to claim from your Maai dashboard.','published','2026-05-19 10:32:59','2026-05-19 10:32:59',0),(4,'Certificate Revoked','certificate_revoked','{{certificate_name}} has been revoked','Hello {{full_name}},\n\nYour {{certificate_name}} for {{event_name}} has been revoked by Maai organisation.','published','2026-05-19 10:32:59','2026-05-19 10:32:59',0),(5,'Camp Approved','camp_approved','Your camp request is approved','Hello {{full_name}},\n\nYour camp request for {{event_name}} has been approved by Maai organisation.','published','2026-05-19 10:32:59','2026-05-19 10:32:59',0),(6,'Camp Rejected','camp_rejected','Update on your camp request','Hello {{full_name}},\n\nYour camp request for {{event_name}} was not approved at this time.','published','2026-05-19 10:32:59','2026-05-19 10:32:59',0),(7,'NGO Verified','ngo_verified','Your NGO profile is verified','Hello {{full_name}},\n\nYour NGO profile has been verified by Maai organisation.\n\nMembership status: {{membership_status}}','published','2026-05-19 10:32:59','2026-05-19 10:32:59',0),(8,'Announcement','announcement','Maai announcement: {{event_name}}','Hello {{full_name}},\n\nMaai organisation has a new announcement about {{event_name}}.','published','2026-05-19 10:32:59','2026-05-19 10:32:59',0),(9,'Membership Under Review','membership_under_review','Your Maai membership is under review','Hello {{full_name}},\n\nYour Maai membership request is under review.\n\nMembership status: {{membership_status}}','published','2026-05-19 13:41:59','2026-05-19 13:41:59',1),(10,'Event Created','event_created','New Maai event: {{event_name}}','Hello {{full_name}},\n\nA new Maai event has been created: {{event_name}}.','published','2026-05-19 13:42:00','2026-05-19 13:42:00',1);
/*!40000 ALTER TABLE `email_templates` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `event_certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_certificates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `event_id` int unsigned DEFAULT NULL,
  `volunteer_id` int unsigned NOT NULL,
  `certificate_type` varchar(120) NOT NULL DEFAULT 'event',
  `status` enum('eligible','claimed','revoked') NOT NULL DEFAULT 'eligible',
  `verification_code` varchar(40) NOT NULL,
  `issued_by` int unsigned DEFAULT NULL,
  `claimed_at` timestamp NULL DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_certificates_code_unique` (`verification_code`),
  UNIQUE KEY `event_certificates_unique` (`event_id`,`volunteer_id`,`certificate_type`),
  KEY `event_certificates_volunteer_lookup` (`volunteer_id`,`status`),
  CONSTRAINT `event_certificates_event_fk` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_certificates_volunteer_fk` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `event_certificates` WRITE;
/*!40000 ALTER TABLE `event_certificates` DISABLE KEYS */;
INSERT INTO `event_certificates` VALUES (1,1,1,'participation','claimed','MAAI-EVT-0001',NULL,'2026-05-17 18:24:22','2026-05-17 12:53:17','2026-05-17 12:53:17'),(9,NULL,12,'membership','claimed','MAAI-MEM-00012',7,'2026-05-17 20:37:17','2026-05-17 20:36:58','2026-05-17 20:36:58'),(14,1,2,'event','eligible','MAAI-EVT-0002',NULL,NULL,'2026-05-19 10:33:01','2026-05-19 10:33:01'),(15,1,3,'event','eligible','MAAI-EVT-0003',NULL,NULL,'2026-05-19 10:33:01','2026-05-19 10:33:01'),(25,NULL,13,'membership','claimed','MAAI-MEM-00013',7,'2026-05-20 12:50:08','2026-05-20 12:49:51','2026-05-20 12:49:51'),(29,NULL,14,'membership','eligible','MAAI-MEM-00014',7,NULL,'2026-05-20 13:22:27','2026-05-20 13:22:27');
/*!40000 ALTER TABLE `event_certificates` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `event_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_participants` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `event_id` int unsigned NOT NULL,
  `volunteer_id` int unsigned NOT NULL,
  `role` varchar(140) DEFAULT NULL,
  `attendance_status` enum('registered','attended','absent') NOT NULL DEFAULT 'registered',
  `hours_contributed` decimal(6,2) NOT NULL DEFAULT '0.00',
  `added_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `joined_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `participation_status` enum('pending','approved','rejected','registered','participated','completed','cancelled') NOT NULL DEFAULT 'registered',
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_participants_unique` (`event_id`,`volunteer_id`),
  KEY `event_participants_event_lookup` (`event_id`,`attendance_status`),
  KEY `event_participants_volunteer_lookup` (`volunteer_id`),
  KEY `event_participants_participation_lookup` (`event_id`,`participation_status`),
  CONSTRAINT `event_participants_event_fk` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_participants_volunteer_fk` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `event_participants` WRITE;
/*!40000 ALTER TABLE `event_participants` DISABLE KEYS */;
INSERT INTO `event_participants` VALUES (1,1,1,'Volunteer','attended',4.00,NULL,'2026-05-17 12:42:09','2026-05-19 10:33:01','participated',NULL),(2,1,2,'Volunteer','attended',4.00,NULL,'2026-05-17 12:42:09','2026-05-19 10:33:01','participated',NULL),(9,1,3,'Volunteer','attended',4.00,NULL,'2026-05-17 15:13:04','2026-05-19 10:33:01','participated',NULL),(94,14,12,'Volunteer','registered',0.00,12,'2026-05-21 10:16:45','2026-05-21 10:16:45','approved',NULL);
/*!40000 ALTER TABLE `event_participants` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(220) NOT NULL,
  `description` text,
  `event_type` enum('camp','workshop','awareness','conference','research','meeting','training','other') NOT NULL DEFAULT 'other',
  `event_date` date DEFAULT NULL,
  `location` varchar(220) DEFAULT NULL,
  `certificate_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `certificate_template_id` varchar(120) DEFAULT NULL,
  `created_by` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `slug` varchar(240) DEFAULT NULL,
  `banner_url` text,
  `start_datetime` datetime DEFAULT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `visibility` enum('public','members_only','internal') NOT NULL DEFAULT 'members_only',
  `status` enum('draft','published','upcoming','ongoing','completed','cancelled','archived') NOT NULL DEFAULT 'draft',
  `initiative_id` int unsigned DEFAULT NULL,
  `qr_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `ngo_id` int unsigned DEFAULT NULL,
  `camp_request_id` int unsigned DEFAULT NULL,
  `public_registration` tinyint(1) NOT NULL DEFAULT '0',
  `feedback_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `whatsapp_group_link` text,
  `registration_deadline` datetime DEFAULT NULL,
  `volunteer_instructions` text,
  `required_skills` text,
  `coordinator_contact` varchar(180) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `camp_type` varchar(100) DEFAULT NULL,
  `whatsapp_link` text,
  `max_volunteers` int DEFAULT NULL,
  `certificate_eligible` tinyint(1) NOT NULL DEFAULT '0',
  `banner` text,
  PRIMARY KEY (`id`),
  KEY `events_date_lookup` (`event_date`,`certificate_enabled`),
  KEY `events_created_by_lookup` (`created_by`),
  KEY `events_status_datetime_lookup` (`status`,`visibility`,`start_datetime`),
  KEY `events_slug_lookup` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Community Health Camp','Demo event for event-based volunteer certificate eligibility.','camp','2026-05-17','Community Outreach Center',1,'default-event',NULL,'2026-05-17 12:42:09','2026-05-21 10:05:24','community-health-camp',NULL,'2026-05-17 00:00:00',NULL,NULL,'members_only','draft',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'camp','camp',NULL,NULL,0,NULL),(2,'Research Workshop','A practical orientation for research volunteers and documentation teams.','workshop',NULL,'Maai Learning Hub',0,NULL,NULL,'2026-05-19 10:33:01','2026-05-21 10:05:24','research-workshop',NULL,'2026-05-21 16:03:01','2026-05-21 18:03:01',NULL,'members_only','published',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'workshop','workshop',NULL,NULL,0,NULL),(3,'YouthCon Orientation','Orientation for YouthCon volunteers, coordinators, and speakers.','conference',NULL,'Online',0,NULL,NULL,'2026-05-19 10:33:01','2026-05-21 10:05:24','youthcon-orientation',NULL,'2026-05-22 16:03:01','2026-05-22 18:03:01',NULL,'members_only','published',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'conference','conference',NULL,NULL,0,NULL),(4,'Project Suraksha Drive','Community safety and public health awareness drive.','camp',NULL,'Maai Community Center',1,NULL,NULL,'2026-05-19 13:46:22','2026-05-21 10:05:24','project-suraksha-drive',NULL,'2026-05-15 19:16:22','2026-05-15 21:16:22',NULL,'members_only','published',NULL,0,NULL,NULL,0,0,NULL,NULL,NULL,NULL,NULL,'camp','camp',NULL,NULL,0,NULL),(5,'Project Vrudhar','','camp','2026-05-24','Thane',1,NULL,7,'2026-05-21 09:47:37','2026-05-21 10:05:24','project-vrudhar',NULL,'2026-05-24 10:00:00','2026-05-24 15:15:00',10,'members_only','upcoming',NULL,0,NULL,NULL,0,0,'https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja','2026-05-22 23:59:00','Please come 30 mins before camp starts for breifing','',NULL,'camp','camp','https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja',10,0,NULL),(6,'Project Vrudhar','','camp','2026-05-24','Thane',1,NULL,7,'2026-05-21 09:47:42','2026-05-21 10:05:24','project-vrudhar',NULL,'2026-05-24 10:00:00','2026-05-24 15:15:00',10,'members_only','upcoming',NULL,0,NULL,NULL,0,0,'https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja','2026-05-22 23:59:00','Please come 30 mins before camp starts for breifing','',NULL,'camp','camp','https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja',10,0,NULL),(7,'Project Vrudhar','','camp','2026-05-24','Thane',1,NULL,7,'2026-05-21 09:47:50','2026-05-21 10:05:24','project-vrudhar',NULL,'2026-05-24 10:00:00','2026-05-24 15:15:00',10,'members_only','upcoming',NULL,0,NULL,NULL,0,0,'https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja','2026-05-22 23:59:00','Please come 30 mins before camp starts for breifing','some skills',NULL,'camp','camp','https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja',10,0,NULL),(8,'Project Vrudhar','','camp','2026-05-24','Thane',1,NULL,7,'2026-05-21 09:47:50','2026-05-21 10:05:24','project-vrudhar',NULL,'2026-05-24 10:00:00','2026-05-24 15:15:00',10,'members_only','upcoming',NULL,0,NULL,NULL,0,0,'https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja','2026-05-22 23:59:00','Please come 30 mins before camp starts for breifing','some skills',NULL,'camp','camp','https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja',10,0,NULL),(9,'Project Vrudhar','','camp','2026-05-24','Thane',1,NULL,7,'2026-05-21 09:47:50','2026-05-21 10:05:24','project-vrudhar',NULL,'2026-05-24 10:00:00','2026-05-24 15:15:00',10,'members_only','upcoming',NULL,0,NULL,NULL,0,0,'https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja','2026-05-22 23:59:00','Please come 30 mins before camp starts for breifing','some skills',NULL,'camp','camp','https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja',10,0,NULL),(10,'Project Vrudhar','Project Vrudhar - old age camp','camp','2026-05-21','Thane',1,NULL,7,'2026-05-21 09:51:53','2026-05-21 10:05:24','project-vrudhar',NULL,'2026-05-21 09:00:00','2026-05-21 15:00:00',12,'members_only','upcoming',NULL,0,NULL,NULL,0,0,'https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja','2026-05-23 23:59:00','Please come 30 mins early','No required skills',NULL,'camp','camp','https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja',12,0,NULL),(11,'Project Vrudhar','Project Vrudhar - old age camp','camp','2026-05-21','Thane',1,NULL,7,'2026-05-21 09:52:17','2026-05-21 10:05:24','project-vrudhar',NULL,'2026-05-21 09:00:00','2026-05-21 15:00:00',12,'members_only','upcoming',NULL,0,NULL,NULL,0,0,'https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja','2026-05-23 23:59:00','Please come 30 mins early','No required skills',NULL,'camp','camp','https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja',12,0,NULL),(12,'Project Vrudhar','Project Vrudhar - old age camp','camp','2026-05-21','Thane',1,NULL,7,'2026-05-21 09:52:31','2026-05-21 10:05:24','project-vrudhar',NULL,'2026-05-21 09:00:00','2026-05-21 15:00:00',12,'members_only','upcoming',NULL,0,NULL,NULL,0,0,'https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja','2026-05-23 23:59:00','Please come 30 mins early','No required skills',NULL,'camp','camp','https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja',12,0,NULL),(13,'Project Vrudhar','Project Vrudhar - old age camp','camp','2026-05-21','Thane',1,NULL,7,'2026-05-21 10:10:40','2026-05-21 10:10:40','project-vrudhar',NULL,'2026-05-21 09:00:00','2026-05-21 15:00:00',12,'members_only','upcoming',NULL,0,NULL,NULL,0,0,'https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja','2026-05-23 23:59:00','Please come 30 mins early','No required skills',NULL,'camp','camp','https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja',12,1,NULL),(14,'Project Vrudhar','Project Vrudhar','camp','2026-05-24','Thane',1,NULL,7,'2026-05-21 10:11:54','2026-05-21 10:11:54','project-vrudhar',NULL,'2026-05-24 09:00:00','2026-05-24 15:00:00',15,'members_only','upcoming',NULL,0,NULL,NULL,0,0,'https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja','2026-05-24 23:59:00','Please come 20 mins early','None',NULL,'camp','camp','https://chat.whatsapp.com/D5oTjJTslgO17rL1Lu17ja',15,1,NULL);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `id_card_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `id_card_templates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `template_type` varchar(80) NOT NULL DEFAULT 'membership',
  `front_background_url` text,
  `back_background_url` text,
  `logo_url` text,
  `header_text` varchar(220) DEFAULT NULL,
  `footer_text` varchar(500) DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `field_config` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_card_templates_status_lookup` (`status`,`is_default`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `id_card_templates` WRITE;
/*!40000 ALTER TABLE `id_card_templates` DISABLE KEYS */;
INSERT INTO `id_card_templates` VALUES (1,'Maai Membership Card','membership','https://placehold.co/900x540/e0f2fe/0f172a?text=Maai+ID+Front','https://placehold.co/900x540/f8fafc/0f172a?text=Maai+ID+Back','https://placehold.co/160x160/ffffff/0891b2?text=Maai','Maai Membership Card','If found, please contact Maai organisation.','archived',0,'2026-05-19 10:33:01','2026-05-20 14:13:18','{\"qr\": {\"x\": 900, \"y\": 245, \"side\": \"back\", \"type\": \"qr\", \"color\": \"#000000\", \"width\": 154, \"height\": 154, \"enabled\": true, \"fontSize\": 18}, \"role\": {\"x\": 96, \"y\": 345, \"side\": \"front\", \"color\": \"#0f172a\", \"width\": 320, \"height\": 34, \"enabled\": true, \"fontSize\": 22}, \"status\": {\"x\": 96, \"y\": 390, \"side\": \"front\", \"color\": \"#0f766e\", \"width\": 320, \"height\": 34, \"enabled\": true, \"fontSize\": 22}, \"barcode\": {\"x\": 96, \"y\": 600, \"side\": \"front\", \"type\": \"barcode\", \"color\": \"#000000\", \"width\": 260, \"height\": 46, \"enabled\": true, \"fontSize\": 18}, \"college\": {\"x\": 96, \"y\": 435, \"side\": \"front\", \"color\": \"#0f172a\", \"width\": 620, \"height\": 36, \"enabled\": true, \"fontSize\": 22}, \"full_name\": {\"x\": 96, \"y\": 170, \"side\": \"front\", \"color\": \"#0f172a\", \"width\": 640, \"height\": 54, \"enabled\": true, \"fontSize\": 34}, \"membership_number\": {\"x\": 96, \"y\": 285, \"side\": \"front\", \"color\": \"#0f172a\", \"width\": 420, \"height\": 40, \"enabled\": true, \"fontSize\": 24}, \"verification_code\": {\"x\": 96, \"y\": 520, \"side\": \"front\", \"color\": \"#0f172a\", \"width\": 420, \"height\": 34, \"enabled\": true, \"fontSize\": 20}}'),(2,'Aarogya Crew','membership','https://i.postimg.cc/CLPrycq0/Front-Side.png','https://i.postimg.cc/prVC4jVY/Back-Side.png',NULL,'Maai Membership Card','If found, please contact Maai organisation.','published',1,'2026-05-20 12:48:15','2026-05-21 06:43:17','{\"qr\": {\"x\": 848, \"y\": 420, \"side\": \"back\", \"type\": \"qr\", \"color\": \"#000000\", \"width\": 242, \"height\": 230, \"enabled\": false, \"fontSize\": 18}, \"role\": {\"x\": 96, \"y\": 345, \"side\": \"front\", \"color\": \"#0f172a\", \"width\": 320, \"height\": 34, \"enabled\": false, \"fontSize\": 22}, \"status\": {\"x\": 98, \"y\": 240, \"side\": \"front\", \"color\": \"#0f766e\", \"width\": 320, \"height\": 34, \"enabled\": true, \"fontSize\": 22}, \"barcode\": {\"x\": 96, \"y\": 600, \"side\": \"front\", \"type\": \"barcode\", \"color\": \"#000000\", \"width\": 260, \"height\": 46, \"enabled\": false, \"fontSize\": 18}, \"college\": {\"x\": 280, \"y\": 647, \"side\": \"front\", \"color\": \"#0f172a\", \"width\": 620, \"height\": 36, \"enabled\": true, \"fontSize\": 22}, \"full_name\": {\"x\": 140, \"y\": 415, \"side\": \"front\", \"color\": \"#0f172a\", \"width\": 928, \"height\": 81, \"enabled\": true, \"fontSize\": 55}, \"membership_number\": {\"x\": 210, \"y\": 580, \"side\": \"front\", \"color\": \"#0f172a\", \"width\": 420, \"height\": 40, \"enabled\": true, \"fontSize\": 24}, \"verification_code\": {\"x\": 96, \"y\": 520, \"side\": \"front\", \"color\": \"#0f172a\", \"width\": 420, \"height\": 34, \"enabled\": false, \"fontSize\": 20}}');
/*!40000 ALTER TABLE `id_card_templates` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `impact_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `impact_stats` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `volunteers_count` int unsigned NOT NULL DEFAULT '0',
  `ngo_count` int unsigned NOT NULL DEFAULT '0',
  `events_count` int unsigned NOT NULL DEFAULT '0',
  `certificates_count` int unsigned NOT NULL DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `impact_stats` WRITE;
/*!40000 ALTER TABLE `impact_stats` DISABLE KEYS */;
INSERT INTO `impact_stats` VALUES (1,7,1,14,6,'2026-05-21 10:12:09');
/*!40000 ALTER TABLE `impact_stats` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `initiatives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `initiatives` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(180) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text,
  `imageUrl` text,
  `bannerUrl` text,
  `category` enum('awareness','camp','research','education','advocacy','community','conference','other') NOT NULL DEFAULT 'other',
  `beneficiaries` varchar(120) DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `isFeatured` tinyint(1) NOT NULL DEFAULT '0',
  `slug` varchar(220) DEFAULT NULL,
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `date` date DEFAULT NULL,
  `location` varchar(180) DEFAULT NULL,
  `volunteers_needed` int DEFAULT NULL,
  `registration_open` tinyint(1) NOT NULL DEFAULT '0',
  `tags` json DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `short_description` text,
  `image_url` text,
  `banner_url` text,
  `visibility` enum('public','volunteers','internal') NOT NULL DEFAULT 'public',
  `order_index` int NOT NULL DEFAULT '0',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `certificate_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `event_link` text,
  `chapter` varchar(180) DEFAULT NULL,
  `impact_stats` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `initiatives_public_sort` (`visible`,`featured`,`display_order`,`created_at`),
  KEY `initiatives_status_featured_order` (`status`,`visibility`,`featured`,`order_index`,`created_at`),
  KEY `initiatives_slug_lookup` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `initiatives` WRITE;
/*!40000 ALTER TABLE `initiatives` DISABLE KEYS */;
INSERT INTO `initiatives` VALUES (4,'Project Bandhan',NULL,'Project Bandhan is a Maai organisation initiative prepared for community impact.','https://placehold.co/900x600?text=Project+Bandhan','https://placehold.co/1400x700?text=Project+Bandhan','education',NULL,'published',0,0,'project-bandhan',1,1,1,NULL,NULL,NULL,0,NULL,1,'2026-05-20 12:26:21','2026-05-20 12:26:21','Project Bandhan is a Maai organisation initiative.','https://placehold.co/900x600?text=Project+Bandhan','https://placehold.co/1400x700?text=Project+Bandhan','public',1,NULL,NULL,0,NULL,NULL,NULL),(5,'Project Suraksha',NULL,'Project Suraksha is a Maai organisation initiative prepared for community impact.','https://placehold.co/900x600?text=Project+Suraksha','https://placehold.co/1400x700?text=Project+Suraksha','awareness',NULL,'published',0,0,'project-suraksha',1,1,1,NULL,NULL,NULL,0,NULL,2,'2026-05-20 12:26:21','2026-05-20 12:26:21','Project Suraksha is a Maai organisation initiative.','https://placehold.co/900x600?text=Project+Suraksha','https://placehold.co/1400x700?text=Project+Suraksha','public',2,NULL,NULL,0,NULL,NULL,NULL),(6,'YouthCon',NULL,'YouthCon is a Maai organisation initiative prepared for community impact.','https://placehold.co/900x600?text=YouthCon','https://placehold.co/1400x700?text=YouthCon','conference',NULL,'published',0,0,'youthcon',1,1,1,NULL,NULL,NULL,0,NULL,3,'2026-05-20 12:26:21','2026-05-20 12:26:21','YouthCon is a Maai organisation initiative.','https://placehold.co/900x600?text=YouthCon','https://placehold.co/1400x700?text=YouthCon','public',3,NULL,NULL,0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `initiatives` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `membership_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `membership_settings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `payments_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `membership_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `upi_qr_url` text,
  `instructions` text,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `currency` varchar(10) NOT NULL DEFAULT 'INR',
  `payment_instructions` text,
  `membership_name` varchar(180) NOT NULL DEFAULT 'Free Membership',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `plan_duration` int DEFAULT NULL,
  `renewal_fee` decimal(10,2) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `chapter_pricing` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `membership_settings` WRITE;
/*!40000 ALTER TABLE `membership_settings` DISABLE KEYS */;
INSERT INTO `membership_settings` VALUES (1,0,0.00,NULL,'Memberships are currently free.','2026-05-19 10:32:58','INR','Memberships are currently free.','Free Membership',1,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `membership_settings` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `mentors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mentors` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `role` varchar(180) DEFAULT NULL,
  `designation` varchar(180) DEFAULT NULL,
  `organization` varchar(180) DEFAULT NULL,
  `bio` text,
  `imageUrl` text,
  `linkedin` text,
  `category` varchar(120) DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `full_name` varchar(180) DEFAULT NULL,
  `chapter` varchar(180) DEFAULT NULL,
  `region` varchar(180) DEFAULT NULL,
  `mentorship_type` varchar(180) DEFAULT NULL,
  `specialization` varchar(180) DEFAULT NULL,
  `image_url` text,
  `linkedin_url` text,
  `instagram_url` text,
  `instagram` text,
  `email` varchar(180) DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
  `order_index` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `mentors_public_sort` (`visible`,`featured`,`display_order`,`created_at`),
  KEY `mentors_status_featured_order` (`status`,`featured`,`order_index`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `mentors` WRITE;
/*!40000 ALTER TABLE `mentors` DISABLE KEYS */;
INSERT INTO `mentors` VALUES (3,'Dr. A Sharma',NULL,'Public Health Specialist','Maai organisation','Mentor supporting Maai organisation\'s community health mission.','https://placehold.co/600x600?text=Dr.+A+Sharma',NULL,'Public Health',0,1,1,1,'2026-05-20 12:26:21','2026-05-20 12:26:21','Dr. A Sharma',NULL,NULL,NULL,'Public Health','https://placehold.co/600x600?text=Dr.+A+Sharma',NULL,NULL,NULL,NULL,'published',1),(4,'Dr. Priya Mehta',NULL,'Community Medicine Mentor','Maai organisation','Mentor supporting Maai organisation\'s community health mission.','https://placehold.co/600x600?text=Dr.+Priya+Mehta',NULL,'Community Medicine',0,1,1,2,'2026-05-20 12:26:21','2026-05-20 12:26:21','Dr. Priya Mehta',NULL,NULL,NULL,'Community Medicine','https://placehold.co/600x600?text=Dr.+Priya+Mehta',NULL,NULL,NULL,NULL,'published',2);
/*!40000 ALTER TABLE `mentors` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `ngo_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ngo_notifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `ngo_id` int unsigned NOT NULL,
  `title` varchar(220) NOT NULL,
  `message` text NOT NULL,
  `notification_type` varchar(80) NOT NULL DEFAULT 'camp_request',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ngo_notifications_lookup` (`ngo_id`,`read_at`,`created_at`),
  CONSTRAINT `ngo_notifications_ngo_fk` FOREIGN KEY (`ngo_id`) REFERENCES `ngos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `ngo_notifications` WRITE;
/*!40000 ALTER TABLE `ngo_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `ngo_notifications` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `ngos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ngos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `organization_name` varchar(220) NOT NULL,
  `registration_number` varchar(180) NOT NULL,
  `ngo_type` enum('healthcare','education','community','research','environment','other') NOT NULL DEFAULT 'other',
  `email` varchar(180) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(40) NOT NULL,
  `website` text,
  `city` varchar(120) NOT NULL,
  `state` varchar(120) DEFAULT NULL,
  `address` text,
  `mission` text,
  `description` text,
  `logo_url` text,
  `cover_url` text,
  `membership_status` enum('under_review','verified','rejected','suspended') NOT NULL DEFAULT 'under_review',
  `payment_status` enum('free','pending','paid','failed') NOT NULL DEFAULT 'free',
  `transaction_id` varchar(255) NOT NULL DEFAULT 'FREE',
  `verified_by` int unsigned DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `chapter` varchar(180) DEFAULT NULL,
  `partner_level` varchar(120) DEFAULT NULL,
  `certificate_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ngos_email_unique` (`email`),
  UNIQUE KEY `ngos_registration_unique` (`registration_number`),
  KEY `ngos_status_lookup` (`membership_status`,`payment_status`,`created_at`),
  KEY `ngos_city_lookup` (`city`,`state`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `ngos` WRITE;
/*!40000 ALTER TABLE `ngos` DISABLE KEYS */;
INSERT INTO `ngos` VALUES (1,'Maai Demo Partner NGO','DEMO-NGO-001','healthcare','demo.ngo@maai.org','$2a$10$kZCB4RdujMOtfb67kQwa8urshyxMnnYcBIrO8TS9g8N04arwTW6I6','+910000000000','https://maai.example.org','Delhi','Delhi','Demo address','Community health collaboration.','Verified demo NGO partner for Maai workflows.','https://placehold.co/600x600?text=NGO','https://placehold.co/1200x500?text=Maai+NGO','verified','free','FREE',NULL,'2026-05-19 10:32:58',NULL,NULL,0,'2026-05-19 10:32:58','2026-05-19 10:32:58');
/*!40000 ALTER TABLE `ngos` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `recipient_type` enum('volunteer','ngo','it_staff','superadmin') NOT NULL,
  `recipient_id` int unsigned NOT NULL,
  `title` varchar(220) NOT NULL,
  `message` text NOT NULL,
  `notification_type` enum('membership','certificate','camp_request','event','ngo','announcement','system') NOT NULL DEFAULT 'system',
  `status` enum('unread','read','archived') NOT NULL DEFAULT 'unread',
  `action_url` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_recipient_status` (`recipient_type`,`recipient_id`,`status`,`created_at`),
  KEY `notifications_type_lookup` (`notification_type`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'volunteer',1,'Welcome to Maai','Your Maai notification inbox is ready.','system','unread','/volunteer/dashboard','2026-05-19 10:33:00',NULL),(2,'superadmin',7,'Admin notifications enabled','New registrations, camp requests, and operational events will appear here.','system','read','/admin','2026-05-19 10:33:00','2026-05-19 13:53:50'),(3,'it_staff',8,'Admin notifications enabled','New registrations, camp requests, and operational events will appear here.','system','unread','/admin','2026-05-19 10:33:00',NULL),(4,'ngo',1,'NGO inbox ready','Camp request updates and partnership notifications will appear here.','system','unread','/ngo/dashboard','2026-05-19 10:33:00',NULL),(5,'superadmin',7,'New volunteer registration','Volunteer2 submitted a volunteer membership request.','membership','read','/admin/volunteers','2026-05-20 12:49:16','2026-05-20 12:49:38'),(6,'it_staff',8,'New volunteer registration','Volunteer2 submitted a volunteer membership request.','membership','unread','/admin/volunteers','2026-05-20 12:49:16',NULL),(7,'volunteer',13,'Membership verified','Your Maai membership has been verified. Your membership certificate is now eligible to claim.','membership','unread','/volunteer/certificates','2026-05-20 12:49:51',NULL),(8,'superadmin',7,'New volunteer registration','volunteer3 submitted a volunteer membership request.','membership','read','/admin/volunteers','2026-05-20 13:22:00','2026-05-20 13:22:23'),(9,'it_staff',8,'New volunteer registration','volunteer3 submitted a volunteer membership request.','membership','unread','/admin/volunteers','2026-05-20 13:22:00',NULL),(10,'volunteer',14,'Membership verified','Your Maai membership has been verified. Your membership certificate is now eligible to claim.','membership','unread','/volunteer/certificates','2026-05-20 13:22:27',NULL),(11,'volunteer',12,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:37',NULL),(12,'volunteer',4,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:37',NULL),(13,'volunteer',13,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:37',NULL),(14,'volunteer',14,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:37',NULL),(15,'volunteer',3,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:37',NULL),(16,'volunteer',12,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:42',NULL),(17,'volunteer',13,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:42',NULL),(18,'volunteer',14,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:42',NULL),(19,'volunteer',3,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:42',NULL),(20,'volunteer',4,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:42',NULL),(21,'volunteer',12,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(22,'volunteer',13,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(23,'volunteer',14,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(24,'volunteer',3,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(25,'volunteer',4,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(26,'volunteer',12,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(27,'volunteer',13,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(28,'volunteer',14,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(29,'volunteer',3,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(30,'volunteer',4,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(31,'volunteer',12,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(32,'volunteer',13,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(33,'volunteer',14,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(34,'volunteer',3,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(35,'volunteer',4,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:47:50',NULL),(36,'volunteer',12,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:51:53',NULL),(37,'volunteer',13,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:51:53',NULL),(38,'volunteer',14,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:51:53',NULL),(39,'volunteer',3,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:51:53',NULL),(40,'volunteer',4,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:51:53',NULL),(41,'volunteer',12,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:52:17',NULL),(42,'volunteer',14,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:52:17',NULL),(43,'volunteer',13,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:52:17',NULL),(44,'volunteer',3,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:52:17',NULL),(45,'volunteer',4,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:52:17',NULL),(46,'volunteer',12,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:52:31',NULL),(47,'volunteer',13,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:52:31',NULL),(48,'volunteer',14,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:52:31',NULL),(49,'volunteer',3,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:52:31',NULL),(50,'volunteer',4,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 09:52:31',NULL),(51,'volunteer',12,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 10:10:40',NULL),(52,'volunteer',13,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 10:10:40',NULL),(53,'volunteer',14,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 10:10:40',NULL),(54,'volunteer',3,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 10:10:40',NULL),(55,'volunteer',4,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 10:10:40',NULL),(56,'volunteer',12,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 10:11:54',NULL),(57,'volunteer',13,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 10:11:54',NULL),(58,'volunteer',14,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 10:11:54',NULL),(59,'volunteer',3,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 10:11:54',NULL),(60,'volunteer',4,'New event created','Project Vrudhar is now available in Maai events.','event','unread','/volunteer/events','2026-05-21 10:11:54',NULL),(61,'volunteer',12,'Camp registration pending','Your registration for Project Vrudhar is awaiting approval.','event','unread','/volunteer/my-camps','2026-05-21 10:16:45',NULL),(62,'volunteer',12,'Camp registration approved','Project Vrudhar registration has been approved.','event','unread','/volunteer/my-camps','2026-05-21 10:22:02',NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `reels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reels` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(180) NOT NULL,
  `description` text,
  `thumbnailUrl` text,
  `videoUrl` text,
  `location` varchar(180) DEFAULT NULL,
  `eventName` varchar(180) DEFAULT NULL,
  `upload_date` timestamp NULL DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `category` varchar(120) DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `slug` varchar(220) DEFAULT NULL,
  `platform` enum('instagram','youtube','external') NOT NULL DEFAULT 'external',
  `caption` text,
  `thumbnail_url` text,
  `video_url` text,
  `initiative_id` int unsigned DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
  `published_at` timestamp NULL DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `views` int NOT NULL DEFAULT '0',
  `likes` int NOT NULL DEFAULT '0',
  `engagement` decimal(10,2) NOT NULL DEFAULT '0.00',
  `chapter` varchar(180) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reels_public_sort` (`active`,`featured`,`display_order`,`upload_date`,`created_at`),
  KEY `reels_status_featured_order` (`status`,`featured`,`order_index`,`published_at`,`created_at`),
  KEY `reels_initiative_lookup` (`initiative_id`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `reels` WRITE;
/*!40000 ALTER TABLE `reels` DISABLE KEYS */;
INSERT INTO `reels` VALUES (4,'Project Suraksha Awareness Reel','Project Suraksha Awareness Reel from Maai organisation.','https://placehold.co/900x1200?text=Project+Suraksha+Awareness+Reel','https://www.instagram.com/reel/example-suraksha/',NULL,NULL,'2026-05-20 12:26:21',0,1,NULL,1,'2026-05-20 12:26:21','2026-05-20 12:26:21','project-suraksha-awareness-reel','instagram','Project Suraksha Awareness Reel from Maai organisation.','https://placehold.co/900x1200?text=Project+Suraksha+Awareness+Reel','https://www.instagram.com/reel/example-suraksha/',NULL,'published','2026-05-20 12:26:21',1,0,0,0.00,NULL),(5,'Volunteer Camp Reel','Volunteer Camp Reel from Maai organisation.','https://placehold.co/900x1200?text=Volunteer+Camp+Reel','https://www.youtube.com/shorts/example-camp',NULL,NULL,'2026-05-20 12:26:21',0,1,NULL,2,'2026-05-20 12:26:21','2026-05-20 12:26:21','volunteer-camp-reel','youtube','Volunteer Camp Reel from Maai organisation.','https://placehold.co/900x1200?text=Volunteer+Camp+Reel','https://www.youtube.com/shorts/example-camp',NULL,'published','2026-05-20 12:26:21',2,0,0,0.00,NULL),(6,'YouthCon Highlights','YouthCon Highlights from Maai organisation.','https://placehold.co/900x1200?text=YouthCon+Highlights','https://example.com/youthcon-highlights',NULL,NULL,'2026-05-20 12:26:21',0,1,NULL,3,'2026-05-20 12:26:21','2026-05-20 12:26:21','youthcon-highlights','external','YouthCon Highlights from Maai organisation.','https://placehold.co/900x1200?text=YouthCon+Highlights','https://example.com/youthcon-highlights',NULL,'published','2026-05-20 12:26:21',3,0,0,0.00,NULL);
/*!40000 ALTER TABLE `reels` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `social_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `social_links` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `platform` enum('instagram','linkedin','youtube','twitter','facebook','website','whatsapp','telegram','discord') NOT NULL,
  `url` text NOT NULL,
  `icon` varchar(80) NOT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
  `order_index` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `social_links_platform_unique` (`platform`),
  KEY `social_links_status_order` (`status`,`order_index`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `social_links` WRITE;
/*!40000 ALTER TABLE `social_links` DISABLE KEYS */;
INSERT INTO `social_links` VALUES (1,'instagram','https://www.instagram.com/maai.cares','instagram','published',1,'2026-05-18 04:30:55','2026-05-18 04:30:55'),(2,'linkedin','https://www.linkedin.com/company/maai-cares','linkedin','published',2,'2026-05-18 04:30:55','2026-05-18 04:30:55'),(3,'youtube','https://www.youtube.com/@Maai.organisation','youtube','published',3,'2026-05-18 04:30:55','2026-05-18 04:30:55');
/*!40000 ALTER TABLE `social_links` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `socials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `socials` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `platform` varchar(120) NOT NULL,
  `handle` varchar(180) DEFAULT NULL,
  `url` text,
  `iconUrl` text,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `socials_public_sort` (`is_active`,`display_order`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `socials` WRITE;
/*!40000 ALTER TABLE `socials` DISABLE KEYS */;
/*!40000 ALTER TABLE `socials` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `role` varchar(180) DEFAULT NULL,
  `bio` text,
  `imageUrl` text,
  `linkedin` text,
  `email` varchar(180) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `team_active_sort` (`isActive`,`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
/*!40000 ALTER TABLE `team` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `role` varchar(180) DEFAULT NULL,
  `designation` varchar(180) DEFAULT NULL,
  `department` varchar(160) DEFAULT NULL,
  `imageUrl` text,
  `bio` text,
  `linkedin` text,
  `email` varchar(180) DEFAULT NULL,
  `instagram` text,
  `priority` int NOT NULL DEFAULT '0',
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `full_name` varchar(180) DEFAULT NULL,
  `chapter` varchar(180) DEFAULT NULL,
  `state` varchar(120) DEFAULT NULL,
  `image_url` text,
  `linkedin_url` text,
  `instagram_url` text,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
  `order_index` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `team_public_sort` (`active`,`featured`,`priority`,`created_at`),
  KEY `team_members_status_order` (`status`,`department`,`order_index`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (5,'Abhishek Kashyap',NULL,'GAIMS President','Leadership','https://placehold.co/600x600?text=Abhishek+Kashyap','Leadership team member at Maai organisation.',NULL,NULL,NULL,0,0,1,1,'2026-05-20 12:26:21','2026-05-20 12:26:21','Abhishek Kashyap',NULL,NULL,'https://placehold.co/600x600?text=Abhishek+Kashyap',NULL,NULL,'published',1),(6,'Oluwasola Victor',NULL,'CEO of BlueOzone','Leadership','https://placehold.co/600x600?text=Oluwasola+Victor','Leadership team member at Maai organisation.',NULL,NULL,NULL,0,0,1,1,'2026-05-20 12:26:21','2026-05-20 12:26:21','Oluwasola Victor',NULL,NULL,'https://placehold.co/600x600?text=Oluwasola+Victor',NULL,NULL,'published',2);
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `testimonials` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(180) NOT NULL,
  `role` varchar(180) DEFAULT NULL,
  `organization` varchar(180) DEFAULT NULL,
  `quote` text NOT NULL,
  `imageUrl` text,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `rating` int DEFAULT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `full_name` varchar(180) DEFAULT NULL,
  `designation` varchar(180) DEFAULT NULL,
  `testimonial` text,
  `image_url` text,
  `category` enum('volunteer','mentor','ngo','partner','beneficiary','speaker','other') NOT NULL DEFAULT 'other',
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'published',
  `order_index` int NOT NULL DEFAULT '0',
  `event_id` int unsigned DEFAULT NULL,
  `initiative_id` int unsigned DEFAULT NULL,
  `chapter` varchar(180) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `testimonials_public_sort` (`active`,`featured`,`display_order`,`created_at`),
  KEY `testimonials_status_featured_order` (`status`,`category`,`featured`,`order_index`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
INSERT INTO `testimonials` VALUES (1,'Volunteer feedback','Volunteer','Maai Volunteers','Volunteering with Maai helped me contribute to meaningful community health work.','https://placehold.co/600x600?text=Volunteer+feedback',0,1,1,5,1,'2026-05-19 10:33:04','2026-05-19 10:33:04','Volunteer feedback','Volunteer','Volunteering with Maai helped me contribute to meaningful community health work.','https://placehold.co/600x600?text=Volunteer+feedback','volunteer','published',1,NULL,NULL,NULL),(2,'Mentor feedback','Mentor','Maai Mentors','Maai\'s commitment to structured community impact makes mentoring deeply rewarding.','https://placehold.co/600x600?text=Mentor+feedback',0,1,1,5,2,'2026-05-19 10:33:04','2026-05-19 10:33:04','Mentor feedback','Mentor','Maai\'s commitment to structured community impact makes mentoring deeply rewarding.','https://placehold.co/600x600?text=Mentor+feedback','mentor','published',2,NULL,NULL,NULL),(3,'NGO partner feedback','NGO Partner','Partner Organization','The collaboration with Maai brought clarity, compassion, and execution strength to our outreach.','https://placehold.co/600x600?text=NGO+partner+feedback',0,1,1,5,3,'2026-05-19 10:33:04','2026-05-19 10:33:04','NGO partner feedback','NGO Partner','The collaboration with Maai brought clarity, compassion, and execution strength to our outreach.','https://placehold.co/600x600?text=NGO+partner+feedback','ngo','published',3,NULL,NULL,NULL);
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `fullName` varchar(180) NOT NULL,
  `email` varchar(180) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `accountType` varchar(80) NOT NULL DEFAULT 'volunteer',
  `role` varchar(80) NOT NULL DEFAULT 'member',
  `status` enum('pending','active','suspended','rejected') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_auth_lookup` (`email`,`accountType`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `volunteer_ids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteer_ids` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `volunteer_id` int unsigned NOT NULL,
  `template_id` int unsigned NOT NULL,
  `membership_number` varchar(40) NOT NULL,
  `verification_code` varchar(40) NOT NULL,
  `issued_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','expired','revoked') NOT NULL DEFAULT 'active',
  `photo_url` text,
  `blood_group` varchar(20) DEFAULT NULL,
  `emergency_contact` varchar(80) DEFAULT NULL,
  `chapter` varchar(180) DEFAULT NULL,
  `state` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `volunteer_ids_volunteer_unique` (`volunteer_id`),
  UNIQUE KEY `volunteer_ids_membership_unique` (`membership_number`),
  UNIQUE KEY `volunteer_ids_code_unique` (`verification_code`),
  KEY `volunteer_ids_status_lookup` (`status`,`issued_at`),
  KEY `volunteer_ids_template_fk` (`template_id`),
  CONSTRAINT `volunteer_ids_template_fk` FOREIGN KEY (`template_id`) REFERENCES `id_card_templates` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `volunteer_ids_volunteer_fk` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `volunteer_ids` WRITE;
/*!40000 ALTER TABLE `volunteer_ids` DISABLE KEYS */;
INSERT INTO `volunteer_ids` VALUES (1,3,2,'MAAI-VOL-0003','MAAI-ID-951F00','2026-05-19 10:33:01','active',NULL,NULL,NULL,NULL,NULL),(2,4,1,'MAAI-VOL-0004','MAAI-ID-4F87A2','2026-05-19 10:33:01','active',NULL,NULL,NULL,NULL,NULL),(3,7,1,'MAAI-VOL-0007','MAAI-ID-560964','2026-05-19 10:33:01','active',NULL,NULL,NULL,NULL,NULL),(4,8,1,'MAAI-VOL-0008','MAAI-ID-6A139C','2026-05-19 10:33:01','active',NULL,NULL,NULL,NULL,NULL),(5,12,1,'MAAI-VOL-0012','MAAI-ID-CC1EBD','2026-05-19 10:33:01','active',NULL,NULL,NULL,NULL,NULL),(11,13,2,'MAAI-VOL-0013','MAAI-ID-2YI7JK','2026-05-20 12:49:51','active',NULL,NULL,NULL,NULL,NULL),(12,14,2,'MAAI-VOL-0014','MAAI-ID-2W0YLM','2026-05-20 13:22:27','active',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `volunteer_ids` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `volunteer_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteer_profiles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int unsigned NOT NULL,
  `phone` varchar(40) NOT NULL,
  `college` varchar(180) DEFAULT NULL,
  `course` varchar(180) DEFAULT NULL,
  `year` varchar(80) DEFAULT NULL,
  `city` varchar(120) NOT NULL,
  `skills` text,
  `interests` text,
  `availability` varchar(220) DEFAULT NULL,
  `bio` text,
  `linkedin` text,
  `instagram` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `volunteer_profiles_user_unique` (`userId`),
  KEY `volunteer_profiles_city_lookup` (`city`),
  CONSTRAINT `volunteer_profiles_user_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `volunteer_profiles` WRITE;
/*!40000 ALTER TABLE `volunteer_profiles` DISABLE KEYS */;
/*!40000 ALTER TABLE `volunteer_profiles` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `volunteers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `volunteers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(180) NOT NULL,
  `email` varchar(180) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(40) NOT NULL,
  `city` varchar(120) NOT NULL,
  `college` varchar(180) DEFAULT NULL,
  `course` varchar(180) DEFAULT NULL,
  `academic_year` varchar(80) DEFAULT NULL,
  `skills` text,
  `interests` text,
  `availability` varchar(220) DEFAULT NULL,
  `bio` text,
  `linkedin_url` text,
  `instagram_url` text,
  `role` enum('volunteer','it_staff','superadmin') NOT NULL DEFAULT 'volunteer',
  `status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  `membership_status` enum('under_review','verified','rejected') DEFAULT 'under_review',
  `transaction_id` varchar(255) DEFAULT 'FREE',
  `payment_status` enum('free','pending','paid','failed') DEFAULT 'free',
  `verified_by` int DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `volunteers_email_unique` (`email`),
  KEY `volunteers_role_status_lookup` (`role`,`status`),
  KEY `volunteers_city_lookup` (`city`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `volunteers` WRITE;
/*!40000 ALTER TABLE `volunteers` DISABLE KEYS */;
INSERT INTO `volunteers` VALUES (1,'Test','test@gmail.com','$2b$12$u7zQIxw7fulC0Ue5CYf3j.kgaeGyALx/aPLpaBKPp6fCv2C7V7uba','1234567890','Mumbai','GMC','MBBS','Fourth year','None','None','Weekends','TEST USER BIO','https://www.linkedin.com/feed/','https://www.instagram.com/dr.sildenafil_','volunteer','pending','2026-05-17 10:28:13','2026-05-17 10:28:13','pending','under_review','FREE','free',NULL,NULL),(2,'Test2','test2@gmail.com','$2b$12$P/01BVO4PMTe3vz0PbZh8u8go9.zsm.dq.Ben1rYKNvEiJIaewvWW','7418529631','mumbai','GMC','MBBS','Fourth year',NULL,NULL,NULL,NULL,NULL,NULL,'volunteer','pending','2026-05-17 10:30:06','2026-05-17 10:30:06','pending','under_review','FREE','free',NULL,NULL),(3,'Test3','test3@gmail.com','$2b$12$bosjyYwdhJsYbtztFOsL0./JKC78jquMt8lCSozyJZXGiqshLk8bi','1234185796','Mumbai','GMC','MBBS','2022',NULL,NULL,NULL,NULL,NULL,NULL,'volunteer','approved','2026-05-17 14:22:05','2026-05-17 20:16:56','approved','verified','FREE','free',NULL,NULL),(4,'Test Volunteer','test@maai.org','$2b$10$8D/SnRSWT5th.oSlEfoIG.L8OZWyULi2pD5t9U5PV0xEMvIymJxHW','9876543210','Mumbai','Test College','MBBS','Third Year','Camps, Outreach','Healthcare camps','Weekends','Test account for volunteer login',NULL,NULL,'volunteer','approved','2026-05-17 14:39:09','2026-05-17 20:17:03','approved','verified','FREE','free',NULL,NULL),(7,'Maai Superadmin','admin@maai.org','$2b$10$GCY73uq1qHSrS6M3NJkjuOm.PO9oyEPq6/NQUgUDOU/DxYEQ6ieLq','9876543211','Mumbai','Maai Organisation','Administration','Staff','Operations, CMS, Governance','Admin operations','Full time',NULL,NULL,NULL,'superadmin','approved','2026-05-17 15:13:34','2026-05-17 20:17:03','approved','verified','FREE','free',NULL,NULL),(8,'Maai IT Staff','itstaff@maai.org','$2b$10$DfxPjHeYxVhkzPo3fRC9rOnUvXFjyQ/i/MEV2A/RlcNNUGxXvY292','9876543212','Mumbai','Maai Organisation','IT Operations','Staff','Approvals, Events, CMS','Operations support','Full time',NULL,NULL,NULL,'it_staff','approved','2026-05-17 20:05:46','2026-05-17 20:17:03','approved','verified','FREE','free',NULL,NULL),(12,'volunteer','volunteer@maai.org','$2b$12$V7qcGpXxP8sP5ls3yJMI.OrI3XaChxAC2zFO0/hMMDrtUaY/2KlDe','1234567890','Mumbai','GMC','MBBS','2022',NULL,NULL,NULL,NULL,NULL,NULL,'volunteer','pending','2026-05-17 20:28:00','2026-05-17 20:36:58','pending','verified','FREE','free',7,'2026-05-17 20:36:58'),(13,'Volunteer2','volunteer2@maai.org','$2b$10$iln1W6OUSyr8LKcUMSXX7ON352TftElvY.32WXsiw0cVXmenEDmSO','1237458960','Mumbai','GMC \\','MBBS','2022',NULL,NULL,NULL,NULL,NULL,NULL,'volunteer','pending','2026-05-20 12:49:16','2026-05-20 12:49:51','pending','verified','FREE','paid',7,'2026-05-20 12:49:51'),(14,'volunteer3','volunteer3@gmail.com','$2b$10$OXaR24GOaASIqttx6jQ0sem3VgdpnTOtYu2bVgxpf2gqt.ErFDvT6','1239685742','panvel','GMC','MBBS','2003',NULL,NULL,NULL,NULL,NULL,NULL,'volunteer','pending','2026-05-20 13:22:00','2026-05-20 13:22:27','pending','verified','FREE','free',7,'2026-05-20 13:22:27');
/*!40000 ALTER TABLE `volunteers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

