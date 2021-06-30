var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const User = require('../db/user');

/* GET users listing. */
router.put('/:id', async function(req, res, next) {
  if (req.body.userId == req.params.id || req.user.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt)
      } catch (err) {
        return res.status(500).json(err)
      }
    }
      try {
        const user = await User.findByIdAndUpdate(req.params.id, {
          $set:req.body,
        })
        res.status(200).json("Account has been updated")
      } catch (err) {
        return res.status(500).json(err)
      }
    } else {
      return res.status(403).json("You can upload only your account!")
    }
});

//Delete a user
router.delete('/:id', async function(req, res, next) {
  if (req.body.userId == req.params.id || req.body.isAdmin) {
      try {
        const user = await User.findByIdAndDelete(req.params.id)
        res.status(200).json("delete your account has been updated")
      } catch (err) {
        return res.status(500).json(err)
      }
    } else {
      return res.status(403).json("You can delete only your account!")
    }
});
  
//get a user doc
router.get('/', async function (req, res, next) {
      const userId = req.query.userId
      const username = req.query.username
      try {
        const user = userId ?
                     await User.findById(userId) :
                     await User.findOne({ username: username })
        const {password, updatedAt, ...other} = user._doc//user return a doc, then use ES6 to get the info except password and last update time
        res.status(200).json(other)
      } catch (err) {
        return res.status(500).json(err)
      }
});

router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    const friends = await Promise.all(
      user.followings.map(friendId => {
        return User.findById(friendId)
      })
    )
    console.log(friends)
    let friendList = []
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend
      friendList.push({_id, username, profilePicture })
    })
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err)
  }

})

//you follower
router.put('/:id/follow', async function(req, res, next) {
      try {
        const user = await User.findById(req.params.id)
        const currentUser = await User.findById(req.body.userId)
        if (!user.followers.includes(req.body.userId)) {
          await user.updateOne({ $push: { followers: req.body.userId } })
          await currentUser.updateOne({ $push: {followings:req.params.id}})
          res.status(200).json("User has been followed!")
        } else {
          res.status(403).json("You allready follow this user!")
        }
      } catch (err) {
        console.log(err)
        return res.status(500).json(err)
      }
});

//unfollow
router.put('/:id/unfollow', async function(req, res, next) {
      try {
        const user = await User.findById(req.params.id)
        const currentUser = await User.findById(req.body.userId)
        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { followers: req.body.userId } })
          await currentUser.updateOne({ $pull: {followings:req.params.id}})
          res.status(200).json("User has been unfollowed!")
        } else {
          res.status(403).json("You allready unfollow this user!")
        }
      } catch (err) {
        return res.status(500).json(err)
      }
});

module.exports = router;
