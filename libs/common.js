function setCookie(cname, cvalue, exdays)
{
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname)
{
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) 
    {
        let c = ca[i];
        while (c.charAt(0) == ' ') 
        {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) 
        {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// From: https://portswigger.net/web-security/cross-site-scripting/preventing

function htmlEncode(str)
{
    return String(str).replace(/[^\w. ]/gi, function(c){
        return '&#'+c.charCodeAt(0)+';';
    });
}

// Function to call an API and generate an HTML table
async function fetchAndGenerateTable(apiUrl, tableContainerId)
{
    // Fetch the JSON data from the API
    const response = await fetch(apiUrl);
    if (!response.ok) 
    {
        throw new Error(`API call failed with status: ${response.status}`);
    }
    const jsonData = await response.json();

    // Create the table and its header row dynamically
    const table = document.createElement("table");
    table.border = "1";
    table.classList.add('table');
    table.classList.add('table-striped');

    // Assuming JSON data is an array of objects
    const tableHeader = document.createElement("thead");
    const headerRow = document.createElement("tr");

    // Add table header based on JSON keys
    const keys = Object.keys(jsonData[0]); // Take keys from the first object
    keys.forEach((key) => {
        const th = document.createElement("th");
        th.textContent = key.replace(/_/g," ");
        th.classList.add('text-capitalize');
        headerRow.appendChild(th);
    });

    tableHeader.appendChild(headerRow);
    table.appendChild(tableHeader);

    // Populate table rows with the JSON data
    const tableBody = document.createElement("tbody");
    jsonData.forEach((item) => {
        const row = document.createElement("tr");
        keys.forEach((key) => {
            const cell = document.createElement("td");
            cell.textContent = item[key];
            row.appendChild(cell);
        });
        tableBody.appendChild(row);
    });

    table.appendChild(tableBody);

    // Append the table to the specified container in the DOM
    const tableContainer = document.getElementById(tableContainerId);
    tableContainer.innerHTML = ""; // Clear any existing content
    tableContainer.appendChild(table);
}

async function getCurrentUserId(elementid)
{
    try
    {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (!res.ok)
        {
            // 401 or other error
            console.warn('User not logged in');
        }
        const id = await res.json();
        const userid = id.username;
        elementid.innerHTML = "";
        elementid.innerHTML = userid;
    }
    catch (err) 
    {
        console.error('Fetch error:', err);
    }
}

