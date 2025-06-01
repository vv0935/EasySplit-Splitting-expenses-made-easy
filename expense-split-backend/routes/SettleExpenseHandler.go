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

func SettleExpenseHandler(o orm.Ormer, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
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
	er := o.Raw(query1, Global_transactions.PayeeID).QueryRow(&user)

	if er != nil {
		if er == orm.ErrNoRows {
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
	_, errr := o.Raw(query, Global_transactions.PayerID, Global_transactions.PayeeID, Global_transactions.Amount, Global_transactions.Description).Exec()
	if errr != nil {
		log.Println(" Database error:", errr)
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
		"message": "settle added",
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











func SettleExpenseHandlerLocal(w http.ResponseWriter, r *http.Request, o orm.Ormer) {
	allowedOrigin := "http://localhost:8081"

	// Handle CORS preflight request
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
		return
	}

	var globalTransaction models.Global_transactions
	if err := json.NewDecoder(r.Body).Decode(&globalTransaction); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	log.Println("Parsed Request Body:", globalTransaction)

	// Query user to verify existence
	var user models.Userauth
	query1 := "SELECT * FROM userauth WHERE user_id = ? LIMIT 1"
	err := o.Raw(query1, globalTransaction.PayeeID).QueryRow(&user)
	if err != nil {
		if err == orm.ErrNoRows {
			http.Error(w, `{"message": "Invalid credentials"}`, http.StatusBadRequest)
			return
		}
		http.Error(w, fmt.Sprintf(`{"message": "Database error: %s"}`, err), http.StatusInternalServerError)
		return
	}

	// Insert transaction
	query := "INSERT INTO Global_transactions(PayerID, PayeeID, Amount, Description) VALUES (?, ?, ?, ?)"
	_, errr := o.Raw(query, globalTransaction.PayerID, globalTransaction.PayeeID, globalTransaction.Amount, globalTransaction.Description).Exec()
	if errr != nil {
		log.Println("Database insert error:", errr)
		http.Error(w, `{"message": "Database error"}`, http.StatusInternalServerError)
		return
	}

	responseBody, _ := json.Marshal(map[string]string{
		"code":    "200",
		"message": "settle added",
	})

	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBody)
}
