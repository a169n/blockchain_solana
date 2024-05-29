import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const currentUser = await User.findById(id);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const friendsIds = currentUser.friends.map((friendId) =>
      friendId.toString()
    );

    const filteredFriendsIds = friendsIds.filter((friendId) => friendId !== id);

    const users = await User.find({
      _id: { $nin: [id, ...filteredFriendsIds] },
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserFriendsCount = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    const friendsCount = user.friends.length;
    res.status(200).json({ friendsCount });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({
        _id,
        firstName,
        lastName,
        occupation,
        location,
        picturePath,
        publicKey,
      }) => {
        return {
          _id,
          firstName,
          lastName,
          occupation,
          location,
          picturePath,
          publicKey,
        };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({
        _id,
        firstName,
        lastName,
        occupation,
        location,
        picturePath,
        publicKey,
      }) => {
        return {
          _id,
          firstName,
          lastName,
          occupation,
          location,
          picturePath,
          publicKey,
        };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
