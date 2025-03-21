import { useEffect, useState } from "react";
import Header from "./Header2";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Categories from "./Categories";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import './Home.css';
import './pf.css'; // Import styles for Myprofile
import config from "./config";
function Userproducts() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [search, setSearch] = useState('');
    const [cProducts, setCProducts] = useState([]);
    const [cTutors, setCTutors] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const [likedItems, setLikedItems] = useState([]);
    const [user, setUser] = useState({});
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [hoveredProductIndex, setHoveredProductIndex] = useState(0);
    
    useEffect(() => {
        let interval;
        if (hoveredProduct) {
            interval = setInterval(() => {
                setHoveredProductIndex((prevIndex) => {
                    const newIndex = (prevIndex + 1) % products.find(p => p._id === hoveredProduct).pimages.length;
                    return newIndex;
                });
            }, 3000);
        }
    
        return () => clearInterval(interval);
    }, [hoveredProduct]);

    useEffect(() => {
        console.log("Fetching user products and tutors for userId:", userId);
        axios.post(`${config.API_BASE_URL}/userproducts`, { userId })
            .then(response => {
                console.log("Response from server:", response.data);
                if (response.data.message === 'success') {
                    setProducts(response.data.products);
                    setCProducts(response.data.products);
                    setTutors(response.data.tutors);
                    setCTutors(response.data.tutors);
                } else {
                    console.error('Error fetching products and tutors');
                }
            })
            .catch(error => {
                console.error('Server Error:', error);
                alert('Server Error.');
            });

        fetchLikedItems(); // Fetch liked items when component mounts
        fetchUserProfile(); // Fetch user profile when component mounts
    }, [userId]);

    useEffect(() => {
        filterItems(search, selectedDepartment);
    }, [search, selectedDepartment, products, tutors]);

    const fetchUserProfile = () => {
        let url = `${config.API_BASE_URL}/Myprofile/${userId}`;
        axios.get(url)
            .then((res) => {
                console.log(res.data)
                if (res.data.user) {
                    setUser(res.data.user);
                }
            })
            .catch((err) => {
                alert('Server Error.');
            });
    };

    const handleSearch = (value) => {
        setSearch(value);
    };

    const filterItems = (searchQuery, department) => {
        const filteredProducts = products.filter((item) => (
            (!department || item.category === department) &&
            (!searchQuery ||
                item.pname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.pdesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase()))
        ));

        const filteredTutors = tutors.filter((item) => (
            (!department || item.category === department) &&
            (!searchQuery ||
                item.sname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.year.toLowerCase().includes(searchQuery.toLowerCase()))
        ));

        setCProducts(filteredProducts);
        setCTutors(filteredTutors);
        setIsSearch(!!searchQuery);
    };

    const handleClick = () => {
        filterItems(search, selectedDepartment);
    };

    const handleLike = (item, type, e) => {
        e.stopPropagation();
        const loggedInUserId = localStorage.getItem('userId');

        if (!loggedInUserId) {
            alert('Please Login First !!');
            return;
        }

        const url = `${config.API_BASE_URL}/Likes`;
        const data = { userId: loggedInUserId, productId: item._id, type };

        if (isItemLiked(item._id, type)) {
            axios.delete(url, { data })
                .then((res) => {
                    if (res.data.message) {
                        alert('Unliked');
                        fetchLikedItems(); // Reload liked items after unliking
                    }
                })
                .catch((err) => {
                    console.log(err);
                    alert('Server Error.');
                });
        } else {
            axios.post(url, data)
                .then((res) => {
                    if (res.data.message) {
                        alert('Liked');
                        fetchLikedItems(); // Reload liked items after liking
                    }
                })
                .catch((err) => {
                    console.log(err);
                    alert('Server Error.');
                });
        }
    };

    const handleProduct = (id) => {
        navigate(`/product/${id}`);
    };

    const handleSubject = (id) => {
        navigate(`/Tutordetails/${id}`);
    };

    const handleCategory = (value) => {
        setSelectedDepartment(value);
    };

    const fetchLikedItems = () => {
        const loggedInUserId = localStorage.getItem('userId');
        if (!loggedInUserId) return;

        axios.get(`${config.API_BASE_URL}/user/${loggedInUserId}/likes`)
            .then((res) => {
                if (res.data) {
                    setLikedItems(res.data);
                }
            })
            .catch((err) => {
                console.log(err);
                alert('Server Error.');
            });
    };

    const isItemLiked = (itemId, type) => {
        return likedItems.some(like => like.id === itemId && like.type === type);
    };

    return (
        <div>
            <Header search={search} handleSearch={handleSearch} handleClick={handleClick} />
            <Categories handleCategory={handleCategory} />

            <div className="m-3 p-3">
                <h2 className="text-center mt-2">USER PROFILE</h2>
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

            <h2 style={{ textAlign: 'left', marginTop: '20px', marginBottom: '10px',marginLeft:'20px', cursor: 'pointer' }}
                onClick={() => navigate(window.location.reload())}>
                User's ADS:
            </h2>

            {isSearch && (
                <>
                    <h5>
                        SEARCH RESULTS
                        <button className="clear-btn" onClick={() => {
                            setIsSearch(false);
                            setCProducts(products);
                            setCTutors(tutors);
                            setSearch('');
                        }}>CLEAR</button>
                    </h5>
                    {cProducts.length === 0 && cTutors.length === 0 && <h5>No Results Found</h5>}
                </>
            )}

            <div className="d-flex justify-content-center flex-wrap">
                {cProducts.map((item) => (
                    <div 
                    onMouseEnter={() => {
                        setHoveredProduct(item._id);
                        setHoveredProductIndex(0);
                    }} 
                    onMouseLeave={() => setHoveredProduct(null)} 
                    onClick={() => handleProduct(item._id, 'product')} 
                    key={item._id} 
                    className="card m-3"
                >
                    <div onClick={() => handleProduct(item._id)} key={item._id} >
                        <div onClick={(e) => handleLike(item, 'product', e)} className="icon-con">
                            {isItemLiked(item._id, 'product') ? <FaHeart className="icons liked" color="#FF0000" /> : <FaRegHeart className="icons" />}
                        </div>
                        {item.pimages && item.pimages.length > 0 && (
                            <img 
                            src={`${config.API_BASE_URL}/${item.pimages[hoveredProduct === item._id ? hoveredProductIndex : 0]}`} 
                            alt={item.pname} 
                        />
                        )}
                        <div className="card-content">
                            <p className="product-title">{item.pname} | {item.category}</p>
                            <h3 className="text-danger">Rs {item.price}/-</h3>
                            <p className="product-description text-success">{item.pdesc}</p>
                        </div>
                    </div></div>
                ))}
                {cTutors.length > 0 && cTutors.map((tutor) => (
                        <div onClick={() => handleSubject(tutor._id)} key={tutor._id} className="scard m-3">
                            <div onClick={(e) => handleLike(tutor, 'tutor', e)} className="icon-con">
                                {isItemLiked(tutor._id, 'tutor') ? <FaHeart className="icons liked" color="#FF0000"/> : <FaRegHeart className="icons" />}
                            </div>
                            {tutor.videoUrl ? (
                                <div className="video-container">
                                    <video width="100%" height="auto" controls>
                                        <source src={`${config.API_BASE_URL}/${tutor.videoUrl}`} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : (
                                <img src={`${config.API_BASE_URL}/uploads/Resource.jpeg`} alt="Tutor" />
                            )}
                            <div className="scard-content">
                                <p className="product-title">{tutor.sname} | Grade: {tutor.grade}</p>
                                <h3 className="text-danger">Rs {tutor.tprice}/-</h3>
                                <p className="product-description text-success">{tutor.tname}</p>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default Userproducts;
