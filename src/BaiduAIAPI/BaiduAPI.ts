import {fetch, RequestInit} from 'undici'; // 请确保你已经安装了node-fetch库
import logger from '../bot/logging'
import {check_auth_api_failed, check_auth_api_successful} from "./api_schema/auth_schema";

const token_endpoint = '/oauth/2.0/token';
const api_host = 'https://aip.baidubce.com'

export default class BaiduAPI {
    protected access_token?: string = null

    private readonly client_id: string
    private readonly client_secret: string

    constructor(client_id: string, client_secret: string, access_token?: string) {
        this.client_id = client_id
        this.client_secret = client_secret
        this.access_token = access_token ? access_token : null
    }

    protected async refresh_access_token() {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        const response = await fetch(`${api_host}${token_endpoint}?grant_type=client_credentials&client_id=${this.client_id}&client_secret=${this.client_secret}`, requestOptions);
        if (!response.ok) {
            logger.error(`refresh_token failed: ${JSON.stringify(await response.json())}`)
            throw new Error('Failed to fetch token');
        } else {
            const data = await response.json();
            if (check_auth_api_successful(data)) {
                this.access_token = data.access_token
                logger.info(`baidu_api_get_refresh_token get new token: ${this.access_token}`)
            } else if (check_auth_api_failed(data)) {
                logger.error(`baidu_api_get_refresh_token failed: ${data.error}, ${data.error_description}`)
            } else {
                throw new Error(`baidu_api_get_refresh_token unknown response: ${JSON.stringify(data)}`)
            }
            console.log(data);
        }
    }

    // 尽情使用这个api，不用担心没有access_token的问题！
    protected async post_form_api(endpoint: string, parameter_table: { [key: string]: string }) {
        if (!this.access_token) {
            await this.refresh_access_token()
            if (!this.access_token) throw new Error(`post_form_api: no access token error`)
        }
        let params = new URLSearchParams();
        for (let key in parameter_table)
            params.append(key, parameter_table[key]);
        return await fetch(`${api_host}${endpoint}?access_token=${this.access_token}`, {
            method: "POST",
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow",
            body: params
        });
    }
}


