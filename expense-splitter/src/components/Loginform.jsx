// import { useState } from "react"
// import  styles from './Loginform.module.css'
// export const Loginform=({isLogin})=>{
//     let [ID, setID]=useState("")
//     let [MobileNo, setNo]=useState("")
//     const handleSubmit= async (e)=>{
//         e.preventDefault();//prevents default form submission behavour which reloads the page
//         if(!ID && !MobileNo){
//             window.alert("please enter ID or MobileNo")
//         }
//         try{
//             // const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-login?user_id=${ID}&mobile=${MobileNo}`);
//             const response = await fetch(`http://localhost:9000/easysplit-login?user_id=${ID}&mobile=${MobileNo}`);
//             if(!response.ok){
//                 throw new Error("invalid credentials")
//             }
//             console.log(response)
//             const data=await response.json()
//             const {message, user_id, mobile }= data
//             ID=user_id
//             MobileNo=mobile
//             if (ID) {
//                 localStorage.setItem("user_id", ID);  
//                 console.log("user id in ls:", localStorage.getItem("user_id"))
//             }
//             if (MobileNo) {
//                 localStorage.setItem("mobile", MobileNo);// Save user_id in localStorage
//                 console.log("mobile in ls:", localStorage.getItem("mobile"))
//             }
//             isLogin({ID, MobileNo, message})
            
//         }
//         catch(error){
//             alert(error.message)

//         }
//     }
//     return (
//         <div className={styles.loginContainer}>
//             <div className={styles.loginBox}>
//             <h2 className={styles.loginTitle}> Login</h2>
//             <form onSubmit={handleSubmit}>
//                 <input className={styles.inputField} type="text" placeholder="Enter User ID" value={ID} onChange={(e)=>(setID(e.target.value))}></input>
//                 <h2>OR</h2>
//                 <input className={styles.inputField} type="telephone" placeholder="Enter MobileNo" value={MobileNo} onChange={(e)=>(setNo(e.target.value))}></input>
//                 <button className={styles.loginBtn} type="submit">login</button>
//             </form>
//             </div>
//         </div>   
//     )
// }


import { useState } from "react";
import styles from "./Loginform.module.css";

export const Loginform = ({ isLogin }) => {
  const [ID, setID] = useState("");
  const [MobileNo, setNo] = useState("");
  const [errors, setErrors] = useState({ id: false, phone: false, message: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idEmpty = !ID.trim();
    const phoneEmpty = !MobileNo.trim();
    const isPhoneInvalid = MobileNo && !/^\d{10}$/.test(MobileNo);

    // Validation logic
    if (idEmpty && phoneEmpty) {
      setErrors({
        id: true,
        phone: true,
        message: "Please enter either UserID or a valid 10-digit Phone Number",
      });
      return;
    }

    if (!idEmpty && isPhoneInvalid) {
      setErrors({
        id: false,
        phone: true,
        message: "Phone number must be 10 digits",
      });
      return;
    }

    if (idEmpty && isPhoneInvalid) {
      setErrors({
        id: true,
        phone: true,
        message: "Enter valid 10-digit Phone Number or UserID",
      });
      return;
    }

    // Clear errors if valid
    setErrors({ id: false, phone: false, message: "" });

    
    // const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-login?user_id=${ID}&mobile=${MobileNo}`);

    try {
      const response = await fetch(
        `http://localhost:9000/easysplit-login?user_id=${ID}&mobile=${MobileNo}`
      );

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      const { message, user_id, mobile } = data;

      if (user_id) {
        localStorage.setItem("user_id", user_id);
        setID(user_id);
      }

      if (mobile) {
        localStorage.setItem("mobile", mobile);
        setNo(mobile);
      }

      isLogin({ ID: user_id, MobileNo: mobile, message });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0)">
                <path
                  d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                  fill="currentColor"
                />
              </g>
              <defs>
                <clipPath id="clip0">
                  <rect width="48" height="48" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <h2 className={styles.logoText}>Easy Split</h2>
        </div>
        <div className={styles.navActions}>
          <button className={styles.navButton}>Log in</button>
          <a className={styles.link} href="/signup">Sign up</a>
        </div>
      </header>

      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Welcome back</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="UserID"
            value={ID}
            onChange={(e) => setID(e.target.value)}
            className={`${styles.input} ${errors.id ? styles.inputError : ""}`}
          />
          <div className={styles.orSeparator}>or</div>
          <input
            placeholder="Phone No."
            value={MobileNo}
            onChange={(e) => setNo(e.target.value)}
            className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
          />
          {errors.message && (
            <div className={styles.errorMessage}>{errors.message}</div>
          )}
          <div className={styles.forgotPassword}>Forgot password?</div>
          <button type="submit" className={styles.button}>
            Log In
          </button>
        </form>
        <a href="/signup" className={styles.signupLink}>Don't have an account? Sign Up</a>
      </div>
    </div>
  );
};
