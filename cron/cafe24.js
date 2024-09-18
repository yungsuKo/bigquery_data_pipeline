// cafe24 쇼핑몰 API는 RESTful한 아키텍쳐
// Oath2.0 기반의 인증 시스템과 표준 HTTP request method

import axios from 'axios';
import { base64encode } from 'nodejs-base64';
import request from 'request';

// Authentication
// Get Authentication Code
// 토큰 발급 요청시 사용된 code는 재사용할 수 없으며 코드 발급 후 1분이 경과되면 만료됨.
export async function getCode() {
  const code = await axios.get(
    `https://${process.env.CAFE24_MALLID}.cafe24api.com/api/v2/oauth/authorize?response_type=code&client_id=${process.env.CAFE24_CLIENT_ID}&state=a1b2c3d4&redirect_uri=${process.env.CAFE24_REDIRECT_URI}&scope=mall.read_order`
  );
  console.log(code);
}

export async function getAccessCode() {
  var payload = `grant_type=authorization_code&code=${process.env.CAFE24_CODE}&redirect_uri=${process.env.CAFE24_REDIRECT_URI}`;
  const encodedVal = base64encode(
    `${process.env.CAFE24_CLIENT_ID}:${process.env.CAFE24_CLIENT_SECRET_KEY}`
  );
  var options = {
    method: 'POST',
    url: `https://${process.env.CAFE24_MALLID}.cafe24api.com/api/v2/oauth/token`,
    headers: {
      Authorization: `Basic ${encodedVal}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
    json: true,
  };
  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });
}
