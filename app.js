const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const feedRoutes = require('./routes/feed');
// const authRoutes = require('./routes/auth');
const graphqlAuth = require('./middleware/grapthql-auth');
const { init: InitIO } = require('./socket');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const resolver = require('./graphql/resolver');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4());
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(graphqlAuth);

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: resolver,
    graphiql: true,
    customFormatErrorFn: (err) => {
        if (!err.originalError) return err
        const data = err.originalError.data;
        const message = err.message || 'An error occurred';
        const code = err.originalError.code || 500;
        return { message: message, status: code, data: data };
    }
}));

// app.use('/feed', feedRoutes);
// app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose.connect('mongodb+srv://newtepos:0gkyVS7qxqA15308@cluster0.z8ji3.mongodb.net/messages?retryWrites=true&w=majority&appName=cluster0')
.then(result => {
    // console.log('Connected to MongoDB');
    // const server = app.listen(8080);
    // const io = InitIO(server);
    // io.on('connection', socket => {
    //     console.log('Client connected');
    // });
    app.listen(8080);
})
.catch(err => {
    console.log(err);
});

// app.listen(8080);
