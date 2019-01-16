const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

//nama email password
// this will be our data base's data structure 
const UserSchema = new Schema( 
  {
    nama: String,
    email : String,
    password : String
  },
  { timestamps: true }
);
UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email })
      .exec(function (err, user) {
        if (err) {
          return callback(err)
        } else if (!user) {
          var err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password, function (err, result) {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        })
      });
}
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash){
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    })
});
// export the new Schema so we could modify it using Node.js
module.exports = mongoose.model("User", UserSchema,'User');