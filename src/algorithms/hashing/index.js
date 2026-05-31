import * as hashTableChaining from './hashTableChaining';
import * as hashTableLinearProbing from './hashTableLinearProbing';
import * as hashTableQuadraticProbing from './hashTableQuadraticProbing';
import * as hashTableDoubleHashing from './hashTableDoubleHashing';
import * as cuckooHashing from './cuckooHashing';
import * as rollingHash from './rollingHash';

export {
  hashTableChaining,
  hashTableLinearProbing,
  hashTableQuadraticProbing,
  hashTableDoubleHashing,
  cuckooHashing,
  rollingHash,
};

export const hashingAlgorithms = [
  hashTableChaining,
  hashTableLinearProbing,
  hashTableQuadraticProbing,
  hashTableDoubleHashing,
  cuckooHashing,
  rollingHash,
];
