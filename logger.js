const fs = require('fs');
const path = require('path');

// 生成日志函数
function generateLog(logFilePath, message) {
    // 获取当前时间
    const timestamp = new Date().toISOString();
    // 构造日志内容
    const logMessage = `${timestamp}: ${message}\n`;

    // 将日志内容写入日志文件
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        } else {
            console.log('Log message written to log file:', logMessage.trim());
        }
    });
}

// 导出日志函数，使其可以在其他文件中使用
module.exports = generateLog;
