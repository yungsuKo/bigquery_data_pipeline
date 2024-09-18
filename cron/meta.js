let apiSdk = require('facebook-nodejs-business-sdk');
const AdAccount = apiSdk.AdAccount;
const AdsInsights = apiSdk.AdsInsights;

const facebookApiKey = process.env.FACEBOOK_ACCESS_TOKEN;
let ad_account_id = 'act_1459890564749301';
let app_secret = 'fbb10067089d75c11e438ea69c8164f5';
let app_id = '874529439926322';

const api = apiSdk.FacebookAdsApi.init(facebookApiKey);
const account = new AdAccount(ad_account_id);

const getData = () => {
  let ads_insights;
  let ads_insights_id;

  const fields = [
    'impressions',
    'frequency',
    'spend',
    'actions:page_engagement',
    'actions:omni_initiated_checkout',
    'actions:omni_purchase',
    'actions:omni_add_to_cart',
  ];
  const params = {
    time_range: { since: '2022-12-01', until: '2023-01-01' },
    filtering: [
      {
        field: 'delivery_info',
        operator: 'IN',
        value: [
          'active',
          'inactive',
          'completed',
          'recently_completed',
          'archived',
          'permanently_deleted',
        ],
      },
    ],
    level: 'ad',
    breakdowns: ['days_1', 'ad_name'],
  };
  new AdAccount(ad_account_id)
    .getInsights(fields, params)
    .then((result) => {
      logApiCallResult('ads_insights api call complete.', result);
      ads_insights_id = result[0].id;
    })
    .catch((error) => {
      console.log(error);
    });
  console.log("I'm getting facebook data", facebookApiKey);
};

const getMetaToken = () => {};

module.exports = { getData };
