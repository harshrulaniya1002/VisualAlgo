import * as kruskal from './kruskal';
import * as prim from './prim';
import * as boruvka from './boruvka';
import * as tarjanScc from './tarjanScc';
import * as kosaraju from './kosaraju';
import * as bridgesArticulationPoints from './bridgesArticulationPoints';
import * as eulerPath from './eulerPath';
import * as hamiltonianPath from './hamiltonianPath';

export { kruskal, prim, boruvka, tarjanScc, kosaraju, bridgesArticulationPoints, eulerPath, hamiltonianPath };
export const mstConnectivityAlgorithms = [kruskal, prim, boruvka, tarjanScc, kosaraju, bridgesArticulationPoints, eulerPath, hamiltonianPath];
