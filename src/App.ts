import express from 'express';
import http from 'http';
import Socket from 'socket.io';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import controllers from './app/controllers';
import errorMiddleware from './app/middlewares/errorMiddleware';
import './database';

class App {
  private app: express.Application;

  private http: http.Server;

  private io: Socket.Server;

  private port: number;

  constructor() {
    this.app = express();
    this.port = +process.env.APP_PORT;
    this.http = http.createServer(this.app);
    this.io = Socket(this.http);

    this.initializeMiddlewares();
    this.initializeControllers();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors({
      origin: '*',
      credentials: true,
    }));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'temp', 'uploads')),
    );
  }

  private initializeControllers(): void {
    controllers.forEach((controller) => {
      controller.setSocketIo(this.io);
      this.app.use('/', controller.router);
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  public listen(): void {
    // this.io.on('connection', () => console.log('User Socket On'));

    this.http.listen(process.env.APP_PORT, () => {
      console.log(`Server on port ${this.port}`);
    });
  }
}

export default new App();
