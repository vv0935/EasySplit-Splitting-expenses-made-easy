import { useNavigate } from "react-router-dom";
import styles from "./Welcome.module.css"; // Adjust the path based on your project structure

export default function Welcome() {
    const nav = useNavigate();

    return (
        
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
                {/* <div className={styles.navActions}>
                <a className={styles.link} href="/login">Log in</a>
                <button className={styles.navButton}>Sign up</button>
                </div> */}
            </header>
          <div className={styles.layoutContainer}>
            <div className={styles.contentWrapper}>
              <h2 className={styles.heading}>Welcome to Easy Split</h2>
              <p className={styles.subheading}>Splitting Expenses Made Easy</p>
              <div className={styles.buttonWrapper}>
                <button className={styles.loginButton} onClick={() => nav("/login")}>
                  Login
                </button>
                <button className={styles.signupButton} onClick={() => nav("/signup")}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }