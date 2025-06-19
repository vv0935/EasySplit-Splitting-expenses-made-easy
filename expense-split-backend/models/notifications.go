package models

import (
	"github.com/astaxie/beego/orm"
	"time"
)
type Notification struct {
    NotificationID int    `orm:"auto;pk" json:"notification_id"`
	Type           string `orm:"type(text)" json:"type"`
    UserID         string    `orm:"type(text)" json:"user_id"`  // Payee
    Message        string `orm:"type(text)" json:"message"`
    IsRead         bool   `orm:"default(false)" json:"is_read"`
    CreatedAt time.Time `orm:"auto_now_add;type(datetime)"`
}

// Register the model
func init() {
    orm.RegisterModel(new(Notification))
}
