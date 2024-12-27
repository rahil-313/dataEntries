const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');
const { type } = require('os');



const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname +"_"+ Date.now() +"_"+ file.originalname);
    },
});

const upload = multer({
    storage: storage,
    }).single("image");

    // Insert an user into database route
    router.post("/add", upload, (req, res) => {
    const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename, 
    });
    user.save().then(() =>{
        req.session.message = {
            type: "success",
            message: "user added successfully"
        };
        res.redirect("/");
    }).catch((err)=>{
        res.json({  message: err.message, type:"danger"});
    });
});

// Get all users route
router.get("/", (req, res) => {
    User.find().exec().then((users) =>{
        res.render('index', {
                     title: 'Home Page',
                    users: users,
                   });
    }).catch((err)=>{
        res.json({ message: err.message });
    });
});

router.get("/add", (req, res) =>{
    res.render('add_users',{ title: 'Add users'});
});

//edit an user route
router.get("/edit/:id", (req, res) =>{
    let id = req.params.id;
    User.findById(id).then((user) => {
        res.render("edit_users", {
            title: "Edit User",
            user: user,
        })
    }).catch((err) =>{
        res.redirect("/");
    })
});

// update user
router.post("/update/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = "";
    if (req.file) {
    new_image = req.file.filename;
    try {
    fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
    console.log(err);
    }
    } else {
    new_image = req.body.old_image;
    }
    User.findByIdAndUpdate(
        id,
        {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: new_image,
        }).then(() => {
            req.session.message = {
                type: "success",
                message: "User updated successfully",
            };
            res.redirect("/");
        }).catch((err) => {
            res.json({ message: err.message, type: "danger" });
        }) 
    });

// delete user
router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;

        // Find the user by ID and delete
        const result = await User.findByIdAndDelete(id).exec();

        // Delete the user's image file if it exists
        if (result && result.image !== '') {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: 'success',
            message: 'User deleted successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});
module.exports = router;
