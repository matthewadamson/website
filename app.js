require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const https = require("https");
const _ = require("lodash");

const request = require("request");

const homeStartingContent = "At New Century Innovation we believe in leaving everything a little, or a lot, betther than we found it.  It is never too late, and never soon enough to make a right decision.  Our founder and Director knows that sometimes we have plenty, and sometimes we need to facilitate a change.  That's where New Century Innovation comes in; it is helping you to move your organization forward, whether that means abiding the conventional wisdom or thinking outside of the box."
"Have a look at our contact page to get in touch with us, or feel free to read about our founder in the 'about us' section.  We are reachable through our contact page and would love to hear from you."
const aboutContent = "New Century was started by me, Matt Adamson, in late 2020, in an effort to make a more personalized way of socially interacting during the lockdowns.  In other words, I realized the value of a personal web page more than before.  I am the father of two beautiful girls and a wonderful wife.  My background is varied to say the least, but I enjoy the outdoors, playing the guitar, travelling and, (moreso as I get older), having a beautiful, boring life.  This website will hopefully serve a dual purpose in facilitating my career transition into the IT industry";
const interests = "I enjoy learning.  From Theology to computers, and most things in between; I love to read and converse about things.  I am particularly fascinated by other cultures and places, and perhaps that is why I travelled so much as a young man";
const experience = "As I mentioned before, my experience is varied.  I travelled a lot as a younger man; from my time flying around in Chinooks in Afghanistan, to my days teaching English in northern China, I have seen a good little portion of the world.  That, of course, only makes one realize how much more is out there, and how much he doesn't know.  I finished a degree in Anthropology from UAB in 2007, and really thought I was in safe territory.  When I finally 'settled down', (got married and moved back to the U.S.), I realized quickly that the job market was much more competitive than I had originally thought, and while I'd had some neat experiences, I was desperately lacking a specialty.  This is why I have devoted the recent years of my life to learning everything I can about the IT industry, and am at a point now where I feel confident in trying to get that first taste of my dream career working with computers.  I am an AWS certified Solutions Architect, (Associate and Professional), and have just finished an intense full-stack web development course with a focus on JavaScript, Node.js, React, CSS, and much more.  It is my genuine hope that this web page will help me get my foot into the door in this industry, as I am very eager to prove myself an intricate asset.";

const contactContent = "Matt Adamson can be reached by phone at (205) 505-2779, or by email at ";
const postContent = "posts";


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// REVAMP WHEN READY FOR DATABASE

// mongoose.connect("mongodb://localhost:27017/newCenturyInnovation", {useNewUrlParser: true, useUnifiedTopology: true});
// // {useUnifiedTopology: true} necessary to avoid deprecation warning.


mongoose.connect(process.env.PORT || 'mongodb://27017/safe-shore-75874', {useNewUrlParser: true, useUnifiedTopology: true});
// {useUnifiedTopology: true} necessary to avoid deprecation warning.

const postSchema = {
  title: String,
  content: String
};

const subscriberSchema = {
  firstName: String,
  lastName: String,
  email: String
};

// const keySchema = new.mongoose.Schema({
//   key: String
// });
//



const Post = mongoose.model("Post", postSchema);

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

//
let posts = [];
let post = [];

let subscribers = [];
let subscriber = [];


// process.env.API_KEY

app.get("/", function(req, res) {

  Post.find({}, function(err, posts) {
    res.render("home", {
      homeStartingContent: homeStartingContent,
      posts: posts
    });
  });
});

app.get("/newsletter", function(req, res) {
  res.render("newsletter");
});

app.get("/about", function(req, res) {
  res.render("about", {
    aboutContent: aboutContent,
    interests: interests,
    experience: experience
  });
});

app.get("/email", function(req, res) {
  res.redirect("https://mail.google.com");
});
// ??????????????????????????????????????????
app.get("/compose", function(req, res) {
  res.render("compose");
  // , {
  //   req.body.postTitle = postTitle,
  // });
});
// ??????????????????????????????????????????
app.get("/contact", function(req, res) {
  res.render("contact", {
    contactContent: contactContent,
  });
});



// ???????????????????????????????????????????????

// ???????????????????????????????????????????????
app.post("/compose", function(req, res) {

  const post = new Post ({
    title: req.body.postTitle,
    content: req.body.postContent
  });

  post.save(function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.post("/newsletter", function(req, res) {

  const email = req.body.email;
  const firstName = req.body.fName;
  const lastName = req.body.lName;

  const subscriber = new Subscriber ({
    firstName: req.body.fName,
    lastName: req.body.lName,
    email: req.body.email
  });


subscriber.save(function(err) {
  if (!err) {
    res.redirect("/success");
  } else {
    res.redirect("/failure");
  }
  });

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  const jsonData = JSON.stringify(data);
  const url = "https://us7.api.mailchimp.com/3.0/lists/5e51e8eb43";
  const options = {
    method: "POST",
    auth: "process.env.API_KEY"
  }

  const request = https.request(url, options, function(response) {
    response.on("data", function(data) {
      console.log(JSON.parse(data));
    })
  })
  request.write(jsonData);
  request.end();

});

app.get("/success", function(req, res) {
  res.render("success");
});

app.get("/failure", function(req, res) {
  res.render("failure");
});




// app.get("/post/:postId", function(req, res) {
//   const requestedPostId = req.params.postId;
//
// Post.findOne({_id: requestedPostId}, function(err, post) {
//   if (!err) {
//     res.render("post", {
//
//         post: post
//
//     });
//     res.redirect("/post/" + requestedPostId);
//   } else {
//     res.redirect("/");
//   }
// });
// });
// ????????????????????????????????????????????
// app.get("/posts/:postId", function(req, res){
//
// const requestedPostId = req.params.postId;
//
//   Post.findOne({_id: requestedPostId}, function(err, post){
//     res.render("post", {
//       title: post.title,
//       content: post.content
//     });
//   });
//
// });


// ?????????????????????????????????????????????????????????
app.get("/post/:postId", function(req, res){
  const requestedPostId = _.lowerCase(req.params.postId);
  // const storedTitle = _.lowerCase(post.title);
  let posts = [];
  let post = "";
  let title = "";
  let content = "";

  Post.findOne({title: requestedPostId}, function(err, post){
    if (!err) {
    res.render("post", {
    title: title,
    content: content,
    post: post
    });
  } else {
    res.redirect("/");
  }

});
});
// ????????????????????????????????????????????????

// app.get("/post/:postId", function(req, res){
//
//
// let title = "";
// let content = "";
// const requestedPostId = _.lowerCase(req.params.postId);
//
// // _.lowerCase(req.params.postId);
//   Post.findOne({title: requestedPostId}, function(err, post){
//     if (!err) {
//     res.render("post", {
//     title: title,
//     content: content,
//     post: post
//     });
//   } else {
//     res.redirect("/");
//   }
//   });
//
// });


// ????????????????????????????????????????????
// app.get("/post", function(req, res) {
// let postTitle = "";
// let postContent = "";
//   Post.find({}, function(err, posts) {
//     res.render("post", {
//       posts: posts
//     });
//   });
// });


// Saving for post page:
// <h1> <%= title %> </h1>
// <textarea class="textarea1" name="textArea" rows="1000" cols="170">
// <%= content %> </textarea>
// ------


// Post.findOne({_id: requestedPostId}, function(err, post){
//       res.render("post", {
//         title: post.title,
//         content: post.content
//       });
//   });
// });






app.listen(process.env.PORT || 3001, function() {
  console.log("Server started on Heroku port");
});
