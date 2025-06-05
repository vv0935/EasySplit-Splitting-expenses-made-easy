// import { useState } from "react"
// import  styles from './Loginform.module.css'
// export const Signinform=({onSignin})=>{
//     const [Name, setName]=useState("")
//     const [MobileNo, setNo]=useState("")
//     const handleSubmit= async (e)=>{
//         e.preventDefault();//prevents default form submission behavour which reloads the page
//         if(!Name || !MobileNo){
//             window.alert("please enter Name and MobileNo")
//         }
//         try{
//             // const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-signin`, {
//             const response = await fetch(`http://localhost:9000/easysplit-signin`, {

//                 method: "POST",
//                 headers: {
//                 "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     Name: Name, // Send the user input as JSON
//                     mobile: MobileNo,
//             }),
//         });
//             if(!response.ok){
//                 throw new Error("invalid credentials")
//             }

//             console.log("before parsing Response:", response);
//             let data = await response.json();
//             console.log("after parsing Response:", data);
//             if(data.user_id){
//                 localStorage.setItem("user_id", data.user_id)
//                 console.log("user_id ls", localStorage.getItem("user_id"))
//             }
//             if(data.mobile){
//                 localStorage.setItem("mobile", data.mobile)
//                 console.log("mobile ls", localStorage.getItem("mobile"))
//             }

//             onSignin(data); // Pass the correct object

//         }
//         catch(error){
//             alert(error.message)
//         }

//     }
//     return (
//         <div className={styles.loginContainer}>
//             <div className={styles.loginBox}>
//             <h2 className={styles.loginTitle}> Signin</h2>
//             <form onSubmit={handleSubmit}>
//                 <input className={styles.inputField} type="text" placeholder="Enter User Name" value={Name} onChange={(e)=>(setName(e.target.value))}></input>
//                 <input className={styles.inputField} type="text" placeholder="Enter MobileNo" value={MobileNo} onChange={(e)=>(setNo(e.target.value))}></input>
//                 <button className={styles.loginBtn} type="submit">Signin</button>
//             </form>
//             </div>
//         </div>

//     )
// }



import { useState } from "react";
import styles from "./SignInForm.module.css";
import { Snackbar, Alert } from '@mui/material';


export const SignInForm = ({ onSignin }) => {
    const [Name, setName] = useState("");
    const [MobileNo, setNo] = useState("");
     
    const [errors, setErrors] = useState({ name: "", mobile: "", password: "" }); // <-- CHANGE: Added password error
    const [Password, setPassword] = useState("");   //<-- CHANGE: Added state for password
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success', // 'error' or 'success'
    });


    const validate = () => {
        let nameError = "";
        let mobileError = "";
        let passwordError = ""; // <-- CHANGE: Validate password

        if (Name.trim() === "") {
            nameError = "Name is required";
        }

        if (MobileNo.trim() === "") {
            mobileError = "Phone number is required";
        } else if (!/^\d{10}$/.test(MobileNo)) {
            mobileError = "Phone number must be 10 digits";
        }

        if (Password.trim() === "") {
            passwordError = "Password is required";
        } else if (Password.length < 6) {
            passwordError = "Password must be at least 6 characters";
        }

        setErrors({ name: nameError, mobile: mobileError, password: passwordError });

        return !(nameError || mobileError || passwordError);
    };
    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
        setTimeout(() => setSnackbar({ ...snackbar, open: false }), 5000);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        //  const response = await fetch(`https://h1aq3pu22g.execute-api.ap-south-1.amazonaws.com/default/easysplit-signin` ,{
        // const response = await fetch("http://localhost:9000/easysplit-signin", {
        try {
              const response = await fetch("http://localhost:9000/easysplit-signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Name, mobile: MobileNo, password: Password }), // <-- CHANGE: Added password to request body
            });

            if (!response.ok) throw new Error("Backend not working, Sorry for the discomfort");

            const data = await response.json();
            localStorage.setItem("user_id", data.user_id);
            // localStorage.setItem("mobile", data.mobile);
            localStorage.setItem("checkit-token", data.token); // <-- CHANGE: Store JWT token in localStorage

            onSignin(data);
            showSnackbar('Sign in successful!', 'success');

        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.logoSection}>
                    <div className={styles.logo}>
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.6 8.6C5.5 11.6 3.5 15.5 2.6 19.7C1.8 24 2.2 28.4 3.9 32.3C5.5 36.3 8.3 39.7 11.9 42.1C15.5 44.5 19.7 45.8 24 45.8C28.3 45.8 32.5 44.5 36.1 42.1C39.7 39.7 42.5 36.3 44.1 32.3C45.8 28.4 46.2 24 45.4 19.7C44.5 15.5 42.5 11.6 39.4 8.6L24 24L8.6 8.6Z" fill="currentColor" />
                        </svg>
                    </div>
                    <h2 className={styles.brand}>Easy Split</h2>
                </div>
                <div className={styles.navActions}>
                    <a className={styles.link} href="/login">Log in</a>
                    <button className={styles.navButton}>Sign up</button>
                </div>
            </header>

            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.title}>Sign in</h2>
                <span>Your name</span>
                <label className={styles.label}>
                    <input
                        className={`${styles.input} ${errors.name ? styles.inputError : ""}`}

                        placeholder="Enter your name"
                        value={Name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && <div className={styles.errorText}>{errors.name}</div>}
                </label>
                <span>Mobile Number</span>
                <label className={styles.label}>
                    <input
                        className={`${styles.input} ${errors.mobile ? styles.inputError : ""}`}
                        placeholder="Enter your mobile number"
                        value={MobileNo}
                        onChange={(e) => setNo(e.target.value)}
                    />
                    {errors.mobile && <div className={styles.errorText}>{errors.mobile}</div>}
                </label>

                <span>Password</span> {/* <-- CHANGE: Label for password */}
                <label className={styles.label}>
                    <input
                        type="password"
                        className={`${styles.input} ${errors.password ? styles.inputError : ""}`} // <-- CHANGE: style password input
                        placeholder="Enter your password"
                        value={Password}
                        onChange={(e) => setPassword(e.target.value)} // <-- CHANGE: bind password input
                    />
                    {errors.password && <div className={styles.errorText}>{errors.password}</div>}
                </label>

                <button className={styles.submitButton} type="submit">Sign in</button>
            </form>
            <Snackbar
                open={snackbar.open}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </div>
    );
};
