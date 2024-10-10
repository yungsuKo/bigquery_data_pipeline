// bigquery에 데이터 저장하기
// 인자로 광고 매체를 받음.
import { BigQuery } from '@google-cloud/bigquery';

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
  const rows = {
    aaa: '1',
    bbb: '2',
    ccc: '3',
  };

  // 빅쿼리에 데이터 적재
  await bigqueryClient.dataset(datasetName).table(tableId).insert(rows);

  console.log('Table :');
  console.log(table.metadata.tableReference);
}
