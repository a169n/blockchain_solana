import { Typography, useTheme } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useSelector } from "react-redux";

const AdvertWidget = () => {
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;
  const user = useSelector((state) => state.user);

  return (
    user.hasTopWeb3Nft && (
      <WidgetWrapper>
        <FlexBetween>
          <Typography color={dark} variant="h5" fontWeight="500">
            TOPWEB3
          </Typography>
          <Typography color={medium}>NFT</Typography>
        </FlexBetween>
        <img
          width="100%"
          height="auto"
          alt="advert"
          src={user.image_uri}
          style={{ borderRadius: "0.75rem", margin: "0.75rem 0" }}
        />
        <Typography color={medium} m="0.5rem 0">
          Your pathway to stunning and immaculate beauty and made sure your skin
          is exfoliating skin and shining like light.
        </Typography>
        <Typography color={medium} m="0.5rem 0">
          Congratulations on receiving the TOPWEB3 NFT! With this NFT, you can
          now write posts and comments on our platform. Invite more friends to
          earn exclusive rewards!
        </Typography>
      </WidgetWrapper>
    )
  );
};

export default AdvertWidget;
