// controllers/userController.js

const User = require("../../models/User");
const bcrypt = require('bcryptjs')

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { userName, mobile, role, email, password, permissions } =
    req.body.selectedUser;
  const userRole = req.role;
  // console.log(req.body.selectedUser.password, "-------password-------");
  if (userRole !== "Admin") {
    return res.status(403).json({ message: "Only Admin can update user" });
  }
  
  try {
    let user = await User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (userName && userName !== user.userName) {
      const userNameExist = await User.findOne({ where: { userName } });
      if (userNameExist && userNameExist.id !== id) {
        return res.status(400).json("Username already exists");
      }
    }
    
    if (email && email !== user.email) {
      const emailExist = await User.findOne({ where: { email } });
      if (emailExist && emailExist.id !== id) {
        return res.status(400).json("Email already exists");
      }
    }
    
    if (mobile && mobile !== user.mobile) {
      const mobileExist = await User.findOne({ where: { mobile } });
      if (mobileExist && mobileExist.id !== id) {
        return res.status(400).json("Mobile number already exists");
      }
    }
    // console.log(user.password,"------user----------------")
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      // console.log(hashedPassword)
    }
    // console.log(user.password,"============pasword============")
    user.userName = userName || user.userName;
    user.mobile = mobile || user.mobile;
    user.email = email || user.email;
    user.role = role || user.role;

    user.permissions = permissions || user.permissions;

    await user.save();

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateUser;
