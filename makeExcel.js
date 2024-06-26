// 获取今天的日期  
var today = new Date();
const XLSX = require('xlsx');
const generateLog = require('./logger'); //日志模块
const path = require('path');
// 输出excel表格模块
const {
    // writeToExcel,
    // appendDataToExcel,
    createExcelFile,
    worksheetExists,
    // checkFileExists,
    appendWorksheetToFile
} = require('./outFile');


// const httpClient = require("./axios");
const fs = require('fs');
// 日志模块初始化
const logFilePath = path.join(__dirname, './log/appRun.log'); // 日志文件路径

// const { saveTextToFile } = require('./outFile'); //保存txt模块
// const interactWithChatGPT = require('./chatAPI');
// var year = today.getFullYear();
// var month = (today.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回的月份是从 0 开始的，所以需要加 1，并用 padStart 填充前导零  
// var day = today.getDate().toString().padStart(2, '0'); // getDate() 返回的是日期，不需要加 1
// var hours = today.getHours();
// var fullDate = year + '-' + month + '-' + day;
// var dayHour = year + '-' + month + '-' + day + "-" + hours;;


module.exports.asyncFunction = function (data, options, callback) {
    // console.log("test:", options)

    // var outfilePath = options.filePath
    // const message = 'This is  system log,下面是本次(' + `${options.nowTime}` + ')系统运行日志：'; // 要记录的日志消息
    // generateLog(logFilePath, message);

    // 模拟异步操作  

    setTimeout(() => {

        // const worksheetName = options.fullDate;
        const worksheetName = options.dayHour;
        const worksheetData = [
            ['邮箱', '网站', '相关属性', "判定", '备注', '时间'],
        ];

        // 本地处理结果表文件存在否
        if (fs.existsSync(options.outfilePath)) {
            console.log("表1已经存在", worksheetName);
            const workbook = XLSX.readFile(options.outfilePath); // 替换为你的工作簿路径
            // 检查是否存在名为 'xxx' 的工作表  
            const sheetExists = worksheetExists(workbook, worksheetName);
            if (sheetExists) {
                // console.log(`${worksheetName} 是否存在: ${sheetExists}`);
                console.log("工作表1表名存在,数据直接追加到工作表:", worksheetName)
            } else {
                // console.log("工作表1在,表名不存在,新建立工作表:", worksheetName)
                // 调用模块函数，追加工作表  
                appendWorksheetToFile(
                    options.outfilePath, // 现有工作簿的路径
                    options.outfilePath, // 更新后工作簿的路径
                    worksheetName, // 新工作表的名称  
                    worksheetData // 新工作表的数据  
                );
                today = new Date();
                milliseconds = today.getMilliseconds();
                generateLog(logFilePath, '工作表1存在,表名不存在,新建立工作表' + `--${options.nowTime}`);
            }

        } else {
            // console.log("表格1不存在");
            // 调用函数创建 Excel 文件  创建新表
            console.log(worksheetData, options.outfilePath, worksheetName)
            createExcelFile(worksheetData, options.outfilePath, worksheetName);
            today = new Date();
            milliseconds = today.getMilliseconds();
            generateLog(logFilePath, '表1文件不存在,新建立表文件' + `--${options.nowTime}`);
            // 主函数
        }


        // const outfilePath2   = 'C:\\Users\\LYZ\\Desktop\\AI分析结果\\首轮处理失败记录.xlsx'; //./outExe/首轮识别失败记录.xlsx';
        // const outfilePath2 = 'C:\\Users\\jeking\\Desktop\\AI分析结果\\第二批首轮识别失败记录.xlsx';
        // var outfilePath = 'C:\\Users\\Administrator\\Desktop\\AI分析结果\\首轮识别失败记录.xlsx' //C: \\Users\\LYZ\\Desktop\\AI分析结果\\
        const worksheetName2 = options.dayHour;
        const worksheetData2 = [
            ['邮箱', '网站', '关键词', '相关属性', '判断结论'],
        ];
        // 本地处理异常结果表文件存在否
        if (fs.existsSync(options.outfilePath2)) {
            console.log("表2已经存在", options.outfilePath2);
            const workbook = XLSX.readFile(options.outfilePath2); // 替换为你的工作簿路径
            // 检查是否存在名为 'xxx' 的工作表  
            const sheetExists = worksheetExists(workbook, worksheetName2);
            if (sheetExists) {
                // console.log(`${worksheetName} 是否存在: ${sheetExists}`);
                console.log("工作表2名存在,数据直接追加到工作表:", worksheetName2)
            } else {
                // 调用模块函数，追加工作表  
                appendWorksheetToFile(
                    options.outfilePath2, // 现有工作簿的路径
                    options.outfilePath2, // 更新后工作簿的路径
                    worksheetName2, // 新工作表的名称  
                    worksheetData2 // 新工作表的数据  
                );
                today = new Date();
                milliseconds = today.getMilliseconds();
                generateLog(logFilePath, '工作表2在,表名' + `${worksheetName2}` + '不存在,新建立工作表' + `--${options.nowTime}`);
            }

        } else {
            // console.log("表格2不存在");
            // 调用函数创建 Excel 文件  创建新表
            createExcelFile(worksheetData2, options.outfilePath2, worksheetName2);
            today = new Date();
            milliseconds = today.getMilliseconds();
            generateLog(logFilePath, '表2文件不存在,新建立表文件' + `--${options.nowTime}`);
        }
        callback(null, data + ' 异步回调执行完毕返回');
    }, 1);

};