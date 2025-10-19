import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST,
<<<<<<< HEAD
  port: parseInt(process.env.DB_PORT, 10),
=======
  port: parseInt(process.env.DB_PORT, 10) || 17345,
>>>>>>> 709dfc2 (Db conecction and script to the entities)
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  name: process.env.DB_NAME,
  synchronize: process.env.DB_SYNC === 'true',
}));
