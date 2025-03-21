import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import config from "./config";
function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");

    const handleReset = () => {
        axios.post(`${config.API_BASE_URL}/reset-password`, { token, newPassword })
            .then((res) => {
                alert(res.data.message);
                navigate('/login');
            })
            .catch(() => alert('Error resetting password'));
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <input type="password" className="form-control" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <br />
            <button className="btn btn-primary" onClick={handleReset}>Reset Password</button>
        </div>
    );
}

export default ResetPassword;
