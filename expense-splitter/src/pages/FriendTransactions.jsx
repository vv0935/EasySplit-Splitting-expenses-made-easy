// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import styles from "./Friend.module.css";
// import { Loader } from "../components/Loader";


// export function FriendTransactions() {
//     const nav = useNavigate();
//     const location = useLocation();
//     const [FriendData, setFriendData] = useState([]);
//     const userId = localStorage.getItem("user_id");
//     const searchParams = new URLSearchParams(location.search);
//     const friendId = searchParams.get("friend_id");
//     const [FriendName, setFriendName] = useState("");
//     const [Balance, setBalance] = useState(0);
//     const [loading, setLoading] = useState(false)

//     useEffect(() => {
//         if (!userId) {
//             alert("User ID not found!");
//             return;
//         }

//         const getFriends = async () => {
//             setLoading(true);
//             try {
//                 const response = await fetch(
//                     // `https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-get_friend_transactions?user_id=${userId}&friend_id=${friendId}`,
//                     `http://localhost:9000/easysplit-get_friend_transactions?user_id=${userId}&friend_id=${friendId}`,
//                     {
//                         method: "GET",
//                         headers: {
//                             "Content-Type": "application/json",
//                         },
//                     }
//                 );

//                 if (!response.ok) {
//                     throw new Error("Invalid response");
//                 }

//                 const data = await response.json();
//                 setFriendName(data.Friend_Name);
//                 setFriendData(data.data);
//                 setBalance(data.Balance);
//             } catch (error) {
//                 alert(error.message);
//             } finally {
//                 setLoading(false)
//             }
//         };

//         getFriends();
//     }, [userId]);

//     return (
//         <>
//             {loading ? <Loader /> :
//                 <div className={styles.body}>
//                     <div className={styles.friendTransactionsContainer}>
//                         <div className={styles.dashboardHeader}>
//                             <h1 className={styles.friendHeading}>You and {FriendName}</h1>
//                             <div className={styles.buttonContainer}>
//                                 <button onClick={() => nav(`/addexpense?&friend_id=${friendId}`)}>
//                                     Add
//                                 </button>
//                                 <button onClick={() => nav(`/settleexpense?&friend_id=${friendId}`)}>
//                                     Settle
//                                 </button>
//                                 <button onClick={() => nav("/dashboard")}>Dashboard</button>
//                             </div>
//                         </div>
//                         <h2 className={styles.balanceInfo}>
//                             {Balance > 0 ? `You get ₹${Math.abs(Balance)}` : `You owe ₹${Math.abs(Balance)}`}
//                         </h2>
//                         <ul className={styles.transactionList}>
//                             {FriendData? (
//                                 FriendData.map((transaction, index) => (
//                                     <li
//                                         key={index}
//                                         className={`${styles.transactionItem} ${transaction.status === "Paid"
//                                             ? styles.positiveBalance
//                                             : styles.negativeBalance
//                                             }`}
//                                     >
//                                         {transaction.description === "settle"
//                                             ? `${transaction.description} - Amount: ₹${transaction.amount}`
//                                             : `${transaction.description} - Amount: ₹${transaction.amount} - Share: ₹${transaction.share} (${transaction.status})`}
//                                     </li>
//                                 ))
//                             ) : (
//                                 <h2>No transactions entered</h2>
//                             )}
//                         </ul>

//                     </div>

//                 </div>}
//         </>


//     );
// }



import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Friend.module.css";
import { Loader } from "../components/Loader";

export function FriendTransactions() {
    const nav = useNavigate();
    const location = useLocation();
    const [FriendData, setFriendData] = useState([]);
    const userId = localStorage.getItem("user_id");
    const searchParams = new URLSearchParams(location.search);
    const friendId = searchParams.get("friend_id");
    const [FriendName, setFriendName] = useState("");
    const [Balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) {
            alert("User ID not found!");
            return;
        }

        const getFriends = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    // `https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-get_friend_transactions?user_id=${userId}&friend_id=${friendId}`,

                    `http://localhost:9000/easysplit-get_friend_transactions?user_id=${userId}&friend_id=${friendId}`
                );
                if (!response.ok) throw new Error("Invalid response");
                const data = await response.json();
                setFriendName(data.Friend_Name);
                setFriendData(data.data);
                setBalance(data.Balance);
            } catch (error) {
                alert(error.message);
            } finally {
                setLoading(false);
            }
        };

        getFriends();
    }, [userId]);

    return loading ? (
        <Loader />
    ) : (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.logoSection}>
                    <div className={styles.logo}>
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor" />
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
            <div className={styles.PageTitle}>
                You and {FriendName}
                <div className={styles.actions}>
                    <div className={styles.footerButtons}>
                        <button className={styles.addExpenseButton} onClick={() => nav("/addexpense")}>
                            Add Expense
                        </button>

                        {Balance < 0 && (
                            <button
                                className={styles.addExpenseButton}
                                onClick={() =>
                                    nav(`/settleexpense?friend_id=${friendId}&amount=${Math.abs(Balance)}&name=${FriendName}`)
                                }
                            >
                                Settle Up
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.balance}>
                    {Balance > 0 ? (
                        <span className={styles.positive}>You get ₹{Math.abs(Balance)}</span>
                    ) : (
                        <span className={styles.negative}>You owe ₹{Math.abs(Balance)}</span>
                    )}
                </div>

                <h3 className={styles.sectionTitle}>Transactions:</h3>
                <div className={styles.transactionList}>
                    {FriendData.length > 0 ? (
                        FriendData.map((t, idx) => (
                            <div
                                key={idx}
                                className={`${styles.transactionCard} ${t.status === "Paid" ? styles.positive : styles.negative}`}
                            >
                                <p className={styles.description}>
                                    {t.description === "    "
                                        ? `Settled ₹${t.amount}`
                                        : `${t.description}`}
                                </p>
                                {t.description !== "settle" && (
                                    <p className={styles.meta}>You {t.status === "Paid" ? "get" : "owe"} ₹{t.share}</p>
                                )}
                                <span className={styles.amount}>₹{t.amount}</span>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noData}>No transactions with {FriendName}</p>
                    )}
                </div>
            </div>
        </div >
    );
}
