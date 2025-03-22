import { useEffect, useState } from "react";
import Header from "./Header2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "./config";
function Tutor() {
    const navigate = useNavigate();

    const [sname, setsname] = useState('');
    const [tname, settname] = useState('');
    const [tprice, settprice] = useState('');
    const [year, setyear] = useState('');
    const [grade, setgrade] = useState('');
    const [category, setcategory] = useState('Tutor');
    const [video, setVideo] = useState(null);

    const [department, setDepartment] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
        }
        const userDepartment = localStorage.getItem('department');
        setDepartment(userDepartment);
    }, [navigate]);

    const handleApi = () => {
        const formData = new FormData();
        formData.append('sname', sname);
        formData.append('tname', tname);
        formData.append('tprice', tprice);
        formData.append('grade', grade);
        formData.append('year', year);
        formData.append('category', 'Tutor');
        formData.append('userId', localStorage.getItem('userId'));
        formData.append('department', localStorage.getItem('department'));
        if (video) {
            formData.append('video', video);
        }

        console.log("FormData:", formData); // Log FormData

        const url = `${config.API_BASE_URL}/Tutor`;
        axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((res) => {
            if (res.data.message) {
                alert(res.data.message);
                if (res.data.department) {
                    localStorage.setItem('department', res.data.department); 
                }
                navigate('/');
            }
        })
        .catch((err) => {
            console.error('Server error:', err);
        });
    };
    
    return (
        <>
        <Header />
        <div className="add-product-page" style={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            padding: '1rem'
        }}>
            
            <div className="add-product-container">
                <h1>Add Tutor Details</h1>
                
                <div className="form-group">
                    <label className="form-label">Subject Name</label>
                    <input className="form-input" type="text" value={sname} onChange={(e) => setsname(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Specialized Topics</label>
                    <input className="form-input" type="text" value={tname} onChange={(e) => settname(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Current Year</label>
                    <select className="form-input select-input" value={year} onChange={(e) => setyear(e.target.value)}>
                        <option value="">Year</option>
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Grade Acquired in the Subject</label>
                    <input className="form-input" type="text" value={grade} onChange={(e) => setgrade(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Price Per Hour</label>
                    <input className="form-input" type="text" value={tprice} onChange={(e) => settprice(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Upload Video Introduction</label>
                    <input 
                        className="form-input file-input" 
                        type="file" 
                        accept="video/*" 
                        onChange={(e) => setVideo(e.target.files[0])} 
                    />
                </div>

                <button onClick={handleApi} className="submit-btn-add">
                    Submit Application
                </button>
            </div>
        </div>
        </>
    );
}
export default Tutor;
