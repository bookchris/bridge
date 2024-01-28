import { Hand } from "@bridge/core";

export class Table extends Hand {
  readonly id: string;
  readonly uids: string[];
  readonly created?: Date;
  constructor(
    hand: Hand,
    props: { id: string; uids: string[]; created?: Date }
  ) {
    super({ ...hand });
    this.id = props.id;
    this.uids = props.uids;
    this.created = props.created;
  }
}
