// Local storage simulation for accounts
let reportingAccounts = JSON.parse(localStorage.getItem('adBansAccounts')) || [];
let targetAccount = '';
let reportsSent = 0;
let reportsSuccessful = 0;
let reportsFailed = 0;
let isReporting = false;

// Simulated Instagram API functions
const simulateReport = (account) => {
    return new Promise((resolve) => {
        const successRate = 0.75; // 75% success rate
        const minDelay = 800;
        const maxDelay = 2000;
        
        setTimeout(() => {
            const success = Math.random() < successRate;
            resolve(success);
        }, minDelay + Math.random() * (maxDelay - minDelay));
    });
};

const simulateAccountCheck = (account) => {
    return new Promise((resolve) => {
        const delay = 1000;
        setTimeout(() => {
            // Simulate 90% chance account is still alive
            resolve(Math.random() < 0.9 ? 'ALIVE' : 'BANNED');
        }, delay);
    });
};

// DOM Elements
const accountsList = document.getElementById('accountsList');
const newAccountInput = document.getElementById('newAccount');
const targetAccountInput = document.getElementById('targetAccount');
const successCount = document.getElementById('successCount');
const failedCount = document.getElementById('failedCount');
const aliveStatus = document.getElementById('aliveStatus');
const progressFill = document.getElementById('progressFill');

// Render accounts list
const renderAccounts = () => {
    accountsList.innerHTML = '';
    reportingAccounts.forEach((account, index) => {
        const li = document.createElement('li');
        li.innerHTML = 
            <span>${account}</span>
            <button onclick="removeAccount(${index})">Remove</button>
        ;
        accountsList.appendChild(li);
    });
};

// Add new reporting account
function addAccount() {
    const account = newAccountInput.value.trim();
    if (account && !reportingAccounts.includes(account)) {
        reportingAccounts.push(account);
        localStorage.setItem('adBansAccounts', JSON.stringify(reportingAccounts));
        newAccountInput.value = '';
        renderAccounts();
    }
}

// Remove account
function removeAccount(index) {
    reportingAccounts.splice(index, 1);
    localStorage.setItem('adBansAccounts', JSON.stringify(reportingAccounts));
    renderAccounts();
}

// Start reporting process
function startReporting() {
    if (isReporting) return;
    
    targetAccount = targetAccountInput.value.trim();
    if (!targetAccount) return;
    
    isReporting = true;
    reportsSent = 0;
    reportsSuccessful = 0;
    reportsFailed = 0;
    
    // Reset UI
    successCount.textContent = '0';
    failedCount.textContent = '0';
    aliveStatus.textContent = 'CHECKING...';
    progressFill.style.width = '0%';
    
    // Start reporting loop
    reportLoop();
}

// Reporting loop
async function reportLoop() {
    if (!isReporting) return;
    
    // Check if target is still alive periodically
    if (reportsSent % 5 === 0) {
        const status = await simulateAccountCheck(targetAccount);
        aliveStatus.textContent = status;
        
        if (status === 'BANNED') {
            isReporting = false;
            targetAccountInput.value = '';
            alert(Target account ${targetAccount} has been BANNED!);
            return;
        }
    }
    
    // Use a random reporting account
    const account = reportingAccounts[Math.floor(Math.random() * reportingAccounts.length)];
    
    // Simulate report
    const success = await simulateReport(account);
    
    if (success) {
        reportsSuccessful++;
    } else {
        reportsFailed++;
    }
    
    reportsSent++;
    
    // Update UI
    successCount.textContent = reportsSuccessful;
    failedCount.textContent = reportsFailed;
    progressFill.style.width = ${Math.min(100, reportsSent / 10)}%;
    
    // Continue reporting
    setTimeout(reportLoop, 500);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderAccounts();
    if (reportingAccounts.length === 0) {
        alert('Add reporting accounts first!');
    }
});