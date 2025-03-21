import { useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Categories from "./Categories";
import { FaRegHeart } from "react-icons/fa";
import './Home.css';
import config from "./config";

function Category() {
    const navigate = useNavigate();
    const param = useParams();

    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [products, setProducts] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [search, setSearch] = useState('');
    const [cProducts, setCProducts] = useState([]);
    const [isSearch, setIsSearch] = useState(false);

    const handleSearch = (value) => {
        setSearch(value);
    };

    const handleClick = () => {
        const department = localStorage.getItem('department');
        const url = `${config.API_BASE_URL}/search?search=${search}&department=${department}`;
        axios.get(url)
            .then((res) => {
                setCProducts(res.data.products);
                setIsSearch(true); // Show search results
            })
            .catch((err) => {
                console.log(err);
                alert('Server Error.');
            });
    };

    const handleLike = (productId, e) => {
        e.stopPropagation();
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Please Login First !!');
            return;
        }

        const url = `${config.API_BASE_URL}/Likes`;
        const data = { userId, productId };
        axios.post(url, data)
            .then((res) => {
                if (res.data.message) {
                    alert('Liked');
                }
            })
            .catch((err) => {
                console.log(err);
                alert('Server Error.');
            });
    };

    const handleProduct = (id) => {
        navigate('/tutordetails/' + id); // Navigate to tutordetails page
    };

    const handleCategory = (value) => {
        setSelectedDepartment(value);
    };

    useEffect(() => {
        const fetchProducts = () => {
            const url = `${config.API_BASE_URL}/get-product?catName=${param.catName}`;
            axios.get(url)
                .then((res) => {
                    if (res.data.products) {
                        setProducts(res.data.products);
                        filterProductsAndTutors(selectedDepartment, res.data.products, tutors, search);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    alert('Server Error.');
                });
        };

        const fetchTutors = () => {
            const url = `${config.API_BASE_URL}/get-tutors`; // Replace with the actual API endpoint
            axios.get(url)
                .then((res) => {
                    if (res.data.tutors) {
                        setTutors(res.data.tutors);
                        filterProductsAndTutors(selectedDepartment, products, res.data.tutors, search);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    alert('Server Error.');
                });
        };

        if (param.catName === "Tutors") {
            fetchTutors();
        } else {
            fetchProducts();
        }
    }, [param, selectedDepartment, search]); // Include param and search in dependency array

    const filterProductsAndTutors = (selectedDept, productsData, tutorsData, searchQuery) => {
        let filteredProducts = [];
        let filteredTutors = [];

        // Filter products
        if (selectedDept && selectedDept !== "Tutors") {
            filteredProducts = productsData.filter(item => item.category === selectedDept);
        } else {
            filteredProducts = productsData;
        }

        // Filter tutors
        if (selectedDept === "Tutor") {
            filteredTutors = tutorsData;
        } else {
            filteredTutors = tutorsData.filter(item => item.department === selectedDept);
        }

        // Apply search filter if there's a search query
        if (searchQuery) {
            filteredProducts = filteredProducts.filter(item =>
                item.pname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.pdesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase())
            );

            filteredTutors = filteredTutors.filter(item =>
                item.sname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.year.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Set filtered products and tutors
        setCProducts(filteredProducts);
        setTutors(filteredTutors);
        setIsSearch(searchQuery ? true : false);
    };

    return (
        <div>
            <Header search={search} handleSearch={handleSearch} handleClick={handleClick} />
            <Categories handleCategory={handleCategory} />

            {isSearch && cProducts && (
                <div>
                    <h5>SEARCH RESULTS
                        <button className="clear-btn" onClick={() => setIsSearch(false)}>CLEAR</button>
                    </h5>
                    {cProducts.length === 0 && <h5>No Results Found</h5>}
                </div>
            )}

            {!isSearch && (
                <div className="d-flex justify-content-center flex-wrap">
                    {param.catName !== "Tutors" && cProducts && cProducts.length > 0 && cProducts.map((item) => (
                        <div onClick={() => handleProduct(item._id)} key={item._id} className="card m-3">
                            <div onClick={(e) => handleLike(item._id, e)} className="icon-con">
                                <FaRegHeart className="icons" />
                            </div>
                            {item.pimages && item.pimages.length > 0 && (
                                <img width="300px" height="200px" src={`${config.API_BASE_URL}/${item.pimages[0]}`} alt={item.pname} />
                            )}
                            <p className="m-2">{item.pname} | {item.category}</p>
                            <h3 className="m-2 text-danger">Rs {item.price}/-</h3>
                            <p className="m-2 text-success">{item.pdesc}</p>
                        </div>
                    ))}

                    {param.catName === "Tutors" && tutors && tutors.length > 0 && tutors.map((tutor) => (
                        <div onClick={() => handleProduct(tutor._id)} key={tutor._id} className="card m-3">
                            <div onClick={(e) => handleLike(tutor._id, e)} className="icon-con">
                                <FaRegHeart className="icons" />
                            </div>
                            <p className="m-2">{tutor.sname} | {tutor.tname}</p>
                            <h3 className="m-2 text-danger">{tutor.tprice}/- per hour</h3>
                            <p className="m-2 text-success">Grade: {tutor.grade} | Year: {tutor.year}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Category;
