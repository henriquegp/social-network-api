class HttpException {
  public status: number;

  public message: string;

  public handlers: object;

  constructor(status: number, message: string, handlers: object = {}) {
    this.status = status;
    this.message = message;
    this.handlers = handlers;
  }
}

export default HttpException;
