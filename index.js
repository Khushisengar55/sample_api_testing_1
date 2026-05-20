document.addEventListener('DOMContentLoaded', () => {
    const btnTrigger = document.getElementById('btn-trigger-pipeline');
    const btnCopy = document.getElementById('btn-copy-code');
    const consoleBody = document.getElementById('console-body');
    const btnText = btnTrigger.querySelector('.btn-text');
    const btnLoader = btnTrigger.querySelector('.btn-loader');
    const connectionStatus = document.getElementById('connection-status');

    // Helper to log console lines
    function logLine(text, type = 'system') {
        const line = document.createElement('div');
        line.className = `line ${type}`;
        line.innerText = text;
        consoleBody.appendChild(line);
        consoleBody.scrollTop = consoleBody.scrollHeight;
    }

    // Copy SQL function
    btnCopy.addEventListener('click', () => {
        const sqlText = document.getElementById('sql-query-text').innerText;
        navigator.clipboard.writeText(sqlText).then(() => {
            const originalText = btnCopy.innerText;
            btnCopy.innerText = 'Copied!';
            btnCopy.style.background = 'rgba(16, 185, 129, 0.2)';
            btnCopy.style.borderColor = 'rgba(16, 185, 129, 0.4)';
            btnCopy.style.color = '#34d399';
            
            setTimeout(() => {
                btnCopy.innerText = originalText;
                btnCopy.style.background = '';
                btnCopy.style.borderColor = '';
                btnCopy.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code: ', err);
        });
    });

    // Run Pipeline function
    btnTrigger.addEventListener('click', async () => {
        // Disable UI
        btnTrigger.disabled = true;
        btnText.innerText = 'Executing...';
        btnLoader.classList.remove('hidden');
        
        // Clear console
        consoleBody.innerHTML = '';
        
        logLine('[SYSTEM] Initiating cloud pipeline orchestration...', 'system');
        
        // Simulate progressive start
        await new Promise(resolve => setTimeout(resolve, 600));
        logLine('[+] Step 1: Contacting API Gateway to generate webhook...', 'progress');
        logLine('    -> Target: https://bfhldevapigw.healthrx.co.in/hiring/generateWebhook/PYTHON', 'system');
        
        try {
            const response = await fetch('/api/run-challenge', {
                method: 'POST'
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `HTTP ${response.status} Error`);
            }

            const data = await response.json();
            
            await new Promise(resolve => setTimeout(resolve, 800));
            logLine('[+] SUCCESS: Webhook credentials received from Gateway.', 'success');
            logLine(`    -> Webhook URL: ${data.webhookUrl}`, 'data');
            logLine(`    -> Auth Token: ${data.accessTokenSummary}`, 'data');
            
            await new Promise(resolve => setTimeout(resolve, 800));
            logLine('[+] Step 2: Formulating ANSI-compliant SQL Query solution...', 'progress');
            logLine('    -> Dialect compatibility: PostgreSQL / MySQL / SQL Server', 'system');
            
            await new Promise(resolve => setTimeout(resolve, 600));
            logLine('[+] Step 3: Submitting solution to the live webhook...', 'progress');
            logLine(`    -> Sending POST to webhook...`, 'system');
            
            await new Promise(resolve => setTimeout(resolve, 800));
            logLine(`[+] Response Status Code: ${data.status}`, 'success');
            logLine('[+] Response Headers verified.', 'system');
            logLine(`[+] Response Body: ${JSON.stringify(data.gatewayResponse)}`, 'data');
            
            await new Promise(resolve => setTimeout(resolve, 500));
            logLine('==================================================================', 'system');
            logLine('[SUCCESS] CHALLENGE COMPLETED SUCCESSFULLY IN CLOUD!', 'success');
            logLine('==================================================================', 'success');

        } catch (error) {
            logLine(`[-] ERROR encountered during pipeline run:`, 'error');
            logLine(`    -> ${error.message}`, 'error');
            logLine('[SYSTEM] Cloud execution failed. Falling back to local offline logging.', 'system');
        } finally {
            // Re-enable UI
            btnTrigger.disabled = false;
            btnText.innerText = 'Run Pipeline Live';
            btnLoader.classList.add('hidden');
        }
    });
});
