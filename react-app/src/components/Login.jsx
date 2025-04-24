import { Link, useNavigate,useLocation  } from "react-router-dom";
import Header from "./Header2";
import { useState, useEffect  } from "react";
import axios from "axios";
import config from "./config";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import './LoginSignup.css';
function LoginSignup() {
    const location = useLocation(); 
    const navigate = useNavigate();
    const [pid, setPid] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);

    const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Business Administration"];

    useEffect(() => {
        if (location.state?.isLogin !== undefined) {
            setIsLogin(location.state.isLogin);
        }
    }, [location.state]);

    const handleLogin = () => {
        const url = `${config.API_BASE_URL}/login`;
        axios.post(url, { pid, password })
            .then((res) => {
                if (res.data.message) {
                    alert(res.data.message);
                    if (res.data.token) {
                        localStorage.setItem('token', res.data.token);
                        localStorage.setItem('userId', res.data.userId);
                        
                        if (res.data.userId === "6809e390c53774cdef5c594d") {
                            localStorage.setItem('type', 'admin');
                            navigate('/admin'); // Navigate to admin panel
                        } else {
                            localStorage.setItem('type', 'user');
                            navigate('/'); // Navigate to user dashboard/home
                        }
                    }
                }
            })
            .catch(() => alert('SERVER ERROR'));
    };
    

    const handleSignup = async () => {
        if (!pid || !username || !password || !mobile || !email || !selectedDepartment) {
            setErrorMessage("All fields are required!");
            return;
        }

        if (!/^\d{10}$/.test(mobile)) {
            setErrorMessage("Mobile number must be exactly 10 digits!");
            return;
        }

        try {
            const pendingUser = { pid, username, password, mobile, email, department: selectedDepartment };
            localStorage.setItem("pendingUser", JSON.stringify(pendingUser));

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            alert("Verification email sent! Please verify your email.");
            navigate('/verify-email');
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handleForgotPassword = () => {
        axios.post(`${config.API_BASE_URL}/forgot-password`, { email })
            .then(() => alert("Reset link sent to your email!"))
            .catch(() => alert("Error sending reset email."));
        setShowForgotPassword(false);
    };

return (
    <>
        <div className="bg-container"></div>
        <div className="bg-overlay"></div>

        <div sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Header />
            {/* <h1 className="text-center mt-2">Welcome to {isLogin ? 'Login' : 'Signup'}</h1> */}

            <div className="form-modal">
                <div className="form-toggle">
                    <button onClick={() => setIsLogin(true)} 
                        style={{ backgroundColor: isLogin ? '#57B846' : '#fff', color: isLogin ? '#fff' : '#222' }}>
                        Login
                    </button>
                    <button onClick={() => setIsLogin(false)} 
                        style={{ backgroundColor: !isLogin ? '#57B846' : '#fff', color: !isLogin ? '#fff' : '#222' }}>
                        Signup
                    </button>
                </div>

                {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

                {/* Form Fields */}
                <h5>PID</h5>
                <input className="form-control" type="text" value={pid} onChange={(e) => setPid(e.target.value)} />
                
                {!isLogin && (
                    <>
                        <h5>USERNAME</h5>
                        <input className="form-control" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <h5>PHONE NUMBER</h5>
                        <input className="form-control" type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                        <h5>EMAIL</h5>
                        <input className="form-control" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <h5>DEPARTMENT</h5>
                        <select className="form-control" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                            <option value="">Select Department</option>
                            {departments.map((dept, index) => (
                                <option key={index} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </>
                )}

                <h5>PASSWORD</h5>
                <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="btn logout-btn m-9" onClick={isLogin ? handleLogin : handleSignup}>
                    {isLogin ? 'LOGIN' : 'SIGNUP'}
                </button>
                {isLogin && ( 
  <button className="btn btn-link" onClick={() => setShowForgotPassword(true)}>
    Forgot Password?
  </button>
)}
            </div>
            
        </div>
        {showForgotPassword && (
    <div className="modal-overlay">
        <div className="modal-content">
            <h5>Enter your email</h5>
            <input 
                className="form-control" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
            />
            <button className="btn btn-primary" onClick={handleForgotPassword}>
                Send Reset Link
            </button>
            <button className="btn btn-secondary" onClick={() => setShowForgotPassword(false)}>
                Close
            </button>
        </div>
    </div>
)}


    </>
    
);

}

export default LoginSignup;
