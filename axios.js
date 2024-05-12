// http-client.js  
const axios = require('axios');

// 封装GET请求  
function get(url, params = {}, headers = {}) {
    const config = {
        method: 'get',
        url: url,
        params: params,
        headers: headers,
    };

    return axios(config)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error('GET request failed:', error);
            throw error;
        });
}

// 封装POST请求  
function post(url, data = {}, headers = {}) {
    const config = {
        method: 'post',
        url: url,
        data: data,
        headers: headers,
    };

    return axios(config)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error('POST request failed:', error || "JinaApi请求网站超时或返回异常！");
            throw error;
        });
}

// 导出模块  
module.exports = {
    get,
    post,
};