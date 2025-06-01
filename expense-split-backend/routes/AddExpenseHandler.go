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

func AddExpenseHandler(o orm.Ormer, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// allowedOrigin := "http://easysplit.com:8080"
	allowedOrigin := "http://localhost:8081"

	if request.HTTPMethod == "OPTIONS" {
		return events.APIGatewayProxyResponse{
			StatusCode: 200,
			Headers: map[string]string{
				"Access-Control-Allow-Origin":  allowedOrigin,
				"Access-Control-Allow-Methods": "OPTIONS, POST",
				"Access-Control-Allow-Headers": "Content-Type",
			},
			Body: "",
		}, nil
	}
	var Global_transactions models.Global_transactions

	err := json.Unmarshal([]byte(request.Body), &Global_transactions)
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 400,
			Headers: map[string]string{
				"Access-Control-Allow-Origin": allowedOrigin,
			}, Body: "Invalid request body"}, nil
	}
	log.Println("Parsed Request Body:", Global_transactions)

	// Query User
	var user models.Userauth
	query1 := "SELECT * FROM userauth WHERE user_id = ? LIMIT 1"
	errr := o.Raw(query1, Global_transactions.PayeeID).QueryRow(&user)

	if errr != nil {
		if errr == orm.ErrNoRows {
			log.Println(" User not found")
			return events.APIGatewayProxyResponse{StatusCode: 400, Body: "Invalid credentials",
				Headers: map[string]string{
					"Access-Control-Allow-Origin": allowedOrigin,
				}}, nil
		}
		log.Println(" Database error:", err)
		return events.APIGatewayProxyResponse{StatusCode: 500, Body: fmt.Sprintf("Database error: %s", err),
			Headers: map[string]string{
				"Access-Control-Allow-Origin": allowedOrigin,
			}}, nil
	}
	query := "INSERT INTO Global_transactions(PayerID, PayeeID, Amount, Description) values(?,?,?,?)"
	_, er := o.Raw(query, Global_transactions.PayerID, Global_transactions.PayeeID, Global_transactions.Amount, Global_transactions.Description).Exec()
	if er != nil {
		log.Println(" Database error:", er)
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
		"message": "expense added",
	})
	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  allowedOrigin,
			"Access-Control-Allow-Methods": "OPTIONS, POST",
			"Access-Control-Allow-Headers": "Content-Type",
		},
		Body: string(responseBody),
	}, nil

}














func AddExpenseHandlerLocal(w http.ResponseWriter, r *http.Request, o orm.Ormer) {
	allowedOrigin := "http://localhost:8081"

	// Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
		return
	}

	// Decode request body
	var globalTxn models.Global_transactions
	err := json.NewDecoder(r.Body).Decode(&globalTxn)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	log.Println("Parsed Request Body:", globalTxn)

	// Validate payee
	var user models.Userauth
	query1 := "SELECT * FROM userauth WHERE user_id = ? LIMIT 1"
	errr := o.Raw(query1, globalTxn.PayeeID).QueryRow(&user)

	if errr != nil {
		if errr == orm.ErrNoRows {
			log.Println("User not found")
			http.Error(w, "Invalid credentials", http.StatusBadRequest)
			return
		}
		log.Println("Database error:", errr)
		http.Error(w, fmt.Sprintf("Database error: %s", errr), http.StatusInternalServerError)
		return
	}

	// Insert transaction
	query := "INSERT INTO Global_transactions(PayerID, PayeeID, Amount, Description) values(?,?,?,?)"
	_, execErr := o.Raw(query, globalTxn.PayerID, globalTxn.PayeeID, globalTxn.Amount, globalTxn.Description).Exec()
	if execErr != nil {
		log.Println("Database error:", execErr)
		http.Error(w, `{"message": "Database error"}`, http.StatusInternalServerError)
		return
	}

	// Success response
	responseBody, _ := json.Marshal(map[string]string{
		"code":    "200",
		"message": "expense added",
	})
	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBody)
}
