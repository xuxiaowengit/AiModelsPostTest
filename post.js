async function interactWithChatGPT(inputText) {
    const apiKey = 'YOUR_API_KEY_HERE'; // 替换为您的 OpenAI API 密钥
    const modelEndpoint = 'http://127.0.0.1:11434/v1/chat/completions'; // 模型 API 终点

    // 请求参数
    const requestBody = {
        model: 'openchat:7b-v3.5-1210', // 使用的模型名称on
        messages: [
            {
                "role": "user",
                "content": "你是什么系统？"
            }
        ],
        prompt: inputText, // 输入的文本
        max_tokens: 150, // 生成的最大标记数量
        temperature: 0.7, // 温度参数，控制生成文本的创造性程度
        n: 1, // 返回的文本数量
        stop: '\n' // 生成文本停止标记
    };

    // 发起 POST 请求
    const response = await fetch(modelEndpoint, {
        method: 'POST',
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

// 使用示例   response.choices[0].messages)
const inputText = "你好，请你自我介绍下你的系统版本。";
interactWithChatGPT(inputText)
    .then(response => {
        console.log(response)
        console.log(JSON.stringify(response.choices[0].message,null,2))
    }
    )

    .catch(error => console.error('Error interacting with ChatGPT:', error));
