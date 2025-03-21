import { useEffect, useState } from "react";
import { auth } from "../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "./config";
function VerifyEmail() {
    const [isVerified, setIsVerified] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [pendingUser, setPendingUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("pendingUser"));
        console.log("📥 Retrieved from localStorage:", storedUser);
    
        if (!storedUser) {
            console.error("❌ No user data found in localStorage.");
            return;
        }
    
        setPendingUser(storedUser);
    
        const interval = setInterval(async () => {
            await auth.currentUser?.reload();
            if (auth.currentUser?.emailVerified) {
                console.log("✅ Email verified! Sending data to backend:", storedUser);
                setIsVerified(true);
                clearInterval(interval);
                sendDataToBackend(storedUser);
            }
        }, 5000);
    
        return () => clearInterval(interval);
    }, []);
    
    const sendDataToBackend = async (userData) => {
        console.log("📤 Sending data to backend:", userData);
    
        if (!userData || Object.values(userData).some(value => !value)) {
            console.error("❌ Error: Some required fields are missing!", userData);
            return;
        }
    
        try {
            const response = await axios.post(`${config.API_BASE_URL}/register-in-db`, userData, {
                headers: { "Content-Type": "application/json" }
            });
            console.log("✅ User registered in MongoDB:", response.data);
            localStorage.removeItem("pendingUser");
            setIsRegistered(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            console.error("❌ Error registering user:", error.response?.data || error.message);
        }
    };
    
    
    

    return (
        <div>
            <h2>Please verify your email</h2>
            {!isVerified ? <p>Waiting for email verification...</p> : <p>Email verified! Registering...</p>}
            {isRegistered && <p>✅ Registration completed! Redirecting...</p>}
        </div>
    );
}

export default VerifyEmail;
