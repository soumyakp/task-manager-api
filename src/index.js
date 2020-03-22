const express = require('express');
// const bodyParser = require("body-parser");

require('./db/mongoose');
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');

const app = express();
const port = process.env.PORT;

// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled!');
//     } else {
//         next();
//     }
// });

// Maintainance purpose

// app.use((req, res, next) => {
//     res.status(503).send('Site is currently down. Check back soon!');
// });

// const multer = require('multer');
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, callback) {
//         if (!file.originalname.match(/\.(doc|docx)$/)) {
//             return callback(new Error('Please upload a word document'));
//         }

//         callback(undefined, true);
//     }
// });

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send();
// }, (error, req, res, next) => {
//     res.status(404).send({ error: error.message });
// });

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     );
//     res.setHeader(
//       "Access-Control-Allow-Methods",
//       "GET, POST, PATCH, PUT, DELETE, OPTIONS"
//     );
//     next();
//   });

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});

// const Task = require('../src/models/taskSchema');
// const User = require('../src/models/userSchema');

// const main = async () => {
//     // const task = await Task.findById('5e6fbbfe543c170950f3f6d4'); //.populate('owner');
//     // await task.populate('owner').execPopulate();
//     // console.log(task);

//     const user = await User.findById('5e6fb0b4d98f130eac156dfa').populate('tasks');
//     console.log(user.tasks);
// }

// main();