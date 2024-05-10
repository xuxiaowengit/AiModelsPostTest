// const fs = require('fs');
const fs = require('fs').promises;

// 读取文本文件的函数
function readTextFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}


// excel-reader.js (异步版本)  
const XLSX = require('xlsx');

async function readExcelFile(filePath, options = { header: 1 }) {
    // 异步读取文件内容  
    const fileBuffer = await fs.readFile(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // 获取第一个工作表（Sheet）  
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];

    // 将工作表转换为JSON对象数组  
    const jsonData = XLSX.utils.sheet_to_json(worksheet, options);

    // 返回JSON数据  
    return jsonData;
}

// 导出模块  
module.exports = {
    readExcelFile,
    readTextFile
};