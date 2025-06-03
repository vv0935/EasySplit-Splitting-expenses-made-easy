// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import styles from "./Dashboard.module.css";
// import { Loader } from "../components/Loader"
// export function Dashboard() {
//     const nav = useNavigate();
//     const [dashboardData, setDashboardData] = useState([]);
//     const userId = localStorage.getItem("user_id");
//     const Mobile = localStorage.getItem("mobile");
//     const [userName, setName] = useState("");
//     const [netbalance, setNet] = useState(0);
//     const [positivebalance, setPos] = useState(0);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (!userId) {
//             alert("User ID not found!");
//             return;
//         }

//         const getFriends = async () => {
//             setLoading(true);
//             try {
//                 // const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-get_friends?user_id=${userId}&mobile=${Mobile}`, {
//                 const response = await fetch(`http://localhost:9000/easysplit-get_friends?user_id=${userId}&mobile=${Mobile}`, {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                 });

//                 if (!response.ok) {
//                     throw new Error("Invalid response");
//                 }

//                 const data = await response.json();
//                 console.log("Dashboard Data:", data);
//                 setDashboardData(data.data);
//                 setNet(data.Balance);
//                 setPos(data.PositiveBalance);
//                 setName(data.userName);
//             } catch (error) {
//                 alert(error.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         getFriends();
//     }, [userId]);

//     return (
//         <>
//             {loading?<Loader />:
//             <div className={styles.body}>
//                 <div className={styles.dashboard}>
//                     <div className={styles.dashboardHeader}>
//                         <h1 className={styles.heading}>Dashboard</h1>
//                         <div className={styles.buttonContainer}>
//                             <button onClick={() => nav("/addexpense")}>Add</button>
//                             <button onClick={() => nav("/settleexpense")}>Settle</button>
//                             <button onClick={() => nav("/")}>Log out</button>
//                         </div>
//                     </div>
//                     <h2 className={styles.username}>Hello {userName}!!</h2>
//                     <div className={styles.component}>
//                         <div className={styles.Balances}>Balance: {Math.abs(netbalance)}</div>
//                         <div className={styles.Balances}>You Owe: {Math.abs(netbalance - positivebalance)}</div>
//                         <div className={styles.Balances}>You are Owed: {positivebalance}</div>
//                     </div>
//                     <ul className={styles.transactions}>
//                         {dashboardData?.length > 0 ? (
//                             dashboardData.map((friend, index) => (
//                                 <li
//                                     key={index}
//                                     onClick={() => nav(`/friend-transactions?friend_id=${friend.friend_id}`)}
//                                     className={`${styles.displayelements} ${friend.netbalance >= 0 ? styles.positiveBalance : styles.negativeBalance}`}
//                                 >
//                                     {friend.name} (ID: {friend.friend_id}) - Balance: {Math.abs(friend.netbalance)}
//                                 </li>
//                             ))
//                         ) : (
//                             <h3>No transactions entered</h3>
//                         )}
//                     </ul>

//                 </div>

//             </div>}
//         </>

//     );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { Loader } from "../components/Loader";

export function Dashboard() {
    const nav = useNavigate();
    const [dashboardData, setDashboardData] = useState([]);
    const userId = localStorage.getItem("user_id");
    const Mobile = localStorage.getItem("mobile");
    const [userName, setName] = useState("");
    const [netbalance, setNet] = useState(0);
    const [positivebalance, setPos] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) {
            alert("User ID not found!");
            return;
        }

        const getFriends = async () => {
            setLoading(true);
            try {
                // const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-get_friends?user_id=${userId}&mobile=${Mobile}`);

                const response = await fetch(`http://localhost:9000/easysplit-get_friends?user_id=${userId}&mobile=${Mobile}`);
                if (!response.ok) throw new Error("Invalid response");

                const data = await response.json();
                setDashboardData(Array.isArray(data.data) ? data.data : []);
                setNet(data.Balance);
                setPos(data.PositiveBalance);
                setName(data.userName);
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
                    <a className={`${styles.active}`} href="/dashboard">Dashboard</a>
                    <a>Friends</a>
                    <a>Groups</a>
                    <a className={styles.link} onClick={() => nav("/")}>Log Out</a>
                </nav>
            </header>

            <main className={styles.main}>
                <div className={styles.welcomeText}>
                    Welcome! {userName}
                </div>
                <div className={styles.dashboardTitle}>Dashboard
                    <div className={styles.footerButtons}>
                        <button className={styles.addExpenseButton} onClick={() => nav("/addexpense")}>Add Expense</button>
                        {/* <button onClick={() => nav("/settleexpense")}>Settle Expense</button> */}
                    </div>
                </div>
                <div className={styles.balanceContainer}>
                    <div className={styles.card}>
                        <p>Total Outstanding</p>
                        <h3>₹{Math.abs(netbalance)}</h3>
                    </div>
                    <div className={styles.card}>
                        <p>Others Owe You</p>
                        <h3>₹{positivebalance}</h3>
                    </div>
                    <div className={styles.card}>
                        <p>You Owe</p>
                        <h3>₹{Math.abs(netbalance - positivebalance)}</h3>
                    </div>
                </div>

                <h2 className={styles.sectionTitle}>Friends Summary</h2>
                <div className={styles.friendList}>
                    {dashboardData.length > 0 ? (
                        dashboardData.map((friend, index) => (
                            <div className={styles.friendRow} key={index}>
                                <div
                                    onClick={() =>
                                        nav(`/friend-transactions?friend_id=${friend.friend_id}`)
                                    }
                                    className={`${styles.friendCard} ${friend.netbalance >= 0
                                        ? styles.positive
                                        : styles.negative
                                        }`}
                                >
                                    <p>{friend.name}</p>
                                    <p>{friend.description}</p>
                                    <div className={styles.cardRight}>
                                        <span className={styles.amount}>
                                            ₹{Math.abs(friend.netbalance)}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.tooltipWrapper}>

                                    <button
                                        className={`${styles.settleIconBtn} ${friend.netbalance >= 0 ? styles.invisibleBtn : ''
                                            }`}
                                        // title={`Settle Up with ${friend.name}`}
                                        onClick={(e) => {
                                            if (friend.netbalance >= 0) return;
                                            e.stopPropagation();
                                            nav(
                                                `/settleexpense?friend_id=${friend.friend_id}&amount=${Math.abs(
                                                    friend.netbalance
                                                )}&name=${friend.name}`
                                            );
                                        }}
                                        disabled={friend.netbalance >= 0}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className={styles.icon}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                                            />
                                        </svg>
                                        <span className={styles.tooltip}>Settle Up with {friend.name}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noData}>No transactions entered</p>
                    )}
                </div>



            </main>
        </div>
    );
}
