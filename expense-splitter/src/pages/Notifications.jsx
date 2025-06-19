import React, { useEffect, useState } from "react";
import styles from "./Notification.module.css";
import { useNavigate } from "react-router-dom";
import { Loader } from "../components/Loader";
import { Snackbar, Alert } from "@mui/material";

export function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error"
  });

  const token = localStorage.getItem("checkit-token");
  const userId = localStorage.getItem("user_id");
  const baseURL = "http://localhost:9000";
  // const base url = "lambaapi"
  const hasUnread = notifications.some((notif) => !notif.is_read);

  const showSnackbar = (message, severity = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // 📥 Get notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseURL}/notification/get`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        showSnackbar("Session expired. Please log in again.", "error"); // error 401
        localStorage.removeItem("checkit-token");
        localStorage.removeItem("user_id");
        navigate("/login"); // ✅ Redirect to login
        return;
      }
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error", err);
      showSnackbar("Failed to fetch notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Mark single as read
  const markAsRead = async (notificationID) => {
    try {
      const res = await fetch(`${baseURL}/notification/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notification_id: notificationID,
        }),
      });
      if (res.status === 401) {
        showSnackbar("Session expired. Please log in again.", "error");  // error 401
        localStorage.removeItem("checkit-token");
        localStorage.removeItem("user_id");
        navigate("/login"); // ✅ Redirect to login
        return;
      }
      if (res.ok) {
        fetchNotifications(); // Refresh
      }
    } catch (err) {
      console.error("Mark one error", err);
      showSnackbar("Failed to mark notification as read.");
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${baseURL}/notification/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mark_all: true,
        }),
      });

      if (res.status === 401) {
        showSnackbar("Session expired. Please log in again.", "error");   // 401 error
        localStorage.removeItem("checkit-token");
        localStorage.removeItem("user_id");
        navigate("/login"); // ✅ Redirect to login
        return;
      }

      if (res.ok) {
        fetchNotifications(); // Refresh
      }
    } catch (err) {
      console.error("Mark all error", err);
      showSnackbar("Failed to mark all as read.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("checkit-token");
    localStorage.removeItem("user_id");
    navigate("/", {
      state: {
        snackbar: {
          open: true,
          message: "Logged out successfully",
          severity: "success"
        }
      }
    });
  };

  useEffect(() => {
    if (!userId) {
      showSnackbar("User ID not found! Please login", "error");
      navigate("/login");
      return;
    }
    fetchNotifications();
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className={styles.brand}>Easy Split</h2>
        </div>

        <nav className={styles.navLinks}>
          <a className={`${styles.linkin} ${styles.link}`} href="/dashboard">Dashboard</a>
          <a>Groups</a>
          <a className={`${styles.active} ${styles.link}`} href="/notification">🔔 Notifications</a>
          <a className={`${styles.linkout} ${styles.link}`} onClick={handleLogout}>Log Out</a>
        </nav>
      </header>

      <main className={`${styles.footerButtons} ${styles.main}`}>
        {Array.isArray(notifications) && notifications.length > 0 && (
          <div className={styles.notificationTitle}>
            🔔 Notifications
            <button
              className={styles.markAllButton}
              onClick={markAllAsRead}
              disabled={!hasUnread}
            >
              Mark All as Read
            </button>
          </div>
        )}

        {!Array.isArray(notifications) || notifications.length === 0 ? (
          <div className={styles.noData}>
            <p>No notifications yet</p>
            <p className={styles.lightText}>All your recent transaction notifications will be shown here</p>
          </div>
        ) : (
          <div className={styles.notificationList}>
            {notifications.map((notif) => (
              <div
                key={notif.notification_id}
                className={`${styles.notificationCard} ${notif.is_read ? styles.read_message : styles.unread_message}`}
              >
                <div className={styles.messageRow}>
                  <span>{notif.message}</span>
                  <button
                    className={`${styles.iconButton} ${notif.is_read ? styles.read : styles.unread}`}
                    onClick={() => {
                      if (!notif.is_read) {
                        markAsRead(notif.notification_id);
                      }
                    }}
                    title={notif.is_read ? "Read" : "Mark as Read"}
                  >
                    {notif.is_read ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail-open">
                        <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                        <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                        <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                      </svg>
                    )}
                  </button>

                </div>
                <p className={styles.timestamp}>
                  {new Date(notif.CreatedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            backgroundColor: snackbar.severity === "success" ? "#2e7d32" : "#c62828",
            color: "#fff",
            width: "100%"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}