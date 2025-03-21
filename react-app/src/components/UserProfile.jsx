import React, {useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ProfilePage.css";
import config from "./config";
import Header from './Header2'
import { FaShareAlt, FaTrash, FaFlag } from "react-icons/fa";



const UserProfile = () => {
  // ... (keep the existing state and useEffect logic)
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState("products");
  const loggedInUser = localStorage.getItem('userId');
  const isOwner = loggedInUser  === userId;
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [activeOptions, setActiveOptions] = useState(null); // Track which card options are open
  const loguserId = localStorage.getItem('userId');
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
  setActiveOptions(prev => (prev === id ? null : id));
};


const handleShare = (e, item, type) => { 
  e.stopPropagation();
  console.log("Sharing item:", item);
  let url = `${window.location.origin}/product/${item._id}`; 
  if (type === "tutor") {
      url = `${window.location.origin}/Tutordetails/${item._id}`;
  }else if (type === "cert") {
      url = `${window.location.origin}/userprofile/${item}`;
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
            setSubjects(subjects.filter(t => t._id !== id)); // Assuming `setTutors` exists
          } else if (type === "cert") {
              setCertificates(certificates.filter(c => c._id !== id)); // Assuming `setCertificates` exists
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

// ----
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


const handleInputChange = (e) => {
  console.log("New input value:", e.target.value);
  setReportReason(e.target.value);
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


// ========
const CertificateModal = ({ certificate, onClose }) => {
  return (
    <div className="certificate-modal-backdrop" onClick={onClose}>
      <div className="certificate-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <img 
          src={`${config.API_BASE_URL}/${certificate.image}`} 
          alt="Certificate" 
          className="certificate-full-image"
        />
        <div className="certificate-details">
          <h3>{certificate.courseName}</h3>
          <p>Issued by: {certificate.company}</p>
          <p>Duration: {certificate.duration}</p>
          <p>Issued on: {new Date(certificate.issueDate).toLocaleDateString()}</p>
          {certificate.verificationCode && (
            <p>Verification Code: {certificate.verificationCode}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AddCertificateModal = ({ onClose, onSubmit }) => {
  const fileInputRef = useRef(null);
  // Move state management inside the modal
  const [localCertificate, setLocalCertificate] = useState({
    courseName: '',
    duration: '',
    company: '',
    verificationCode: '',
    image: null
  });

  const handleFileChange = (e) => {
    setLocalCertificate(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Custom validation
    if (!localCertificate.image) {
      alert('Please select a certificate file');
      return;
    }

    const formData = new FormData();
    formData.append('courseName', localCertificate.courseName.trim());
    formData.append('duration', localCertificate.duration.trim());
    formData.append('company', localCertificate.company.trim());
    formData.append('verificationCode', localCertificate.verificationCode.trim());
    formData.append('userId', localStorage.getItem('userId'));
    formData.append('image', localCertificate.image);

    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/certificates`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      // Update parent state through callback
      onSubmit(response.data);
      onClose();
    } catch (error) {
      console.error('Certificate upload failed:', error);
      alert('Failed to upload certificate');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="certificate-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Add New Certificate</h2>
        <form onSubmit={handleSubmit}>
        <div className="form-group">
  <label>Course Name</label>
  <input 
    type="text" 
    required
    value={localCertificate.courseName}  // Changed
    onChange={(e) => setLocalCertificate(prev => ({  // Changed
      ...prev,
      courseName: e.target.value
    }))}
  />
</div>

<div className="form-group">
  <label>Duration</label>
  <input 
    type="text" 
    required
    value={localCertificate.duration}  // Changed
    onChange={(e) => setLocalCertificate(prev => ({  // Changed
      ...prev,
      duration: e.target.value
    }))}
  />
</div>

<div className="form-group">
  <label>Issuing Company</label>
  <input 
    type="text" 
    required
    value={localCertificate.company}  // Changed
    onChange={(e) => setLocalCertificate(prev => ({  // Changed
      ...prev,
      company: e.target.value
    }))}
  />
</div>

<div className="form-group">
  <label>Verification Code (optional)</label>
  <input 
    type="text" 
    value={localCertificate.verificationCode}  // Changed
    onChange={(e) => setLocalCertificate(prev => ({  // Changed
      ...prev,
      verificationCode: e.target.value
    }))}
  />
</div>

          <div className="form-group file-upload">
            <label>
              Certificate Image
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                required
              />
<div className="file-input">
  {localCertificate.image?.name || "Choose file..."} 
</div>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Upload Certificate</button>
          </div>
        </form>
      </div>
    </div>
  );
};
// =======

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/certificates?userId=${userId}`)
      .then(res => setCertificates(res.data))
      .catch(err => console.error(err));
   
  }, [userId]);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/users/${userId}`)
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
    axios.get(`${config.API_BASE_URL}/api/products?addedBy=${userId}`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));

    axios.get(`${config.API_BASE_URL}/api/subjects?addedBy=${userId}`)
      .then(res => setSubjects(res.data))
      .catch(err => console.error(err));
    const fetchUser = async () => {
        try {
          const response = await axios.get(`${config.API_BASE_URL}/api/users/${userId}`);
          console.log("Fetched User Data:", response.data); // Debugging log
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };
        fetchUser();
  }, [userId]);

  if (!user) return (
    <div className="modern-loading">
      <div className="loading-spinner"></div>
      Loading profile...
    </div>
  );

  const handleProduct = (id, type) => {
    navigate(`/product/${id}`);
};

const handleSubject = (id) => {
    navigate('/Tutordetails/' + id);
};

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("userId", loggedInUser);
    formData.append("type", type); // 'profile' or 'cover'

    try {
      console.log("Uploading image...",formData);
      const res = await axios.post(
        `${config.API_BASE_URL}/api/users/upload-image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setUser(res.data); // Update the UI
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };


  return (
    <div className="modern-profile-container">
      <Header/>
    {/* Cover Photo Section */}
    <div className="modern-cover-container">
    <div 
    className="modern-cover-photo" 
    title={isOwner ? "Click to change cover photo" : ""}
    onClick={() => isOwner && document.getElementById("coverInput").click()} // ✅ Trigger file input manually
  >
    <img 
      src={user.coverImage ? `${config.API_BASE_URL}${user.coverImage}` : "https://placehold.co/1200x400"} 
      alt="Cover" 
    />
    <div className="cover-gradient"></div>

    {isOwner && (
      <label className="image-upload-label cover-upload">
        <input
    type="file"
    id="coverInput" // ✅ Use an ID to reference it
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => handleImageUpload(e, "cover")}
    disabled={!isOwner}
  />
        <span className="upload-text">Change Cover Photo</span>
      </label>
    )}
  </div>

  <div className="modern-profile-header">
    <label className="image-upload-label profile-upload">
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleImageUpload(e, "profile")}
        disabled={!isOwner}
      />
      <div className="modern-avatar-container" title={isOwner ? "Click to change profile photo" : ""}>
        <img 
          src={user.profileImage ? `${config.API_BASE_URL}${user.profileImage}` : "https://placehold.co/170x170"} 
          alt="Profile" 
          className="modern-profile-avatar" 
        />
      </div>
    </label>

    <div className="modern-profile-info">
      <h1 className="modern-profile-name">{user.username}</h1>
      <p className="modern-profile-bio">{user.department}</p>
    </div>
  </div>
</div>


      {/* Navigation Tabs */}
      <nav className="modern-nav-container">
        <div className="modern-nav-items">
          <button 
            className={`modern-nav-item ${activeTab === "products" ? "modern-active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button 
            className={`modern-nav-item ${activeTab === "subjects" ? "modern-active" : ""}`}
            onClick={() => setActiveTab("subjects")}
          >
            Subjects
          </button>
          <button 
  className={`modern-nav-item ${activeTab === "certificates" ? "modern-active" : ""}`}
  onClick={() => setActiveTab("certificates")}
>
  Certificates
</button>
        </div>
      </nav>

      {/* Content Sections */}
      <main className="modern-content-grid">
        {activeTab === "products" && (
          products.map(item => (
            <article  onClick={() => handleProduct(item._id, 'product')}  key={item._id} className="card modern-product-card">
              {item.pimages?.length > 0 && (
                <div className="product-image-container">
                  <img 
                    src={`${config.API_BASE_URL}/${item.pimages[0]}`} 
                    alt={item.pname} 
                    className="product-image" 
                  />
                </div>
              )}
              <div className="product-info">
                       <div className="options-btn" onClick={(e) => handleToggleOptions(e, item._id)}>
                                    ⋮
                                </div>
                
                                {/* Options Container */}
                                {activeOptions === item._id && (
                    <div ref={optionsRef} className="options-container">
                        <button onClick={(e) => handleShare(e, item, "product")}><FaShareAlt /> Share</button>
                        {(item.addedBy === loggedInUser || userId === 'admin') && (
                            <button onClick={(e) => handleDelete(e, item._id, "product")}><FaTrash /> Delete</button>
                        )}
                        <button onClick={(e) => handleReport(e, item._id,"product" )}><FaFlag /> Report</button>
    
                    </div>
                    
                )}
                <div className="product-meta">
                  <h3 className="product-title">{item.pname}</h3>
                  <div className="price-badge">Rs {item.price}/-</div>
                </div>
                <p className="product-category">{item.category}</p>
                <p className="product-description">{item.pdesc}</p>
              </div>

            </article>
            
          ))
        )}

        {activeTab === "subjects" && (
          subjects.map(tutor => (
            <article onClick={() => handleSubject(tutor._id)} key={tutor._id} className=" modern-subject-card">
              <div className=" media-container ">
                
                {tutor.videoUrl ? (
                  <video controls className="subject-video">
                    <source src={`${config.API_BASE_URL}/${tutor.videoUrl}`} type="video/mp4" />
                  </video>
                ) : (
                  <img 
                    src={`${config.API_BASE_URL}/uploads/Resource.jpeg`}
                    alt="Tutor" 
                    className="subject-image" 
                  />
                )}
              </div>
    
              <div className="subject-info">

              <div className="options-btn" onClick={(e) => handleToggleOptions(e, tutor._id)}>
                                    ⋮
                                </div>
                                {/* Options Container */}
                                {activeOptions === tutor._id && (
                                    <div ref={optionsRef} className="options-container">
                                        <button onClick={(e) => handleShare(e, tutor,"tutor")}><FaShareAlt /> Share</button>
                                        {(tutor.addedBy === loggedInUser || userId === 'admin') && (
                                            <button onClick={(e) => handleDelete(e, tutor._id, "tutor")}><FaTrash /> Delete</button>
                                        )}
                                        <button onClick={(e) => handleReport(e, tutor._id,"tutor")}><FaFlag /> Report</button>
                                    </div>
                                )}
                <h3 className="subject-title">{tutor.sname}</h3>
                <div className="tutor-meta">
                  <div className="tutor-info">
                  <div className="grade-price-container">
      <span className="grade-badge">Grade {tutor.grade}</span>
      <span className="price-badge">Rs {tutor.tprice}/-</span>
    </div>
                    <span className="tutor-name">{tutor.tname}</span>
                  </div>

                </div>
              </div>
            </article>
          ))
        )}
{activeTab === "certificates" && (

  <>
{/* // Update your certificates section to use the modal */}
{isOwner && (
      <button 
        className="add-certificate-btn "
        onClick={() => setShowCertModal(true)}
        style={{gridColumn: '1 / -1'}}
      >
        + Add Certification
      </button>
    )}

{showCertModal && (
  
  <AddCertificateModal 
    onClose={() => setShowCertModal(false)}
    onSubmit={(newCert) => setCertificates(prev => [...prev, newCert])}
  />
)}
{certificates.map(cert => (
   console.log("certificates",cert),
  <div 
  key={cert._id} 
  className="certificate-card"
  onClick={() => setSelectedCertificate(cert)}
>
 
  <div className="certificate-card-header">
    <h4>{cert.courseName}</h4>
    <span className="certificate-company">{cert.company}</span>
  </div>
  <div className="certificate-card-body">
    <img 
      src={`${config.API_BASE_URL}/${cert.image}`} 
      alt="Certificate thumbnail" 
      className="certificate-thumbnail"
    />
    <div className="certificate-meta">
      {/* Three-dot menu for certificates */}
      <div className="cert-options-btn" onClick={(e) => handleToggleOptions(e, cert._id)}>
        ⋮
      </div>

      {/* Options Container */}
      {activeOptions === cert._id && (
        <div ref={optionsRef} className="cert-options-container">
          <button onClick={(e) => handleShare(e,cert.userId._id,"cert" )}><FaShareAlt /> Share</button>
          {(cert.userId._id === loggedInUser || userId === 'admin') && (
            <button onClick={(e) => handleDelete(e, cert._id,"cert")}><FaTrash /> Delete</button>
          )}
          <button onClick={(e) => handleReport(e, cert._id,"cert")}><FaFlag /> Report</button>
        </div>
      )}
      <span className="certificate-duration">{cert.duration}</span>
      <span className="certificate-date">
        {new Date(cert.issueDate).toLocaleDateString()}
      </span>
    </div>
    {cert.verificationCode && (
      <div className="verification-badge">Verified</div>
    )}
  </div>
</div>

))}

  </>
)}

{selectedCertificate && (
  <CertificateModal 
    certificate={selectedCertificate}
    onClose={() => setSelectedCertificate(null)}
  />
)}

      </main>
      {showReportModal && (
  <ReportModal
    onClose={() => setShowReportModal(false)}
    onSubmit={handleReportSubmit}
    itemId={selectedReportItem?.id}
  />
)}


    </div>
  );
};

export default UserProfile;