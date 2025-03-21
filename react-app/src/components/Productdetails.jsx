import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header2";
import "./pd.css";
import config from "./config";
import { Rating, TextField, Button, Typography, Box } from "@mui/material";

function Productdetails() {
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [addedByUsername, setAddedByUsername] = useState("");
    const navigate = useNavigate();
    const { productId } = useParams();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const res = await axios.get(`${config.API_BASE_URL}/get-products/${productId}`);
                if (res.data.product) {
                    setProduct(res.data.product);
                    const userRes = await axios.get(`${config.API_BASE_URL}/get-user/${res.data.product.addedBy}`);
                    if (userRes.data.user) {
                        setAddedByUsername(userRes.data.user.username);
                    }
                }
            } catch (err) {
                alert("Server Error.");
            }
        };
        fetchProductDetails();
    }, [productId]);

    useEffect(() => {
        axios.get(`${config.API_BASE_URL}/getReviews?id=${productId}&type=product`)
            .then((res) => setReviews(res.data))
            .catch(() => alert("Error fetching reviews"));
    }, [productId]);

    useEffect(() => {
        if (product?.pimages?.length > 1) {
            const interval = setInterval(() => {
                setSelectedImageIndex((prevIndex) => (prevIndex + 1) % product.pimages.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [product]);

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
                type: "product",
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
            <h3 className="td"><b>PRODUCT DETAILS:</b></h3>
            <div className="product-container" style={{ textAlign: 'left'}}>
                {product && (
                    <div className="content" style={{ textAlign: 'left'}}>
                        <div className="image-section">
                            <div className="main-image">
                                <img 
                                    src={`${config.API_BASE_URL}/${product.pimages[selectedImageIndex]}`} 
                                    alt="Product"
                                />
                            </div>
                            <div className="thumbnail-container">
                                {product.pimages.map((img, index) => (
                                    <img 
                                        key={index} 
                                        src={`${config.API_BASE_URL}/${img}`} 
                                        alt="Product Thumbnail" 
                                        className={index === selectedImageIndex ? "thumbnail active" : "thumbnail"}
                                        onClick={() => setSelectedImageIndex(index)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="details-section" >
                            <h1><b>{product.pname}</b> </h1>
                            <h2>Category: {product.category}</h2>
                            <h3 className="price-text">Rs. {product.price} /-</h3>
                            <Rating value={product.averageRating || 0} precision={0.5} readOnly />
                            <h5>
                                <b>Seller: </b>
                                <a href={`/userprofile/${product.addedBy}`} className="link">
                                    {addedByUsername}
                                </a>
                            </h5>
                            <h5><b>About:</b> {product.pdesc}</h5>
                            {!!localStorage.getItem("token") && product.addedBy &&
                                <button className="btn col m-9" onClick={() => navigate("/chat", { state: { userId: product.addedBy } })}>
                                    Contact Seller
                                </button>}
                        </div>
                    </div>
                )}
            </div>

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

export default Productdetails;