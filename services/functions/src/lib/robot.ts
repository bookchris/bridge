import { Table } from "@bridge/storage";

export function robotTurn(table: Table) {
  const turn = table.turn;
  if (!turn) {
    return undefined;
  }

  const turnOrDelcarer = table.isDummy(turn) ? turn.partner() : turn;
  if (table.uids.at(turnOrDelcarer.index()) !== "Robot") {
    return undefined;
  }
  return turn;
}

export async function triggerRobot(table: Table) {
  if (robotTurn(table)) {
    console.log("triggering robot");
    /*
    const pubSubClient = new PubSub();
    await pubSubClient.topic("robot-turn").publishMessage({
      json: { tableId: table.id },
    });
    */
  }
  console.log("not triggering robot");
}
