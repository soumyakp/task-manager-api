const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const CryptoJS = require('crypto-js');

const User = require('../models/userSchema');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');
const { response } = require('express');

const router = new express.Router();

router.post('/users', async (req, res) => {
  const { agree, ...userReq } = req.body;
  const user = new User(userReq);
  try {
    await user.save();
    if (req.body.agree) {
      sendWelcomeEmail(user.email, user.name);
    }
    const token = await user.getAuthenticated();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
  // user.save().then(() => {
  //     res.status(201).send(user);
  // }).catch((error) => {
  //     res.status(400).send(error);
  // })
});

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.getAuthenticated();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).save();
  }
});

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/users/me', auth, (req, res) => {
  res.send(req.user);

  // try {
  //     const users = await User.find({});
  //     res.send(users);
  // } catch {
  //     res.status(500).send();
  // }

  // User.find({}).then((users) => {
  //     res.send(users);
  // }).catch((e) => {
  //     res.status(500).send();
  // });
});

// router.get('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) {
//             return res.status(404).send();
//         }
//         res.send(user);
//     } catch (e) {
//         res.status(500).send();
//     }
//     // User.findById(req.params.id).then((user) => {
//     //     if (!user) {
//     //         return res.status(404).send();
//     //     }
//     //     res.send(user);
//     // }).catch((e) => {
//     //     res.status(500).send();
//     // });
// });

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdate = ['name', 'email', 'password', 'age', 'birthday'];
  const isValidOperation = updates.every(eachPropertyName =>
    allowedUpdate.includes(eachPropertyName)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid update!' });
  }
  try {
    // const user = await User.findById(req.user._id);
    updates.forEach(
      eachPropertyName =>
        (req.user[eachPropertyName] = req.body[eachPropertyName])
    );
    await req.user.save();
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    // if (!user) {
    //     return res.status(404).send();
    // }
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);
    // if (!user) {
    //     return res.status(404).send({ error: 'Invalid params!' });
    // }
    await req.user.remove();
    if (req.user.agree) {
      sendCancelationEmail(req.user.email, req.user.name);
    }
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

const upload = multer({
  // dest: 'avatars',
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      callback(new Error('File must be an image!'));
    }

    callback(undefined, true);
  }
});
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({
        width: 250,
        height: 250
      })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

router.get('/users/me/avatar', auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

module.exports = router;
