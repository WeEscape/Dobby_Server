import express from 'express';
import helmet from 'helmet';
import http from 'http';
import cors from 'cors';
import { config } from '../config';
import { NotFoundError } from '../exceptions/NotFound.exception';
import { errorInterceptor } from '../middlewares/error.interceptor';
import { logger } from '../utils/logger.util';
import { Container } from './container.loader';
import { authRouter } from '../routers/auth.router';
import { usersRouter } from '../routers/users.router';
import { authGuard } from '../middlewares/auth.guard';
import { groupsRouter } from '../routers/groups.router';

export class ServerLoader {
  private app: express.Express;
  server: http.Server;

  constructor(private readonly container: Container) {
    this.app = express();
    this.server = http.createServer(this.app);

    this.setMiddlewares();
    this.setRouters();
  }

  /** dependency middleware 설정 */
  setMiddlewares(): void {
    // express
    this.app.use(express.json({ limit: config.server.contentsLimit })); // application/json 설정
    this.app.use(express.urlencoded({ extended: false, limit: config.server.contentsLimit })); // x-www-form-urlencoded 설정

    // cors
    this.app.use(cors()); // cors 허용

    // helmet
    this.app.use(helmet());
    this.app.use(helmet.contentSecurityPolicy(config.helmet.security)); // content 보안 정책 설정

    // proxy 설정
    this.app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
    this.app.set('etag', false);

    // method 설정
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS');
      req.method.toLowerCase() === 'options' && res.status(200).json('Success');

      return next();
    });
  }

  /** routing 설정 */
  setRouters(): void {
    this.app.use('/api/auth', authRouter(this.container.getAuthService()));
    this.app.use('/api/users', authGuard, usersRouter(this.container.getUsersService()));
    this.app.use('/api/groups', authGuard, groupsRouter(this.container.getGroupsService()));

    // 존재하지 않는 api 주소 설정
    this.app.use('*', (req, res, next) => {
      return next(new NotFoundError('api address'));
    });

    this.app.use(errorInterceptor);
  }

  /** 서버 시작 */
  async startServer(port: number): Promise<void> {
    try {
      this.server.listen(port, '0.0.0.0', () => {
        logger.info(`API Worker is running on ${port} `);
        logger.info(`Worker setting is ${process.env.NODE_ENV} Mode`);
      });

      // pm2 setting
      process.env.NODE_ENV !== 'dev' && process.send && process.send('ready') && logger.info('sent ready for PM2');
    } catch (err) {
      logger.error(`Server: ${err}`);
    }
  }
}
