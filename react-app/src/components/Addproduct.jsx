

import { useEffect, useState } from "react";
import Header from "./Header2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "./config";
import './form.css';
function Addproduct() {
    const navigate = useNavigate();

    const [pname, setpname] = useState('');
    const [pdesc, setpdesc] = useState('');
    const [price, setprice] = useState('');
    const [category, setcategory] = useState('');
    const [pimage, setpimage] = useState([]);
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
        formData.append('pname', pname);
        formData.append('pdesc', pdesc);
             formData.append('price', price);
        formData.append('category', category);
                 pimage.forEach(image => formData.append('pimage', image));
                  formData.append('userId', localStorage.getItem('userId'));
        formData.append('department', localStorage.getItem('department'));


        const url = `${config.API_BASE_URL}/Addproduct`;
        axios.post(url, formData)
            .then((res) => {
                if (res.data.message) {
                    alert(res.data.message);
                    // Assuming 'department' is included in the response from the backend
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
            minHeight: '100vh',
            padding: '1rem'
            
        }}>
            

            <div className="add-product-container" >
                <h1>Add New Product</h1>
                <div className="form-group">
                    <label className="form-label">Product Name</label>
                    <input className="form-input" type="text" value={pname} onChange={(e) => setpname(e.target.value)} />
                </div>
                
                <div className="form-group">
                    <label className="form-label">Product Description</label>
                    <input className="form-input" type="text" value={pdesc} onChange={(e) => setpdesc(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Product Price</label>
                    <input className="form-input" type="text" value={price} onChange={(e) => setprice(e.target.value)} />
                </div>

                <div className="form-group">
                    <label className="form-label">Product Category</label>
                    <select className="form-input select-input" value={category} onChange={(e) => setcategory(e.target.value)}>
                        <option value="">Category</option>
                    <option> Books </option>
                    <option> Notes </option>
                    <option> Cloth </option>
                    <option> Equipment </option>
                    <option> Mobile </option>
                    <option> Laptops </option>
                    <option> Miscellaneous </option>
                </select>
                   
                </div>

                <div className="form-group">
                    <label className="form-label">Product Images</label>
                    <input className="form-input file-input" type="file" multiple onChange={(e) => setpimage(Array.from(e.target.files))} />
                </div>

                <button onClick={handleApi} className="submit-btn-add">
                    Add Product
                </button>
            </div>
        </div>
        </>
    );
    
}

export default Addproduct;