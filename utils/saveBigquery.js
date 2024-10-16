import fs from 'fs';
import request from 'request';

// bigquery에 데이터 저장하기
// 인자로 광고 매체를 받음.
import { BigQuery } from '@google-cloud/bigquery';

// 리플레시 토큰 발급 함수
export const refreshToken = async () => {
  return new Promise(function (resolve, reject) {
    let data = fs.readFileSync('./result.json');
    const resultData = JSON.parse(data);
    console.log(resultData);
    let options = {
      method: 'POST',
      url: `https://${process.env.MALL_ID}.cafe24api.com/api/v2/oauth/token`,
      headers: {
        Authorization: `Basic ${process.env.AUTH}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: resultData.refresh_token,
      },
    };
    request(options, function (error, response) {
      try {
        if (error) {
          console.log(error);
          refreshToken();
        } else {
          const responseData = JSON.parse(response.body);
          if (responseData.error) {
            console.log(JSON.parse(response.body));
          } else {
            fs.writeFileSync(
              'result.json',
              response.body,
              'utf8',
              function (error) {
                console.log(error);
              }
            );
            resolve('refreshToken');
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  });
};

export async function fetchDataVersion(url) {
  return new Promise(function (resolve, reject) {
    let data = fs.readFileSync('./result.json');
    var options = {
      method: 'GET',
      url: url,
      headers: {
        Authorization: 'Bearer ' + JSON.parse(data).access_token,
        'Content-Type': 'application/json',
        'X-Cafe24-Api-Version': '2023-09-01',
      },
    };
    request(options, function (error, response, body) {
      if (error) {
        console.log(error);

        resolve('데이터를 불러오지 못했습니다.');
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
}

export async function insertData(data, table) {
  // data를 어떤 table에 넣을 것인지.
  await table.insert(data);
}

export function formatDate(inputDateString) {
  const inputDate = new Date(inputDateString);
  const year = inputDate.getFullYear();
  const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
  const day = inputDate.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

export async function changeData() {}

export async function createDataset() {
  // Creates a client
  const options = {
    keyFilename: `./${process.env.KEY_FILE_NAME}`,
    projectId: `${process.env.BIGQUERY_PROJECT_ID}`,
  };
  const bigqueryClient = new BigQuery(options);
  const datasetName = 'cafe24';
  // tableId를 각각의 api 호출별로 추가하면 됨.
  const tableId = 'test';
  // Get dataset
  const dataset = await bigqueryClient.dataset(datasetName);
  const [table] = await dataset.table(tableId).get();

  // 삽입할 데이터
  const rows = [
    {
      aaa: '1',
      bbb: '2',
      ccc: '3',
    },
    {
      aaa: '2',
      bbb: '3',
      ccc: '4',
    },
  ];

  // 빅쿼리에 데이터 적재
  await bigqueryClient.dataset(datasetName).table(tableId).insert(rows);

  console.log('Table :');
  console.log(table.metadata.tableReference);
}
