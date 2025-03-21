const User = require('../models/User');
exports.signup = async (req, res) => { 
    const { pid, username, password, mobile, email, department } = req.body;

// Validate mobile number format
const mobileNumberPattern = /^\d{10}$/;
if (!mobileNumberPattern.test(mobile)) {
  return res.status(400).send({ message: 'Mobile number must be exactly 10 digits!' });
}

// Check if PID or email or mobile already exists
Users.findOne({ $or: [{ pid }, { email }, { mobile: Number(mobile) }] })
  .then(existingUser => {
    if (existingUser) {
      if (existingUser.pid === pid) {
        return res.status(400).send({ message: 'PID already exists!' });
      } else if (existingUser.email === email) {
        return res.status(400).send({ message: 'Email already exists!' });
      } else if (existingUser.mobile === Number(mobile)) {
        return res.status(400).send({ message: 'Mobile number already exists!' });
      }
    }

    // If no duplicates found, create new user
    const user = new Users({ pid, username, password, mobile: Number(mobile), email, department });

    user.save()
      .then(() => res.send({ message: 'Sign-up Successful!' }))
      .catch(() => res.status(500).send({ message: 'Server error' }));
  })
  .catch(() => res.status(500).send({ message: 'Server error' }));};
exports.login = async (req, res) => {  const { pid, password } = req.body;

  Users.findOne({ pid })
    .then((result) => {
      if (!result) {
        res.send({ message: 'User Not Found!' });
      } else if (result.password === password) {
        const token = jwt.sign({ data: result }, 'Mykey', { expiresIn: '1h' });
        res.send({ message: 'Login Successful!', token, userId: result._id });
      } else {
        res.send({ message: 'Password incorrect!' });
      }
    })
    .catch(() => res.send({ message: 'login error' }));};
exports.getUserProfile = async (req, res) => {   let uid = req.params.userId
    Users.findOne({_id:uid})
    .then((result) => res.send({ message: 'success', user:{
      pid:result.pid,
      email:result.email,
      mobile:result.mobile,
      username:result.username,
      department:result.department
    } }))
      .catch(() => res.send({ message: 'fetch error' }));};