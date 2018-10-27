var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var http = require('http');

const secret = 'ojha';
router.get('/', function(req, res, next) {
    res.render('admn_pnl', { title: 'Administrator' });
});

router.post('/login',function (req, res, next) {
    password = req.body.password;
    const hash = crypto.createHmac('sha256', secret)
        .update(password)
        .digest('hex');
    if(hash==='30df25a5f3ca4239b7c594b3d893d8952d0fc41f55bdd76e768a8c5269f9c88d')
    {
        var options = {
            host: '40.114.81.110',
            port: 8000,
            path: '/'
          };
          
        var req = http.get(options, function(result) {
            res.send("Done");
        });
    }
    else
    {
        res.redirect('/admin');
    }
});

router.get('/control_panel',function (req,res,next) {
    res.render('control_panel');
});

module.exports = router;
