require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const https = require("https");
const _ = require("lodash");

const request = require("request");

const homeStartingContent = "At New Century Innovation we believe in leaving everything a little, or a lot, betther than we found it.  It is never too late, and never soon enough to make a right decision.  Our founder and Director knows that sometimes we have plenty, and sometimes we need to facilitate a change.  That's where New Century Innovation comes in; it is helping you to move your organization forward, whether that means abiding the conventional wisdom or thinking outside of the box. Have a look at our contact page to get in touch with us, or feel free to read about our founder in the 'about us' section.  Our intention is for this to be a place for community, and a place for ideas.  It is designed organiacally; we expect it to grow, and it may grow in a number of different directions at a number of different rates.  As of now, we are planning on adding a subscription signup, and a place to post ideas and thoughts; eventually, our founder will have a blog to find here.  We are reachable through our contact page and would love to hear from you."
const aboutContent = "New Century was started by me, Matt Adamson, in late 2020, in an effort to make a more personalized way of socially interacting during the lockdowns.  In other words, I realized the value of a personal web page more than before.  I am the father of two beautiful girls and the husband of a wonderful wife.  My background is varied to say the least, but I enjoy the outdoors, playing the guitar, travelling, and (moreso as I get older), having a beautiful, boring life.  This website will hopefully serve a dual purpose in being a place for people to connect, and by facilitating my career transition into the IT industry";
const interests = "I enjoy learning.  From Theology to computers, and most things in between, I love to read and converse about things.  It is my position that the best way to truly learn something in a genuine way is experientially.  I am particularly fascinated by other cultures and places, and am open to opportunities abroad as well as in the U.S.";
const experience = "As mentioned above, my experience is varied.  I travelled a lot as a younger man; from my time flying around in Chinooks in the mountains of Afghanistan, to teaching English in northern China.  I have seen a good little portion of the world, however, that only helps make one realize how much one doesn't know.  I finished a degree in Anthropology from UAB in 2007, and really thought I was in safe territory on the career front.  When I finally 'settled down' and got married, I moved back to the U.S.  I realized very quickly that the domestic job market is much more competitive than I had originally thought, and while I'd had some neat experiences I was desperately lacking a viable specialty.  This is the reason I have devoted the recent years of my life to learning everything I can about the IT industry.  I've finally reached a point where I feel confident in entering the industry and beginning my dream career working with computers.  I am an AWS certified Solutions Architect, (Associate and Professional), and have just finished an intense full-stack web development course with a focus on JavaScript, Node.js, React, CSS, MongoDB and much more.  I also have an active security clearance.  It is my genuine hope that this web page will help me get my foot into the door somewhere, as I am eager to prove myself an asset in the field.";

const contactContent = "Matt Adamson can be reached by phone at (205) 505-2779, or by email at ";
const postContent = "posts";


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// REVAMP WHEN READY FOR DATABASE

const uri = process.env.MONGO_DB_URI || 'mongodb+srv://Ulan:123@cluster1.qcpvo.mongodb.net/Students?retryWrites=true&w=majority';



mongoose.connect("mongodb://localhost:27017/newCenturyInnovation", {useNewUrlParser: true, useUnifiedTopology: true});
// // {useUnifiedTopology: true} necessary to avoid deprecation warning.



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
  res.render("home", {
    homeStartingContent: homeStartingContent
  });
});


app.get("/encouragement", function(req, res) {

  Post.find({}, function(err, posts) {
    res.render("encouragement", {
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
