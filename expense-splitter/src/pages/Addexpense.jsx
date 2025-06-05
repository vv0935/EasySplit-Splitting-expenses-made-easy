// import React, { useState } from "react";
// import styles from '../components/Loginform.module.css'
// import { useNavigate, useLocation } from "react-router-dom";

// export function Addexpense() {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const searchParams = new URLSearchParams(location.search);
//     const friend_id = searchParams.get("friend_id");

//     const [Friend_id, setid] = useState("" || friend_id)
//     const [Amount, setcost] = useState("")
//     const [Desc, setdesc] = useState("")


//     const handleSubmit = async (e) => {
//         e.preventDefault();//prevents default form submission behavour which reloads the page
//         if (!Friend_id || !Amount || !Desc) {
//             window.alert("please enter all the details")
//         }
//         try {
//             // const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-login-createExpense`, {
//             const response = await fetch(`http://localhost:9000/easysplit-login-createExpense`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     payer_id: localStorage.getItem("user_id"),
//                     payee_id: Friend_id,
//                     amount: Number(Amount),
//                     description: Desc
//                 }),
//             });
//             console.log("before invalid Response:", response);
//             if (!response.ok) {
//                 throw new Error("invalid credentials")
//             }

//             console.log("before parsing Response:", response);
//             let data = await response.json();
//             console.log("after parsing Response:", data);
//             if (data.message == "expense added") {
//                 window.alert("Added expense")
//                 navigate(`/friend-transactions?friend_id=${Friend_id}`)
//             }
//         }
//         catch (error) {
//             alert(error.message)
//         }

//     }
//     return (
//         <div className={styles.loginContainer}>
//             <div className={styles.loginBox}>
//                 <h2 className={styles.loginTitle}> Add Expense</h2>
//                 <form onSubmit={handleSubmit}>
//                     <input className={styles.inputField} type="text" placeholder="Enter Friend ID" value={Friend_id} onChange={(e) => (setid(e.target.value))}></input>
//                     <input className={styles.inputField} type="number" placeholder="Enter Amount" value={Amount} 
//                     onChange={(e) => {
//                         const value = e.target.value;
//                         if (!value || parseFloat(value) >= 0) {
//                             setcost(value);}
//                     }}></input>
//                 <input className={styles.inputField} type="text" placeholder="Enter Description" value={Desc} onChange={(e) => (setdesc(e.target.value))}></input>

//                 <button className={styles.loginBtn} type="submit">Submit</button>
//             </form>
//         </div>
//             </div >

//         )

// }


import React, { useState, useEffect } from "react";
import styles from "./Addexpense.module.css";
import { useNavigate, useLocation } from "react-router-dom";

export function Addexpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialFriendId = searchParams.get("friend_id");

  const [Friend_id, setid] = useState(initialFriendId || "");
  const [Amount, setcost] = useState("");
  const [Desc, setdesc] = useState("");
  const [SharedWith, setSharedWith] = useState("");
  const [Notes, setNotes] = useState("");
  const [Users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem("checkit-token"); // ✅ Add token
        const response = await fetch("http://localhost:9000/get-all-users", {
          headers: {
            "Authorization": `Bearer ${token}`, // ✅ Add token in headers
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Could not load users");
      }
    }

    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Friend_id || !Amount || !Desc) {
      window.alert("Please enter all required details");
      return;
    }
    try {
      const token = localStorage.getItem("checkit-token"); // ✅ Add token

      //const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-login-createExpense`, {

      const response = await fetch("http://localhost:9000/easysplit-login-createExpense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Add token to headers
        },
        body: JSON.stringify({
          payer_id: localStorage.getItem("user_id"),
          payee_id: Friend_id,
          amount: Number(Amount),
          description: Desc,
          notes: Notes,
        }),
      });

      if (response.status === 401) {
        alert("Session expired. Please log in again."); // ✅ Alert on 401
        localStorage.removeItem("checkit-token");
        localStorage.removeItem("user_id");
        navigate("/login"); // ✅ Redirect to login
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      const data = await response.json();
      if (data.message === "expense added") {
        window.alert("Expense added successfully");
        navigate(`/friend-transactions?friend_id=${Friend_id}`);
      }
    } catch (error) {
      alert(error.message);
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
            <a>Friends</a>
            <a>Groups</a>
            <a className={`${styles.linkout} ${styles.link}`} href="/" onClick={() => navigate("/")}>Log Out</a>
          </nav>
        </header>
      </div>

      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h2 className={styles.loginTitle}>Add Expense</h2>
          <form onSubmit={handleSubmit}>
            <label className={styles.label}>
              Select Friend
              <select
                className={styles.inputField}
                value={Friend_id}
                onChange={(e) => setid(e.target.value)}
              >
                <option value="">-- Select a friend --</option>
                {Users.filter(user => user.user_id !== localStorage.getItem("user_id")).map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.name} ({user.user_id})
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.label}>
              Amount
              <input
                className={styles.inputField}
                type="number"
                placeholder="Enter Amount"
                value={Amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value || parseFloat(value) >= 0) {
                    setcost(value);
                  }
                }}
              />
            </label>

            <label className={styles.label}>
              Description
              <input
                className={styles.inputField}
                type="text"
                placeholder="Enter Description"
                value={Desc}
                onChange={(e) => setdesc(e.target.value)}
              />
            </label>

            <label className={styles.label}>
              Split
              <select
                className={styles.inputField}
                value={SharedWith}
                onChange={(e) => setSharedWith(e.target.value)}
              >
                <option value="">Select</option>
                <option value="Equally">Equally</option>
                <option value="They pay Complete">Complete pay</option>
              </select>
            </label>

            <label className={styles.label}>
              Notes (optional)
              <textarea
                className={styles.textArea}
                placeholder="Add any notes about the expense"
                value={Notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <button className={styles.loginBtn} type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
