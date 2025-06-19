package routes

import (
	"encoding/json"
	// "expense-split-backend/models"
	// "fmt"
	"log"
	"net/http"

	"github.com/astaxie/beego/orm"
	"github.com/aws/aws-lambda-go/events"
)

func NotificationMarkReadHandler(o orm.Ormer, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	allowedOrigin := "http://localhost:8081"

	if request.HTTPMethod == "OPTIONS" {
		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers: map[string]string{
				"Access-Control-Allow-Origin":  allowedOrigin,
				"Access-Control-Allow-Methods": "OPTIONS, POST",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
			Body: "",
		}, nil
	}

	authHeader := request.Headers["Authorization"]
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Headers: map[string]string{
				"Access-Control-Allow-Origin": allowedOrigin,
			},
			Body: "Unauthorized - missing or invalid token format",
		}, nil
	}
	tokenString := authHeader[7:]
	claims, err := validateJWT(tokenString)
	if err != nil {
		log.Println("JWT validation failed:", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
			Headers: map[string]string{
				"Access-Control-Allow-Origin": allowedOrigin,
			},
			Body: "Unauthorized - invalid token",
		}, nil
	}
	
	userID, ok := claims["user_id"].(string)
	if !ok {
		log.Println("user_id is not a string")
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers: map[string]string{
				"Access-Control-Allow-Origin": allowedOrigin,
			},
			Body: "Invalid user ID in token",
		}, nil
	}

	// Parse body
	var req struct {
		NotificationID int  `json:"notification_id"`
		MarkAll        bool `json:"mark_all"`
	}
	err = json.Unmarshal([]byte(request.Body), &req)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers: map[string]string{
				"Access-Control-Allow-Origin": allowedOrigin,
			},
			Body: "Invalid request body",
		}, nil
	}

	if req.MarkAll {
		// 🔁 Mark all as read
		_, err = o.Raw("UPDATE notification SET is_read = true WHERE user_i_d = ?", userID).Exec()
	} else {
		// ✅ Mark one as read
		_, err = o.Raw("UPDATE notification SET is_read = true WHERE  notification_i_d = ? AND user_i_d = ?", req.NotificationID, userID).Exec()
	}

	if err != nil {
		log.Println("Database error:", err)
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers: map[string]string{
				"Access-Control-Allow-Origin": allowedOrigin,
			},
			Body: `{"message": "Database error"}`,
		}, nil
	}

	responseBody, _ := json.Marshal(map[string]string{
		"code":    "200",
		"message": "notification(s) marked as read",
	})
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  allowedOrigin,
			"Access-Control-Allow-Methods": "OPTIONS, POST",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Content-Type":                 "application/json",
		},
		Body: string(responseBody),
	}, nil
}


func NotificationMarkReadHandlerLocal(w http.ResponseWriter, r *http.Request, o orm.Ormer) {
	allowedOrigin := "http://localhost:8081"

	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
		return
	}

	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || len(authHeader) < 8 || authHeader[:7] != "Bearer " {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		http.Error(w, "Unauthorized - missing or invalid token format", http.StatusUnauthorized)
		return
	}
	tokenString := authHeader[7:]
	claims, err := validateJWT(tokenString)
	if err != nil {
		log.Println("JWT validation failed:", err)
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		http.Error(w, "Unauthorized - invalid token", http.StatusUnauthorized)
		return
	}
	userID, ok := claims["user_id"].(string)
	if !ok {
		log.Println("user_id is not a string")
		http.Error(w, "Invalid user ID in token", http.StatusBadRequest)
		return
	}

	var req struct {
		NotificationID int  `json:"notification_id"`
		MarkAll        bool `json:"mark_all"`
	}
	err = json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.MarkAll {
		// 🔁 Mark all as read
		_, err = o.Raw("UPDATE notification SET is_read = true WHERE user_i_d = ?", userID).Exec()
	} else {
		// ✅ Mark one as read
		_, err = o.Raw("UPDATE notification SET is_read = true WHERE notification_i_d = ? AND user_i_d = ?", req.NotificationID, userID).Exec()
	}

	if err != nil {
		log.Println("Database error:", err)
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		http.Error(w, `{"message": "Database error"}`, http.StatusInternalServerError)
		return
	}

	responseBody, _ := json.Marshal(map[string]string{
		"code":    "200",
		"message": "notification(s) marked as read",
	})
	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBody)
}
