// package routes

// import (
// 	"context"
// 	"expense-split-backend/models"
// 	"fmt"

// 	"github.com/aws/aws-lambda-go/events"
// 	"github.com/aws/aws-lambda-go/lambda"
// 	"gorm.io/gorm"
// 	"github.com/astaxie/beego/orm"
// )

// var Db *gorm.DB

// func Authroutes(db *gorm.DB, router *gin.Engine) {
// 	userGroup := router.Group("/user")
// 	{
// 		userGroup.GET("/easysplit.com/authlogin", func(c *gin.Context) {
// 			ID := c.Query("user_id")
// 			MobileNo := c.Query(("mobile"))
// 			var user models.Userauth
// 			res := db.Where("User_id=? OR Mobile=?", ID, MobileNo).First(&user)
// 			if res.Error != nil {
// 				c.JSON(400, gin.H{"Error": "Invalid credentials"})
// 				return
// 			}
// 			c.JSON(200, gin.H{"success": " credentials"})
// 		})

// 	}

// }

// func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
// 	ID := request.QueryStringParameters["user_id"]
// 	MobileNo := request.QueryStringParameters["mobile"]
// 	if ID == "" {
// 		if val, ok := request.MultiValueQueryStringParameters["user_id"]; ok && len(val) > 0 {
// 			ID = val[0]
// 		}
// 	}
// 	if MobileNo == "" {
// 		if val, ok := request.MultiValueQueryStringParameters["mobile"]; ok && len(val) > 0 {
// 			MobileNo = val[0]
// 		}
// 	}
// 	fmt.Println("ID:", ID)
// 	fmt.Println("MobileNo:", MobileNo)
// 	fmt.Println("Raw Event:", request)
// 	var user models.Userauth
// 	res := Db.Where("User_id=? OR Mobile=?", ID, MobileNo).First(&user)
// 	fmt.Println("✅ Extracted user_id:", ID, "mobile:", MobileNo)

// 	if ID == "" || MobileNo == "" {
// 		return events.APIGatewayProxyResponse{StatusCode: 400, Body: "Missing query parameters"}, nil
// 	}
// 	if res.Error != nil {
// 		return events.APIGatewayProxyResponse{
// 			StatusCode: 200,
// 			Body:       fmt.Sprintf("invalid credentials %s", res.Error),
// 		}, nil
// 	}
// 	return events.APIGatewayProxyResponse{
// 		StatusCode: 200,
// 		Headers: map[string]string{
// 			"Access-Control-Allow-Origin":  "*",
// 			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// 			"Access-Control-Allow-Headers": "Content-Type",
// 		},
// 		Body: fmt.Sprintf("Welcome user %s", user.User_id),
// 	}, nil

// }

// import (
// 	"context"
// 	"expense-split-backend/models"
// 	"fmt"
// 	"log"

// 	"github.com/astaxie/beego/orm"
// 	"github.com/aws/aws-lambda-go/events"
// 	"github.com/aws/aws-lambda-go/lambda"
// 	_ "github.com/go-sql-driver/mysql" // Ensure MySQL driver is imported
// )

// // Initialize ORM
// var o orm.Ormer

// func init() {
// 	// Register model
// 	orm.RegisterModel(new(models.Userauth))

// 	// Register default database (update with your DB credentials)
// 	orm.RegisterDataBase("default", "mysql", "root:Vaishuveera@2@tcp(0.tcp.in.ngrok.io:12200)/Splitwiser?charset=utf8mb4&parseTime=True&loc=Local")

// 	// Create ORM object
// 	o = orm.NewOrm()
// }

// // Lambda Handler
// func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
// 	ID := request.QueryStringParameters["user_id"]
// 	MobileNo := request.QueryStringParameters["mobile"]

// 	if ID == "" {
// 		if val, ok := request.MultiValueQueryStringParameters["user_id"]; ok && len(val) > 0 {
// 			ID = val[0]
// 		}
// 	}
// 	if MobileNo == "" {
// 		if val, ok := request.MultiValueQueryStringParameters["mobile"]; ok && len(val) > 0 {
// 			MobileNo = val[0]
// 		}
// 	}

// 	log.Println("ID:", ID)
// 	log.Println("MobileNo:", MobileNo)
// 	log.Println("Raw Event:", request)

// 	var user models.Userauth
// 	err := o.QueryTable("userauths").Filter("User_id", ID).Filter("Mobile", MobileNo).One(&user)

// 	if err == orm.ErrNoRows {
// 		return events.APIGatewayProxyResponse{
// 			StatusCode: 200,
// 			Body:       "Invalid credentials: record not found",
// 		}, nil
// 	} else if err != nil {
// 		return events.APIGatewayProxyResponse{
// 			StatusCode: 500,
// 			Body:       fmt.Sprintf("Database error: %s", err),
// 		}, nil
// 	}

// 	return events.APIGatewayProxyResponse{
// 		StatusCode: 200,
// 		Headers: map[string]string{
// 			"Access-Control-Allow-Origin":  "*",
// 			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// 			"Access-Control-Allow-Headers": "Content-Type",
// 		},
// 		Body: fmt.Sprintf("Welcome user %s", user.User_id),
// 	}, nil
// }

// func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
// 	var inputUser Userauth
// 	errr := json.Unmarshal([]byte(request.Body), &inputUser)
// 	if errr != nil {
// 		log.Println("Error json:", errr)
// 		return events.APIGatewayProxyResponse{StatusCode: 400, Body: "json related error"}, nil
// 	}

// 	log.Println("Received user:", request.Body)
// 	var user Userauth
// 	res := Db.Where("ID=? OR mobilenum=?", inputUser.User_id, inputUser.Mobile).First(&user)

// 	if res != nil {
// 		ctx.JSON(http.StatusBadRequest, gin.H{"messege": "Invalid ID"})
// 	}
// 	ctx.JSON(200, gin.H{"User_id": inputUser.User_id, "mobile": inputUser.Mobile})

// 	return events.APIGatewayProxyResponse{StatusCode: 200, Body: inputUser.Mobile}, nil
// }

// func InitLambda(db *gorm.DB) {
// 	Db = db
// 	lambda.Start(handler)
// }

// func InitLambda() {
// 	lambda.Start(handler)
// }

// package routes

// import (
// 	"context"
// 	"errors"
// 	"math/rand"
// 	"strconv"
// 	"time"

// 	"github.com/astaxie/beego/orm"
// 	"github.com/aws/aws-lambda-go/events"
// 	"github.com/aws/aws-lambda-go/lambda"
// )

// func generateUserID() string {
// 	rand.Seed(time.Now().UnixNano())
// 	return strconv.Itoa(rand.Intn(90000) + 10000)
// }

// // Initialize ORM
// var o orm.Ormer

// func handler(ctx context.Context, event interface{}) (interface{}, error) {
// 	switch e := event.(type) {
// 	case events.APIGatewayV2HTTPRequest:
// 		return handleV2Request(e)
// 	case events.APIGatewayProxyRequest:
// 		return handleV1Request(e)
// 	default:
// 		return nil, errors.New("unsupported event type")
// 	}
// }

// func handleV2Request(e events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
// 	// Handle API Gateway V2 request
// 	// Example:
// 	if e.RawPath == "/easysplit-create-expense" {
// 		return AddExpenseHandler(o, e)
// 	}
// 	// Add more route handling as needed
// 	return events.APIGatewayV2HTTPResponse{
// 		StatusCode: 404,
// 		Body:       "Not Found",
// 	}, nil
// }

// func handleV1Request(e events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
// 	// Handle API Gateway V1 request
// 	// Example:
// 	if e.Path == "/easysplit-login" {
// 		return LoginHandler(o, e)
// 	} else if e.Path == "/easysplit-signin" {
// 		return SigninHandler(o, e)
// 	} else if e.Path == "/easysplit-get_friends" {
// 		return GetDashboardHandler(o, e)
// 	}
// 	// Add more route handling as needed
// 	return events.APIGatewayProxyResponse{
// 		StatusCode: 404,
// 		Body:       "Not Found",
// 	}, nil
// }

// func InitLambda() {
// 	lambda.Start(handler)
// }

package routes

import (
	"context"
	"log"
	"math/rand"
	"strconv"
	"time"

	"github.com/astaxie/beego/orm"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func generateUserID() string {
	rand.Seed(time.Now().UnixNano())
	return strconv.Itoa(rand.Intn(90000) + 10000)
}

// Initialize ORM
var o orm.Ormer

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	o = orm.NewOrm()
	log.Println("Path:", request.Path)
	if request.Path == "/easysplit-login" {
		return LoginHandler(o, request)
	} else if request.Path == "/easysplit-signin" {
		return SigninHandler(o, request)
	} else if request.Path == "/easysplit-get_friends" {
		return GetDashboardHandler(o, request)
	} else if request.Path == "/easysplit-login-createExpense" {
		return AddExpenseHandler(o, request)
	} else if request.Path == "/easysplit-settle-expense" {
		return SettleExpenseHandler(o, request)
	} else if request.Path == "/easysplit-get_friend_transactions" {
		return GetFriendHandler(o, request)
	}else if request.Path == "/easysplit-get-users" {
		return GetAllUsersHandler(o, request)
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
		Body: "Invalid path",
	}, nil

}

func InitLambda() {
	lambda.Start(handler)

}
