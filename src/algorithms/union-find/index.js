import * as naiveUnionFind from './naiveUnionFind';
import * as unionByRank from './unionByRank';
import * as pathCompression from './pathCompression';
import * as rollbackDsu from './rollbackDsu';

export { naiveUnionFind, unionByRank, pathCompression, rollbackDsu };
export const unionFindAlgorithms = [naiveUnionFind, unionByRank, pathCompression, rollbackDsu];
