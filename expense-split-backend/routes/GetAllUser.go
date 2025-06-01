package routes

import (
	"encoding/json"
	"expense-split-backend/models"
	"fmt"
	"log"
	"net/http"

	"github.com/astaxie/beego/orm"
	"github.com/aws/aws-lambda-go/events"
)

// Struct to simplify the user response
type UserResponse struct {
	UserID string    `json:"user_id"`
	Name   string    `json:"name"`
}

// Lambda-compatible handler
func GetAllUsersHandler(o orm.Ormer, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var users []UserResponse

	_, err := o.Raw("SELECT user_id, name FROM userauth").QueryRows(&users)
	if err != nil {
		log.Println("Database error while fetching users:", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers: map[string]string{
				"Access-Control-Allow-Origin": "*",
			},
			Body: fmt.Sprintf("Database error: %s", err),
		}, nil
	}

	responseBody, _ := json.Marshal(users)
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
		Body: string(responseBody),
	}, nil
}

// Local HTTP handler for development/testing
func GetAllUsersHandlerLocal(w http.ResponseWriter, r *http.Request, o orm.Ormer) {
	allowedOrigin := "http://localhost:8081"

	// Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var users []models.Userauth
	_, err := o.Raw("SELECT user_id, name FROM userauth").QueryRows(&users)
	if err != nil {
		log.Println("Database error while fetching users:", err)
		http.Error(w, fmt.Sprintf("Database error: %s", err), http.StatusInternalServerError)
		return
	}

	var userList []UserResponse
	for _, u := range users {
		userList = append(userList, UserResponse{
			UserID: u.User_id,
			Name:   u.Name,
		})
	}

	responseBody, _ := json.Marshal(userList)

	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBody)
}