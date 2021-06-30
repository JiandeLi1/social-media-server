var express = require('express');
var router = express.Router();
const Post = require("../db/Post")
const User = require("../db/user")

//create a post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost)
    } catch (err) {
        res.status(500).json(err)
    }
})

//update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            await post.updateOne({$set:req.body})
            res.status(200).json("The post has been update!")
        } else {
            res.status(200).json("You can update only your post!")
        }
        
    } catch (err) {
        res.status(500).json(err)
    }
})

//delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            await post.deleteOne()
            res.status(200).json("The post has been delete!")
        } else {
            res.status(200).json("You can delete only your post!")
        }
    } catch (err) {
        res.status(500).json(err)
    }
})


//like a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: {likes:req.body.userId}})
            res.status(200).json("The post has been liked!")
        } else {
            await post.updateOne({ $pull: {likes:req.body.userId}})
            res.status(200).json("The post has been disliked!")
        }
    } catch (err) {
        res.status(500).json(err)
    }
})

//get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
         res.status(200).json(post)
    } catch (err) {
        res.status(500).json(err)
    }
})

//get timeline posts
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId)
        const userPost = await Post.find({userId: currentUser._id})
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({userId:friendId})
            })
        )
        res.status(200).json(userPost.concat(...friendPosts))
    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
})


router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        const post = await Post.find({userId:user._id})
         res.status(200).json(post)
    } catch (err) {
        res.status(500).json(err)
    }
})

module.exports = router