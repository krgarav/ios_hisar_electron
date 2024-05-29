const User = require('../../models/User');

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userRole = req.role;
  const authenticatedUserId = req.id;

  if (userRole !== "Admin") {
    return res.status(403).json({ message: "Only Admin can delete users" });
  }
  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (parseInt(id) === authenticatedUserId) {
      return res.status(403).json({ message: 'You cannot delete your own account' });
    }
    await user.destroy();

    res.status(201).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = deleteUser;
