const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./taskSchema');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            // if (!validator.isLength(value, {min: 6, max: undefined})) {
            //     throw new Error('Password length is must be grether then 6!');
            // } else 
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password can\'t contains password!');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be positive!');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

// Virtual property --> A virtual is not actual data stored in the database it's a relationship
// between two entities in our case between our user and our task.

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

// Below toJSON() function is call when JSON.stringify is call.
// When res.send() method call behind the screen it will stringify the object using JSON.stringify()
// method.
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
}

userSchema.methods.getAuthenticated = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();
    
    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Unable to login!');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Password is invalid!');
    }

    return user;
}

// hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password =  await bcrypt.hash(user.password, 8);
    }
    next();
});

// delete tasks when user removed

userSchema.pre('remove', async function (next) {
    await Task.deleteMany({ owner: this._id });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;