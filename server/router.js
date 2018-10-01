const UserModel = require("./models/userModel");
const express = require("express");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const config = require("./config");
const bcrypt = require("bcrypt");
const path = require("path");
const passport = require("passport");

function checkAuth(req, res, next) {
  passport.authenticate(
    "jwt",
    { session: false },
    (err, decryptToken, jwtError) => {
      if (jwtError != void 0 || err != void 0)
        return res.render("index.html", { error: err || jwtError });
      req.user = decryptToken;
      next();
    }
  )(req, res, next);
}

function createToken(body) {
  return jwt.sign(body, config.jwt.secretOrKey, {
    expiresIn: config.expiresIn,
  });
}
module.exports = (app) => {
  app.use(
    "/assets",
    express.static(path.join(__dirname, "..", "client/public"))
  );
  app.get("/", checkAuth, (req, res) => {
    res.render("index.html", { username: req.user.username });
  });
  app.post("/login", async (req, res) => {
    try {
      let user = await UserModel.findOne({
        username: { $regex: _.escapeRegExp(req.body.name), $options: "i" },
      })
        .lean()
        .exec();
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        const token = createToken({ id: user._id, username: user.username });
        res.cookie("token", token, {
          httpOnly: true,
        });
        res.status(200).send({ message: "User login successfull" });
      } else {
        return res.status(400).send({ message: "User undefined" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Some Errors" });
    }
  });
  app.post("/register", async (req, res) => {
    try {
      let user = await UserModel.findOne({
        username: { $regex: _.escapeRegExp(req.body.name), $options: "i" },
      })
        .lean()
        .exec();
      if (user) {
        return res.status(400).send({ message: "User already exist" });
      }
      user = await UserModel.create({
        username: req.body.username,
        password: req.body.password,
      });
      const token = createToken({ id: user._id, username: user.username });
      res.cookie("token", token, {
        httpOnly: true,
      });
      res.status(200).send({ message: "User created!" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Some Errors" });
    }
  });
  app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).send({ message: "Logout successfull" });
  });
};
