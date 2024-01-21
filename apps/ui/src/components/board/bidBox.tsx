import { Bid, Hand, Seat } from "@bridge/core";
import { Box, Button, ButtonProps, Icon, Paper } from "@mui/material";
import { useState } from "react";
import { useTableContext } from "./table";

export interface BidBoxProps {
  hand: Hand;
  seat?: Seat; // When specified, limits when you can bid.
}

export function BidBox({ hand, seat }: BidBoxProps) {
  const bidder = hand.nextBidder;
  return (
    <Box
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 2,
      }}
    >
      {(!seat || seat === bidder) && (
        <BidSelector hand={hand} bidder={bidder} />
      )}
    </Box>
  );
}

function BidSelector({ hand, bidder }: { hand: Hand; bidder: Seat }) {
  const [level, setLevel] = useState(0);

  const { bid } = useTableContext();
  if (!bid) throw new Error("No bid functions defined");
  const bidAs = (b: Bid) => {
    setLevel(0);
    bid(b);
  };

  const isValid = (b: Bid) => hand.canBid(b, bidder);

  return (
    <Paper sx={{ p: 1 }}>
      <Box display="flex">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((l) => (
          <BidButton
            key={l}
            variant={level === l ? "outlined" : "contained"}
            onClick={() => setLevel(l)}
            disabled={!!level || !isValid(new Bid(`${l}NT`))}
            sx={{ minWidth: 0 }}
          >
            {l}
          </BidButton>
        ))}
      </Box>
      {level ? (
        <div>
          <Box display="flex">
            <BidButton
              startIcon={<Icon>navigate_before</Icon>}
              onClick={() => setLevel(0)}
            />
            {["♣", "♦", "♥", "♠", "NT"].map((suit) => {
              const bid = new Bid(`${level}${suit}`);
              return (
                <BidButton
                  key={suit}
                  onClick={() => bidAs(bid)}
                  disabled={!level || !isValid(bid)}
                >
                  {suit}
                </BidButton>
              );
            })}
          </Box>
        </div>
      ) : (
        <div>
          <Box display="flex">
            <BidButton onClick={() => bidAs(Bid.Pass)}>Pass</BidButton>
            <BidButton
              onClick={() => bidAs(Bid.Double)}
              disabled={!isValid(Bid.Double)}
            >
              X
            </BidButton>
            <BidButton
              onClick={() => bidAs(Bid.Redouble)}
              disabled={!isValid(Bid.Redouble)}
            >
              XX
            </BidButton>
          </Box>
        </div>
      )}
    </Paper>
  );
}

function BidButton(props: ButtonProps) {
  return (
    <Button
      variant="contained"
      fullWidth
      {...props}
      sx={{ minWidth: 0, m: 0.5, px: { xs: 1, sm: 2 } }}
    />
  );
}
