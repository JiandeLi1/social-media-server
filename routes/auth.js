var express = require('express');
var router = express.Router();
const User = require("../db/user");
const bcrypt = require("bcrypt");

/* GET auth listing. */
router.post('/register', async function(req, res, next) {
    try {
    //Using bcrypt to create a new password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password:hashedPassword
       })
        const user = await newUser.save()
        res.status(200).json(user)
    } catch (err) {
        console.log(err)
    }
});

router.post("/login", async (req, res, next) => {
    console.log(req.body)
    try {
        const user = await User.findOne({ email: req.body.email })//return a object that email is match
        !user && res.status(404).json("User Not Found");
        const vaildPassword = await bcrypt.compare(req.body.password, user.password)
        !vaildPassword && res.status(404).json("Wrong Password");
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json(err)
    }
})
module.exports = router; 