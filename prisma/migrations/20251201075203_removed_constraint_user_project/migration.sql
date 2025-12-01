-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `projects_user_id_fkey`;

-- DropIndex
DROP INDEX `projects_user_id_key` ON `projects`;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
