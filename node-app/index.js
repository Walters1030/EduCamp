
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const { Server } = require("socket.io");
const http = require("http");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');
// const bodyParser = require('body-parser');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// Set up Express app
const app = express();
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const server = http.createServer(app); 
app.use(bodyParser.json());
// const port = 4000;

app.use(cors({
  origin: "*", // Allow all origins (for testing)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/uploads", express.static("uploads"));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'workaholicbuzz@gmail.com',
    pass: 'xveumlegcokmooxq'
  }
});



// Connect to MongoDB
mongoose.connect('mongodb+srv://merger123:merger123@cluster0.z3ztoq6.mongodb.net');

// Define MongoDB models
const Users = mongoose.model('Users', {
  pid: String,
  username: String,
  password: String,
  mobile: { type: Number, unique: true },
  email: String,
  department: String,
  Likes: [{ type: { type: String }, id: mongoose.Schema.Types.ObjectId }],
  resetToken: String,
  resetTokenExpiry: Date,
  about: String,
  profileImage: String,
  coverImage: String,
  
});

const Products = mongoose.model('Products', { pname: String, pdesc: String, price: Number, category: String, pimages: [String], addedBy: mongoose.Schema.Types.ObjectId , 
  department:String, userCommented: [
    {
        userID: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }, // Reference to User model
        rating: Number,
        comment: String
    }
],date: { type: Date, default: Date.now }});
  const Subjects = mongoose.model('Subjects', {
    sname: String,
    tname: String,
    year: String,
    category: String,
    grade: Number,
    tprice: Number,
    addedBy: mongoose.Schema.Types.ObjectId,
    department: String,
    videoUrl: String,
    date: { type: Date, default: Date.now },
    userCommented: [
      {
          userID: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }, // Reference to User model
          rating: Number,
          comment: String
      }
  ]
  });

  const Message = mongoose.model('Message', {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    text: { type: String },
    file: { type: String },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false } // Added read field
  });

  const certificateSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    duration: { type: String, required: true },
    issueDate: { type: Date, default: Date.now },
    company: { type: String, required: true },
    verificationCode: String,
    image: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
  });
  
  const Certificate = mongoose.model('Certificate', certificateSchema);

  const reportSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "itemType" },
    itemType: { type: String, enum: ["Products", "Subjects", "Certificates"], required: true },
    reason: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Report = mongoose.model("Report", reportSchema);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// Define routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Socket.io setup
const io = require("socket.io")(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});




app.get("/api/messages/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  const messages = await Message.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  }).sort("timestamp");

  res.json(messages);
});

app.get('/api/chats/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const pipeline = [
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      {
        $addFields: {
          contactId: {
            $cond: [
              { $eq: ["$senderId", userId] },
              "$receiverId",
              "$senderId"
            ]
          },
          isReceiver: { $eq: ["$receiverId", userId] }
        }
      },
      {
        $lookup: {
          from: "users",
          let: { contactId: { $toObjectId: "$contactId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$contactId"] } } },
            { $project: { 
              _id: { $toString: "$_id" }, 
              username: 1, 
              profileImage: 1 
            }}
          ],
          as: "contact"
        }
      },
      { $unwind: "$contact" },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$contactId",
          contact: { $first: "$contact" },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$isReceiver", true] },
                  { $eq: ["$read", false] }
                ] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          chatId: "$_id",
          contact: 1,
          lastMessage: {
            text: "$lastMessage.text",
            timestamp: "$lastMessage.timestamp",
            file: "$lastMessage.file"
          },
          unreadCount: 1
        }
      },
      { $sort: { "lastMessage.timestamp": -1 } }
    ];

    const chats = await Message.aggregate(pipeline);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/messages/mark-read', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    await Message.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Modified existing messages endpoint
app.post("/api/messages", async (req, res) => {
  try {
    const { senderId, receiverId, text, timestamp } = req.body;

    const newMessage = new Message({ senderId, receiverId, text, timestamp });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to save message" });
  }
});


// Updated Socket.io handler
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('join', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('leave', (room) => {
    socket.leave(room);
    console.log(`User left room: ${room}`);
  });

  socket.on('sendMessage', ({ room, message }) => {
    // Broadcast to all in the room except sender
    socket.to(room).emit('receiveMessage', message);
    // Also send back to sender if needed
    socket.emit('receiveMessage', message);
  });

  socket.on("messageRead", async ({ chatId, userId }) => {
    await Message.updateMany(
      { chatId, receiverId: userId, read: false },
      { $set: { read: true } }
    );
    io.to(chatId).emit("updateReadStatus", { chatId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/Search', (req, res) => {
  console.log(req.query);
  let department = req.query.department;
  let search = req.query.search;

  let query = {};

  if (search) {
    query.$or = [
      { pname: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } }
    ];
  }

  if (department) {
    query.department = department;
  }

  Products.find(query)
    .then((results) => {
      res.send({ message: 'success', products: results });
    })
    .catch((error) => {
      console.error('Search error:', error);
      res.status(500).send({ message: 'search error' });
    });
});


app.post('/Likes', (req, res) => {
  let { productId, userId, type } = req.body;
  const update = { $addToSet: { Likes: { type, id: productId } } };

  Users.updateOne({ _id: userId }, update)
      .then(() => res.send({ message: 'Liked!' }))
      .catch(() => res.send({ message: 'server error' }));
});


app.post('/Addproduct', upload.array('pimage', 10), (req, res) => {

console.log(req.files);
console.log(req.body);


  try {
    const pimages = req.files.map(file => file.path);
    const { pname, pdesc, price, category, userId } = req.body;

    // Check if userId exists
    Users.findById(userId)
      .then(user => {
        if (!user) {
          return res.status(404).send({ message: 'User not found!' });
        }

        // Create the product with the department information
        const product = new Products({
          pname,
          pdesc,
          price,
          category,
          pimages,
          addedBy: userId,
          department: user.department // Assign user's department to the product
        });



        product.save()
          .then(() => res.send({ message: 'Saved Successfully!' }))
          .catch((err) => {
            console.error('Error saving product:', err);
            res.status(500).send({ message: 'Server error' });
          });
      })
      .catch(error => {
        console.error('Error finding user:', error);
        res.status(500).send({ message: 'Server error' });
      });
  } catch (err) {
    console.error('Error in route handler:', err);
    res.status(500).send({ message: 'Server error' });
  }
});


app.get('/get-products/:id', async (req, res) => {
  try {
      const product = await Products.findById(req.params.id).populate("userCommented.userID", "username profileImage");

      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }

      // Calculate the average rating
      const reviews = product.userCommented;
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;

      res.json({
          message: "success",
          product: { ...product.toObject(), averageRating: parseFloat(averageRating.toFixed(1)) }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "fetch error" });
  }
});


app.get('/get-product', (req, res) => {
  const catName = req.query.catName;
  let filter = catName ? { category: catName } : {};

  Products.find(filter)
    .then((result) => res.send({ message: 'success', products: result }))
    .catch(() => res.send({ message: 'fetch error' }));
});
app.get('/user/:userId/likes', async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId).populate('Likes.id');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json(user.Likes);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Backend route to get products by IDs
app.post('/get-products-by-ids', async (req, res) => {
  try {
      const products = await Products.find({ '_id': { $in: req.body.ids } });
      res.json(products);
  } catch (error) {
      res.status(500).send('Server Error');
  }
});

// Backend route to get tutors by IDs
app.post('/get-tutors-by-ids', async (req, res) => {
  try {
      const tutors = await Subjects.find({ '_id': { $in: req.body.ids } });
      res.json(tutors);
  } catch (error) {
      res.status(500).send('Server Error');
  }
});


app.post('/Liked', (req, res) => {
  const userId = req.body.userId;

  Users.findOne({ _id: userId }).populate({
      path: 'Likes.id',
      model: function(doc) {
          return doc.type === 'product' ? 'Products' : 'Subjects';
      }
  })
  .then(user => {
      const likedProducts = user.Likes.filter(item => item.type === 'product').map(item => item.id);
      const likedTutors = user.Likes.filter(item => item.type === 'tutor').map(item => item.id);

      res.send({ message: 'success', likedProducts, likedTutors });
  })
  .catch(() => res.send({ message: 'fetch error' }));
});

app.post('/userproducts', (req, res) => {
  const userId = req.body.userId;

  Products.find({ addedBy: userId })
      .then((products) => {
          res.send({ message: 'success', products });
      })
      .catch((error) => {
          console.error('Error fetching products:', error);
          res.status(500).send({ message: 'Server error', error: error.message });
      });
});

app.post('/usertutors', (req, res) => {
  const userId = req.body.userId;

  Subjects.find({ addedBy: userId })
      .then((tutors) => {
          res.send({ message: 'success', tutors });
      })
      .catch((error) => {
          console.error('Error fetching tutors:', error);
          res.status(500).send({ message: 'Server error', error: error.message });
      });
});


app.post('/Myproducts', (req, res) => {
  const userId = req.body.userId;

  // Find products and tutors added by the user
  Promise.all([
    Products.find({ addedBy: userId }),
    Subjects.find({ addedBy: userId })
  ])
    .then(([products, tutors]) => {
      res.send({ message: 'success', products, tutors });
    })
    .catch((error) => {
      console.error('Error fetching products and tutors:', error);
      res.status(500).send({ message: 'Server error', error: error.message });
    });
});

app.get('/my-tutors', (req, res) => {
  const userId = req.user.id; // Assuming you're using JWT authentication
  Tutor.find({ userId })
      .then(tutors => {
          res.json({ tutors });
      })
      .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Server Error' });
      });
});

app.get('/Myprofile/:userId',(req,res)=>{
  let uid = req.params.userId
  Users.findOne({_id:uid})
  .then((result) => res.send({ message: 'success', user:{
    pid:result.pid,
    email:result.email,
    mobile:result.mobile,
    username:result.username,
    department:result.department
  } }))
    .catch(() => res.send({ message: 'fetch error' }));
  
})

app.delete('/delete-product/:productId', (req, res) => {
  const productId = req.params.productId;
  const userId = req.body.userId;

  
  Products.findOne({ _id: productId, addedBy: userId })
   .then((product) => {
      if (!product) {
        return res.status(403).send({ message: 'You are not authorized to delete this product.' });
      }

      
      Products.deleteOne({ _id: productId })
       .then(() => res.send({ message: 'Product deleted successfully.' }))
       .catch((error) => {
          console.error('Error deleting product:', error);
          res.status(500).send({ message: 'Server error' });
        });
    })
   .catch((error) => {
      console.error('Error finding product:', error);
      res.status(500).send({ message: 'Server error' });
    });
});

app.delete('/delete-tutor/:tutorId', (req, res) => {
  const tutorId = req.params.tutorId; // Get tutorId from URL parameters
  const userId = req.body.userId; // Get userId from request body

  // Find the tutor with the specified ID and ensure it was added by the requesting user
  Subjects.findOne({ _id: tutorId, addedBy: userId })
    .then((tutor) => {
      if (!tutor) {
        return res.status(403).send({ message: 'You are not authorized to delete this tutor.' });
      }

      // Delete the tutor
      Subjects.deleteOne({ _id: tutorId })
        .then(() => res.send({ message: 'Tutor deleted successfully.' }))
        .catch((error) => {
          console.error('Error deleting tutor:', error);
          res.status(500).send({ message: 'Server error' });
        });
    })
    .catch((error) => {
      console.error('Error finding tutor:', error);
      res.status(500).send({ message: 'Server error' });
    });
});



app.post('/Signup', async (req, res) => {
  console.log("📥 Received Data:", req.body);
  try {
    const { pid, username, password, mobile, email, department } = req.body;

    if (!pid || !username || !password || !mobile || !email || !department) {
      return res.status(400).send({ message: 'All fields are required!' });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Firebase Authentication - Create User
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username
    });

    console.log("✅ Firebase user created:", userRecord.uid);

    // MongoDB - Save User Data
    const newUser = new Users({ pid, username,  password: hashedPassword, mobile: Number(mobile), email, department });
    await newUser.save();

    res.send({ message: 'Sign-up Successful!', uid: userRecord.uid });

  } catch (error) {
    console.error("🔥 Error registering user:", error);
    res.status(500).send({ message: 'Server error', error: error.message });
  }
});

app.post("/register-in-db", async (req, res) => {
  try {
      const { pid, username, password, mobile, email, department } = req.body;

      // Check if user already exists in MongoDB
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ error: "User already registered in MongoDB." });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Save the user in MongoDB only
      const newUser = new Users({ pid, username,  password: hashedPassword, mobile, email, department });
      await newUser.save();

      console.log("✅ User registered in MongoDB:", newUser);
      res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
      console.error("❌ Error registering user in MongoDB:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post('/login', async (req, res) => {
  try {
    const { pid, password } = req.body;

    const user = await Users.findOne({ pid });
    if (!user) {
      return res.status(404).send({ message: 'User Not Found!' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Password incorrect!' });
    }

    const token = jwt.sign({ data: user }, 'Mykey', { expiresIn: '1h' });
    res.send({ message: 'Login Successful!', token, userId: user._id });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});



app.get('/get-user/:uId',(req,res)=>{
const userId = req.params.uId;


  Users.findOne({ _id: userId })
  .then((result) => res.send({ message: 'Successful!',user:{email:result.email,mobile:result.mobile,username: result.username}}))
  .catch(() => res.send({ message: 'error' }));


})

app.post('/Tutor', upload.single('video'), (req, res) => {
  console.log("Request body:", req.body);

  const { sname, tname, tprice, grade, year, category, userId } = req.body;
  const videoUrl = req.file ? req.file.path : '';

  Users.findById(userId)
    .then(user => {
      if (!user) {
        console.log("User not found:", userId);
        return res.status(404).send({ message: 'User not found!' });
      }

      const subject = new Subjects({
        sname,
        tname,
        tprice,
        year,
        category,
        grade,
        addedBy: userId,
        department: user.department,
        videoUrl // Save the video URL
      });

      subject.save()
        .then(() => {
          console.log("Subject saved successfully");
          res.send({ message: 'Saved Successfully!' });
        })
        .catch((err) => {
          console.error('Error saving subject:', err);
          res.status(500).send({ message: 'Server error' });
        });
    })
    .catch(error => {
      console.error('Error finding user:', error);
      res.status(500).send({ message: 'Server error' });
    });
});
app.get('/get-video/:id', (req, res) => {
  const videoId = req.params.id;
  // Retrieve and serve the video based on its ID or path
});



app.get('/get-tutors', (req, res) => {
  Subjects.find({})
     .then(tutors => {
          const tutorsWithImages = tutors.map(tutor => ({
             ...tutor.toObject(),
              imageUrl: '/uploads/Resource.jpeg'
          }));
          res.status(200).json({ tutors: tutorsWithImages });
      })
     .catch(err => {
          console.error(err);
          res.status(500).json({ message: 'Server error' });
      });
});
app.delete('/Likes', (req, res) => {
  let { productId, userId, type } = req.body;
  const update = { $pull: { Likes: { type, id: productId } } };

  Users.updateOne({ _id: userId }, update)
      .then(() => res.send({ message: 'Unliked!' }))
      .catch(() => res.send({ message: 'server error' }));
});


app.get("/get-subject/:id", async (req, res) => {
  try {
      const subject = await Subjects.findById(req.params.id).populate("userCommented.userID", "username");
      if (!subject) return res.status(404).json({ error: "Subject not found" });

      // Calculate the average rating
      const totalRatings = subject.userCommented.length;
      const averageRating = totalRatings > 0
          ? subject.userCommented.reduce((sum, r) => sum + r.rating, 0) / totalRatings
          : 0;

      res.json({ subject: { ...subject.toObject(), averageRating } });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
  }
});


app.get('/get-user/:uId', (req, res) => {
  const userId = req.params.uId;

  Users.findOne({ _id: userId })
    .then((result) => res.send({ message: 'Successful!', user: { email: result.email, mobile: result.mobile, username: result.username } }))
    .catch(() => res.send({ message: 'error' }));
});

// Request Password Reset
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });
  if (!user) return res.status(404).send({ message: 'User not found!' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000; // 1-hour expiry
  await user.save();

  const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
  await transporter.sendMail({
    from: 'your-email@gmail.com',
    to: user.email,
    subject: 'Password Reset Request',
    text: `Click the link to reset your password: ${resetLink}`
  });

  res.send({ message: 'Password reset link sent to your email.' });
});

// Reset Password
app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await Users.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) return res.status(400).send({ message: 'Invalid or expired token!' });

  // const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = newPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.send({ message: 'Password updated successfully!' });
});

app.get("/api/users/:id", async (req, res) => {
  const user = await Users.findById(req.params.id).select("pid username department Likes profileImage coverImage");
  res.json(user);
});

app.get("/api/products", async (req, res) => {
  const products = await Products.find({ addedBy: req.query.addedBy });
  res.json(products);
});

app.get("/api/subjects", async (req, res) => {
  const subjects = await Subjects.find({ addedBy: req.query.addedBy });
  res.json(subjects);
});

app.post("/api/users/upload-image", upload.single("image"), async (req, res) => {
  let { userId, type } = req.body;
  console.log("📥 Received image upload request:", req.body);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  if (!["profile", "cover"].includes(type)) {
    return res.status(400).json({ error: "Invalid upload type" });
  }

  try {
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const imagePath = `/uploads/${req.file.filename}`;

    if (type === "profile") user.profileImage = imagePath;
    if (type === "cover") user.coverImage = imagePath;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats', async (req, res) => {
  try {
    console.log("📥 Received chat request:", req.body);
    const { userId, contactId } = req.body;
    
    // Validate input
    if (!userId || !contactId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create sorted participant array
    const participants = [userId, contactId].sort();
    
    // Check existing chat
    let chat = await Message.findOne({ participants })
      .populate('lastMessage')
      .populate({
        path: 'participants',
        select: 'username' // Assuming you have username in your User model
      });

    // If chat doesn't exist, create new
    if (!chat) {
      chat = new Chat({ participants });
      await chat.save();
      
      // Populate dummy contact info (replace with actual user lookup)
      chat = chat.toObject();
      chat.contact = {
        _id: contactId,
        username: contactId === participants[0] ? participants[0] : participants[1]
      };
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post("/addReview", async (req, res) => {
  try {
      const { id, userID, rating, comment, type } = req.body;
      if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userID)) {
          return res.status(400).json({ error: "Invalid ID" });
      }

      const model = type === "product" ? Products : Subjects;
      const item = await model.findById(id);
      if (!item) {
          return res.status(404).json({ error: "Item not found" });
      }

      // Add review to userCommented array
      item.userCommented.push({ userID, rating, comment });
      await item.save();

      res.json({ message: "Review added successfully!" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
  }
});

// Fetch reviews
app.get('/getReviews', async (req, res) => {
  try {
    const { id, type } = req.query; // type: 'product' or 'subject'
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const model = type === 'product' ? Products : Subjects;
    const item = await model.findById(id).populate('userCommented.userID', 'username profileImage');
    if (!item) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(item.userCommented);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get("/get-subject-rating/:id", async (req, res) => {
  try {
      const subject = await Subjects.findById(req.params.id).populate("reviews.userID", "username");
      if (!subject) return res.status(404).json({ error: "Subject not found" });

      // Calculate the average rating
      const totalRatings = subject.reviews.length;
      const averageRating = totalRatings > 0
          ? subject.reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
          : 0;

      res.json({ subject: { ...subject.toObject(), averageRating } });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
  }
});


// Configure Multer for certificate image upload
const certUploadDir = path.join(__dirname, 'uploads/certificates');
if (!fs.existsSync(certUploadDir)) {
  fs.mkdirSync(certUploadDir, { recursive: true });
}

const certificateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, certUploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const uploadCertificate = multer({ storage: certificateStorage });

// Certificate Routes
app.post('/api/certificates', uploadCertificate.single('image'), async (req, res) => {
  try {
    const { courseName, duration, company, verificationCode, userId } = req.body;
    
    if (!courseName || !duration || !company || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newCertificate = new Certificate({
      courseName,
      duration,
      company,
      verificationCode: verificationCode || null,
      image: req.file ? `uploads/certificates/${req.file.filename}` : null,
      userId
    });

    await newCertificate.save();
    res.status(201).json(newCertificate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/certificates', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    
    const certificates = await Certificate.find(query)
      .populate('userId', 'username profileImage ')
      .sort({ issueDate: -1 });

    res.json(certificates);
    console.log(certificates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add to your existing Express setup:
app.use('/uploads/certificates', express.static(path.join(__dirname, 'uploads/certificates')));

app.delete("/delete/:type/:id", async (req, res) => {
  const { type, id } = req.params;

  let Model;
  switch (type) {
      case "product":
          Model = Products;
          break;
      case "tutor":
          Model = Subjects;
          break;
      case "cert":
          Model = Certificate;
          break;
      default:
          return res.status(400).json({ error: "Invalid type specified" });
  }
  try {
      const deletedItem = await Model.findByIdAndDelete(id);
      if (!deletedItem) {
          return res.status(404).json({ error: "Item not found" });
      }
      res.json({ message: "Deleted successfully", deletedItem });
  } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/report", async (req, res) => {
  const { itemId, reason, type } = req.body;
  console.log(req.body);

  if (!itemId || !reason) {
      return res.status(400).json({ error: "Item ID and reason are required" });
  }
const itemType = type === "product" ? "Products" : type === "tutor" ? "Subjects" : "Certificates";
  try {
      const report = new Report({
          itemId,
          reason,
          itemType,
      });

      await report.save();
      res.json({ message: "Report submitted successfully", report });
  } catch (error) {
      console.error("Error submitting report:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});


// API to fetch daily counts grouped by category, ensuring all dates are included
app.get("/analytics/daily-category", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    console.log("Start Date:", start);
    console.log("End Date:", end);

    // Aggregate Products
    const productStats = await Products.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, category: "$category" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } } // Ensure chronological order
    ]);

    // Aggregate Subjects
    const subjectStats = await Subjects.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, category: "$category" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } }
    ]);

    console.log("Product Aggregation Result:", productStats);
    console.log("Subject Aggregation Result:", subjectStats);

    // Generate all dates within the range to ensure completeness
    const dateMap = new Map();

    // Helper function to add data to the date map
    function addToMap(stats) {
      stats.forEach(({ _id, count }) => {
        const { date, category } = _id;
        if (!dateMap.has(date)) {
          dateMap.set(date, {});
        }
        dateMap.get(date)[category] = count;
      });
    }

    addToMap(productStats);
    addToMap(subjectStats);

    // Fill missing dates
    let currentDate = new Date(start);
    while (currentDate <= end) {
      const formattedDate = currentDate.toISOString().split("T")[0];
      if (!dateMap.has(formattedDate)) {
        dateMap.set(formattedDate, {}); // Ensure the date exists with an empty category
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Convert map to sorted array
    const finalData = Array.from(dateMap.entries()).map(([date, categories]) => ({
      date,
      categories,
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: finalData,
    });

  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/reports", async (req, res) => {
  try {
      const reports = await Report.find().lean();
      
      const detailedReports = await Promise.all(
          reports.map(async (report) => {
              let itemDetails;
              if (report.itemType === "Products") {
                  itemDetails = await Products.findById(report.itemId).populate("addedBy");
              } else if (report.itemType === "Subjects") {
                  itemDetails = await Subjects.findById(report.itemId).populate("addedBy");
              } else if (report.itemType === "Certificates") {
                  itemDetails = await Certificate.findById(report.itemId).populate("userId");
              }
              
              if (!itemDetails) return null;
              
              const user = await Users.findById(
                  itemDetails.addedBy || itemDetails.userId
              ).select("username email mobile department profileImage");
              
              return {
                  _id: report._id,
                  itemType: report.itemType,
                  reason: report.reason,
                  date: report.date,
                  itemDetails,
                  user
              };
          })
      );
      
      res.json(detailedReports.filter(report => report !== null));
  } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete the report
    const deletedReport = await Report.findByIdAndDelete(id);

    if (!deletedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const genAI = new GoogleGenerativeAI('AIzaSyBbVWhRmXFYLzjJNgHrQ7-sPOacfxE8ZTM');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp-01-21' });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 1024,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// Optional: Sanitize HTML or code tags
function sanitizeInput(text) {
  return text.replace(/<[^>]*>/g, '').substring(0, 8192);
}

// Restriction: Block non-study-related questions
async function isStudyRelated(text) {
  const tempModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-thinking-exp-01-21' });

  const result = await tempModel.generateContent(`Is the following question study or education-related? Just answer "yes" or "no".\n\n"${text}"`);


  const answer = result.response.text().trim().toLowerCase();
  return answer.startsWith('yes');
}


app.post('/analyze-text', async (req, res) => {
  try {
    const { inputValue } = req.body;
    console.log("📥 Received text for analysis:", inputValue);
    if (!inputValue) return res.status(400).json({ error: 'No input provided' });

    const sanitizedInput = sanitizeInput(inputValue);

    if (!isStudyRelated(sanitizedInput)) {
      return res.json({ message: "❌ Only study-related queries are allowed.", confidence: 0 });
    }

    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: 'user',
          parts: [{ text: "You are a helpful study assistant. Only respond to study, education, or career guidance questions." }]
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I will only assist with academic and educational queries." }]
        }
      ]
      
    });
    

    const result = await chatSession.sendMessage(sanitizedInput);
    const responseText = result.response.text();

    res.json({ message: responseText, confidence: 100 });
    console.log("📤 Response sent:", responseText);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Error processing your request' });
  }
});

const shuatsText = `
You are assisting students from Sam Higginbottom University of Agriculture, Technology and Sciences (SHUATS). Here is the official information:

Chancellor: Prof. (Dr.) R. B. Lal  
Vice Chancellor: Prof. (Dr.) R. B. Lal  
Registrar: Prof. (Dr.) R. K. Singh  
Location: Allahabad, Uttar Pradesh  
Website: https://shuats.edu.in

Helpdesk:  
📞 Phone: +91-532-2684281  
📧 Email: info@shuats.edu.in

Important Offices:  
- Academic Affairs: Dr. S. P. Singh (Dean)  
- Examination Cell: Dr. Anil Kumar (Controller)  
- Student Welfare: Dr. P. K. Sharma (Dean)  
- Research & Extension: Dr. R. N. Singh (Director)  
- Placement Cell: Dr. N. K. Verma (Coordinator)  
- International Relations: Dr. Rekha Joshi (Director)  
- Library: Mr. Dinesh Tiwari (Chief Librarian)

HODs by Department:  
- Computer Science and Engineering: Dr. Ankit Srivastava  
- Mechanical Engineering: Dr. Ravi Verma  
- Electrical Engineering: Dr. Ajay Kumar  
- Electronics and Communication: Dr. Ritesh Pandey  
- Civil Engineering: Dr. Deepak Tiwari  
- Information Technology: Dr. Neha Saxena  
- Agriculture: Dr. Meera Kumari  
- Horticulture: Dr. Anil Chauhan  
- Forestry: Dr. Sanjay Rawat  
- Biotechnology: Dr. Shweta Mishra  
- Biochemistry: Dr. Rajeev Prasad  
- Microbiology: Dr. Alka Singh  
- Environmental Sciences: Dr. Sushil Kumar  
- Business Administration (MBA): Dr. Nidhi Agarwal  
- Education: Dr. Vinay Tiwari  
- Theology: Dr. Prabhakar Samuel  
- Economics: Dr. Sarita Yadav  
- English: Dr. Ruchi Mishra  
- Mass Communication: Dr. Vikas Khare  
- Law: Dr. Anamika Sinha  

Library Timings:  
🕘 9:00 AM – 6:00 PM (Monday to Saturday)  

Exam Office Email: examcell@shuats.edu.in  
Placement Cell Email: placement@shuats.edu.in  

This information is verified and meant to help students get accurate assistance for anything related to SHUATS academics, faculty, and university departments.
`;

function isShuatsRelated(input) {
  const keywords = [
    'shuats', 'allahabad', 'r. b. lal', 'r. k. singh', 'academic affairs', 'exam cell', 'student welfare',
    'research', 'placement', 'international relations', 'library', 'controller', 'dean', 'coordinator',
    'director', 'professor', 'dr.', 'hod', 'timetable', 'faculty', 'department', 'helpdesk',
    'dinesh tiwari', 'ankit srivastava', 'neha saxena', 'meera kumari', 'campus', 'shuats.edu.in'
  ];

  const lower = input.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

app.post('/chat-shuats', async (req, res) => {
  try {
    const { inputValue } = req.body;
    console.log("📥 Received text for SHUATS analysis:", inputValue);

    if (!inputValue) {
      console.warn("⚠️ No input provided");
      return res.status(400).json({ error: 'No input provided' });
    }

    const sanitizedInput = sanitizeInput(inputValue);
    console.log("🧼 Sanitized input:", sanitizedInput);

    // Strict SHUATS-only check
    if (!isShuatsRelated(sanitizedInput)) {
      console.warn("❌ Rejected non-SHUATS query");
      return res.json({ message: "❌ Only SHUATS-related queries are allowed.", confidence: 0 });
    }

    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: 'user',
          parts: [{
            text:
              "You are a helpful assistant for SHUATS students only. Answer queries strictly based on the following university information:\n\n" +
              shuatsText
          }]
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I will only respond to queries about SHUATS based on the given data." }]
        }
      ]
    });

    let responseText = '';
    try {
      const result = await chatSession.sendMessage(sanitizedInput);
      responseText = result.response.text();
      console.log("✅ Model response:", responseText);
    } catch (modelErr) {
      console.error("❌ Model error:", modelErr.message, modelErr.stack);
      return res.status(500).json({
        error: 'Failed to process SHUATS query',
        detail: modelErr.message
      });
    }

    res.json({ message: responseText, confidence: 100 });
    console.log("📤 Response sent to client");
  } catch (error) {
    console.error('❌ API Error:', error.message, error.stack);
    res.status(500).json({ error: 'Error processing your request' });
  }
});

server.listen(4000, () => {
  console.log("Server running on port 4000");
});
