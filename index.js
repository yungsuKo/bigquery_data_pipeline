import cron from 'node-cron';
import dotenv from 'dotenv';
// const meta = require('./cron/meta');
import { getCode, getAccessToken } from './cron/cafe24.js';

dotenv.config();

// cron.schedule(
//     '* * * * * *',
//     () => {
//       meta.getData();
//     },
//     {
//       scheduled: false,
//       timezone: 'Asia/Seoul',
//     }
//   );
// meta.getData();
await getCode();
