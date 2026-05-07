import React from "react"
import {
  Card,
  CardActionArea,
  InputAdornment,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { animated } from "@react-spring/web"
import {
  DesignServicesOutlined as DesignServicesIcon,
  Mood as MoodIcon,
  SentimentSatisfiedAltOutlined as SentimentSatisfiedAltIcon,
  DirectionsBusOutlined as DirectionsBusIcon,
} from "@mui/icons-material"

// Components
import { CheckoutFlowStep } from "@components/CheckoutFlow"
import useBoop from "@hooks/useBoop"

const SUGGESTED_DONATIONS = [
  {
    amount: 100,
    text: "Supports materials for a small camp activity at camp",
    Icon: DesignServicesIcon,
  },
  {
    amount: 250,
    text: "Allow us to book better transportation for campers",
    // icon: <DirectionsBusIcon fontSize="large" color="inherit" />,
    Icon: DirectionsBusIcon,
  },
  {
    amount: 500,
    text: "Cover the cost for one counselor to staff camp",
    // icon: <MoodIcon fontSize="large" color="inherit" />,
    Icon: MoodIcon,
  },
  {
    amount: 1000,
    text: "Sponsor one child who is qualified for financial aid",
    // icon: <SentimentSatisfiedAltIcon fontSize="large" color="inherit" />,
    Icon: SentimentSatisfiedAltIcon,
  },
]

const AnimatedCard = animated(Card)

type DonateCardProps = {
  amount: number
  isSelected: boolean
  text: string
  Icon: (typeof SUGGESTED_DONATIONS)[0]["Icon"]
  setDonationAmount: React.Dispatch<number>
}

function DonateCard({
  amount,
  isSelected,
  text,
  Icon,
  setDonationAmount,
}: DonateCardProps) {
  const [style, trigger] = useBoop({
    scale: 1.05,
  })

  const handleClick = () => {
    trigger()
    setDonationAmount(amount)
  }

  return (
    <AnimatedCard
      style={style}
      sx={{
        backgroundColor: isSelected ? "primary.main" : "inherit",
        borderWidth: 2,
        width: 1,
        height: 1,
      }}
    >
      <CardActionArea onClick={handleClick} sx={{ padding: 2 }}>
        <Stack alignItems="center" spacing={1}>
          <Icon
            fontSize="large"
            color="primary"
            sx={{ color: isSelected ? "white" : "primary" }}
          />
          <Typography
            variant="h5"
            textAlign="center"
            color={isSelected ? "white" : "primary"}
          >{`$${amount}`}</Typography>
          <Typography
            variant="body1"
            color={isSelected ? "white" : "inherit"}
            textAlign="center"
          >
            {text}
          </Typography>
        </Stack>
      </CardActionArea>
    </AnimatedCard>
  )
}

type DonateProps = {
  donationAmount: number
  setDonationAmount: React.Dispatch<number>
}

export default function Donate({
  donationAmount,
  setDonationAmount,
}: DonateProps) {
  return (
    <CheckoutFlowStep
      index={2}
      title="Would you like to donate to support LYF?"
      continueText={
        donationAmount > 0 ? "Continue" : "Continue without donating"
      }
    >
      <Grid
        container
        spacing={2}
        alignItems="stretch"
        alignContent="stretch"
        justifyContent="center"
        sx={{
          padding: 2,
        }}
      >
        {SUGGESTED_DONATIONS.map(({ amount, text, Icon }) => (
          <Grid key={amount} size={{ xs: 6, lg: 3 }}>
            <DonateCard
              amount={amount}
              text={text}
              Icon={Icon}
              isSelected={amount == donationAmount}
              setDonationAmount={setDonationAmount}
            />
          </Grid>
        ))}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack
            justifyContent="center"
            alignItems="center"
            direction={{
              xs: "column",
              lg: "row",
            }}
            spacing={{
              xs: 0,
              lg: 2,
            }}
          >
            <Typography variant="h5" textAlign="center" color="primary">
              Other
            </Typography>

            <TextField
              id="other-donation-amount"
              fullWidth
              variant="outlined"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              value={donationAmount}
              onChange={(event) => {
                const customAmount = Number(event.target.value)
                setDonationAmount(Number.isNaN(customAmount) ? 0 : customAmount)
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </CheckoutFlowStep>
  )
}
