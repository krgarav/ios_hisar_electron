const bcrypt = require("bcryptjs");
const User = require("../../models/User");

const createUser = async (req, res) => {
  const { userName, mobile, role, email, password, permissions } =
    req.body.userData;
  const userRole = req.role;

  if (userRole !== "Admin") {
    return res.status(500).json({ message: "Only Admin can create user" });
  }
  if (!userName || !mobile || !email || !password || !permissions || !role) {
    return res.status(422).json({ error: "Please fill all fields properly" });
  }
  if (mobile.length !== 10) {
    return res
      .status(422)
      .json({ error: "Mobile number should be exactly 10 digits" });
  }

  const parsedPermissions =
    typeof permissions === "string" ? JSON.parse(permissions) : permissions;

  try {
    const userExist = await User.findOne({ where: { email } });
    const mobileExist = await User.findOne({ where: { mobile } });
    const userNameExist = await User.findOne({ where: { userName } });
    if (userNameExist) {
      return res.status(500).json({ error: "Username already exists" });
    } else if (mobileExist) {
      return res.status(500).json({ error: "Mobile no. already exists" });
    } else if (userExist) {
      return res.status(500).json({ error: "Email already exists" });
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await User.create({
        userName,
        mobile,
        email,
        password: hashedPassword,
        role,
        permissions: parsedPermissions,
      });
      return res
        .status(201)
        .json({ message: "User created successfully", newUser });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
module.exports = createUser;
