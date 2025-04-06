const multer = require("multer");
const cookie = require("cookie-parser");
const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require("../models/usermodel");
const mongoose = require("mongoose");
const data = require("../controller/postController")
var fs = require('fs');
const { type } = require("os");

const users = [
  {
    username: "abhi@123",
    password: "abhi123", // In production, passwords should be hashed
    name: "first User",
  },
  {
    username: "roman@123",
    password: "roman123",
    name: "Regular User",
  },
];

//MIDDLEWARE

const isAuth = (req, res, next) => {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage }).single("image");

// Route to add a new product
router.get("/", isAuth, (req, res) => {
  res.render("home", { title: "AdminLTE 3 | Dashboard" });
});


router.get("/register", (req, res) => {
  res.render("register", { title: "AdminLTE 3 | Register",  message : null });
});

router.post('/register', async(req,res) =>{
  
  try {

    const {name, email, password} = req.body

    console.log("Request body:", req.body);

    const existingUsers = await User.findOne({email})
    if(existingUsers){
      req.session.message ={
        type: "danger",
        message : "Email Already Exists"
      }
      return res.redirect("/register")
    }
    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(password, saltRounds);
    

    const regUser = await User.create({
      name, email, password : hashedPass 
    })

    req.session.message = {
      type : "success", 
      messgae : "User Register Successfully"
    }
    return res.redirect("/login")
    
  } catch (error) {
    console.error(error);
    res.render("login", {
      title: "AdminLTE 3 | Login",
      error: "Something went wrong",
    });
    
  }
})


router.get("/login", (req, res) => {
  res.render("login", { title: "AdminLTE 3 | Login" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ email: username }); // Use email as username
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.isLoggedIn = true;
      req.session.username = user.name;
      req.session.email = user.email;
      req.session.save((err) => {
        if (err) console.error(err);
        res.redirect("/");
      });
    } else {
      res.render("login", {
        title: "AdminLTE 3 | Login",
        error: "Invalid email or password",
        message: null,
      });
    }
  } catch (error) {
    console.error(error);
    res.render("login", {
      title: "AdminLTE 3 | Login",
      error: "Something went wrong",
      message: null,
    });
  }
});

// router.post("/login", (req, res) => {
//   const { username, password } = req.body;
//   // Find user in our static data
//   const user = users.find(
//     (u) => u.username === username && u.password === password
//   );
//   if (user) {
//     // Successful login
//     req.session.isLoggedIn = true;
//     req.session.username = user.name;
//     req.session.email = user.username;
//     req.session.save((err) => {
//       if (err) {
//         console.log(err);
//       }
//       res.redirect("/");
//     });
//   } else {
//     // Failed login
//     res.render("login", {
//       title: "AdminLTE 3 | Login",
//       error: "Invalid username or password",
//     });
//   }
// });


// router.get("/dashboard", isAuth, (req, res) => {
//   res.render("dashboard", {
//     title: "AdminLTE 3 | Dashboard",
//     username: req.session.username,
//   });
// });

router.get("/logout", isAuth, (req, res) => {
  req.session.destroy(); 
  res.redirect("/login");
});

router.get("/users", isAuth,   async (req, res) => {

  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.size) || 10;
    const search = req.query.search || '';

    let query = {};
    if (search) {
        query = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ] 
        };
    }

    const totalData = await User.countDocuments(query);
    const totalPages = Math.ceil(totalData / perPage);


    const users = await User.find(query)
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();

        const message = req.session.message || null;
        req.session.message = null;

    res.render("userdata", {
      title: "AdminLTE 3 | Register", 
        message : message  ,
        users,
        totalPages,
        currentPage: page,
        searchQuery: search,
    });

} catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Error Occurred" });
}



  // try {
  //   const users = await User.find(); 

    
    
  //   // res.status(200).json(users); // Fetch users from MongoDB
  //   res.render("userdata",  { title: "AdminLTE 3 | Register", message : "" , users}); // Pass users to EJS
    
  // }catch (error) {
  //   console.error("Error fetching users:", error);  // Log the error
  //   res.status(500).send("Error fetching users: " + error.message);
  // }
});


  //   res.render("userdata.ejs", { title: "AdminLTE 3 | Register" ,message : ""});
// });


router.get("/getusers", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users); // ✅ Send an array directly
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}); 



//router.get('/api', data)








router.post("/users", upload, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const image = req.file.filename;

    const newUser = await User.create({ name, email, phone, image });
    console.log("USER DATA:", newUser);
    req.session.message = {
      type: "success",
      Message: "Data Added Successfully",
    };
    // res.status(200).json({
    //   Success: true,
    //   message: "success",
    // });

    res.redirect('/users')
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in adding data",
      error: err.message,
    });
  }
});

router.get("/users", async (req, res) => {
  try {
    const reUsers = await User.find();
    const message = req.session.message || null;
    req.session.message = null;
    res.render("userdata", { 
      title: "Home Page",
      users: reUsers,
      message: message,
    });
  } catch (error) {
    console.error("Error :", error);
    res.json({ message: error.message });
  }
});

// router.get("/users/:id", async (req, res) => {
//   try {
//     const id = req.params.id;
//     const user = await User.findById(id);

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     res.json(user);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// router.post("/users/:id", upload, async (req, res) => {
//   try {
//     const id = req.params.id;
//     const { name, email, phone } = req.body;

//     const user = await User.findById(id);
//     if (!user) {
//       res.status(400).json({
//         message: "Does not find user",
//       });
//     }
//     // console.log(user)

//     const old_image = user.image;
//     //console.log(old_image)

//     let updateData = { name, email, phone };
//     if (req.file) {
//       updateData.image = req.file.filename;
//     }

//     const updatedUser = await User.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     if (req.file && old_image) {
//       const imagePath = `./uploads/${old_image}`;
//       fs.unlink(imagePath, (err) => {
//         if (err) console.error("Failed to delete image:", err);
//       });
//     }

//     res.json({
//       success: true,
//       message: "User updated successfully",
//       user: updatedUser,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });


router.get("/users/edit/:id", isAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const { page } = req.query; 
    const user = await User.findById(id);

    if (!user) {
      
      req.session.message = {
        type: "danger",
        message: "User not found!",
      };
      return res.redirect("/users");
    }

    res.render("edituser", {
      title: "Edit User",
      page : page || 1 ,
      user: user,
      message: null,
    });
  } catch (err) {
    console.error(err);
    req.session.message = {
      type: "danger",
      message: "Something went wrong!",
    };
    res.redirect("/users");
  }
});

// POST route to handle edit user form submission
router.post("/edit/:id", upload, async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, phone, page } = req.body;
    

    const user = await User.findById(id);
    if (!user) {
      req.session.message = {
        type: "danger",
        message: "User Not Found!",
      };
      return res.redirect("/users?page=" + (page || 1));
    }

    // Prepare update data
    let updateData = { name, email, phone };

    // Handle image update only if a new file is uploaded
    if (req.file) {
      const oldImage = user.image;
      const oldImagePath = `./uploads/${oldImage}`;
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Delete old image
      }
      updateData.image = req.file.filename; // Set new image
    } // If no new file, image remains unchanged (no action needed)

    await User.findByIdAndUpdate(id, updateData, { new: true });

    req.session.message = {
      type: "success",
      message: "User updated successfully!",
    }; 
    return res.redirect(`/users?page=${page || 1}`)
  } catch (err) {
    console.error(err);
    req.session.message = {
      type: "danger",
      message: "Error updating user!",
    };
    res.redirect("/users?page=" + (req.body.page || 1));
  }
});  

// router.get("/delete/:id", async (req, res) => {
//   try {
//     const {id} = req.body;
//     const user = await User.findById(id); // Find user first

//     if (!user) {
//       req.session.message = { 
//         type: "danger", 
//         message: "User not found!",
//       };
//       return res.redirect("/users");
//     }

//     // Get the image path
//     const oldIimage = user.image;  
//     const imagePath = `../uploads/${oldIimage}`;
//     console.log(oldIimage);

//     // Delete user from the database
//     await User.findByIdAndDelete(id);

//     // Check if image exists before deleting
//     fs.unlink(imagePath, (err) => {
//       if (err) {
//         console.error("Error deleting image:", err);
//       }
//     });

//     req.session.message = {
//       type: "success",
//       message: "User deleted successfully!",
//     };

//     // res.status(200).json({
//     //   message: "User Deleted",
      
//     // });

//     return res.redirect("/users");
//   } catch (err) {
//     console.error(err);
//     req.session.message = {
//       type: "danger",
//       message: "Something went wrong!",
//     };
//   }
// });


router.post("/users/delete", async(req,res)=>{
  
  try {
    
  
  const {id,page}= req.body


  if (!id) {
    req.session.message ={
      type : danger,
      message : "User ID is required",
    }

    return res.redirect("/users");
  }

  const user = await User.findById(id)

  if (!user) {
    req.session.message= { 
      type : danger,
      message : "User Not Found",
    }
    return  res.redirect("/users")
  }

  const oldimage = user.image
  const imagePath = `../uploads/${oldimage}`

  await User.findByIdAndDelete(id)

  if(fs.existsSync(imagePath)){
    fs.unlink(imagePath , (err) =>{
      if(err){
      console.log("Image Not Deleted")
  }
})
  }
  req.session.message={
    type: "success",
    message : "Image Deleted"
  }
  return res.redirect(`/users?page=${page}`)

 } catch (error) {
  console.log(error)
  req.session.message={
    type: "success",
    message : "Something went wrong"
  }
  return res.redirect("/users")
  }

})

module.exports = router;
