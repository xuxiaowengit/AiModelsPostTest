// chatgpt-module.js  

// 引入 Node.js 内置的 fetch 模块（如果你使用的是较新的 Node.js 版本）  
// 否则，你可能需要安装 node-fetch 库  
// npm install node-fetch  
// const fetch = require('node-fetch'); // 如果需要  
// import fetch from 'node-fetch';
// 封装函数  
async function interactWithChatGPT(inputText, apiKey, modelEndpoint, modelName) {
    // 请求参数  
    const requestBody = {
        model: modelName,
        messages: [{
            "role": "user",
            "content": inputText
        }],
        prompt: inputText,
        Top_P: 0.95,
        seed: 0,
        Keep_Alive: '25m',
        Top_k: 10,
        Repeat_Penalty: 1.5,
        max_tokens: 250,
        temperature: 0.65,
        n: 1,
        Context_Length: 2048,
        stop: '\n'
    };

    // // 发起 POST 请求  
    // const response = await fetch(modelEndpoint, {
    //     method: 'POST',
    //     timeout: 100000, // 设置超时时间为 10 秒（注意单位是毫秒）  
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${apiKey}`
    //     },
    //     body: JSON.stringify(requestBody)
    // });

    // // 检查响应状态码并处理错误  
    // if (!response.ok) {
    //     throw new Error(`Failed to interact with ChatGPT: ${response.status} ${response.statusText}`);
    // }

    try {


        // 发起 POST 请求  
        const response = await fetch(modelEndpoint, {
            method: 'POST',
            timeout: 100000, // 设置超时时间为 10 秒（注意单位是毫秒）  
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        // 检查响应状态码并处理错误  
        if (!response.ok) {
            throw new Error(`Failed to interact with ChatGPT: ${response.status} ${response.statusText}`);
        }
        // 解析并返回响应数据  
        const responseData = await response.json();
        // console.log("responseData", responseData)
        return responseData;
    } catch (error) {
        return error
    }

}

// 导出函数  
module.exports = interactWithChatGPT;