import { Card, Hand, HandState, Seat } from "@bridge/core";
import { Box, Paper, useMediaQuery, useTheme } from "@mui/material";
import useSize from "@react-hook/size";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useDdsSolveHand } from "../../lib/useDds";
import { BidBox } from "./bidBox";
import { BiddingCard } from "./biddingCard";
import { ContractCard } from "./contractCard";
import { Controls } from "./controls";
import { DoubleDummyTableCard } from "./doubelDummyTableCard";
import { Holding } from "./holding";
import { Play } from "./playCard";
import { PlayerBox } from "./playerBox";
import { usePosition } from "./position";
import { ScoreBox } from "./scoreBox";
import { ScoreGraph } from "./scoreGraph";
import { Trick } from "./trick";
import { TricksCard } from "./tricksCard";

interface BoardContextType {
  hand: Hand;
  position: number;
  setPosition: Dispatch<SetStateAction<number>>;
  variation: Card[];
  setVariation: Dispatch<SetStateAction<Card[]>>;
  handAt: Hand;
  width: number;
  scale: number;
  live: boolean;
  analysis: boolean;
}

const BoardContext = createContext({} as BoardContextType);

export const useBoardContext = () => useContext(BoardContext);

export interface BoardProps {
  hand: Hand;
  live?: boolean;
  analysis?: boolean;
  position?: number;
  playingAs?: Seat;
}

export function Board({ hand, live, analysis, playingAs }: BoardProps) {
  const { position, setPosition, variation, setVariation } = usePosition(hand);
  const readOnly = position !== hand.positions || !live || !playingAs;

  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));

  const ref = useRef<HTMLDivElement>(null);
  const [width] = useSize(ref);

  const handAt = useMemo(() => {
    let h = hand.atPosition(position);
    for (const card of variation) {
      const newH = h.doPlay(card);
      if (newH) {
        h = newH;
      }
    }
    return h;
  }, [hand, position, variation]);
  const nextCard = useMemo(() => {
    const next = position + 1;
    if (next < hand.positions) {
      const handNext = hand.atPosition(next);
      return handNext.play.at(-1);
    }
  }, [hand, position]);

  const value = useMemo(
    () => ({
      width,
      scale: width / 900,
      hand,
      handAt,
      playingAs,
      live: !!live,
      analysis: !!analysis,
      position,
      setPosition,
      variation,
      setVariation,
    }),
    [width, hand, handAt, playingAs, live, position, setPosition]
  );

  const dds = useDdsSolveHand(handAt);

  const right = (
    <>
      <Controls hand={hand} position={position} setPosition={setPosition} />
      <BiddingCard hand={hand} position={position} />
      {!hand.isBidding && <Play hand={hand} position={position} />}
      {!live && <DoubleDummyTableCard hand={hand} />}
    </>
  );
  return (
    <div>
      <BoardContext.Provider value={value}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            //my: 2,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {isXl && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 400,
              }}
            ></Box>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Paper
              ref={ref}
              square={!isSm}
              //variant="outlined"
              sx={{
                backgroundColor: "#378B05",
                //backgroundColor: "#effee6",
                width: {
                  xs: "100vmin",
                  sm: "min(100vmin, 800px);",
                },
                height: "min(85vmin, 680px);",
                position: "relative",
              }}
            >
              <Holding seat={Seat.North} nextCard={nextCard} dds={dds} />
              <Holding seat={Seat.West} nextCard={nextCard} dds={dds} />
              <Holding seat={Seat.East} nextCard={nextCard} dds={dds} />
              <Holding seat={Seat.South} nextCard={nextCard} dds={dds} />
              <PlayerBox seat={Seat.South} />
              <PlayerBox seat={Seat.North} />
              <PlayerBox seat={Seat.East} />
              <PlayerBox seat={Seat.West} />
              <ContractCard />
              <TricksCard />
              {!readOnly && handAt.state === HandState.Bidding && (
                <BidBox hand={handAt} seat={playingAs} />
              )}
              {handAt.state === HandState.Playing && <Trick hand={handAt} />}
              {handAt.state === HandState.Complete && (
                <ScoreBox hand={handAt} />
              )}
            </Paper>
            {!live && (
              <ScoreGraph
                hand={hand}
                position={position}
                setPosition={setPosition}
              />
            )}
            {!isLg && right}
          </Box>
          {isLg && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 300,
              }}
            >
              {right}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: width,
            mt: 2,
          }}
        ></Box>
      </BoardContext.Provider>
    </div>
  );
}

export interface MiniBoardProps {
  hand: Hand;
  live?: boolean;
  analysis?: boolean;
  onClick?: () => void;
}

export function MiniBoard({
  hand,
  live,
  analysis,
  onClick = () => null,
}: MiniBoardProps) {
  const width = 250;
  const height = 212;
  const value = useMemo(
    () => ({
      width: width,
      scale: width / 900,
      hand: hand,
      handAt: hand,
      position: hand.positions,
      setPosition: () => null,
      variation: [],
      setVariation: () => null,
      live: !!live,
      analysis: !!analysis,
    }),
    [hand, live]
  );

  return (
    <Paper
      onClick={onClick}
      sx={{
        backgroundColor: "#378B05",
        width: `${width}px`,
        height: `${height}px`,
        position: "relative",
        cursor: "pointer",
      }}
    >
      <BoardContext.Provider value={value}>
        <Holding seat={Seat.North} />
        <Holding seat={Seat.West} />
        <Holding seat={Seat.East} />
        <Holding seat={Seat.South} />
        <PlayerBox seat={Seat.South} />
        <PlayerBox seat={Seat.North} />
        <PlayerBox seat={Seat.East} />
        <PlayerBox seat={Seat.West} />
        {hand.state === HandState.Playing && <Trick hand={hand} />}
        {hand.state === HandState.Complete && <ScoreBox hand={hand} />}
      </BoardContext.Provider>
    </Paper>
  );
}
