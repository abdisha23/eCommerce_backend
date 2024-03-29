const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    numViews: {
      type: Number,
      default: 0,
    },
    isLiked: {
      type: Boolean,
      default: false,
    },
    isDisliked: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    author: {
      type: String,
      default: "Admin",
    },
    images: [{
      public_id: String,
      url: String
  }],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

//Export the model
module.exports = mongoose.model("Blog", blogSchema);








// const mongoose = require('mongoose');


// var blogSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: String,
//         reqiured: true
//     },
//     numViews: {
//         type: Number,
//         default: 0
//     },
//     isLiked: {
//         type: Boolean,
//         default: false,
//     },
//     isDisLiked: {
//         type: Boolean,
//         default: false,
//     },
//     Likes: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//     }],
//     disLikes: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//     }],
//     image: {
//         type: String,
//         default: "https://www.shutterstock.com/shutterstock/photos/1029506242/display_1500/stock-photo-blogging-blog-concepts-ideas-with-white-worktable-1029506242.jpg"
//     },
//     auther: {
//         type: String,
//         default: "Admin"
//     },
//    },
//    {
//     toJSON: {
//         virtuals: true
//     },
//     toObject: {
//         virtuals: true
//     },
//     timestamps: true  
// });

// module.exports = mongoose.model("Blog", blogSchema);