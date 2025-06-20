/**
 * Authentication Router Module
 *
 * Handles user registration, login, and logout operations
 */
var express = require("express");
var router = express.Router();
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");
const validation = require("../middleware/validation.middleware");
const { auth } = require("../middleware");

/**
 * Register a new user
 *
 * @route POST /Register
 * @param {string} req.body.username - Username (3-8 characters, letters only)
 * @param {string} req.body.password - Password (5-10 chars, with at least one number and special char)
 * @param {string} req.body.firstname - User's first name
 * @param {string} req.body.lastname - User's last name
 * @param {string} req.body.country - User's country
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.profilePic - URL to user's profile picture
 * @returns {Object} - Success message
 * @throws {Error} - If username already exists or other validation fails
 */
router.post(
  "/Register",
  validation.validateRegister,
  async (req, res, next) => {
    try {
      // parameters exists
      // valid parameters
      // username exists
      let user_details = {
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        country: req.body.country,
        password: req.body.password,
        email: req.body.email,
        profilePic: req.body.profilePic,
      };
      let users = [];
      users = await DButils.execQuery("SELECT username from users");

      if (users.find((x) => x.username === user_details.username))
        throw { status: 409, message: "Username taken" };

      // add the new username
      let hash_password = bcrypt.hashSync(
        user_details.password,
        parseInt(process.env.bcrypt_saltRounds)
      );

      await DButils.execQuery(
        `INSERT INTO users (username, firstname, lastname, country, password, email, profilePic) VALUES ('${user_details.username}', '${user_details.firstname}', '${user_details.lastname}',
      '${user_details.country}', '${hash_password}', '${user_details.email}', '${user_details.profilePic}')`
      );
      res.status(201).send({ message: "user created", success: true });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Authenticate and log in a user
 *
 * @route POST /Login
 * @param {string} req.body.username - User's username
 * @param {string} req.body.password - User's password
 * @returns {Object} - Success message with session cookie set
 * @throws {Error} - If username doesn't exist or password is incorrect
 */
router.post("/Login", async (req, res, next) => {
  try {
    console.log("Login attempt for username:", req.body.username); // check that username exists
    const users = await DButils.execQuery("SELECT username FROM users");
    console.log("Found users in DB:", users);

    // Check if users is an array of arrays or just an array of objects
    const usersList = Array.isArray(users[0]) ? users[0] : users;
    if (!usersList.find((x) => x.username === req.body.username)) {
      console.log("Username not found in database");
      throw { status: 401, message: "Username or Password incorrect" };
    } // check that the password is correct
    const result = await DButils.execQuery(
      `SELECT * FROM users WHERE username = '${req.body.username}'`
    );
    // Handle different result formats
    const user = Array.isArray(result[0]) ? result[0][0] : result[0];

    console.log("Found user:", { ...user, password: "HIDDEN" });
    console.log("Comparing passwords:");
    console.log("1. Password from request:", req.body.password);
    console.log("2. Hash from DB:", user.password);

    const isPasswordMatch = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    console.log("3. Password match result:", isPasswordMatch);

    if (!isPasswordMatch) {
      console.log("Password comparison failed");
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = user.user_id;
    console.log(
      "Login successful, set user_id in session:",
      req.session.user_id
    );

    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
});
//ma kore
/**
 * Log out a user by resetting their session
 *
 * @route POST /Logout
 * @authentication Required
 * @returns {Object} - Success message indicating logout was successful
 * @throws {Error} - If user is not logged in
 */
router.post("/Logout", auth.authenticate, function (req, res, next) {
  try {
    console.log("=== Logout Process Started ===");
    console.log("User requesting logout - ID:", req.session.user_id);
    console.log("Session before reset:", req.session);

    req.session.reset(); // reset the session info

    console.log("Session after reset:", req.session);
    console.log("=== Logout Process Completed ===");

    res.status(200).send({ success: true, message: "logout succeeded" });
  } catch (error) {
    console.error("Logout error:", error);
    next(error);
  }
});

module.exports = router;
