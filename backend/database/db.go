package database

import (
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewDatabase() (*gorm.DB, func()) {
	var dsn string
	if os.Getenv("ENVIRONMENT") == "production" {
		dsn = os.Getenv("PROD_DB_DSN")
	} else {
		dsn = os.Getenv("DEV_DB_DSN")
	}
	db, err := gorm.Open(postgres.Open(dsn))
	if err != nil {
		panic("failed to connect database")
	}
	return db, func() {
		sqlDB, err := db.DB()
		if err != nil {
			panic("failed to get db from gorm")
		}
		sqlDB.Close()
	}
}
