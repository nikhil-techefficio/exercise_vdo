
document.getElementById('fileUpload').addEventListener('change', handleFile);
document.getElementById('exportExcel').addEventListener('click', exportToExcel);
document.getElementById('exportJson').addEventListener('click', exportToJson);
document.getElementById('filterBtn').addEventListener('click', applyFilters);

let tableData = [];
let originalData = [];

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
        originalData = [...tableData];
        populateTable(tableData);
        populateFilters(tableData);
    };
    reader.readAsArrayBuffer(file);
}

function populateTable(data) {
    const table = document.getElementById('dataTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    thead.innerHTML = '';
    tbody.innerHTML = '';

    // Create table headers dynamically
    if (data.length > 0) {
        const headerRow = document.createElement('tr');
        data[0].forEach((header) => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        headerRow.innerHTML += '<th>Action</th>';
        thead.appendChild(headerRow);
    }

    // Create table rows dynamically
    data.slice(1).forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((cell) => {
            const td = document.createElement('td');
            td.textContent = cell || '';
            tr.appendChild(td);
        });

        // Add Edit button
        const actionTd = document.createElement('td');
        actionTd.innerHTML = `<button onclick="editRow(${rowIndex})">Edit</button>`;
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

function populateFilters(data) {
    if (data.length < 2) return;

    const headers = data[0];
    const rows = data.slice(1);

    // Populate Employee Filter
    const employeeIndex = headers.indexOf('Employee Name');
    const employeeFilter = document.getElementById('employeeFilter');
    employeeFilter.innerHTML = '<option value="all">All Employees</option>';
    if (employeeIndex !== -1) {
        const uniqueEmployees = [...new Set(rows.map((row) => row[employeeIndex]))].filter(Boolean);
        uniqueEmployees.forEach((employee) => {
            const option = document.createElement('option');
            option.value = employee;
            option.textContent = employee;
            employeeFilter.appendChild(option);
        });
    }

    // Populate Project Filter
    const projectIndex = headers.indexOf('Project');
    const projectFilter = document.getElementById('projectFilter');
    projectFilter.innerHTML = '<option value="all">All Projects</option>';
    if (projectIndex !== -1) {
        const uniqueProjects = [...new Set(rows.map((row) => row[projectIndex]))].filter(Boolean);
        uniqueProjects.forEach((project) => {
            const option = document.createElement('option');
            option.value = project;
            option.textContent = project;
            projectFilter.appendChild(option);
        });
    }
}

function applyFilters() {
    const employeeFilter = document.getElementById('employeeFilter').value;
    const projectFilter = document.getElementById('projectFilter').value;
    const headers = tableData[0];

    const filteredData = originalData.filter((row, index) => {
        if (index === 0) return true; // Include header row

        const employeeMatches = employeeFilter === 'all' || row[headers.indexOf('Employee Name')] === employeeFilter;
        const projectMatches = projectFilter === 'all' || row[headers.indexOf('Project')] === projectFilter;

        return employeeMatches && projectMatches;
    });

    populateTable(filteredData);
}

function editRow(rowIndex) {
    const table = document.getElementById('dataTable');
    const tbody = table.querySelector('tbody');
    const row = tbody.children[rowIndex];
    const cells = Array.from(row.children);

    if (cells[cells.length - 1].textContent === 'Edit') {
        cells.forEach((cell, index) => {
            if (index < cells.length - 1) {
                const input = document.createElement('input');
                input.value = cell.textContent;
                cell.textContent = '';
                cell.appendChild(input);
            }
        });
        cells[cells.length - 1].innerHTML = '<button onclick="saveRow(' + rowIndex + ')">Save</button>';
    }
}

function saveRow(rowIndex) {
    const table = document.getElementById('dataTable');
    const tbody = table.querySelector('tbody');
    const row = tbody.children[rowIndex];
    const cells = Array.from(row.children);

    const updatedRow = cells.slice(0, -1).map((cell) => {
        const input = cell.querySelector('input');
        const value = input.value;
        cell.textContent = value;
        return value;
    });

    tableData[rowIndex + 1] = updatedRow;
    cells[cells.length - 1].innerHTML = '<button onclick="editRow(' + rowIndex + ')">Edit</button>';
}

function exportToExcel() {
    const ws = XLSX.utils.aoa_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'EmployeeData.xlsx');
}

function exportToJson() {
    const json = JSON.stringify(tableData.slice(1).map((row) => {
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
