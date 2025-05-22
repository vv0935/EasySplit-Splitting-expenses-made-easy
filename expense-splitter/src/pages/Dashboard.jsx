import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { Loader } from "../components/Loader"
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
                const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-get_friends?user_id=${userId}&mobile=${Mobile}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Invalid response");
                }

                const data = await response.json();
                console.log("Dashboard Data:", data);
                setDashboardData(data.data);
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

    return (
        <>
            {loading?<Loader />:
            <div className={styles.body}>
                <div className={styles.dashboard}>
                    <div className={styles.dashboardHeader}>
                        <h1 className={styles.heading}>Dashboard</h1>
                        <div className={styles.buttonContainer}>
                            <button onClick={() => nav("/addexpense")}>Add</button>
                            <button onClick={() => nav("/settleexpense")}>Settle</button>
                            <button onClick={() => nav("/")}>Log out</button>
                        </div>
                    </div>
                    <h2 className={styles.username}>Hello {userName}!!</h2>
                    <div className={styles.component}>
                        <div className={styles.Balances}>Balance: {netbalance}</div>
                        <div className={styles.Balances}>You Owe: {Math.abs(netbalance - positivebalance)}</div>
                        <div className={styles.Balances}>You are Owed: {positivebalance}</div>
                    </div>
                    <ul className={styles.transactions}>
                        {dashboardData?.length > 0 ? (
                            dashboardData.map((friend, index) => (
                                <li
                                    key={index}
                                    onClick={() => nav(`/friend-transactions?friend_id=${friend.friend_id}`)}
                                    className={`${styles.displayelements} ${friend.netbalance >= 0 ? styles.positiveBalance : styles.negativeBalance}`}
                                >
                                    {friend.name} (ID: {friend.friend_id}) - Balance: {Math.abs(friend.netbalance)}
                                </li>
                            ))
                        ) : (
                            <h3>No transactions entered</h3>
                        )}
                    </ul>

                </div>

            </div>}
        </>

    );
}
