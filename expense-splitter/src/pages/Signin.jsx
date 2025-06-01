import { useState } from "react";
import { SignInForm } from "../components/Signinform";
import { useNavigate } from "react-router-dom";

function Signin() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 

  const handleSignin = (userData) => {
    setUser(userData);
    if (userData.message === "Signin successful") {
      navigate("/dashboard")} 

  };

  return (
    <div>
      {user ? (
        user.message === "Signin successful"? (
          <h1>
            Welcome {user.user_name || "User"}, User ID: {user.user_id || "N/A"}
          </h1>
        ) : (
          <h1>Error: {user.message}</h1>
        )
      ) : (
        <SignInForm onSignin={handleSignin} />
      )}
    </div>
  );
}

export default Signin;
