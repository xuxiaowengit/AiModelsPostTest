// 引入模块 
const XLSX = require('xlsx');
const generateLog = require('./logger'); //日志模块
const path = require('path');
// 输出excel表格模块
const {
    writeToExcel,
    appendDataToExcel,
    appendToExcel,
    createExcelFile,
    worksheetExists,
    checkFileExists,
    appendWorksheetToFile
} = require('./outFile');
const { // 读取表格模块
    readExcelFile
} = require("./readFile");
const httpClient = require("./axios");
const {
    saveTextToFile
} = require('./outFile'); //保存txt模块
const interactWithChatGPT = require('./chatAPI');
const fs = require('fs');
var outfilePath = './outExe/已识别网站记录.xlsx';
const myModule = require('./makeExcel');

// 常量定义
var today = new Date();
var year = today.getFullYear();
var month = (today.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回的月份是从 0 开始的，所以需要加 1，并用 padStart 填充前导零  
var day = today.getDate().toString().padStart(2, '0'); // getDate() 返回的是日期，不需要加 1
var hours = today.getHours();
var minutes = today.getMinutes();
var seconds = today.getSeconds();
var milliseconds = today.getMilliseconds();
var fullDate = year + '-' + month + '-' + day;
var dayHour = year + '-' + month + '-' + day + "-" + hours;;
var nowTime = year + '-' + month + '-' + day + ` ` + hours + '-' + minutes + '-' + seconds + `:` + milliseconds + `ms`


// 定义一个函数来更新和打印毫秒数  
function updateMilliseconds() {
    // 每次调用时都创建一个新的Date对象  
    today = new Date();
    // 获取年、月、日  
    year = today.getFullYear();
    month = (today.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回的月份是从 0 开始的，所以需要加 1，并用 padStart 填充前导零  
    day = today.getDate().toString().padStart(2, '0'); // getDate() 返回的是日期，不需要加 1
    hours = today.getHours();
    minutes = today.getMinutes();
    seconds = today.getSeconds();
    milliseconds = today.getMilliseconds();
    dayHour = year + '-' + month + '-' + day + "-" + hours;
    // 组合成完整的日期字符串  
    fullDate = year + '-' + month + '-' + day;
    nowTime = year + '-' + month + '-' + day + ` ` + hours + '-' + minutes + '-' + seconds + `:` + milliseconds + `ms`
    // console.log(milliseconds); // 这将每秒打印新的毫秒数

}
// 使用setInterval来每秒调用updateMilliseconds函数  
setInterval(updateMilliseconds, 1000); // 1000毫秒 = 1秒


// 日志模块初始化
const logFilePath = path.join(__dirname, './log/appRun.log'); // 日志文件路径
const message = 'This is  system log,下面是本次(' + `${nowTime}` + ')邮件发送日志：'; // 要记录的日志消息
generateLog(logFilePath, message);

// 文本处理
function removeLinesWithURLs(text) {
    // 假设text是一个多行字符串，我们使用\n作为行分隔符
    // 如果你的文本格式不同，你可能需要修改这个分隔符
    const lines = text.split(/\r?\n/); // 兼容Windows和Unix/Linux的换行符

    // 使用filter方法过滤掉包含URLs的行
    const filteredLines = lines.filter((line) => !/(https?:\/\/)/.test(line));

    // 将过滤后的行重新组合成一个多行字符串
    return filteredLines.join("\n");
}



var excledata = []; //处理结果表格缓存
var Failed = []; //识别异常的拎出来
var url1 = "https://r.jina.ai/"; //web文本获取接口
function main() { //主方法
    // 读取excel表格中的网站信息
    var url2;
    (async () => {
        try {
            // const filePath = "./txt/测试数据.xls"; // 替换为你的Excel文件路径
            const filePath = "./txt/第二批测试数据.xlsx"; // 替换为你的Excel文件路径
            const data = await readExcelFile(filePath);
            console.log("表格数据:", data[0], data.length); // 输出Excel表格中的数据
            url2 = data[0][1]
            // 遍历异步调用方法入口
            var myArray = data;
            iterateArray(myArray, () => {
                // console.log('全部处理完.');
                // console.log("excledata", excledata, filePath, worksheetName);
                const worksheetName = fullDate;
                appendToExcel(outfilePath, worksheetName, excledata); //把处理完成的结果追加到表格
                today = new Date();
                milliseconds = today.getMilliseconds();
                // console.log("dayHour:", dayHour)
                if (Failed.length !== 0) {
                    appendToExcel('./outFile/首轮识别失败记录.xlsx', dayHour, Failed); //写出失败记录
                    generateLog(logFilePath, "全部处理完,程序退出！" + `--${nowTime}`);
                    console.log('首轮分析有部分失败:', Failed);
                } else {
                    console.log('首轮分析没有失败，数组为空！');
                }

                setTimeout(function () {
                    // 这里是延时后执行的代码
                    console.log('全部处理完,程序退出');
                    process.exit() //结束程序
                }, 3000); // 1000 毫秒 = 1 秒

            }, url2);

        } catch (error) {
            console.error("Error reading Excel file:"); //错误太长error
            today = new Date();
            milliseconds = today.getMilliseconds();
            generateLog(logFilePath, "Error reading Excel file:" + `${error}` + `--${nowTime}`);

        }
    })();
}



// 遍历数组并调用另一个方法--从jina接口获取网站关键词
function iterateArray(array, callback, url2) {
    let index = 0;

    function next() {
        if (index < array.length - 533) {
            console.log("待处理总数量：", array.length - index, url2)
            getJinaApi(array[index], () => {
                index++;
                next();
            }, array[index][1], index, array[index]);
        } else {
            callback();
        }
    }
    next();
}


// ebdc4157d67e6a7c745c42174d8df71802a7397ceb9962e1d552ca3f765685b8   openchat APIkey
// 获取过滤的网页内容
function getJinaApi(item, callback, url2, index, item) {
    // 使用GET请求url1+url2
    var url3 = url1 + url2;
    console.log('开始处理第:', index + 1, '网站,Url3:', url3)
    httpClient.get(url3, {
        null: ""
    })
        .then((data) => {
            if (data != "") {
                let text = removeLinesWithURLs(data);
                // 使用正则表达式和replace方法替换换行符为逗号
                let newText = text.replace(/(\r\n|\n|\r)|[^\x20-\x7E]/gm, ",");
                // console.log("后去替换空格等符号:", newText);
                console.log("已完成第", index + 1, "网站获取", item[1])
                openchatApiPost(newText, item, callback, index);
                today = new Date();
                milliseconds = today.getMilliseconds();
                generateLog(logFilePath, "已完成第" + `${index + 1}` + "网站:" + `${item[1]}` + "获取" + `--${nowTime}`);
            } else {
                today = new Date();
                milliseconds = today.getMilliseconds();
                generateLog(logFilePath, "jina.ai接口请求返回格式异常数据," + `--${nowTime}`);
                array3.splice(0, 0, item[0] || '没有数据');
                array3.splice(1, 0, url2);
                array3.splice(2, 0, item[2] || '没有数据');
                array3.splice(3, 0, item[3] || '没有数据');
                array3.splice(4, 0, 'jinaAPI请求失败!');
                Failed.push(array3);
            }

        })
        .catch((error) => {
            var array3 = [];
            console.error("jina.ai接口请求失败:", item); //error 太长不要打印
            today = new Date();
            milliseconds = today.getMilliseconds();
            generateLog(logFilePath, "jina.ai接口请求失败," + `${error}` + `--${nowTime}`);
            // 异常的数据加入另外表格临时缓存
            array3.splice(0, 0, item[0] || '没有数据');
            array3.splice(1, 0, url2);
            array3.splice(2, 0, item[2] || '没有数据');
            array3.splice(3, 0, item[3] || '没有数据');
            array3.splice(4, 0, 'jinaAPI请求失败!');
            Failed.push(array3);
            callback();
        });
}



// 处理结果缓存表格
var excelData = [];
// openchatAI请求识别
function openchatApiPost(text, item, callback, index) {
    // console.log("CCl:", "./txt/" + item[0] + ".txt")

    // 问题模版
    var qusetion = `Determine if it is relevant to the Battery business, Energy Storage Business, ESS product, 
            UPS uninterruptible power supply, telecom tower, or PV Solar business.If it is relevant, reply with 1; if not, reply with 0.
            Only reply with 0 or 1,no analysis or explanation is needed.text is:`;


    // 你的 API 密钥和模型 API 终点（如果需要的话，可以在这里覆盖默认值）  
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijk1YTBlMjIzLWQ0ZGYtNGFkNC1iZjBlLTA3OWIyMTUxYmU5YiJ9.S95yOdHFmevutvd7_w81hBJjA2kKlnAQCdG0b7VwW7s';
    // const modelEndpoint = 'http://127.0.0.1:11435/v1/chat/completions';
    // const modelEndpoint = 'http://127.0.0.1:11434/v1/chat/completions';
    // const modelEndpoint = 'http://localhost:11434/api/generate';
    // const modelEndpoint = 'http://wk2m6ujhui.tcp01.cn/v1/chat/completions';
    const modelEndpoint = 'http://192.168.1.254:11433/v1/chat/completions'; //254 内必须映射11434到11433，ollama不直接对127.0.0.1之外的来访者提供服务

    // 输入文本  
    var inputText = qusetion + text;
    // console.log(inputText)
    const modelName = 'openchat:7b-v3.5-q6_K';
    // const modelName = 'openchat:7b-v3.5-1210';
    // const modelName = 'llama3';
    // 调用函数并处理响应  
    interactWithChatGPT(inputText, apiKey, modelEndpoint, modelName)
        .then(response => {
            // console.log(response);
            // 注意：'choices' 和 'message' 取决于实际 API 响应结构  
            if (response.choices && response.choices[0].message) {
                console.log("分析结果：", JSON.stringify(response.choices[0].message, null, 2));
                console.log("已完成第", index + 1, "网站", item[1] + "分析");
                // console.log("excelData:", excelData)
                today = new Date();
                milliseconds = today.getMilliseconds();
                generateLog(logFilePath, "已完成第" + `${index + 1}` + "网站:" + `${item[1]}` + "分析" + `--${nowTime}`);
                var array = [],
                    array2 = [];
                array.splice(0, 0, item[0] || '没有数据');
                array.splice(1, 0, item[1] || '没有数据');
                if (response.choices[0].message.content === " 1") {
                    array.splice(2, 0, item[3] || '没有数据');
                    array.splice(3, 0, '是');
                    array.splice(4, 0, ''); //如果后面要追加数据，前面需要先追加


                } else if (response.choices[0].message.content === " 0") { //
                    array.splice(2, 0, '');
                    array.splice(3, 0, '非');
                    array.splice(4, 0, "");

                } else {
                    var webState = "未准确识别！" + response.choices[0].message.content //第五格备注
                    array.splice(2, 0, '');
                    array.splice(3, 0, '!!');
                    array.splice(4, 0, webState);
                    // 异常的数据加入另外表格临时缓存
                    array2.splice(0, 0, item[0] || '没有数据');
                    array2.splice(1, 0, item[1] || '没有数据');
                    array2.splice(2, 0, item[2] || '没有数据');
                    array2.splice(3, 0, item[3] || '没有数据');
                    array2.splice(4, 0, '首轮识别失败！'); //取代原来的是非显示
                    Failed.push(array2);
                    // console.log("Failed:", Failed);

                }
                milliseconds = today.getMilliseconds();
                array.splice(5, 0, nowTime);
                excelData.push(array)
                // console.log("excelData2:", excelData)
                excledata = excelData;

            } else {
                console.log('openchatAPI返回的数据不含预期的格式结构!');
                today = new Date();
                milliseconds = today.getMilliseconds();
                generateLog(logFilePath, '当次openchatAPI返回的数据不含预期的格式结构!:' + `${response.choices[0].message}` + `--${nowTime}`);
            }
            const processingTime = Math.random() * 1200;

            setTimeout(() => {
                console.log(` 分析 ${item[1]} 延时 ${processingTime} ms`);
                // 调用保存文本到文件的方法
                saveTextToFile(text, "./txt/" + item[0] + ".txt")
                    .then(() => {
                        console.log('已保存' + item[1] + '到txt!');
                    })
                    .catch((err) => {
                        console.error('An error occurred while saving the file:', err);
                        today = new Date();
                        milliseconds = today.getMilliseconds();
                        generateLog(logFilePath, 'An error occurred while saving the file' + `--${err}`);
                    });


                callback();
            }, processingTime);

        }).catch(error => {
            console.error('Error interacting with openChat:', error)
            today = new Date();
            milliseconds = today.getMilliseconds();
            generateLog(logFilePath, 'Error interacting with openChatAPI' + `${error}` + `--${nowTime}`);
            callback();
        });
}



// 表格集中处理====================================================
// const module = require('./makeExcel');  //modeule 是全局厂家变量
// 调用异步函数，并在完成后打印结果  
const options = {
    outfilePath: outfilePath,
    nowTime: nowTime,
    fullDate: fullDate
}; // 创建一个包含 file 属性的对象   
myModule.asyncFunction('data to process', options, function (err, result) {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('表格初始化异步处理:', result);
    nextMethod(result);
});
// 主函数
function nextMethod(data) {
    console.log('Next method with main:', data);
    main();
}