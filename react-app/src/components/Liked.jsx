import { useEffect, useState, useRef } from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Categories from "./Categories";
import { FaRegHeart, FaHeart } from "react-icons/fa"; // Import both icons for the liked and unliked states
import './Home.css';
import config from "./config";
import { FaShareAlt, FaTrash, FaFlag } from "react-icons/fa";

function Liked() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [search, setSearch] = useState('');
    const [cProducts, setCProducts] = useState([]);
    const [cTutors, setCTutors] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('All Department');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isSearch, setIsSearch] = useState(false);
    const [likedItems, setLikedItems] = useState([]); // State to store liked items
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [hoveredProductIndex, setHoveredProductIndex] = useState(0);
    const [activeOptions, setActiveOptions] = useState(null); // Track which card options are open
    const userId = localStorage.getItem('userId');
    const optionsRef = useRef(null);
      const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReportItem, setSelectedReportItem] = useState(null);
    const [reportReason, setReportReason] = useState("");

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setActiveOptions(null);
            }
        };
    
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleToggleOptions = (e, id) => {
        e.stopPropagation();
        setActiveOptions(activeOptions === id ? null : id);
    };
    
    const handleShare = (e, item, type) => { 
        e.stopPropagation();
        
        let url = `${window.location.origin}/product/${item._id}`; 
        if (type === "tutor") {
            url = `${window.location.origin}/Tutordetails/${item._id}`;
        }
    
        navigator.clipboard.writeText(url)
            .then(() => alert("Link copied to clipboard!"))
            .catch(err => console.error("Failed to copy:", err));
    };
    
const handleDelete = async (e, id, type) => {
  e.stopPropagation();
  if (window.confirm("Are you sure you want to delete this item?")) {
      try {
          await axios.delete(`${config.API_BASE_URL}/delete/${type}/${id}`);
          alert("Deleted successfully");
          
          if (type === "product") {
              setProducts(products.filter(p => p._id !== id));
          } else if (type === "tutor") {
            setTutors(tutors.filter(t => t._id !== id)); // Assuming `setTutors` exists
          } 
          
      } catch (error) {
          console.error("Error deleting item", error);
      }
  }
};
    
const handleReport = (e, id, type) => {
    e.stopPropagation();
    setSelectedReportItem({ id, type });  
    setReportReason(''); 
    setShowReportModal(true);
  };
const ReportModal = ({ onClose, onSubmit, itemId }) => {
const [localReason, setLocalReason] = useState('');

const handleSubmit = () => {
onSubmit(itemId, localReason); // Pass the reason from local state
onClose();
};

return (
<div className="modal-backdrop" onClick={onClose}>
  <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
    <h3>Report Item</h3>
    <textarea
      placeholder="Please specify the reason for reporting..."
      value={localReason}
      onChange={(e) => setLocalReason(e.target.value)}
      className="report-reason-input"
    />
    <div className="report-modal-actions">
      <button className="cancel-btn" onClick={onClose}>Cancel</button>
      <button className="submit-btn" onClick={handleSubmit}>
        Submit Report
      </button>
    </div>
  </div>
</div>
);
};


const handleReportSubmit = async (itemId, reason) => {
if (!selectedReportItem) return;

try {
await axios.post(`${config.API_BASE_URL}/report`, {
  itemId: selectedReportItem.id,
  reason: reason, // Use passed reason
  type: selectedReportItem.type
});
alert('Report submitted successfully!');
setSelectedReportItem(null);
setShowReportModal(false);
} catch (error) {
console.error('Error submitting report:', error);
alert('Failed to submit report.');
}
};


    
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
    
    // Handle search input change
    const handleSearch = (value) => {
        setSearch(value);
    };

    // Handle category selection
    const handleCategory = (value) => {
        setSelectedCategory(value);
    };

    // Filter products and tutors based on search, category, and department
    const filterItems = (searchQuery, department, category) => {
        const filteredProducts = products.filter((item) => (
            (department === 'All Department' || item.department === department) &&
            (category === '' || item.category === category) &&
            (!searchQuery ||
                item.pname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.pdesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase()))
        ));

        const filteredTutors = tutors.filter((item) => (
            (department === 'All Department' || item.department === department) &&
            (category === '' || item.category === category) &&
            (!searchQuery ||
                item.sname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.year.toLowerCase().includes(searchQuery.toLowerCase()))
        ));

        setCProducts(filteredProducts);
        setCTutors(filteredTutors);
        setIsSearch(!!searchQuery);
    };

    // Handle search and category filter button click
    const handleClick = () => {
        filterItems(search, selectedDepartment, selectedCategory);
    };

    // Handle like button click
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
                        // Remove unliked item from likedItems state immediately
                        const updatedLikedItems = likedItems.filter(likedItem => !(likedItem.id === item._id && likedItem.type === type));
                        setLikedItems(updatedLikedItems);
                        fetchLikedItems(updatedLikedItems); // Pass updated liked items for refetching
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
                        fetchLikedItems([...likedItems, { id: item._id, type }]); // Add new liked item
                    }
                })
                .catch((err) => {
                    console.log(err);
                    alert('Server Error.');
                });
        }
    };

    // Navigate to product details page
    const handleProduct = (id) => {
        navigate(`/product/${id}`);
    };

    // Navigate to tutor details page
    const handleSubject = (id) => {
        navigate(`/Tutordetails/${id}`);
    };

    // Handle department change
    const handleDepartmentChange = (value) => {
        setSelectedDepartment(value);
    };

    // Fetch liked items on component mount
    useEffect(() => {
        fetchLikedItems();
    }, []);

    // Fetch liked items from server
    const fetchLikedItems = (updatedLikedItems = null) => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        axios.get(`${config.API_BASE_URL}/user/${userId}/likes`)
            .then((res) => {
                if (res.data) {
                    const likedItemsToUpdate = updatedLikedItems || res.data; // Use updated liked items or fetched data
                    setLikedItems(likedItemsToUpdate);
                    const productIds = likedItemsToUpdate.filter(item => item.type === 'product').map(item => item.id);
                    const tutorIds = likedItemsToUpdate.filter(item => item.type === 'tutor').map(item => item.id);

                    if (productIds.length > 0) {
                        axios.post(`${config.API_BASE_URL}/get-products-by-ids`, { ids: productIds })
                            .then(res => {
                                setProducts(res.data);
                                setCProducts(res.data);
                            })
                            .catch(() => {
                                alert('Server Error.');
                            });
                    } else {
                        setProducts([]);
                        setCProducts([]);
                    }

                    if (tutorIds.length > 0) {
                        axios.post(`${config.API_BASE_URL}/get-tutors-by-ids`, { ids: tutorIds })
                            .then(res => {
                                setTutors(res.data);
                                setCTutors(res.data);
                            })
                            .catch(() => {
                                alert('Server Error.');
                            });
                    } else {
                        setTutors([]);
                        setCTutors([]);
                    }
                } else {
                    console.error('Error fetching liked items');
                }
            })
            .catch(() => {
                alert('Server Error.');
            });
    };

    // Filter items when search, category, or department changes
    useEffect(() => {
        filterItems(search, selectedDepartment, selectedCategory);
    }, [search, selectedDepartment, selectedCategory, products, tutors]);

    // Function to check if item is liked
    const isItemLiked = (itemId, type) => {
        return likedItems.some(like => like.id === itemId && like.type === type);
    };

    return (
        <div>
            <Header search={search} handleSearch={handleSearch} handleClick={handleClick} onDepartmentChange={handleDepartmentChange} />
            <Categories handleCategory={handleCategory} />
            <h1 style={{ textAlign: 'left', marginTop: '20px', marginBottom: '10px', cursor: 'pointer' }}
                onClick={() => navigate(window.location.reload())}>
                Likes:
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
                    className="card modern-product-card"
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
                                {/* Options Button */}
                                            <div className="options-btn" onClick={(e) => handleToggleOptions(e, item._id)}>
                                                ⋮
                                            </div>
                            
                                            {/* Options Container */}
                                            {activeOptions === item._id && (
                                <div ref={optionsRef} className="options-container">
                                    <button onClick={(e) => handleShare(e, item, "product")}><FaShareAlt /> Share</button>
                                    {(item.addedBy === userId || userId === 'admin') && (
                                        <button onClick={(e) => handleDelete(e, item._id,"product")}><FaTrash /> Delete</button>
                                    )}
                                    <button onClick={(e) => handleReport(e, item._id,"product")}><FaFlag /> Report</button>
                                </div>
                            )}
                            <p className="product-title">{item.pname} | {item.category}</p>
                            <h3 className="text-danger">Rs {item.price}/-</h3>
                            <p className="product-description text-success">{item.pdesc}</p>
                        </div>
                    </div></div>
                ))}
                {cTutors.length > 0 && cTutors.map((tutor) => (
                        <div onClick={() => handleSubject(tutor._id)} key={tutor._id} className="scard modern-subject-card">
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
                            <div className="options-btn" onClick={(e) => handleToggleOptions(e, tutor._id)}>
                    ⋮
                </div>

                {/* Options Container */}
                {activeOptions === tutor._id && (
                    <div ref={optionsRef} className="options-container">
                        <button onClick={(e) => handleShare(e, tutor, "tutor")}><FaShareAlt /> Share</button>
                        {(tutor.addedBy === userId || userId === 'admin') && (
                            <button onClick={(e) => handleDelete(e, tutor._id,"tutor")}><FaTrash /> Delete</button>
                        )}
                        <button onClick={(e) => handleReport(e, tutor._id,"tutor")}><FaFlag /> Report</button>
                    </div>
                )}

                                <p className="product-title">{tutor.sname} | Grade: {tutor.grade}</p>
                                <h3 className="text-danger">Rs {tutor.tprice}/-</h3>
                                <p className="product-description text-success">{tutor.tname}</p>
                            </div>
                        </div>
                    ))}
                {(cProducts.length === 0 && cTutors.length === 0) && !isSearch && (
                    <h5>No liked items found.</h5>
                )}
            </div>
            {showReportModal && (
  <ReportModal
    onClose={() => setShowReportModal(false)}
    onSubmit={handleReportSubmit}
    itemId={selectedReportItem?.id}
  />
)}
        </div>
    );
}

export default Liked;
