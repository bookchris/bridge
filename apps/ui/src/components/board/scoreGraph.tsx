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

/*

export function ScoreGraph({ hand }: ScoreGraphProps) {
  const positions = [] as number[];
  for (let i = hand.bidding.length; i < hand.play.length; i++) {
    positions.push(i);
  }
  const positionHands = positions.map((p) => hand.atPosition(p));
  const positionCards = positionHands
    .map((h) => h.play.at(-1))
    .map((c) => c?.toString() || "none");
  const scores = positionHands.map((h) => handToDdsMax(h) || 0);
  return (
    <Paper square>
      <Paper square elevation={0} sx={{ backgroundColor: "secondary.main" }}>
        <Typography sx={{ p: 1, color: "white" }}>Analysis</Typography>
      </Paper>
      <Paper sx={{ width: "100%", height: 200 }}>
        <ResponsiveChartContainer
          series={[
            {
              type: "line",
              data: scores,
              showMark: false,
              area: true,
            },
          ]}
          xAxis={[
            {
              data: positionCards,
              scaleType: "point",
              //scaleType: "band",
              //id: "x-axis-id",
            },
          ]}
        >
          <LinePlot />
          <MarkPlot />
          <ChartsTooltip />
        </ResponsiveChartContainer>
      </Paper>
    </Paper>
  );
}

*/

export function ScoreGraph({ hand, position, setPosition }: ScoreGraphProps) {
  const dds = useDds();
  const [data, setData] = useState<Payload[]>();
  useEffect(() => {
    const d: Payload[] = [];
    const queryAll = async () => {
      for (
        let pos = hand.bidding.length;
        pos < hand.bidding.length + hand.play.length;
        pos++
      ) {
        const handAt = hand.atPosition(pos);
        const card = handAt.play.at(-1)?.toString() || "none";
        const score = await dds.handToDdsMax(handAt);
        d.push({ label: card, score, position: pos });
      }
      d[0].label = hand.contract.toString();
      return d;
    };
    queryAll().then(setData);
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
  if (active && payload && label.length) {
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
