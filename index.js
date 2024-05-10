// 获取今天的日期  
var today = new Date();
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

// 读取表格模块
const {
    readExcelFile
} = require("./readFile");

const httpClient = require("./axios");
const { saveTextToFile } = require('./outFile'); //保存txt模块
const interactWithChatGPT = require('./chatAPI');
const fs = require('fs');
var year = today.getFullYear();
var month = (today.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回的月份是从 0 开始的，所以需要加 1，并用 padStart 填充前导零  
var day = today.getDate().toString().padStart(2, '0'); // getDate() 返回的是日期，不需要加 1
var fullDate = year + '-' + month + '-' + day;
var dayHour;
var nowTime;

// 定义一个函数来更新和打印毫秒数  
function updateMilliseconds() {
    // 每次调用时都创建一个新的Date对象  
    today = new Date();
    // 获取年、月、日  
    year = today.getFullYear();
    month = (today.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回的月份是从 0 开始的，所以需要加 1，并用 padStart 填充前导零  
    day = today.getDate().toString().padStart(2, '0'); // getDate() 返回的是日期，不需要加 1
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();
    var milliseconds = today.getMilliseconds();
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
            const filePath = "./txt/测试数据.xls"; // 替换为你的Excel文件路径
            const data = await readExcelFile(filePath);
            console.log("表格数据:", data[0], data.length); // 输出Excel表格中的数据
            url2 = data[0][1]
            // 遍历异步调用方法入口
            var myArray = data;
            iterateArray(myArray, () => {
                console.log('全部处理完.');
                // console.log("excledata", excledata, filePath, worksheetName);
                appendToExcel(outfilePath, worksheetName, excledata); //把处理完成的结果追加到表格
                today = new Date();
                milliseconds = today.getMilliseconds();
                createExcelFile(Failed, './outFile/首轮识别失败记录.xlsx', dayHour); //写出失败记录
                generateLog(logFilePath, "全部处理完,程序退出！" + `--${nowTime}`);
                process.exit() //结束程序
            }, url2);
        } catch (error) {
            console.error("Error reading Excel file:", error);
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
        if (index < array.length - 100) {
            console.log("长度：", array.length, url2)
            getJinaApi(array[index], () => {
                index++;
                next();
            }, array[index][1], index);
        } else {
            callback();
        }
    }
    next();
}


// ebdc4157d67e6a7c745c42174d8df71802a7397ceb9962e1d552ca3f765685b8   openchat APIkey


// 获取过滤的网页内容
function getJinaApi(item, callback, url2, index) {
    // 使用GET请求url1+url2
    var url3 = url1 + url2;
    console.log('开始处理第:', index, '网站,\nUrl3:', url3)
    httpClient.get(url3, { null: "" })
        .then((data) => {
            // 假设你有一个包含换行符的字符串
            let text = removeLinesWithURLs(data);
            // console.log("先去掉url:", text);
            // 使用正则表达式和replace方法替换换行符为逗号
            let newText = text.replace(/(\r\n|\n|\r)|[^\x20-\x7E]/gm, ",");
            // let newText = text.replace(/(\r\n|\n|\r)/gm, ",");
            // console.log("后去替换空格等符号:", newText);
            console.log("已完成第", index, "网站获取", item[1])
            openchatApiPost(newText, item, callback, index);
            today = new Date();
            milliseconds = today.getMilliseconds();
            generateLog(logFilePath, "已完成第" + `${index}` + "网站:" + `${item[1]}` + "获取" + `--${nowTime}`);

        })
        .catch((error) => {
            console.error("jina.ai接口请求失败:", error);
            today = new Date();
            milliseconds = today.getMilliseconds();
            generateLog(logFilePath, "jina.ai接口请求失败" + `${error}` + `--${nowTime}`);
            callback();
        });
}





// 假设你有以下数据  
var excelData = [];

// openchatAI请求识别
function openchatApiPost(text, item, callback, index) {
    // console.log("CCl:", "./txt/" + item[0] + ".txt")

    // 问题模版
    var qusetion = `Determine if it is relevant to the Battery business, Energy Storage Business, ESS product, 
            UPS uninterruptible power supply, telecom tower, or PV Solar business.If it is relevant, reply with 1; if not, reply with 0.
            Only reply with 0 or 1,no analysis or explanation is needed.text is:`;


    // 你的 API 密钥和模型 API 终点（如果需要的话，可以在这里覆盖默认值）  
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc2YTlmOTg2LWY5NWYtNDAxNi05OGU5LTQ1Y2I4YjgxZDZjYiJ9.IwWmITyTdNWIWFBBGWP1C0WmlICstTvYRqSoVvCpnWk';
    // const modelEndpoint = 'http://127.0.0.1:11435/v1/chat/completions';
    const modelEndpoint = 'http://192.168.1.254:11433/v1/chat/completions';

    // 输入文本  
    var inputText = qusetion + text;
    // console.log(inputText)

    // 调用函数并处理响应  
    interactWithChatGPT(inputText, apiKey, modelEndpoint)
        .then(response => {
            // console.log(response);
            // 注意：'choices' 和 'message' 取决于实际 API 响应结构  
            if (response.choices && response.choices[0].message) {
                console.log("分析结果：", JSON.stringify(response.choices[0].message, null, 2));
                console.log("已完成第", index, "网站", item[1] + "分析");
                // console.log("excelData:", excelData)
                today = new Date();
                milliseconds = today.getMilliseconds();
                generateLog(logFilePath, "已完成第" + `${index}` + "网站:" + `${item[1]}` + "分析" + `--${nowTime}`);
                var array = [],
                    array2 = [];
                array.splice(0, 0, item[0]);
                array.splice(1, 0, item[1]);
                if (response.choices[0].message.content === " 1") {
                    array.splice(2, 0, item[3]);
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
                    array2.splice(0, 0, item[0]);
                    array2.splice(1, 0, item[1]);
                    array2.splice(2, 0, item[2]);
                    array2.splice(3, 0, item[3]);
                    array2.splice(4, 0, item[4]);
                    Failed.push(array2);
                    console.log("Failed:", Failed);

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
            const processingTime = Math.random() * 1000;

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

        })

        .catch(error => {
            console.error('Error interacting with ChatGPT:', error)
            today = new Date();
            milliseconds = today.getMilliseconds();
            generateLog(logFilePath, 'Error interacting with ChatGPT' + `${error}` + `--${nowTime}`);
            callback();
        });
}



const outfilePath = './outFile/已识别网站记录.xlsx';
const worksheetName = fullDate;
const worksheetData = [
    ['邮箱', '网站', '相关属性', "判定", '备注', '时间'],
];


// 本地表文件存在否
if (fs.existsSync(outfilePath)) {
    console.log("表已经存在", worksheetName);
    const workbook = XLSX.readFile(outfilePath); // 替换为你的工作簿路径
    // 检查是否存在名为 'xxx' 的工作表  
    const sheetExists = worksheetExists(workbook, worksheetName);
    if (sheetExists) {
        // console.log(`${worksheetName} 是否存在: ${sheetExists}`);
        console.log("工作表名存在,数据直接追加到工作表:", worksheetName)
    } else {
        console.log("工作表在,表名不存在,新建立工作表:", worksheetName)
        // 调用模块函数，追加工作表  
        appendWorksheetToFile(
            outfilePath, // 现有工作簿的路径  
            outfilePath, // 更新后工作簿的路径  
            worksheetName, // 新工作表的名称  
            worksheetData // 新工作表的数据  
        );
        today = new Date();
        milliseconds = today.getMilliseconds();
        generateLog(logFilePath, '工作表在,表名不存在,新建立工作表' + `--${nowTime}`);
    }


} else {

    console.log("表格不存在");
    // 调用函数创建 Excel 文件  创建新表
    createExcelFile(worksheetData, outfilePath, worksheetName);
    today = new Date();
    milliseconds = today.getMilliseconds();
    generateLog(logFilePath, '表文件不存在,新建立表文件' + `--${nowTime}`);
    // 主函数
}

main() //启动主方法