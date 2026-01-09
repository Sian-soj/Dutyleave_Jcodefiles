async function testApi() {
    console.log("Testing POST /api/update...");
    try {
        const response = await fetch('http://localhost:3000/api/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                range: "Sheet1!E2",
                value: "API_TEST"
            })
        });

        const result = await response.json();
        console.log(`Status: ${response.status}`);
        console.log("Response:", result);

        if (response.ok) {
            console.log("✅ API Test Passed!");
        } else {
            console.log("❌ API Test Failed.");
        }
    } catch (error) {
        console.error("❌ API Test Network Error:", error.message);
    }
}

testApi();
