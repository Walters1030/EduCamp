
import { useEffect, useState } from "react";
import Header from "./Header2";
import axios from "axios";
import './pf.css'
import config from "./config";

function Myprofile() {
    const [user, setUser] = useState({});

    useEffect(() => {
        let url = `${config.API_BASE_URL}/Myprofile/` + localStorage.getItem('userId');
        axios.get(url)
            .then((res) => {
                console.log(res.data)
                if (res.data.user) {
                    setUser(res.data.user);
                }
            })
            .catch((err) => {
                alert('Server Err.')
            })
    }, [])

    return (
        <div>
            <Header />
            <div className="m-3 p-3">
                <h3 className="text-center mt-2">USER PROFILE</h3>
                <table className="table table-bordered vertical-table">
                    <tbody>
                        <tr>
                            <th>PID</th>
                            <td>{user.pid}</td>
                        </tr>
                        <tr>
                            <th>USERNAME</th>
                            <td>{user.username}</td>
                        </tr>
                        <tr>
                            <th>EMAIL ID</th>
                            <td>{user.email}</td>
                        </tr>
                        <tr>
                            <th>MOBILE</th>
                            <td>{user.mobile}</td>
                        </tr>
                        <tr>
                            <th>Department</th>
                            <td>{user.department}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Myprofile;
