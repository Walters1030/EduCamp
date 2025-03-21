import { useEffect, useState } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Categories from "./Categories";
import { FaRegHeart, FaHeart } from "react-icons/fa"; // Import both icons for the liked and unliked states
import './Home.css';
import config from "./config";

function Myproducts() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [search, setSearch] = useState('');
    const [cProducts, setCProducts] = useState([]);
    const [cTutors, setCTutors] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const [likedItems, setLikedItems] = useState([]); // State to store liked items
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
        const userId = localStorage.getItem('userId');

        if (!userId) {
            alert('Please Login First !!');
            return;
        }

        const url = `${config.API_BASE_URL}/Likes`;
        const data = { userId, productId: item._id, type };

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

    const handleDeleteProduct = (productId) => {
        const url = `${config.API_BASE_URL}/delete-product/${productId}`;
        const userId = localStorage.getItem('userId');

        axios.delete(url, { data: { userId } })
            .then(() => {
                setProducts(products.filter(product => product._id !== productId));
                setCProducts(cProducts.filter(product => product._id !== productId));
                alert('Product deleted successfully.');
            })
            .catch(() => {
                alert('Server Error.');
            });
    };

    const handleDeleteTutor = (tutorId) => {
        const url = `${config.API_BASE_URL}/delete-tutor/${tutorId}`;
        const userId = localStorage.getItem('userId');

        axios.delete(url, { data: { userId } })
            .then(() => {
                setTutors(tutors.filter(tutor => tutor._id !== tutorId));
                setCTutors(cTutors.filter(tutor => tutor._id !== tutorId));
                alert('Tutor deleted successfully.');
            })
            .catch(() => {
                alert('Server Error.');
            });
    };

    const handleCategory = (value) => {
        setSelectedDepartment(value);
    };

    const fetchLikedItems = () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        axios.get(`${config.API_BASE_URL}/user/${userId}/likes`)
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

    useEffect(() => {
        const userId = localStorage.getItem('userId');

        axios.post(`${config.API_BASE_URL}/Myproducts`, { userId })
            .then(response => {
                if (response.data.message === 'success') {
                    setProducts(response.data.products);
                    setCProducts(response.data.products);
                    setTutors(response.data.tutors);
                    setCTutors(response.data.tutors);
                } else {
                    console.error('Error fetching products and tutors');
                }
            })
            .catch(() => {
                alert('Server Error.');
            });

        fetchLikedItems(); // Fetch liked items when component mounts
    }, []);

    useEffect(() => {
        filterItems(search, selectedDepartment);
    }, [search, selectedDepartment, products, tutors]);

    return (
        <div>
            <Header search={search} handleSearch={handleSearch} handleClick={handleClick} />
            <Categories handleCategory={handleCategory} />
            <h1 style={{ textAlign: 'left', marginTop: '20px', marginBottom: '10px', cursor: 'pointer' }}
                onClick={() => navigate(window.location.reload())}>
                My ADS:
            </h1>

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
                            <div className="button-container">
                                <button className="btn logout-btn" onClick={() => handleProduct(item._id)}>View</button>
                                <button className="btn delete-btn" onClick={() => handleDeleteProduct(item._id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {/* {cTutors.length > 0 && cTutors.map((tutor) => (
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
                            <img src={'${config.API_BASE_URL}/uploads/Resource.jpeg'} alt="Tutor" />
                        )}
                        <div className="scard-content">
                            <p className="product-title">{tutor.sname} | Grade: {tutor.grade}</p>
                            <h3 className="text-danger">Rs {tutor.tprice}/-</h3>
                            <p className="product-description text-success">{tutor.tname}</p>
                        </div>
                        <div className="button-container">
                            <button className="btn logout-btn" onClick={() => handleSubject(tutor._id)}>View</button>
                            <button className="btn delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteTutor(tutor._id); }}>Delete</button>
                        </div>
                    </div>
                ))} */}
            </div>
        </div>
    );
}

export default Myproducts;
