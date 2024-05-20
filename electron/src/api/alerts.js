import axios from 'axios';

export class AlertsApi {

    endpoint = '/vaahshare/alerts';

    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL
        });
    }

    async getList() {
        const { data } = await this.api.get(this.endpoint);
        return data;
    }

    async getItem(id) {
        const { data } = await this.api.get(`${this.endpoint}/${id}`);
        return data;
    }

    async createItem(payload) {
        const { data } = await this.api.post(this.endpoint, payload);
        return data;
    }
}
