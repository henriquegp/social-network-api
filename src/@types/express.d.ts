// eslint-disable-next-line @typescript-eslint/no-unused-vars
import User from '../app/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
