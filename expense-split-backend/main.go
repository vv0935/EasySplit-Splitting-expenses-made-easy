package main

import (
	"expense-split-backend/models"
	"expense-split-backend/routes"
	"fmt"
	"log"
	"os"
	"net/http"

	"github.com/astaxie/beego/orm"
	_ "github.com/go-sql-driver/mysql" // MySQL driver
	"github.com/joho/godotenv"
)

func ConnectDB() {
	// Register MySQL database
	err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }
	dsn := os.Getenv("DSN")
	err = orm.RegisterDataBase("default", "mysql", dsn)
	if err != nil {
		log.Fatal("Failed to register database:", err)
		return
	}

	// Register models
	orm.RegisterModel(new(models.Userauth))

	// Sync database (auto-create tables)
	err = orm.RunSyncdb("default", false, true)
	if err != nil {
		log.Fatal("Database migration failed:", err)
		return
	}

	fmt.Println("Database connected and migrated successfully!")
}

func main() {
	ConnectDB()

	// Initialize Lambda routes
	// routes.InitLambda()
	// Only initialize Lambda if running in Lambda environment
	if os.Getenv("_LAMBDA_SERVER_PORT") != "" {
        routes.InitLambda()
    } else {
        fmt.Println("Running locally, Lambda init skipped")
		router := routes.InitRouter()  // You may need to add this method to get a router
        log.Println("Starting local server at :9000")
        log.Fatal(http.ListenAndServe(":9000", router))
        // You can start a local HTTP server here if needed
    }

	// CORS middleware setup
	// log.Fatal(http.ListenAndServe(":9000", handler))
}
