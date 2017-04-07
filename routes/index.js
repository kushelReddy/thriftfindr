var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Thriftstore = require("../models/thriftstore");
var middleware = require("../middleware");
var assert = require('assert');  
var util=require('util');


//root route

router.get("/", middleware.saveReferal ,function(req, res){

    Thriftstore.find({}, function(err, allThriftstores){
        if(err){
            console.log(err);
        } else {
            res.render("thriftstores/index", {thriftstores: allThriftstores, currentUser: req.user});
        }
    });
});



// router.get("/", function(req, res){
//     res.redirect("/thriftstores");
// });


//show register form
router.get("/register", middleware.saveReferal, function(req, res){
    if (req.user){
        res.redirect('/');
    } else {
        res.render("register");
    }
});

//handle signup logic
router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username, picture: "http://i.imgur.com/cieth3z.jpg?1"});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {"error": err.message});
        }
        req.flash("success", "Welcome to ThriftFinder, " + user.username + "!");
        passport.authenticate("local")(req, res, function(){
            res.redirect("/thriftstores");
        });
    })
    
});

//show login form
router.get("/login", function(req, res){
    if (req.user){
        res.redirect('/');
    } else {
        res.render("login");
    }
});

//handling login logic
//app.post(login, middleware, callback)


router.post('/login', passport.authenticate('local'), function(req, res) {
    console.log('/login', req.session.returnTo);
    req.session.returnTo = req.session.returnTo || '/';
    res.redirect(req.session.returnTo);
    delete req.session.returnTo;
}); 

// router.post("/login", passport.authenticate("local", 
//     {
//         successRedirect: "/",
//         failureRedirect: "/login"
        
//     }), function(req, res){
// });

//logout route

router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "You successfully logged out");
    // res.redirect("/thriftstores");
    res.redirect(req.session.returnTo);
});


//search route
// router.get("/search/:type/:term", middleware.saveReferal, function(req, res){
router.get("/search", middleware.saveReferal, function(req, res){
    //find the thriftstore with provided ID
    
    switch (req.query.type) {
        case 'name':
            Thriftstore.find({ "name": new RegExp(req.query.term, 'i')}, function(err, data) {
              if(err) {
                 console.log("err:");
                 console.log(err);
            }
            else{
                 console.log('found: ', data.length);
                res.render("thriftstores/search", {term: req.query.term, thriftstores: data, currentUser: req.user});
            }});
            break;
        case 'location':
            //implement search by location
            break;
        default:
            res.render("thriftstores/search", {currentUser: req.user});
            
    }
    

      
    });


module.exports = router;