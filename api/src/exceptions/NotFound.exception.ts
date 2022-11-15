export class NotFoundError extends Error {
  status: number;

  constructor(message: string) {
    super(message);

    this.status = 404;
    this.name = 'Not Found';
  }
}
