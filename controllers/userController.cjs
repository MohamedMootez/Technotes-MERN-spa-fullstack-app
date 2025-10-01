const User = require("../models/User.cjs");
const Note = require("../models/Note.cjs");

const asyncHandler = require("express-async-handler");

const bcrypt = require("bcrypt");

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});




const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  // *confim data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required !" });
  }

  //  *Check for duplicates
  //! Mongoose says if you are passing a paramtere in the find method, you have to chain the exec() function to it
  const duplicate = await User.find({ username }).lean().exec();

  if (!duplicate.length<=0) {
    return res.status(409).json({ message: "Duplicate username" });
  }
  //    *Hashing the passwords
  const hashedPwd = await bcrypt.hash(password, 10); //salt rounds
  const userObject = { username, password: hashedPwd, roles };

  // *Create and Store new User
  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
});


const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // *confim data
  if (
    !id ||
    !username ||
 
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res.status(400).json({ message: "All fields are required !" });
  }

//   !we did not call the lean right here because we needed the save methods attached to the mongodb response thats gonna be used to save the user back in the database
  const user=await User.findById(id).exec()
  if(!user){
    return res.status(400).json({message:"user not found"})
  }
  //* Check for duplicate
  const duplicate = await User.findOne({username}).lean().exec()
  if(duplicate && duplicate?._id.toString()!==id){
    return res.status(409).json({message:"Duplicate username"})
  }
  user.username=username
  user.roles=roles
  user.active=active

  if(password){
    user.password=await bcrypt.hash(password,10) //salt rounds
  }
  const updatedUser=await user.save()

  res.json({message:`${updatedUser.username} updated`})
});



const deleteUser = asyncHandler(async (req, res) => {
    const{id}=req.body
    if(!id){
        return res.status(400).json({message:"User ID Required"})
    }

    const notes=await Note.findOne({user:id}).lean().exec()
    if(notes?.length){
        return res.status(400).json({message:"User has assigned notes"})
    }
    const user=await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message:"user not found"})
    }
    const result=await user.deleteOne();
  
  
    const reply=`Username ${user.username} with ID ${user._id} deleted ` 
    
    res.json(reply)
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
