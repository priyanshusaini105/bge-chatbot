import fetch from 'node-fetch';

async function testChat() {
    try {
        console.log('🤖 Testing chat with PDF context...\n');
        
        const response = await fetch('http://localhost:3000/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'What is this document about? Give me a brief summary.',
                conversationHistory: []
            })
        });

        const text = await response.text();
        console.log('📥 Response status:', response.status);
        console.log('📥 Response body:', text);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = JSON.parse(text);
        
        console.log('✅ Chat Response:');
        console.log('━'.repeat(80));
        console.log(data.response);
        console.log('━'.repeat(80));
        console.log(`\n📊 Used Context: ${data.contextUsed ? 'YES' : 'NO'}`);
        
    } catch (error) {
        console.error('❌ Chat test failed:', error.message);
    }
}

testChat();
