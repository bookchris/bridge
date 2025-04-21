import { Hand } from "@bridge/core";
import { Paper, Typography } from "@mui/material";
import {
  ComponentProps,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  Dot,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { useDds } from "../../lib/useDds";

interface Payload {
  label: string;
  score?: number;
  position: number;
}

export interface ScoreGraphProps {
  hand: Hand;
  position: number;
  setPosition: Dispatch<SetStateAction<number>>;
}

export function ScoreGraph({ hand, position, setPosition }: ScoreGraphProps) {
  const dds = useDds();
  const [data, setData] = useState<Payload[]>();
  useEffect(() => {
    const need = 6 + hand.contract.suitBid?.level;
    dds.ddsAnalysePlay(hand).then((analysis) => {
      setData(
        analysis?.tricks.map((t, i) => ({
          label:
            i == 0
              ? hand.contract.toString()
              : hand.play[i - 1].toString() || "none",
          position: hand.bidding.length + i,
          score: t - need,
        }))
      );
    });
  }, [hand]);

  return (
    <Paper square>
      <Paper square elevation={0} sx={{ backgroundColor: "secondary.main" }}>
        <Typography sx={{ p: 1, color: "white" }}>Analysis</Typography>
      </Paper>
      <Paper sx={{ width: "100%", height: 150, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <ReferenceLine
              y={0}
              stroke="red"
              label={hand.contract.toString()}
            />
            <Line
              dot={(props) => (
                <CustomizedDot
                  hand={hand}
                  position={position}
                  setPosition={setPosition}
                  {...props}
                />
              )}
              type="monotone"
              dataKey="score"
              stroke="#8884d8"
              strokeWidth={2}
            />
            <XAxis hide dataKey="label" />
            {/* <YAxis
              width={10}
              axisLine={false}
              tickLine={false}
              interval={"preserveStartEnd"}
              //orientation="right"
              //mirror
            /> */}
            <Tooltip content={<TooltipContent />} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Paper>
  );
}

interface CustomizedDotProps extends ComponentProps<typeof Dot> {
  hand: Hand;
  position: number;
  setPosition: Dispatch<SetStateAction<number>>;
}

function CustomizedDot(props: CustomizedDotProps) {
  const { hand, position, setPosition, ...dotProps } = props;
  const { payload, index } = props as unknown as {
    payload: Payload;
    index: number;
  };
  const current = payload.position === position ? "black" : "";
  if (current) {
    return (
      <Dot
        {...dotProps}
        onClick={() => setPosition(hand.bidding.length + index)}
      />
    );
  }
  return <></>;
}

function TooltipContent(props: TooltipProps<ValueType, NameType>) {
  const { active, payload, label } = props;
  if (active && payload && label?.length) {
    return (
      <Paper square sx={{ p: 1.5 }}>
        <Typography>
          <b>Played:</b>&nbsp;
          {label}
        </Typography>
        <Typography>
          <b>Score:</b>&nbsp;
          {payload[0].value}
        </Typography>
      </Paper>
    );
  }
  return <></>;
}
