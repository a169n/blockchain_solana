import User from "../models/User.js";
import {
  initializeKeypair,
  createNft,
  uploadMetadata,
} from "../utils/solanaNft.js";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";

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

    if (user.friends.length >= 5 && !user.hasTopWeb3Nft) {
      const connection = new Connection(clusterApiUrl("devnet"));
      const userKeypair = await initializeKeypair(connection);
      const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(userKeypair))
        .use(
          bundlrStorage({
            address: "https://devnet.bundlr.network",
            providerUrl: "https://api.devnet.solana.com",
            timeout: 60000,
          })
        );

      const nftData = {
        name: "TOPWEB3",
        symbol: "TW3",
        description: "Awarded for having 5 or more friends",
        sellerFeeBasisPoints: 0,
        imageFile: "JS.png",
      };

      const uri = await uploadMetadata(metaplex, nftData);
      const nft = await createNft(metaplex, uri, nftData);

      user.hasTopWeb3Nft = true;
      user.metadata_uri = uri;
      user.nft_address = `https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`;
      await user.save();
    }

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
