export class BadGatewayError extends Error {
  status: number;

  constructor(message: string) {
    super(message);

    this.status = 502;
    this.name = 'Bad Gateway';
  }
}
