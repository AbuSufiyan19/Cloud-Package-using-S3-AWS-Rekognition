const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const app = express();

dotenv.config();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); 


mongoose.connect('mongodb+srv://abusufiyan3147:fZXqtDNnTVdexiDj@cluster0.dp7wy.mongodb.net/s3package?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/css', express.static(path.resolve(__dirname, "views/css")));

const Routes = require('./Routes/routes');

app.use(Routes);

    // Start server
const PORT = process.env.PORT || 5000;  
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://localhost:${PORT}`);
});