import {
  Dds,
  DdTableDealPbn,
  DdTableResults,
  DealPbn,
  FutureTricks,
  loadDds,
  ParResultsDealer,
  PlayTracePbn,
  SolvedPlay,
} from "bridge-dds";
import * as Comlink from "comlink";

export class DdsWorker {
  private dds?: Dds;
  private initPromise?: Promise<Dds>;

  private async init() {
    if (this.dds) {
      return this.dds;
    }
    if (this.initPromise) {
      return await this.initPromise;
    }
    this.initPromise = loadDds().then((module) => new Dds(module));
    this.dds = await this.initPromise;
    return this.dds;
  }

  public SolveBoardPBN = (
    dealPbn: DealPbn,
    target: number,
    solutions: number,
    mode: number,
  ): Promise<FutureTricks> =>
    this.init().then((dds) =>
      dds.SolveBoardPBN(dealPbn, target, solutions, mode),
    );

  public AnalysePlayPBN = (
    dealPbn: DealPbn,
    playTracePbn: PlayTracePbn,
  ): Promise<SolvedPlay> =>
    this.init().then((dds) => dds.AnalysePlayPBN(dealPbn, playTracePbn));

  public CalcDDTablePBN = (
    ddTableDeal: DdTableDealPbn,
  ): Promise<DdTableResults> =>
    this.init().then((dds) => dds.CalcDDTablePBN(ddTableDeal));

  public DealerPar = (
    ddTableResults: DdTableResults,
    dealer: number,
    vulnerable: number,
  ): Promise<ParResultsDealer> =>
    this.init().then((dds) =>
      dds.DealerPar(ddTableResults, dealer, vulnerable),
    );
}

Comlink.expose(new DdsWorker());
