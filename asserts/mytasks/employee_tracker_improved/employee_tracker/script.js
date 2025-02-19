
document.getElementById('fileUpload').addEventListener('change', handleFile);
document.getElementById('exportExcel').addEventListener('click', exportToExcel);
document.getElementById('exportJson').addEventListener('click', exportToJson);

let tableData = [];

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        tableData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        displayTable(tableData);
    };
    reader.readAsArrayBuffer(file);
}

function displayTable(data) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    data.slice(1).forEach((row, index) => {
        const tr = document.createElement('tr');
        row.forEach((cell) => {
            const td = document.createElement('td');
            td.textContent = cell || '';
            tr.appendChild(td);
        });
        const actionTd = document.createElement('td');
        actionTd.innerHTML = '<button onclick="editRow(' + index + ')">Edit</button>';
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

function exportToExcel() {
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'EmployeeData.xlsx');
}

function exportToJson() {
    const json = JSON.stringify(tableData.slice(1).map(row => {
        return tableData[0].reduce((acc, key, i) => ({ ...acc, [key]: row[i] }), {});
    }));
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EmployeeData.json';
    a.click();
    URL.revokeObjectURL(url);
}

function editRow(index) {
    alert('Edit functionality for row ' + index);
}
