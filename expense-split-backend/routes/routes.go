package routes

import (
	"net/http"
    // "io"
	// "github.com/aws/aws-lambda-go/events"
	
	"github.com/astaxie/beego/orm"
)


func InitRouter() http.Handler {
    o := orm.NewOrm() // ✅ ensure 'o' is initialized
    mux := http.NewServeMux()

    mux.HandleFunc("/easysplit-signin", func(w http.ResponseWriter, r *http.Request) {
        SigninHandlerLocal(w, r, o)
    })
    mux.HandleFunc("/easysplit-login", func(w http.ResponseWriter, r *http.Request) {
       	LoginHandlerLocal(w, r, o)
    })
	mux.HandleFunc("/easysplit-get_friends", func(w http.ResponseWriter, r *http.Request) {
		GetDashboardHandlerLocal(w, r, o)
	})
    mux.HandleFunc("/easysplit-login-createExpense", func(w http.ResponseWriter, r *http.Request) {
        AddExpenseHandlerLocal(w, r, o)
    })
    mux.HandleFunc("/easysplit-settle-expense", func(w http.ResponseWriter, r *http.Request) {
		SettleExpenseHandlerLocal(w, r, o)
	})
    mux.HandleFunc("/easysplit-get_friend_transactions", func(w http.ResponseWriter, r *http.Request) {
		GetFriendHandlerLocal(w, r, o)
	})
    mux.HandleFunc("/get-all-users", func(w http.ResponseWriter, r *http.Request) {
        GetAllUsersHandlerLocal(w, r, o)
    })
    mux.HandleFunc("/notification/get", func(w http.ResponseWriter, r *http.Request) {
        NotificationFetchHandlerLocal(w, r, o)
    })
    mux.HandleFunc("/notification/read", func(w http.ResponseWriter, r *http.Request) {
        NotificationMarkReadHandlerLocal(w, r, o)
    })
    
	


	return mux
}