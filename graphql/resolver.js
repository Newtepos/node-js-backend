const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { isEmail, isEmpty, isLength } = require('validator');
const jwt = require('jsonwebtoken');

module.exports = {
    login: async ({ email, password }) => {
        let loadedUser;
        try {
            const user = await User.findOne({ email: email })
            if (!user) {
                const error = new Error('User cannot be found!');
                error.code = 401;
                throw error;
            }
            loadedUser = user;
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                const error = new Error('Wrong password!');
                error.code = 401;
                throw error;
            }
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            }, 'juniorsecret', { expiresIn: '1h' });
            return { userId: loadedUser._id.toString(), token: token };
        } catch (err) {
            console.log('err', err);
            if (!err.code) {
                err.message = 'An error occurred';
                err.code = 500;
            }
            throw err;
        }
    },
    createUser: async ({ userInput }) => {
        let error
        if (!isEmail(userInput.email)) {
            error = new Error('E-Mail is invalid');
            error.code = 422;
            throw error;
        }
        if (!isEmpty(userInput.password) && !isLength(userInput.password, { min: 7 })) {
            error = new Error('Password is invalid');
            error.code = 422;
            throw error;
        }
        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser) {
            const error = new Error('User already exists');
            error.code = 422;
            throw error;
        }
        const hashedPwd = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPwd,
        });
        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString() };
    }
};


