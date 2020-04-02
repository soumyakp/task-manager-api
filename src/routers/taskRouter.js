const express = require('express');

const Task = require('../models/taskSchema');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }

    // task.save().then(() => {
    //     res.status(201).send(task);
    // }).catch((error) => {
    //     res.status(400).send(error);
    // });
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true';
    }

    if (req.query.sortBy) {
        const sortArr = req.query.sortBy.split(':');
        sort[sortArr[0]] = sortArr[1] === 'asc' ? 1 : -1;
    }

    try {

        // const tasks = await Task.find({ owner: req.user._id });
        // res.send(tasks);
        // both code are 100% workable code.

        // await req.user.populate({
        //     path: 'tasks',
        //     match: {
        //         completed: true
        //     },
        //     sort: {
        //          createdAt: -1 //desc asc would be 1
        //     }
        // }).execPopulate();

        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();

        res.send(req.user.tasks);
                
    } catch (error) {
        res.status(500).send();
    }
    // Task.find({}).then((tasks) => {
    //     res.send(tasks);
    // }).catch((e) => {
    //     res.status(500).send();
    // });
});

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findById(req.params.id);
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (error) {
        res.status(500).send();
    }
    // Task.findById(req.params.id).then((task) => {
    //     if (!task) {
    //         return res.status(404).send();
    //     }
    //     res.send(task);
    // }).catch((e) => {
    //     res.status(500).send();
    // })
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const taskUpdates = Object.keys(req.body);
    const taskAllowedUpdate = ['description', 'completed'];
    const taskIsValidOperation = taskUpdates.every((taskEachProperty) => taskAllowedUpdate.includes(taskEachProperty));

    if (!taskIsValidOperation) {
        return res.status(404).send({error: 'Indalid task object!'});
    }
    try {
        // const task = await Task.findById(req.params.id);
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task) {
            return res.status(400).send({ error: 'Invalid param!'});
        }
        taskUpdates.forEach((taskEachProperty) => task[taskEachProperty] = req.body[taskEachProperty]);
        task.save();
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true , runValidators: true});
        
        res.send(task);    
    } catch (error) {
        res.status(500).send(error);
    }

});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndRemove(req.params.id);
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task) {
            return res.status(404).send({ error: 'Invalid param!' });
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
    
});

module.exports = router;
