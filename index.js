const express = require('express');
const cron = require('node-cron');
const meta = require('./cron/meta');

const app = express();
require('dotenv').config();

const port = 3000;

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});

let start = async () => {
  //   let task_name = cron.schedule(
  //     '* * * * * *',
  //     () => {
  //       meta.getData();
  //     },
  //     {
  //       scheduled: false,
  //       timezone: 'Asia/Seoul',
  //     }
  //   );
  //   task_name.start();

  meta.getData();
};
start();
