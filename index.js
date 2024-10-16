import cron from 'node-cron';
import dotenv from 'dotenv';
// const meta = require('./cron/meta');
import { getCode, getAccessToken } from './cron/cafe24.js';
import {
  createDataset,
  refreshToken,
  fetchDataVersion,
} from './utils/saveBigquery.js';
import { BigQuery } from '@google-cloud/bigquery';

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

// createDataset();

refreshToken().then(async () => {
  // 빅쿼리 객체 생성
  const options = {
    keyFilename: `./${process.env.KEY_FILE_NAME}`,
    projectId: `${process.env.BIGQUERY_PROJECT_ID}`,
  };
  const bigqueryClient = new BigQuery(options);
  const datasetName = 'cafe24';
  const orderTableId = 'orders';
  const dataset = await bigqueryClient.dataset(datasetName);
  const [orderTable] = await dataset.table(orderTableId).get();

  // 날짜 포맷팅
  const today = new Date();
  const formattedDate = today
    .toLocaleString('eu-US', { timezone: 'Asia/Seoul' })
    .split('/');

  const year = formattedDate[0];
  const month = formattedDate[1];
  const day = formattedDate[2].substring(0, 2) - 1;

  //   const start_date = `${year}-${month}-${day}`;
  //   const end_date = `${year}-${month}-${day}`;

  const start_date = `2023-01-01`;
  const end_date = `2023-01-10`;

  // orderUrl endpoint 에서 데이터 가져오기
  // 한 번 호출했을 때 1,000개의 주문이 넘어가는 경우 대비

  const orderData = [];
  let orderUrl = `https://${process.env.MALL_ID}.cafe24api.com/api/v2/admin/orders?start_date=${start_date}&end_date=${end_date}&offset=400&limit=1000`;
  let data = await fetchDataVersion(orderUrl);

  if (!data.links[0]?.rel == 'next') {
    orderData.push(...data.orders);
  } else {
    orderData.push(...data.orders);
    while (data.links[0]?.rel == 'next' || data.links.length == 2) {
      orderUrl =
        data.links[0]?.rel == 'next' ? data.links[0].href : data.links[1].href;
      data = await fetchDataVersion(orderUrl);
      orderData.push(...data.orders);
    }
  }

  console.log(orderData);
  // 빅쿼리 저장하기 이전에 데이터 포맷팅
  const insertOrderData = orderData.map((order) => {
    // 빅쿼리 필드로 설정해둔 데이터'
    return {
      order_id: order.order_id,
      member_id: order.member_id,
      member_email: order.member_email,
      order_price_amount: Number(order.initial_order_amount.order_price_amount),
      shipping_fee: Number(order.initial_order_amount.shipping_fee),
      points_spent_amount: Number(
        order.initial_order_amount.points_spent_amount
      ),
      credits_spent_amount: Number(
        order.initial_order_amount.credits_spent_amount
      ),
      coupon_discount_price: Number(
        order.initial_order_amount.coupon_discount_price
      ),
      coupon_shipping_fee_amount: Number(
        order.initial_order_amount.coupon_shipping_fee_amount
      ),
      membership_discount_amount: Number(
        order.initial_order_amount.membership_discount_amount
      ),
      shipping_fee_discount_amount: Number(
        order.initial_order_amount.shipping_fee_discount_amount
      ),
      set_product_discount_amount: Number(
        order.initial_order_amount.set_product_discount_amount
      ),
      app_discount_amount: Number(
        order.initial_order_amount.app_discount_amount
      ),
      point_incentive_amount: Number(
        order.initial_order_amount.point_incentive_amount
      ),
      total_amount_due: Number(order.initial_order_amount.total_amount_due),
      market_other_discount_amount: Number(
        order.initial_order_amount.market_other_discount_amount
      ),
      payment_method: order.payment_method.join(','),
      payment_method_name: order.payment_method_name.join(','),
      order_date: order.order_date,
      first_order: order.first_order,
      payment_amount: order.payment_amount,
      order_place_name: order.order_place_name,
      order_place_id: order.order_place_id,
      flag: 0,
    };
  });
  try {
    await Promise.all(
      insertOrderData.map(async (row) => {
        await bigqueryClient
          .dataset(datasetName)
          .table(orderTableId)
          .insert(row);
      })
    );
  } catch (error) {
    console.error('Error inserting data:', error);
  }
});

/**
 * 각각의 데이터에 대해서 가져오는 주기를 다르게 함.
 * order_items의 경우 orders에 쌓인 주문건을 기준으로
 * flag가 0인 것을 하나씩 가져와서 조회 후
 * 기존의 orders의 flag를 변경함.
 */
// url을 여기서 만듦
// const order_items = await fetchData(url);

// url을 여기서 만들어
// const products = await fetchData(url);
