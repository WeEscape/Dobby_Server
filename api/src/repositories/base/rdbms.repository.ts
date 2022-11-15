import mysql from 'mysql2/promise';
import { InternalServerError } from '../../exceptions/InternalServer.exception';
import { Generator } from './generator';

export interface RdbmsConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  charset: string;
}

export interface SelectOptions {
  select: string[];
}

export class RdbmsRepository {
  private pool: mysql.Pool;

  constructor(rdbmsConfig: RdbmsConfig, public readonly generator: Generator) {
    this.pool = mysql.createPool(rdbmsConfig);
  }

  protected async getConnection(): Promise<mysql.PoolConnection> {
    try {
      const connection = await this.pool.getConnection();

      return connection;
    } catch (err) {
      throw new InternalServerError(`Rdbms connect: ${err}`);
    }
  }

  async sendQuerys(sqls: { query: string; params?: unknown[] }[]): Promise<unknown[]> {
    let results = [];

    const connection = await this.getConnection();

    try {
      // 트랜잭션 처리
      await connection.beginTransaction();

      // 다중 sql
      for await (const sql of sqls) {
        let result = null;
        [result] = await connection.query(sql.query, sql?.params);
        results.push(result);
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw new InternalServerError(`Rdbms query: ${err}`);
    } finally {
      connection.release();
    }

    return results;
  }

  /** id 생성 */
  protected generateId(): string {
    return this.generator.generateRandomString(12);
  }
}
