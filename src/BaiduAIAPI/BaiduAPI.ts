import { fetch, RequestInit } from 'undici'; // 请确保你已经安装了node-fetch库
import logger from '../bot/logging'

const tokenUrl: string = 'https://aip.baidubce.com/oauth/2.0/token';

class BaiduAPI {
  protected access_token: string

  private client_id: string
  private client_secret: string

  constructor(client_id: string, client_secret: string) {
    this.client_id = client_id
    this.client_secret = client_secret
  }
}

async function refresh_token() {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials'
    })
  };

  const response = await fetch(tokenUrl, requestOptions);
  if (!response.ok) {
    logger.error(`refresh_token failed: ${response.body}`)
    throw new Error('Failed to fetch token');
  } else {
    const data = await response.json();
    console.log(data);
  }

}

