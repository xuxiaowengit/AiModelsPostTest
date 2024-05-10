// excel-writer.js  
const XLSX = require('xlsx');
const fs = require('fs').promises; // 使用 fs 的 promises API  

// 封装写入Excel文件的函数  
// function writeToExcel(data, workbookName) {
//     // 创建一个新的工作簿  
//     const workbook = XLSX.utils.book_new();

//     // 假设数据是一个二维数组  
//     // 转换数据为工作表  
//     const worksheet = XLSX.utils.aoa_to_sheet(data);

//     // 添加工作表到工作簿  
//     XLSX.utils.book_append_sheet(workbook, worksheet, workbookName);

//     // 将工作簿写入文件  
//     XLSX.writeFile(workbook, workbookName);

//     console.log(`Excel文件 ${workbookName} 已生成！`);
// }



// const fs = require('fs');
// 将文本保存到文件的函数
function saveTextToFile(text, filePath) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, text, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}



// 追加数据到工作表
function appendToExcel(filePath, worksheetName, data) {
    // 读取现有的工作簿  
    const workbook = XLSX.readFile(filePath);

    // 检查是否已经存在同名的工作表  
    if (!workbook.Sheets[worksheetName]) {
        // 创建一个新的工作表对象  
        const ws = XLSX.utils.aoa_to_sheet(data); // 假设data是一个二维数组  

        // 将新的工作表添加到工作簿的Sheets对象中  
        workbook.Sheets[worksheetName] = ws;

        // 更新工作簿的Sheet Names  
        if (!workbook.SheetNames.includes(worksheetName)) {
            workbook.SheetNames.push(worksheetName);
        }
    } else {
        // 如果工作表已存在，你需要找到最后一行，并将数据追加到那里  
        const ws = workbook.Sheets[worksheetName];

        // 找到最后一行的索引（假设数据从第一行开始，并且没有空行）  
        let lastRow = 1; // 假设第一行是表头，从第二行开始是数据  
        for (let cellAddress in ws) {
            if (cellAddress.startsWith('A')) { // 只检查A列来确定行数  
                const rowNum = XLSX.utils.decode_cell(cellAddress).r;
                if (rowNum >= lastRow) {
                    lastRow = rowNum + 1; // 下一行是要追加数据的行  
                }
            }
        }

        // 追加数据到工作表  
        data.forEach((row, rowIndex) => {
            row.forEach((cellValue, colIndex) => {
                const cellAddress = XLSX.utils.encode_cell({ r: lastRow + rowIndex, c: colIndex }); // 减去1是因为我们从lastRow开始  
                ws[cellAddress] = { t: 's', v: cellValue }; // 假设数据是字符串类型  
            });
        });

        // 更新工作表的引用范围（可选，但推荐）  
        if (!ws['!ref']) {
            ws['!ref'] = 'A1';
        }
        const range = XLSX.utils.decode_range(ws['!ref']);
        ws['!ref'] = XLSX.utils.encode_range({ s: { r: range.s.r, c: range.s.c }, e: { r: lastRow + data.length - 1, c: range.e.c } }); // 减去2是因为我们已经考虑了表头和最后一行的索引  
    }

    // 写入文件  
    XLSX.writeFile(workbook, filePath);
}




// 封装创建 Excel 文件的函数  
function createExcelFile(data, outputPath, SheetName) {
    // 创建一个新的工作簿（Workbook）  
    const workbook = XLSX.utils.book_new();

    // 将数据转换为工作表对象  
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // 命名工作表（可选）  
    worksheet['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: data.length - 1, c: data[0].length - 1 }
    });

    // 将工作表追加到工作簿  
    XLSX.utils.book_append_sheet(workbook, worksheet, SheetName);
    // XLSX.utils.book_append_sheet(workbook, worksheet2, SheetName);  

    // 写入文件  
    XLSX.writeFile(workbook, outputPath);

    console.log(`新Excel文件已创建：${outputPath}`);
}



// 判断工作簿中是否存在某个工作表名  
function worksheetExists(workbook, sheetName) {
    // 获取工作簿中的所有工作表名  
    const sheetNames = workbook.SheetNames;

    // 遍历工作表名，检查是否存在指定的工作表名  
    for (let i = 0; i < sheetNames.length; i++) {
        if (sheetNames[i] === sheetName) {
            return true; // 如果找到，返回 true  
        }
    }

    return false; // 如果没有找到，返回 false  
}


// 追加工作表
function appendWorksheetToFile(inputFile, outputFile, sheetName, worksheetData) {
    // 读取现有的 Excel 文件  
    const workbook = XLSX.readFile(inputFile);

    // 转换数组数据为工作表对象  
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // 追加新的工作表到工作簿  
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 写入新的工作簿到文件  
    const writeOpts = { bookType: 'xlsx', type: 'buffer' };
    const out = XLSX.write(workbook, writeOpts);

    // 使用 fs 模块将缓冲区写入文件  
    fs.writeFile(outputFile, out, 'binary', function (err) {
        if (err) throw err;
        console.log(`新的工作表已追加到文件：${outputFile}`);
    });
}





// 导出模块  
module.exports = {
    // writeToExcel,
    saveTextToFile,
    // appendDataToExcel,
    appendToExcel,
    createExcelFile,
    worksheetExists,
    appendWorksheetToFile
    // checkFileExists
};