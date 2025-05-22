import { useNavigate } from "react-router-dom";
import styles from "./Welcome.module.css"; // Adjust the path based on your project structure

export default function Welcome() {
    const nav = useNavigate();
    localStorage.clear("user_id")
    localStorage.clear("mobile")

    return (
        <div className={styles.container}>
            <p className={styles.heading}>Welcome to Easy Split</p>
			<h2>Splitting Expenses made Easy</h2>
            <div className={styles.buttonContainer}>
                <button className={styles.button} onClick={() => nav("/login")}>Login</button>
                <button className={styles.button} onClick={() => nav("/signup")}>Signup</button>
            </div>
        </div>
    );
}
