import axios from 'axios';

export class ClientsApi {

    endpoint = '/vaahshare/clients';

    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL
        });
    }

    async getAssets() {
        const { data } = await this.api.get(`${this.endpoint}/assets`);
        return data;
    }
}
