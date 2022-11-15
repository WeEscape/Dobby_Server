import { ServerLoader } from '../src/loaders/server.loader';
import { RdbmsConfig } from '../src/repositories/base/rdbms.repository';
import { testConfig } from './config';
import { TestConatiner } from './loaders/containter.loader';

export const testConatiner = new TestConatiner(<RdbmsConfig>testConfig.rdbms);

export const server = new ServerLoader(testConatiner);
