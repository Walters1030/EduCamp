import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PieChartAnalytics from "./PieChart";
import LineGraphAnalytics from "./LineGraph";
import Header from "./Header2";
import { Box, TextField, MenuItem, Select, InputLabel, FormControl,Typography  } from "@mui/material";
import { FaShareAlt, FaTrash, FaFlag } from 'react-icons/fa';
import config from './config';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const optionsRef = useRef(null);
  const [activeOptions, setActiveOptions] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportItem, setSelectedReportItem] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const userId = localStorage.getItem('userId');
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState(null);


  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/reports`);
        const data = await response.json();
        setReports(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleToggleOptions = (e, reportId) => {
    e.stopPropagation();
    setActiveOptions(activeOptions === reportId ? null : reportId);
  };

  const handleClickOutside = (event) => {
    if (optionsRef.current && !optionsRef.current.contains(event.target)) {
      setActiveOptions(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleShare = (e, item, type) => {
    e.stopPropagation();
    let url = '';
    switch(type) {
      case 'Products':
        url = `${window.location.origin}/product/${item.itemDetails._id}`;
        break;
      case 'Subjects':
        url = `${window.location.origin}/Tutordetails/${item.itemDetails._id}`;
        break;
      case 'Certificates':
        url = `${window.location.origin}/userprofile/${item.user._id}`;
        break;
      default:
        return;
    }
    navigator.clipboard.writeText(url)
      .then(() => alert("Link copied to clipboard!"))
      .catch(err => console.error("Failed to copy:", err));
  };

  const handleDeleteReport = async (e, reportId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`${config.API_BASE_URL}/reports/${reportId}`);
        setReports(reports.filter(r => r._id !== reportId));
        alert('Report deleted successfully');
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report');
      }
    }
  };

  const handleDelete = async (e, id, type) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        let Type = ""; // Define Type before the conditions
  
        if (type === "Products") {
          Type = "product";
        } else if (type === "Subjects") {
          Type = "tutor";
        } else {
          Type = "cert"; // Default case
        }
  
        await axios.delete(`${config.API_BASE_URL}/delete/${Type}/${id}`);
  
        // Remove from items
        setItems((prevItems) => prevItems.filter((item) => item._id !== id));
  
        // Remove from reports
        setReports((prevReports) => prevReports.filter((report) => report.itemDetails._id !== id));
  
        alert("Deleted successfully");
      } catch (error) {
        console.error("Error deleting item", error);
        alert("Failed to delete item");
      }
    }
  };
  
  
  

  const handleReportSubmit = async () => {
    if (!selectedReportItem) return;

    try {
      await axios.post(`${config.API_BASE_URL}/report`, {
        itemId: selectedReportItem.itemId,
        reason: reportReason,
        type: selectedReportItem.itemType
      });
      alert('Report submitted successfully!');
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report.');
    }
  };

  const ReportModal = () => (
    <div className="modal-backdrop" onClick={() => setShowReportModal(false)}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Report {selectedReportItem?.itemType}</h3>
        <textarea
          placeholder="Please specify the reason for reporting..."
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          className="report-reason-input"
        />
        <div className="report-modal-actions">
          <button className="cancel-btn" onClick={() => setShowReportModal(false)}>Cancel</button>
          <button className="submit-btn" onClick={handleReportSubmit}>
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );

  const handleNavigate = (report) => {
    switch(report.itemType) {
      case 'Products':
        navigate(`/product/${report.itemDetails._id}`);
        break;
      case 'Subjects':
        navigate(`/Tutordetails/${report.itemDetails._id}`);
        break;
      case 'Certificates':
        navigate(`/userprofile/${report.user._id}`);
        break;
      default:
        return;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesType = selectedType === 'All' || report.itemType === selectedType;
    const matchesSearch = report.itemDetails.pname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.itemDetails.sname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.itemDetails.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getCardContent = (report) => {
    console.log("Report:", report.itemType);
    switch (report.itemType) {
      case 'Products':
        return {
          title: report.itemDetails.pname,
          category: report.itemDetails.category,
          price: report.itemDetails.price,
          image: report.itemDetails.pimages?.[0]
        };
      case 'Subjects':
        return {
          title: report.itemDetails.sname,
          category: `Grade: ${report.itemDetails.grade}`,
          price: report.itemDetails.tprice,
          image: report.itemDetails.videoUrl ? null : '/uploads/Resource.jpeg',
          videoUrl: report.itemDetails.videoUrl
        };
      case 'Certificates':
        return {
          title: report.itemDetails.courseName,
          category: report.itemDetails.company,
          image: report.itemDetails.image
        };
      default:
        return {};
    }
  };

  return (
    <>
      <Header />
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, p: 2 }}>
        <PieChartAnalytics />
        <LineGraphAnalytics />
      </Box>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 2, mb: 2, fontWeight: "bold" }}>
        Reports
      </Typography>

      <div className="dashboard-reports-container"sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
        
        <div className="reports-controls">
        <TextField
  label="Search Reports"
  variant="outlined"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  sx={{
    width: { xs: "50%", md: "50%", lg: "100%" }, // Adjust width for different screen sizes
    maxWidth: 800,
    marginBottom: 2,
    marginLeft:{ xs: 0, md: 4, lg: 5 },
  }}
/>

          <FormControl  sx={{
    width: { xs: "45%", md: "90%", lg: "100%" }, // Adjust width for different screen sizes
    maxWidth: 240,
    marginBottom: 2,
    marginLeft:{ xs: 1, md: 4, lg: 5 },
  }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="Filter by Type"
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Products">Products</MenuItem>
              <MenuItem value="Subjects">Subjects</MenuItem>
              <MenuItem value="Certificates">Certificates</MenuItem>
            </Select>
          </FormControl>
        </div>

        {isLoading ? (
          <div className="loading">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="no-results">No reports found matching your criteria</div>
        ) : (
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(3, 1fr)'
                },
                gap: 3,
                width: '100%',
                justifyItems: 'center'
              }}>
            {filteredReports.map((report) => {
              const content = getCardContent(report);
              return (
                <div key={report._id} className={`card modern-${report.itemType.toLowerCase()}-card`} onClick={() => handleNavigate(report)}>
                  <div className="report-header">
                    <span className="report-type">{report.itemType}</span>
                  </div>
                  
                  <div
        className="report-reason"
        onClick={(e) => {
          e.stopPropagation(); // Prevents card click event
          setSelectedReportReason(report.reason);
        }}
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 3,
          overflow: "hidden",
          cursor: "pointer",
          whiteSpace: "pre-line",
        }}
      >
        {report.reason}
      </div>
      {selectedReportReason && (
  <div className="modal-backdrop" onClick={() => setSelectedReportReason(null)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <span className="close-btn" onClick={() => setSelectedReportReason(null)}>&times;</span>
      <p>{selectedReportReason}</p>
    </div>
  </div>
)}


                  <div className="options-btn-dashboard" onClick={(e) => handleToggleOptions(e, report._id)}>
                    ⋮
                  </div>

                  {activeOptions === report._id && (                    
                    <div ref={optionsRef} className="options-container">
                      <button onClick={(e) => handleShare(e, report, report.itemType)}>
                        <FaShareAlt /> Share
                      </button>
                      <button onClick={(e) => handleDeleteReport(e, report._id)}>
                        <FaTrash /> Delete Report
                      </button>
                      <button onClick={(e) => handleDelete(e, report.itemDetails._id, report.itemType )}>
                        <FaFlag /> Delete 
                      </button>
                    </div>
                  )}

                  {(content.videoUrl || content.image) && (
                    report.itemType === "Subjects" ? (
                      <video controls className="card-media">
                        <source src={`${config.API_BASE_URL}/${content.videoUrl}`} type="video/mp4" />
                      </video>
                    ):(
                        <img 
                          src={`${config.API_BASE_URL}/${content.image}`} 
                          alt={content.title} 
                          className="card-media"
                        />
                      )
                  )}

                  <div className="card-content">
                    <p className="product-title">{content.title} | {content.category}</p>
                    {content.price && <h3 className="text-danger">Rs {content.price}/-</h3>}
                  </div>

                  <div className="reported-user-info">
                    <span className="username" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/userprofile/${report.user._id}`);
                    }}>
                      @{report.user.username}

                    </span>
                    <br/><b>On:</b> <span className="report-date">{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </Box>
        )}
      </div>

      {showReportModal && <ReportModal />}

      <style jsx>{`
        .dashboard-reports-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;

        }

        .report-cards-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 20px;
        }

        .card {
          position: relative;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          background-color: #f8f9fa;
        }

        .report-reason {
          padding: 0px 15px;
          color: #e74c3c;
          background-color:rgb(243, 216, 216);
          font-size: 0.9em;
            display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* Limits text to 3 lines */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
  word-break: break-word;
        }

        .reported-user-info {
          padding: 10px 15px;
          background-color: #f8f9fa;
        }

        .username {
          color: #3498db;
          font-weight: 500;
          cursor: pointer;
          &:hover {
            text-decoration: underline;
          }
        }

        .options-container {
          position: absolute;
          right: 10px;
          top: 40px;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-radius: 5px;
          z-index: 100;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .options-container button {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.9em;
          &:hover {
            background-color: #f8f9fa;
          }
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .report-modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
        }

        .report-reason-input {
          width: 100%;
          height: 100px;
          margin: 10px 0;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
        }

        .report-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .cancel-btn {
          padding: 8px 16px;
          background: #eee;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .submit-btn {
          padding: 8px 16px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .card-media {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
          .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 500px;
          text-align: center;
          position: relative;
        }

        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 20px;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default Dashboard;