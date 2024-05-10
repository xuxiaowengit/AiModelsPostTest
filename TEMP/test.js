const XLSX = require('xlsx');
const {
    writeToExcel,
    appendDataToExcel,
    appendToExcel,
    createExcelFile,
    worksheetExists
} = require('../outFile');
// function appendOrCreateWorksheetWithData(filePath, worksheetName, firstRowData) {
//     let workbook;
//     try {
//         workbook = XLSX.readFile(filePath);
//     } catch (error) {
//         // 如果文件不存在或读取失败，则创建一个新的工作簿


//         workbook = XLSX.utils.book_new();
//     }

//     // 检查工作表是否存在  
//     let ws = workbook.Sheets[worksheetName]; // 使用Sheets属性来获取工作表  

//     // 如果工作表不存在，则创建它  
//     if (!ws) {
//         ws = workbook.addSheet(worksheetName); // 使用addSheet来添加工作表  

//         // 写入第一行数据  
//         const range = XLSX.utils.aoa_to_sheet([firstRowData]); // 将数组转换为工作表单元格  
//         ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: firstRowData.length - 1 } }); // 更新工作表的引用范围  

//         // 将新创建的工作表添加到工作簿中（通常addSheet已经做了这一步，但这里为了明确性）  
//         // 在这个例子中，addSheet已经返回了新创建的工作表并将其添加到了workbook.Sheets中  
//     }

//     // 如果需要追加数据到工作表（不是本例的重点），你需要处理这个逻辑  

//     // 保存工作簿到文件  
//     XLSX.writeFile(workbook, filePath);
// }



// // 示例用法  
// let filePath = './outFile/web.xlsx'; // 假设的Excel文件路径  
// let worksheetName = 'today'; // 工作表名称  
// let firstRowData = ['example@email.com', 'https://example.com', 'some property', 'positive', 'note about this row']; // 假设的第一行数据  

// appendOrCreateWorksheetWithData(filePath, worksheetName, firstRowData);

// module.exports = {
//     appendOrCreateWorksheetWithData // 导出函数，以便在其他模块中使用  
// };

const outfilePath = './outFile/已识别网站记录.xlsx';


// 加载工作簿  
const workbook = XLSX.readFile(outfilePath); // 替换为你的工作簿路径  

// 检查是否存在名为 'Sheet1' 的工作表  
const sheetExists = worksheetExists(workbook, '2024-05-09');
console.log(`Sheet1 是否存在: ${sheetExists}`);