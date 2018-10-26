var express = require('express');
var router = express.Router();
var passport = require('passport'),
    LocalStrategy   = require('passport-local').Strategy;
var flash = require('connect-flash');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var use = require('../models/users');
var loc = require('../models/user_loc.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.passport && req.session.passport.user)
      res.redirect('/dashboard');
  else
      res.render('index',{success:req.flash('success_msg'),error:req.flash('error'),session:req.session});
});

router.get('/register', function(req,res,next){
  if(req.session.passport && req.session.passport.user)
      res.redirect('/dashboard');
  else
      res.render('register',{error:req.flash('error_msg'),session:req.session});
});

router.get('/dashboard',function(req,res,next){
    if(req.session.passport && req.session.passport.user){
        res.render('dashboard',{msg:req.flash('success'),session:req.session});
    }
    else
        res.redirect('/');
});

router.post('/register', function(req,res,err){
  var email = req.body.email;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var password = req.body.password;
  var confpass = req.body.confpass;
  if(password!=confpass) {
      req.flash('error_msg', 'Password and Confirm Password fields do not match');
        res.redirect('/register');
  }
  else{
      use.find({email:email},function(err,docs){
          if(docs.length>0)
          {
              req.flash('error_msg',"Email already registered.");
              res.redirect('/register');
          }
          else
          {
              var hash = bcrypt.hashSync(password,10);
              var user = new use({
                  "email":email,
                  "fname":fname,
                  "lname":lname,
                  "password":hash
              });
              user.save(function(err,updated){
                  if(err) console.log(err);
                  req.flash('success_msg','You have succesfully registered. Login now to continue');
                  res.redirect('/');
              });
          }
      });
  }
});

router.post('/', passport.authenticate('userLogin', {
    successRedirect:'/dashboard',
    failureRedirect:'/',
    failureFlash:true,
    successFlash:true
}));

passport.use('userLogin',new LocalStrategy({
        usernameField:'email'
    },
    function(username, password, done) {
        use.findOne({ email :username },
            function(err,user) {
                if (err)
                    return done(err);
                if (!user){
                    return done(null, false, { message:'Incorrect Email'});
                }
                if (!isValidPassword(user, password)){
                    return done(null, false, { message:'Incorrect Password'});
                }
                return done(null, user,{message:'You have Logged In successfully'});
            }
        );

    })
);

var isValidPassword = function(user,password){
    return bcrypt.compareSync(password,user.password);
};

passport.serializeUser(function(user, done) {
    var sessionUser = {_id:user._id,email:user.email,fname:user.fname,lname:user.lname};
    done(null, sessionUser);
});

passport.deserializeUser(function(id, done) {
    use.findById(id, function(err, user) {
        done(err, user);
    });
});

router.get('/logout',function(req,res,next){
    req.logOut();
    req.flash('logout','You have successfully logged out');
    res.redirect('/');
});

router.post('/save_loc',function(req,res,next){
    let lat = req.body.latitude;
    let lon = req.body.longitude;
    lat = Math.round(lat);
    lon = Math.round(lon);
    
    let email = req.session.passport.user.email;
    
    loc.findOne({email:email},function(err,docs){
        if(docs)
        {
            docs.latitude = lat;
            docs.longitude = lon;
            docs.save();
        }
        else
        {
            var location = new loc({
                "email":email,
                "latitude":lat,
                "longitude":lon
            });
            location.save(function(err,updated){
                if(err) console.log(err);
            });
        }
    });
});

module.exports = router;
