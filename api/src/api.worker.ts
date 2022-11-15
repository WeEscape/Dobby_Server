import { config } from './config';
import { Container } from './loaders/container.loader';
import { ServerLoader } from './loaders/server.loader';
import { RdbmsConfig } from './repositories/base/rdbms.repository';

/** 서버 시작 */
const main = async () => {
  const container = new Container(<RdbmsConfig>config.rdbms);

  const server = new ServerLoader(container);

  await server.startServer(config.server.port);
};

main();
