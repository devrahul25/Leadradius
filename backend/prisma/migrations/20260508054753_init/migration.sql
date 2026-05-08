-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` TEXT NOT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `refreshToken` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessLead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `placeId` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(255) NULL,
    `rating` DOUBLE NULL,
    `totalReviews` INTEGER NULL,
    `phone` VARCHAR(64) NULL,
    `website` VARCHAR(512) NULL,
    `address` TEXT NULL,
    `city` VARCHAR(255) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `distanceKm` DOUBLE NULL,
    `score` DOUBLE NULL,
    `leadLabel` VARCHAR(64) NULL,
    `status` VARCHAR(32) NULL DEFAULT 'active',
    `source` VARCHAR(32) NULL DEFAULT 'google',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BusinessLead_placeId_key`(`placeId`),
    INDEX `BusinessLead_rating_idx`(`rating`),
    INDEX `BusinessLead_leadLabel_idx`(`leadLabel`),
    INDEX `BusinessLead_city_idx`(`city`),
    INDEX `BusinessLead_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SearchHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `keyword` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `radius` INTEGER NOT NULL,
    `totalLeads` INTEGER NOT NULL DEFAULT 0,
    `apiCalls` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SearchHistory_userId_idx`(`userId`),
    INDEX `SearchHistory_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExportJob` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `format` VARCHAR(16) NOT NULL,
    `filters` JSON NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'pending',
    `filePath` VARCHAR(512) NULL,
    `rowCount` INTEGER NOT NULL DEFAULT 0,
    `errorMsg` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    INDEX `ExportJob_userId_idx`(`userId`),
    INDEX `ExportJob_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SearchHistory` ADD CONSTRAINT `SearchHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExportJob` ADD CONSTRAINT `ExportJob_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
