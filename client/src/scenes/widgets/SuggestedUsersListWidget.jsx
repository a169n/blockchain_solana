import { Box, Typography, useTheme } from "@mui/material";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSuggestedUsers } from "state";

const SuggestedUsersListWidget = ({ userId }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const { palette } = useTheme();
  const suggestedUsers = useSelector((state) => state.suggestedUsers || []);

  const getSuggestedUsers = async () => {
    const response = await fetch(
      `http://localhost:3001/users/${userId}/suggested`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    dispatch(setSuggestedUsers({ suggestedUsers: data }));
  };

  useEffect(() => {
    getSuggestedUsers();
  }, [dispatch]);

  return (
    <WidgetWrapper>
      <Typography
        color={palette.neutral.dark}
        variant="h5"
        fontWeight="500"
        sx={{ mb: "1.5rem" }}>
        Suggested Users
      </Typography>
      <Box display="flex" flexDirection="column" gap="1.5rem">
        {Object.values(suggestedUsers).map((user) => (
          <Friend
            key={user._id}
            friendId={user._id}
            name={`${user.firstName} ${user.lastName}`}
            subtitle={user.occupation}
            userPicturePath={user.picturePath}
          />
        ))}
      </Box>
    </WidgetWrapper>
  );
};

export default SuggestedUsersListWidget;
