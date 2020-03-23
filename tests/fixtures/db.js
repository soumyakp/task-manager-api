const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../../src/models/userSchema');
const Task = require('../../src/models/taskSchema');

const userObjId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userObjId,
    name: 'Ruma',
    email: 'ruma@example.com',
    password: 'rumaWhat@1',
    tokens: [{
        token: jwt.sign({ _id: userObjId }, process.env.JWT_SECRET)
    }]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: 'Rishi',
    email: 'rishi@example.com',
    password: 'rishihouse@1',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
};

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: false,
    owner: userObjId
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second task',
    completed: true,
    owner: userObjId
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third task',
    completed: false,
    owner: userTwoId
};

const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = {
    userObjId,
    userTwoId,
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}
