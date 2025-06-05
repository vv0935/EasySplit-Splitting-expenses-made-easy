package routes

import (
	"encoding/json"
	"expense-split-backend/models"
	"log"
	"net/http"

	"github.com/astaxie/beego/orm"
	"github.com/aws/aws-lambda-go/events"
)

type TransactionResponse struct {
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
	Status      string  `json:"status"`
	Share       float64 `json:"share"`
}

func GetFriendHandler(o orm.Ormer, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// allowedOrigin := "http://easysplit.com:8080"
	allowedOrigin := "http://localhost:8081/"

	FriendID := request.QueryStringParameters["friend_id"]
	UserID := request.QueryStringParameters["user_id"]

	if FriendID == "" || UserID == "" {
		log.Println("friend id or user id is empty")
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusBadRequest,
			Headers: map[string]string{
				"Access-Control-Allow-Origin":  allowedOrigin,
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
				"Content-Type":                 "application/json",
			},
			Body: `{"message": "friend id or user id is empty:"}`,
		}, nil
	}

	var results []models.Global_transactions

	query := `SELECT * FROM Global_transactions WHERE (PayerID=? AND PayeeID=?) OR (PayerID=? AND PayeeID=?) ORDER BY ID DESC`
	numRows, err := o.Raw(query, UserID, FriendID, FriendID, UserID).QueryRows(&results)
	if numRows == 0 {
		log.Println("No transaction were made")
	}

	var friendName string
	errr := o.Raw(`SELECT name FROM userauth WHERE user_id=?`, FriendID).QueryRow(&friendName)
	if errr != nil {
		log.Println("Error fetching friend's name:", err)
		friendName = "Unknown" // Default if not found
	}

	if err != nil {
		log.Println("Database query error:", err)
		return events.APIGatewayProxyResponse{StatusCode: http.StatusInternalServerError,
			Headers: map[string]string{
				"Access-Control-Allow-Origin":  allowedOrigin,
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
				"Content-Type":                 "application/json",
			}, Body: `{"message": "Check your credentilas"}`}, nil
	}

	var balance float64
	var responseTransactions []TransactionResponse
	for _, result := range results {
		var status string
		var share float64
		if result.PayerID == UserID {
			if result.Description == "settle" {
				status = "Paid"
				share = result.Amount
				balance += share // Subtract instead of adding
			} else {
				status = "Paid"
				share = result.Amount / 2
				balance += share
			}
		} else {
			if result.Description == "settle" {
				status = "Owed"
				share = result.Amount
				balance -= share // Add instead of subtracting
			} else {
				status = "Owed"
				share = result.Amount / 2
				balance -= share
			}
		}
		responseTransactions = append(responseTransactions, TransactionResponse{
			Description: result.Description,
			Amount:      result.Amount,
			Status:      status,
			Share:       share,
		})
	}

	responseBody, _ := json.Marshal(map[string]interface{}{
		"code":        200,
		"message":     "Dashboard data retrieved successfully",
		"User_ID":     UserID,
		"Friend_ID":   FriendID,
		"Friend_Name": friendName,
		"data":        responseTransactions,
		"Balance":     balance,
	})
	log.Printf("Query Results: %+v\n", results)
	log.Println("Userid, FriendId", UserID, FriendID)

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  allowedOrigin,
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Content-Type":                 "application/json",
		},
		Body: string(responseBody),
	}, nil
}










func GetFriendHandlerLocal(w http.ResponseWriter, r *http.Request, o orm.Ormer) {
	allowedOrigin := "http://localhost:8081"

	friendID := r.URL.Query().Get("friend_id")
	userID := r.URL.Query().Get("user_id")

	if friendID == "" || userID == "" {
		log.Println("friend_id or user_id is empty")
		http.Error(w, `{"message": "friend id or user id is empty"}`, http.StatusBadRequest)
		return
	}

	var results []models.Global_transactions
	query := `SELECT * FROM Global_transactions WHERE (PayerID=? AND PayeeID=?) OR (PayerID=? AND PayeeID=?) ORDER BY ID DESC`
	numRows, err := o.Raw(query, userID, friendID, friendID, userID).QueryRows(&results)
	if numRows == 0 {
		log.Println("No transactions were made")
	}

	var friendName string
	errr := o.Raw(`SELECT name FROM userauth WHERE user_id=?`, friendID).QueryRow(&friendName)
	if errr != nil {
		log.Println("Error fetching friend's name:", errr)
		friendName = "Unknown"
	}

	if err != nil {
		log.Println("Database query error:", err)
		http.Error(w, `{"message": "Check your credentials"}`, http.StatusInternalServerError)
		return
	}

	var balance float64
	var responseTransactions []TransactionResponse

	for _, result := range results {
		var status string
		var share float64
		if result.PayerID == userID {
			if result.Description == "settle" {
				status = "Paid"
				share = result.Amount
				balance += share
			} else {
				status = "Paid"
				share = result.Amount / 2
				balance += share
			}
		} else {
			if result.Description == "settle" {
				status = "Owed"
				share = result.Amount
				balance -= share
			} else {
				status = "Owed"
				share = result.Amount / 2
				balance -= share
			}
		}
		responseTransactions = append(responseTransactions, TransactionResponse{
			Description: result.Description,
			Amount:      result.Amount,
			Status:      status,
			Share:       share,
		})
	}

	responseBody, _ := json.Marshal(map[string]interface{}{
		"code":        200,
		"message":     "Dashboard data retrieved successfully",
		"User_ID":     userID,
		"Friend_ID":   friendID,
		"Friend_Name": friendName,
		"data":        responseTransactions,
		"Balance":     balance,
	})

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBody)
}
