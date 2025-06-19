// import React, { useState } from "react";
// import  styles from '../components/Loginform.module.css'
useLocation// import { useNavigate, useLocation } from "react-router-dom";

// export function Settleexpense() {
//     const navigate = useNavigate(); 
//     const location = useLocation();
//     const searchParams = new URLSearchParams(location.search);
//     const friend_id = searchParams.get("friend_id"); 

//     const [Friend_id, setid]=useState(""||friend_id)
//     const [Amount, setcost]=useState(0)
//     // const [Desc, setdesc]=useState("")

//     const handleSubmit= async (e)=>{
//         e.preventDefault();//prevents default form submission behavour which reloads the page
//         if(!Friend_id || !Amount ){
//             window.alert("please enter all the details")
//             return
//         }
//         try{
//             // const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-settle-expense `, {
//             const response = await fetch(`http://localhost:9000/easysplit-settle-expense `, {
//                 method: "POST",
//                 headers: {
//                 "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     payer_id:localStorage.getItem("user_id"),
//                     payee_id:Friend_id,
//                     amount:Number(Amount),
//                     description:"settle"
//             }),
//         });
//         console.log("before invalid Response:", response);
//             if(!response.ok){
//                 throw new Error("invalid credentials")
//             }

//             console.log("before parsing Response:", response);
//             let data = await response.json();
//             console.log("after parsing Response:", data);
//             if(data.message=="settle added"){
//                 window.alert("Added Settle")
//                 // navigate("/dashboard")
//                 navigate(`/friend-transactions?friend_id=${Friend_id}`)
//             }
//         }
//         catch(error){
//             alert(error.message)
//         }

//     }
//     return (
//             <div className={styles.loginContainer}>
//                 <div className={styles.loginBox}>
//                 <h2 className={styles.loginTitle}> Add Settle</h2>
//                 <form onSubmit={handleSubmit}>
//                     <input className={styles.inputField} type="text" placeholder="Enter Friend ID" value={Friend_id} onChange={(e)=>(setid(e.target.value))}></input>
//                     <input className={styles.inputField} type="number" placeholder="Enter Amount" value={Amount} onChange={(e)=>(setcost(e.target.value))}></input>
//                     {/* <input className={styles.inputField} type="text" placeholder="Enter Description" value={Desc} onChange={(e)=>(setdesc(e.target.value))}></input> */}

//                     <button className={styles.loginBtn} type="submit">Submit</button>
//                 </form>
//                 </div>
//             </div>

//         )

// }


import React, { useState, useEffect } from "react";
import styles from "./Addexpense.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";

export function Settleexpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const friend_id = searchParams.get("friend_id");
  const amountFromDashboard = searchParams.get("amount");
  const friendName = searchParams.get("name")

  const [Friend_id, setid] = useState(friend_id || "");
  const [FriendName, setname] = useState(friendName || "");
  const [Amount, setAmount] = useState(amountFromDashboard || "");

  // Snackbar states
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [submitting, setSubmitting] = useState(false);

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


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Friend_id || !Amount) {
      setSnackbar({ open: true, message: "Please enter all required details", severity: "error" });
      return;
    }

    if (isNaN(Amount) || Number(Amount) <= 0) {
      setSnackbar({ open: true, message: "Please enter a valid amount", severity: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("checkit-token"); // Get token
      const response = await fetch(`http://localhost:9000/easysplit-settle-expense`, {
        // const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-settle-expense `, {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`  // 🔐 Attach token
        },
        body: JSON.stringify({
          payer_id: localStorage.getItem("user_id"),
          payee_id: Friend_id,
          amount: Number(Amount),
          description: "settle",
        }),
      });

      console.log("Fetch successful"); // ✅ Won’t run if fetch fails
      console.log("Response status:", response.status);

   
      if (response.status === 401) {
        localStorage.removeItem("checkit-token");
        localStorage.removeItem("user_id");

        navigate("/login", {
          state: {
            snackbar: {
              open: true,
              message: "Session expired. Please log in again.",
              severity: "error",
            }
          }
        });
        return;
      }

      if (!response.ok) throw new Error("Invalid response");

      const data = await response.json();
      if (data.message === "settle added") {
        setSnackbar({ open: true, message: "Settle added successfully", severity: "success" });
        setTimeout(() => {
          navigate(`/friend-transactions?friend_id=${Friend_id}`);
        }, 2000);   //2 secs
      }
    } catch (error) {
      setSubmitting(false); // ✅ Stop translucent effect on error
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  };

  return (
    <div>
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
            <a className={`${styles.linkin} ${styles.link}`} href="/notification">🔔 Notifications</a>
            <a className={`${styles.linkout} ${styles.link}`} onClick={handleLogout}>Log Out</a>
          </nav>
        </header>
      </div>

      <div className={styles.loginContainer}>
        <div
          className={styles.loginBox}
          style={{
            opacity: submitting ? 0.5 : 1,
            pointerEvents: submitting ? "none" : "auto",
          }}
        >
          <h2 className={styles.loginTitle}>Settle Up</h2>
          <form onSubmit={handleSubmit}>
            <label className={styles.label}>
              Friend Name
              <input
                className={`${styles.inputField} ${styles.disabledInput}`}
                type="text"
                value={FriendName}
                disabled
                placeholder="Friend Name"
              />
            </label>
            <label className={styles.label}>
              Friend ID
              <input
                className={`${styles.inputField} ${styles.disabledInput}`}
                type="text"
                value={Friend_id}
                disabled
                placeholder="Friend ID"
              />
            </label>
            <label className={styles.label}>
              Amount
              <input
                className={styles.inputField}
                type="text"
                placeholder="Enter Amount"
                value={Amount ? `₹ ${Amount}` : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9.]/g, ""); // keep digits and dot
                  const validDecimal = raw.split(".").length <= 2 ? raw : Amount; // only allow one dot
                  setAmount(validDecimal);
                }}
              />
            </label>


            <button className={styles.loginBtn} type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
      {/* Snackbar for success or error */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => {
          setSnackbar({ ...snackbar, open: false });
          setSubmitting(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => {
            setSnackbar({ ...snackbar, open: false });
            setSubmitting(false);
          }}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            backgroundColor: snackbar.severity === "success" ? "#2e7d32" : "#c62828",
            color: "#fff",
            width: "100%",
          }}
        >
          <div>{snackbar.message}</div>
          {/* <div className={styles.snackbarContainer}>
            {snackbar.message}
            <div className={styles.progressBarWrapper}>
              <div className={styles.progressBar}></div>
            </div> */}
          {/* </div> */}
        </Alert>
      </Snackbar>
    </div>
  );
}
