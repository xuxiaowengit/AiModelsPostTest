// 获取今天的日期  
var today = new Date();
const XLSX = require('xlsx');

// 获取年、月、日  
var year = today.getFullYear();
var month = (today.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回的月份是从 0 开始的，所以需要加 1，并用 padStart 填充前导零  
var day = today.getDate().toString().padStart(2, '0'); // getDate() 返回的是日期，不需要加 1  

// 组合成完整的日期字符串  
var fullDate = year + '-' + month + '-' + day;

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


var excledata = []; //表格缓存
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
                console.log("excledata", excledata, filePath, worksheetName)
                appendToExcel(outfilePath, worksheetName, excledata); //写出表格
            }, url2);
        } catch (error) {
            console.error("Error reading Excel file:", error);
        }
    })();
}



// 遍历数组并调用另一个方法--从jina接口获取网站关键词
function iterateArray(array, callback, url2) {
    let index = 0;

    function next() {
        if (index < array.length) {
            // console.log("长度：", array.length, url2)
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


        })
        .catch((error) => {
            console.error("Error fetching data,jina.ai接口请求失败:", error);
            callback();
        });
    // callback();
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
    const modelEndpoint = 'http://127.0.0.1:11435/v1/chat/completions';

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
                console.log("已完成第", index, "网站分析", item[1])
                // console.log("excelData:", excelData)
                var array = []
                array.splice(0, 0, item[0]);
                array.splice(1, 0, item[1]);
                if (response.choices[0].message.content === " 1") {
                    array.splice(2, 0, item[3]);
                    array.splice(3, 0, '是');
                } else if (response.choices[0].message.content === " 0") {
                    array.splice(2, 0, '');
                    array.splice(3, 0, '非');

                } else {
                    var webState = "未准确识别！" + response.choices[0].message.content
                    array.splice(2, 0, '');
                    array.splice(3, 0, '!!');
                    array.splice(4, 0, webState);
                }

                excelData.push(array)
                console.log("excelData2:", excelData)
                excledata = excelData;

            } else {
                console.log('openchatAPI返回的数据不含预期的格式结构!');
            }
            const processingTime = Math.random() * 3000;

            setTimeout(() => {
                console.log(` 分析 ${item[1]} 延时 ${processingTime} ms`);
                // 调用保存文本到文件的方法
                saveTextToFile(text, "./txt/" + item[0] + ".txt")
                    .then(() => {
                        console.log('已保存' + item[1] + '到txt!');
                    })
                    .catch((err) => {
                        console.error('An error occurred while saving the file:', err);
                    });


                callback();
            }, processingTime);

        })

        .catch(error => {
            console.error('Error interacting with ChatGPT:', error)
            callback();
        });
}



const outfilePath = './outFile/已识别网站记录.xlsx';
const worksheetName = fullDate;
const worksheetData = [
    ['邮箱', '网站', '相关属性', "判定", '备注'],
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
    }


} else {

    console.log("表格不存在");
    // 调用函数创建 Excel 文件  创建新表
    createExcelFile(worksheetData, outfilePath, worksheetName);
    // 主函数
}

main()