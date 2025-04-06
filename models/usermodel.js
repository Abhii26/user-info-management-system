const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({

    name : {
        type : String, 
        required : true
    },
    email : {
        type : String, 
        required : true,
        unique: true,
    },
    phone : {
        type : String, 
        required : false,
    },
    image : {
        type : String, 
        required : false
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 100
    }
    // name:{
    //     type : string,
    //     required : true
    // },
    // email:{
    //     type : string,
    //     required: true
    // },
    // dateOfBirth: {
    //     type: Date,
    //     required: true,
    //     trim: true,
    // },
    // phone : {
    //     type : String, 
    //     required : true,
    // },
    // image : {
    //     type : String, 
    //     required : true
    // }

})
module.exports = mongoose.model("User", userSchema);
