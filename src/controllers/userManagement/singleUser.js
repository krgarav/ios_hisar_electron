const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const secretKey = "omrscanner";

const getSingleUser = async (req, res) => {
  const  {token}  = req.headers;
  const user = req.user
  // console.log(user,"userdata")
  try {
    // const decoded = await jwt.verify(token, secretKey);
    // const selectedAttributes = [
    //   "id",
    //   "userName",
    //   "mobile",
    //   "email",
    //   "permissions",
    //   "role",
    // ];

    // if (!decoded || !decoded.userId) {
    //   return res.status(401).json({ message: "Invalid token" });
    // }
    // const user = await User.findOne(
    //   {
    //     where : {id: decoded.userId },
    //     attributes: selectedAttributes
    // },
      
    // );

    res.status(200).json({ message: "User retrieved successfully", user });
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getSingleUser;

