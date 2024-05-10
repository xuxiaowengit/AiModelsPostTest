async function interactWithChatGPT(inputText) {
    const apiKey = 'YOUR_API_KEY_HERE'; // 替换为您的 OpenAI API 密钥

    const modelEndpoint = 'http://127.0.0.1:11435/v1/chat/completions'; // 模型 API 终点
    // const modelEndpoint = 'http://192.168.1.254:11435/v1/chat/completions'; // 模型 API 终点

    // 请求参数
    const requestBody = {
        model: 'openchat:7b-v3.5-1210', // 使用的模型名称on
        messages: [{
            "role": "user",
            "content": inputText
        }],
        prompt: inputText, // 输入的文本
        Top_P: 0.95,
        seed: 0,
        // Keep_Alive: '25m',
        Top_k: 10,
        Repeat_Penalty: 1.5,
        max_tokens: 250, // 生成的最大标记数量
        temperature: 0.5, // 温度参数，控制生成文本的创造性程度
        n: 1, // 返回的文本数量
        // Context_Length: 2048,
        stop: '\n' // 生成文本停止标记
    };

    // 发起 POST 请求
    const response = await fetch(modelEndpoint, {
        method: 'POST',
        timeout: 100000, // 设置超时时间为 10 秒
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    });

    // 解析并返回响应数据
    const responseData = await response.json();
    return responseData
    // return responseData.choices[0].text.trim();
}
var inputText = "你好，你是什么版本？"
interactWithChatGPT(inputText)
    .then(response => {

        console.log(response)
        console.log(JSON.stringify(response.choices[0].message, null, 2))
    })
    .catch(error => console.error('Error interacting with ChatGPT:', error));



const readTextFile = require('../readFile.js');
var Txt;

// 调用读取文本文件的函数并处理结果
// readTextFile('./txt4.txt')
//     .then(text => {
//         console.log('File content:');
//         Txt = text;
//         var inputText = "Determine if it is relevant to the Battery business, Energy Storage Business, ESS product, " +
//             "UPS uninterruptible power supply, telecom tower, or PV Solar business.If it is relevant, reply with 1; if not, reply with 0." +
//             "Only reply with 0 or 1," +
//             "no analysis or explanation is needed.text is: " + Txt;
//         console.log(inputText);

//     })
//     .catch(error => {
//         console.error('An error occurred while reading the file:', error);
//     });