package routes

import (
	"encoding/json"
	"expense-split-backend/models"
	"log"

	"net/http"
	"time"

	"github.com/astaxie/beego/orm"
	"github.com/aws/aws-lambda-go/events"


	//new-auth
	"golang.org/x/crypto/bcrypt" //  Added for password hashing
	"github.com/golang-jwt/jwt/v4" //  Added for JWT token generation
)

//  JWT secret key (store securely in env variable in production)
var jwtSecret = []byte("my-secret-key-split")


//  Function to generate token
func generateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		// "exp":     time.Now().Add(time.Hour * 24).Unix(), // expires in 24 hrs
		"exp": time.Now().Add(time.Minute * 5).Unix(), //30 sec
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}// how this token is formed



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
	password := requestBody["password"] //  Accept password from request

	log.Println("request Body:", requestBody)
	log.Println("name :", name, "mobile :", mobile)

	//only check in fe 
	if name == "" || mobile == "" || password == "" { //  Validate password too
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

		//  Hash the password before storing
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)   //  what is this type
		if err != nil {
			log.Println("Password hashing failed:", err)
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers: map[string]string{
					"Access-Control-Allow-Origin": allowedOrigin,
				},
				Body: `{"message": "Password hashing failed"}`,
			}, nil
		}
		// 🔐 Save hashed password in DB
		
		query := "insert into userauth(User_id, Mobile, Name, Password) values(?, ?, ?, ?)"
		_, errr := o.Raw(query, userID, mobile, name, string(hashedPassword)).Exec()

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

		//  Generate token
		token, err := generateToken(userID)
		if err != nil {
			log.Println("Token generation error:", err)
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
				Headers: map[string]string{
					"Access-Control-Allow-Origin": allowedOrigin,
				},
				Body: `{"message": "Token generation error"}`,
			}, nil
		}

		responseBody, _ := json.Marshal(map[string]string{
			"code":      "200",
			"user_id":   userID,
			"user_name": name,
			"mobile":    mobile,
			"token":     token,
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
//  Existing user found — ask to login instead
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
	password := requestBody["password"]

	log.Println("name:", name, "mobile:", mobile)

	if name == "" || mobile == "" || password == "" {
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
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			log.Println("Password hashing failed:", err)
			http.Error(w, `{"message": "Password hashing failed"}`, http.StatusInternalServerError)
			return
		}

		insertQuery := "INSERT INTO userauth(User_id, Mobile, Name, Password) VALUES (?, ?, ?, ?)"
		_, err = o.Raw(insertQuery, userID, mobile, name, string(hashedPassword)).Exec()
		if err != nil {
			log.Println("Database error while inserting user:", err)
			http.Error(w, `{"message": "Database error"}`, http.StatusInternalServerError)
			return
		}

		//  Generate token
		token, err := generateToken(userID)
		if err != nil {
			log.Println("Token generation error:", err)
			http.Error(w, `{"message": "Token generation error"}`, http.StatusInternalServerError)
			return
		}

		responseBody, _ := json.Marshal(map[string]string{
			"code":      "200",
			"user_id":   userID,
			"user_name": name,
			"mobile":    mobile,
			"token":     token,
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
