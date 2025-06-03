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

func LoginHandler(o orm.Ormer, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	ID := request.QueryStringParameters["user_id"]
	MobileNo := request.QueryStringParameters["mobile"]

	log.Println("ID:", ID)
	log.Println("MobileNo:", MobileNo)
	log.Println("Raw Event:", request)

	var user models.Userauth

	// Query User
	query := "SELECT * FROM userauth WHERE user_id = ? OR mobile = ? LIMIT 1"
	err := o.Raw(query, ID, MobileNo).QueryRow(&user)

	if err != nil {
		if err == orm.ErrNoRows {
			log.Println(" User not found")
			return events.APIGatewayProxyResponse{StatusCode: 400, Headers: map[string]string{
				"Access-Control-Allow-Origin": "*"}, Body: "Invalid credentials"}, nil
		}
		log.Println(" Database error:", err)
		return events.APIGatewayProxyResponse{StatusCode: 500, Headers: map[string]string{
			"Access-Control-Allow-Origin": "*"}, Body: fmt.Sprintf("Database error: %s", err)}, nil
	}

	responseBody, _ := json.Marshal(map[string]string{
		"code":      "200",
		"user_id":   user.User_id,
		"user_name": user.Name,
		"mobile":    user.Mobile,
		"message":   "Login successful",
	})
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
		Body: string(responseBody),
	}, nil
}













func LoginHandlerLocal(w http.ResponseWriter, r *http.Request, o orm.Ormer) {
	allowedOrigin := "http://localhost:8081"

	// Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
		return
	}

	// Parse query parameters
	userID := r.URL.Query().Get("user_id")
	mobile := r.URL.Query().Get("mobile")

	log.Println("ID:", userID)
	log.Println("MobileNo:", mobile)

	var user models.Userauth

	// Query user by user_id or mobile
	query := "SELECT * FROM userauth WHERE user_id = ? OR mobile = ? LIMIT 1"
	err := o.Raw(query, userID, mobile).QueryRow(&user)

	if err != nil {
		if err == orm.ErrNoRows {
			log.Println("User not found")
			http.Error(w, "Invalid credentials", http.StatusBadRequest)
			return
		}
		log.Println("Database error:", err)
		http.Error(w, fmt.Sprintf("Database error: %s", err), http.StatusInternalServerError)
		return
	}

	responseBody, _ := json.Marshal(map[string]string{
		"code":      "200",
		"user_id":   user.User_id,
		"user_name": user.Name,
		"mobile":    user.Mobile,
		"message":   "Login successful",
	})

	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, GET")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBody)
}
