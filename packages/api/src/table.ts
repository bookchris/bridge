export type CreateTableRequest = {
  mode: string;
};

export type CreateTableResponse = {
  id: string;
};

export type TableBidRequest = {
  tableId: string;
  bid: string;
};

export type TableBidResponse = void;

export type TablePlayRequest = {
  tableId: string;
  card: number;
};

export type TablePlayResponse = void;
