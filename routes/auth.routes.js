const router = require("express").Router();
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");

router.post("/signup", (req, res, next) => {
  const { username, password } = req.body;
  //verification of what was sent
  if (!username) {
    return res
      .status(400)
      .json({ errorMessage: "We need a username from you!" });
  }

  if (password.length < 8) {
    return res.json({ errorMessage: "That password is not safe" });
  }

  User.findOne({ username: username }).then((foundUser) => {
    if (foundUser) {
      return res.json({ errorMessage: "User already exists" });
    }
    //encrypt the password
    const saltRounds = 10;
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        return User.create({ username, password: hashedPassword });
      })
      .then((user) => {
        req.session.user = user;
        res.status(201).json(user);
      })
      .catch((error) => {
        return res.json({ errorMessage: "Couldnt create user" });
      });
  });

  //create the user
});

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ errorMessage: "We need a username!" });
  }

  if (!password) {
    return res.status(400).json({ errorMessage: "where is your password" });
  }

  User.findOne({ username }).then((user) => {
    if (!user) {
      return res.json({ errorMessage: "You dont have an account" });
    }
    bcrypt
      .compare(password, user.password)
      .then((isSamePassword) => {
        if (!isSamePassword) {
          return res.json({ errorMessage: "Wrong password" });
        }
        req.session.user = user;
        return res.json(user);
      })
      .catch((error) => {
        next(error);
      });
  });
});

router.post("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return res
        .status(500)
        .json({
          errorMessage: `Something went wrong with the logout: ${errorMessage}`,
        });
    }
    res.json({ successMessage: "Logged out!" });
  });
});

module.exports = router;
