import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE_URL = 'http://localhost:3000';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60) + '\n');
}

async function testHealthEndpoint() {
    logSection('Testing Health Check Endpoint');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        
        if (response.ok && data.status === 'ok') {
            log('✓ Health check passed', 'green');
            log(`  Status: ${data.status}`, 'blue');
            log(`  Message: ${data.message}`, 'blue');
            log(`  Timestamp: ${data.timestamp}`, 'blue');
            return true;
        } else {
            log('✗ Health check failed', 'red');
            return false;
        }
    } catch (error) {
        log(`✗ Health check error: ${error.message}`, 'red');
        return false;
    }
}

async function testPDFStatsEndpoint() {
    logSection('Testing PDF Stats Endpoint');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/pdf/stats`);
        const data = await response.json();
        
        if (response.ok) {
            log('✓ PDF stats retrieved successfully', 'green');
            log(`  Total Chunks: ${data.totalChunks}`, 'blue');
            log(`  Vector Size: ${data.vectorSize}`, 'blue');
            log(`  Has Data: ${data.hasData}`, 'blue');
            log(`  Collection: ${data.collectionName}`, 'blue');
            
            if (data.error) {
                log(`  Warning: ${data.error}`, 'yellow');
            }
            
            return true;
        } else {
            log('✗ PDF stats failed', 'red');
            log(`  Error: ${JSON.stringify(data)}`, 'red');
            return false;
        }
    } catch (error) {
        log(`✗ PDF stats error: ${error.message}`, 'red');
        return false;
    }
}

async function testChatEndpoint() {
    logSection('Testing Chat Endpoint');
    
    try {
        const testMessage = "What electrical services does BGE ELECTRIQUE provide?";
        
        log(`Sending message: "${testMessage}"`, 'blue');
        
        const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: testMessage,
                chatId: 'test-' + Date.now()
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.response) {
            log('✓ Chat endpoint working', 'green');
            log(`  Has Context: ${data.hasContext}`, 'blue');
            log(`  Response Preview: ${data.response.substring(0, 150)}...`, 'blue');
            log(`  Timestamp: ${data.timestamp}`, 'blue');
            return true;
        } else {
            log('✗ Chat endpoint failed', 'red');
            log(`  Error: ${JSON.stringify(data)}`, 'red');
            return false;
        }
    } catch (error) {
        log(`✗ Chat error: ${error.message}`, 'red');
        log(`  Stack: ${error.stack}`, 'red');
        return false;
    }
}

async function testPDFUploadEndpoint() {
    logSection('Testing PDF Upload Endpoint');
    
    try {
        // Try to find a test PDF
        const possiblePaths = [
            join(__dirname, 'test', 'data', 'codebook.pdf'),
            join(__dirname, 'codebook.pdf'),
            join(__dirname, 'backend', 'test', 'data', 'codebook.pdf')
        ];
        
        let pdfPath = null;
        for (const path of possiblePaths) {
            if (fs.existsSync(path)) {
                pdfPath = path;
                break;
            }
        }
        
        if (!pdfPath) {
            log('⚠ No test PDF found, skipping upload test', 'yellow');
            log('  Searched paths:', 'yellow');
            possiblePaths.forEach(p => log(`    - ${p}`, 'yellow'));
            return null;
        }
        
        log(`Using PDF: ${pdfPath}`, 'blue');
        
        const formData = new FormData();
        formData.append('pdf', fs.createReadStream(pdfPath));
        
        log('Uploading PDF (this may take a while)...', 'yellow');
        
        const response = await fetch(`${API_BASE_URL}/api/pdf/upload`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            log('✓ PDF upload successful', 'green');
            log(`  File Name: ${data.fileName}`, 'blue');
            log(`  Chunks Created: ${data.chunks}`, 'blue');
            return true;
        } else {
            log('✗ PDF upload failed', 'red');
            log(`  Error: ${JSON.stringify(data)}`, 'red');
            return false;
        }
    } catch (error) {
        log(`✗ PDF upload error: ${error.message}`, 'red');
        return false;
    }
}

async function testInvalidEndpoint() {
    logSection('Testing Invalid Endpoint (404 Handler)');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/invalid-endpoint`);
        const data = await response.json();
        
        if (response.status === 404 && data.error) {
            log('✓ 404 handler working correctly', 'green');
            log(`  Status: ${response.status}`, 'blue');
            log(`  Error Message: ${data.error}`, 'blue');
            return true;
        } else {
            log('✗ 404 handler not working as expected', 'red');
            return false;
        }
    } catch (error) {
        log(`✗ 404 test error: ${error.message}`, 'red');
        return false;
    }
}

async function testChatWithoutMessage() {
    logSection('Testing Chat Endpoint Validation');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: '',
                chatId: 'test-validation'
            })
        });
        
        const data = await response.json();
        
        if (response.status === 400 && data.error) {
            log('✓ Chat validation working correctly', 'green');
            log(`  Status: ${response.status}`, 'blue');
            log(`  Error Message: ${data.error}`, 'blue');
            return true;
        } else {
            log('✗ Chat validation not working as expected', 'red');
            return false;
        }
    } catch (error) {
        log(`✗ Chat validation test error: ${error.message}`, 'red');
        return false;
    }
}

// Main test runner
async function runAllTests() {
    log('\n🧪 BGE ELECTRIQUE Chatbot API Test Suite', 'cyan');
    log('Started at: ' + new Date().toISOString(), 'cyan');
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
    };
    
    const tests = [
        { name: 'Health Check', fn: testHealthEndpoint },
        { name: 'PDF Stats', fn: testPDFStatsEndpoint },
        { name: 'Chat Endpoint', fn: testChatEndpoint },
        { name: 'Chat Validation', fn: testChatWithoutMessage },
        { name: 'Invalid Endpoint (404)', fn: testInvalidEndpoint },
        { name: 'PDF Upload', fn: testPDFUploadEndpoint }
    ];
    
    for (const test of tests) {
        results.total++;
        const result = await test.fn();
        
        if (result === null) {
            results.skipped++;
        } else if (result) {
            results.passed++;
        } else {
            results.failed++;
        }
        
        // Add a small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Print summary
    logSection('Test Summary');
    log(`Total Tests: ${results.total}`, 'blue');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'blue');
    log(`Skipped: ${results.skipped}`, 'yellow');
    
    const successRate = ((results.passed / (results.total - results.skipped)) * 100).toFixed(1);
    log(`\nSuccess Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
    
    if (results.failed > 0) {
        log('\n⚠️  Some tests failed. Please check the errors above.', 'red');
        process.exit(1);
    } else {
        log('\n✅ All tests passed!', 'green');
        process.exit(0);
    }
}

// Run tests
runAllTests().catch(error => {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
