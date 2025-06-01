package routes

import (
	"encoding/json"
	"expense-split-backend/models"
	"log"

	"net/http"

	"github.com/astaxie/beego/orm"
	"github.com/aws/aws-lambda-go/events"
)

func SigninHandler(o orm.Ormer, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
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

	var requestBody map[string]string

	err := json.Unmarshal([]byte(request.Body), &requestBody)
	if err != nil {
		return events.APIGatewayProxyResponse{StatusCode: 400,
			Headers: map[string]string{
				"Access-Control-Allow-Origin": allowedOrigin,
			}, Body: "Invalid request body"}, nil
	}
	log.Println("Parsed Request Body:", requestBody)

	name := requestBody["Name"]
	mobile := requestBody["mobile"]
	log.Println("request Body:", requestBody)
	log.Println("name :", name, "mobile :", mobile)
	if name == "" || mobile == "" {
		return events.APIGatewayProxyResponse{
			StatusCode: 400,
			Headers: map[string]string{
				"Access-Control-Allow-Origin":  allowedOrigin,
				"Access-Control-Allow-Methods": "OPTIONS, POST",
				"Access-Control-Allow-Headers": "Content-Type",
			}, Body: `{"message": "empty inputs"}`}, nil
	}

	var user models.Userauth

	// Query User
	query := "SELECT * FROM userauth WHERE mobile = ? LIMIT 1"
	error := o.Raw(query, mobile).QueryRow(&user)

	if error == orm.ErrNoRows {
		log.Println(" New user proceeding to create account")
		userID := generateUserID()
		query := "insert into userauth(User_id, Mobile, Name) values(?, ?, ?)"
		_, errr := o.Raw(query, userID, mobile, name).Exec()
		if errr != nil {
			log.Println(" Database error:", err)
			return events.APIGatewayProxyResponse{
				StatusCode: 200,
				Headers: map[string]string{
					"Access-Control-Allow-Origin": allowedOrigin,
				},
				Body: `{"message": "Database error:"}`,
			}, nil
		}
		responseBody, _ := json.Marshal(map[string]string{
			"code":      "200",
			"user_id":   userID,
			"user_name": name,
			"mobile":    mobile,
			"message":   "Signin successful",
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

	responseBody, _ := json.Marshal(map[string]string{
		"message": "User already exists please login",
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













func SigninHandlerLocal(w http.ResponseWriter, r *http.Request, o orm.Ormer) {
	allowedOrigin := "http://localhost:8081"

	// Handle CORS preflight
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
		return
	}

	var requestBody map[string]string
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Println("Parsed Request Body:", requestBody)

	name := requestBody["Name"]
	mobile := requestBody["mobile"]
	log.Println("name:", name, "mobile:", mobile)

	if name == "" || mobile == "" {
		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		http.Error(w, `{"message": "empty inputs"}`, http.StatusBadRequest)
		return
	}

	var user models.Userauth

	// Check if user exists
	query := "SELECT * FROM userauth WHERE mobile = ? LIMIT 1"
	err := o.Raw(query, mobile).QueryRow(&user)

	if err == orm.ErrNoRows {
		// New user, insert into DB
		log.Println("New user proceeding to create account")
		userID := generateUserID()
		insertQuery := "INSERT INTO userauth(User_id, Mobile, Name) VALUES (?, ?, ?)"
		_, err := o.Raw(insertQuery, userID, mobile, name).Exec()
		if err != nil {
			log.Println("Database error while inserting user:", err)
			http.Error(w, `{"message": "Database error"}`, http.StatusInternalServerError)
			return
		}

		responseBody, _ := json.Marshal(map[string]string{
			"code":      "200",
			"user_id":   userID,
			"user_name": name,
			"mobile":    mobile,
			"message":   "Signin successful",
		})

		w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(responseBody)
		return
	}

	// If user exists
	responseBody, _ := json.Marshal(map[string]string{
		"message": "User already exists please login",
	})
	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Methods", "OPTIONS, POST")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBody)
}
