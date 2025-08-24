CREATE SCHEMA `ams_sales` DEFAULT CHARACTER SET utf8 ;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
INSERT INTO `ams_sales`.`user` (`id`, `role`, `username`, `password`, `name`, `lastname`, `creationDate`) VALUES ('c609fb28-64bd-45da-a35f-bbc86b73c35e', 'SUPER_ADMIN', 'root', '$2a$12$zFXxFQPrHE9UylMJNxxd4eJ3FngDzx2Qhl4lUMIEkh3ZdVf2IPOfK', 'root', 'root', current_date())
