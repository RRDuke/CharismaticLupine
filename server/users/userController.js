var User = require('./user.js');
var jwt = require('jwt-simple');

module.exports = {
  
  signin: function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    new User({user_name: username})
      .fetch().then(function(user){
        if(!user){
          //Throw error
          next(new Error('User does not exist'));
        } else {
          user.comparePassword(password, function(match){
            if (match){
              var token = jwt.encode(user, 'I HAZ SECRETZ');
              res.json({token: token});
            } else {
              return next(new Error('Password FAIL'));
            }
          });
        }
      });
  },

  signup: function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    new User({user_name: username})
      .fetch().then(function(user) {
        if(user){
          //throw error if user exists
          next(new Error('User already exsists!'));
        } else {
          var newUser = new User({
            user_name: username,
            password: password
          });
          newUser.save()
            .then(function(user){
              var token = jwt.encode(user, 'I HAZ SECRETZ');
              res.json({token: token});
            });
        }
      });
    
  },
  checkAuth: function(req, res, next){
    // checking to see if the user is authenticated
    // grab the token in the header is any
    // then decode the token, which we end up being the user object
    // check to see if that user exists in the database
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, 'I HAZ SECRETZ');
      new User({user_name: user.user_name})
        .fetch().then(function(user){
          if(user){
            res.sendStatus(200);
          } else {
            res.sendStatus(401);
          }
        }).catch(function(error){
          next(error);
        });
    }

  }
};