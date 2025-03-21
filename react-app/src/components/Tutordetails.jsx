import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header2";
import "./pf.css";
import "./tutord.css";
import config from "./config";
import { Rating, TextField, Button, Typography, Box } from "@mui/material";

function Tutordetails() {
    const [tutor, setTutor] = useState(null);
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const { productId } = useParams();
    const [addedByUsername, setAddedByUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTutorDetails = async () => {
            try {
                const res = await axios.get(`${config.API_BASE_URL}/get-subject/${productId}`);
                if (res.data.subject) {
                    setTutor(res.data.subject);
                    const userRes = await axios.get(`${config.API_BASE_URL}/get-user/${res.data.subject.addedBy}`);
                    if (userRes.data.user) {
                        setAddedByUsername(userRes.data.user.username);
                    }
                }
            } catch (err) {
                alert("Server Error.");
            }
        };
        fetchTutorDetails();
    }, [productId]);

    useEffect(() => {
        axios.get(`${config.API_BASE_URL}/getReviews?id=${productId}&type=subject`)
            .then((res) => setReviews(res.data))
            .catch(() => alert("Error fetching reviews"));
    }, [productId]);

    const handleSubmitReview = async () => {
        if (!rating || !comment) {
            alert("Please provide a rating and comment.");
            return;
        }
        try {
            await axios.post(`${config.API_BASE_URL}/addReview`, {
                id: productId,
                userID: localStorage.getItem("userId"),
                rating,
                comment,
                type: "subject",
            });
            setReviews([...reviews, { rating, comment, userID: { username: "You" } }]);
            setRating(0);
            setComment("");
        } catch (err) {
            alert("Error submitting review");
        }
    };

    return (
        <>
            <Header />
            <h3 className="td"><b>TUTOR DETAILS:</b></h3><br />
            <div className="tproduct-container">
    {tutor && (
        <>
            <div className="video-section">
                {tutor.videoUrl ? (
                    <div className="main-video">
                        <video className="video-player" controls>
                            <source src={`${config.API_BASE_URL}/${tutor.videoUrl}`} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                ) : (
                    <div className="main-image">
                        <img src={`${config.API_BASE_URL}/${tutor.pimages[0]}`} alt="Tutor" />
                    </div>
                )}
            </div>

            <div className="tdetails-section">
                <h1><b>{tutor.sname}</b></h1>
                <Rating value={tutor.averageRating || 0} precision={0.5} readOnly />
                <h2 className="tprice-text">{tutor.tprice}/-</h2>
                <h4>Per Hour</h4>
                
                <div className="tutor-info">
                    <h5><b>Grade:</b> {tutor.grade}</h5>
                    <h5><b>Tutor:</b> <a href={`/userprofile/${tutor.addedBy}`} className="link">{addedByUsername}</a></h5>
                    <h5><b>Year:</b> {tutor.year}</h5>
                </div>

                {!!localStorage.getItem("token") && tutor.addedBy &&
                    <button className="btn col m-9" onClick={() => navigate("/chat", { state: { userId: tutor.addedBy } })}>
                        Contact Tutor
                    </button>}
            </div>
        </>
    )}
</div>

      {/* Review Section */}
<div className="review-section">
    <div className="review-form">
        <h2>Leave a Review</h2>
        <Rating 
            value={rating} 
            onChange={(e, newValue) => setRating(newValue)} 
            precision={0.5} 
            size="large"
        />
        <TextField 
            fullWidth 
            label="Write a comment..." 
            variant="outlined"
            multiline 
            rows={3} 
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
            margin="normal"
            InputLabelProps={{
                style: { color: '#606060' }
            }}
        />
        <Button 
            variant="contained" 
            className="submit-button"
            onClick={handleSubmitReview}
        >
            Submit
        </Button>
    </div>

    {/* Display Reviews */}
    <div className="review-list">
        <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Reviews</h2>
        {reviews.length ? reviews.map((userCommented, index) => (
            <div key={index} className="review-item">
                <div className="avatar"></div>
                <div className="review-content">
                    <div className="username">
                        {userCommented.userID?.username || "Anonymous"}
                    </div>
                    <Rating 
                        value={userCommented.rating} 
                        precision={0.5} 
                        readOnly 
                        size="small"
                    />
                    <div className="comment-text">
                        {userCommented.comment}
                    </div>
                </div>
            </div>
        )) : <Typography>No reviews yet.</Typography>}
    </div>
</div>
        </>
    );
}

export default Tutordetails;