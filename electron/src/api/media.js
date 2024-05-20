import axios from 'axios';

export class MediaApi {

    endpoint = '/vaahshare/media';

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

    async updateItem(id, payload) {
        const { data } = await this.api.put(`${this.endpoint}/socket/${id}`, payload);
        return data;
    }

    async deleteItem(id) {
        const { data } = await this.api.delete(`${this.endpoint}/socket/${id}`);
        return data;
    }

    async getListBySocketIdAndMediaNames(socketId, userHost, mediaNames) {
        const { data } = await this.api.post(`${this.endpoint}/client/${socketId}/${userHost}`, { media_names: mediaNames });
        return data;
    }
}
