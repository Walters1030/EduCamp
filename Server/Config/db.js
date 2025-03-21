mongoose.connect('mongodb+srv://merger123:merger123@cluster0.z3ztoq6.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log('MongoDB connected')).catch(err => console.log(err));