import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000';

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testChatAPI() {
    log('\n🤖 BGE ELECTRIQUE Chatbot Functionality Test', 'cyan');
    log('='.repeat(60), 'cyan');
    
    const testQueries = [
        {
            question: "What electrical services does BGE ELECTRIQUE provide?",
            description: "General services inquiry"
        },
        {
            question: "Tell me about electrical installation services",
            description: "Specific service inquiry"
        },
        {
            question: "What are the safety requirements for electrical work?",
            description: "Technical inquiry"
        }
    ];
    
    let passedTests = 0;
    let totalTests = testQueries.length;
    
    for (let i = 0; i < testQueries.length; i++) {
        const test = testQueries[i];
        
        log(`\n📝 Test ${i + 1}/${totalTests}: ${test.description}`, 'yellow');
        log(`Question: "${test.question}"`, 'blue');
        log('─'.repeat(60), 'cyan');
        
        try {
            const startTime = Date.now();
            
            const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: test.question,
                    chatId: `test-${Date.now()}`
                })
            });
            
            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            if (response.ok && data.response) {
                passedTests++;
                log(`✅ SUCCESS (${responseTime}ms)`, 'green');
                log(`\nResponse Preview:`, 'magenta');
                log(`${data.response.substring(0, 200)}...`, 'reset');
                log(`\nMetadata:`, 'blue');
                log(`  - Has Context from RAG: ${data.hasContext ? 'Yes ✓' : 'No ✗'}`, data.hasContext ? 'green' : 'yellow');
                log(`  - Response Length: ${data.response.length} characters`, 'blue');
                log(`  - Timestamp: ${data.timestamp}`, 'blue');
            } else {
                log(`❌ FAILED`, 'red');
                log(`Status: ${response.status}`, 'red');
                log(`Error: ${JSON.stringify(data, null, 2)}`, 'red');
            }
            
        } catch (error) {
            log(`❌ ERROR: ${error.message}`, 'red');
            if (error.stack) {
                log(`Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`, 'red');
            }
        }
        
        // Wait between requests
        if (i < testQueries.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 Test Results Summary', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`Total Tests: ${totalTests}`, 'blue');
    log(`Passed: ${passedTests}`, 'green');
    log(`Failed: ${totalTests - passedTests}`, totalTests - passedTests > 0 ? 'red' : 'blue');
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    log(`\nSuccess Rate: ${successRate}%`, successRate >= 100 ? 'green' : 'yellow');
    
    if (passedTests === totalTests) {
        log('\n🎉 All chatbot tests passed! The API is working correctly.', 'green');
        return true;
    } else {
        log(`\n⚠️  ${totalTests - passedTests} test(s) failed.`, 'red');
        return false;
    }
}

// Run the test
console.log('\n🚀 Starting Chatbot Functionality Test...\n');

testChatAPI()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });
