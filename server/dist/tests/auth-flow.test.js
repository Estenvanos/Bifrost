"use strict";
/**
 * Authentication Flow Test
 *
 * This test demonstrates:
 * 1. Signing in with credentials
 * 2. Extracting the access token
 * 3. Using the token to call the getMe endpoint
 *
 * To run: npx tsx tests/auth-flow.test.ts
 * (Make sure the server is running on port 4000 first)
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const BASE_URL = "http://localhost:4000";
// Test user credentials (from seed.ts)
const TEST_USER = {
    email: "john@customer.com",
    password: "Customer@123",
};
/**
 * Test 1: Sign In
 */
function testSignIn() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n🔐 Testing Sign In...");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        try {
            const response = yield fetch(`${BASE_URL}/api/auth/signin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(TEST_USER),
            });
            const data = yield response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Success: ${data.success}`);
            console.log(`Message: ${data.message}`);
            console.log(`\nUser Data:`);
            console.log(`  ID: ${data.data.user._id}`);
            console.log(`  Username: ${data.data.user.username}`);
            console.log(`  Email: ${data.data.user.email}`);
            console.log(`  Type: ${data.data.user.type}`);
            console.log(`\nAccess Token: ${data.data.accessToken.substring(0, 50)}...`);
            if (!response.ok || !data.success) {
                throw new Error(`Sign in failed: ${data.message || response.statusText}`);
            }
            console.log("\n✅ Sign In Test Passed!\n");
            return data.data.accessToken;
        }
        catch (error) {
            console.error("\n❌ Sign In Test Failed:", error);
            throw error;
        }
    });
}
/**
 * Test 2: Get Me (with access token)
 */
function testGetMe(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n👤 Testing Get Me (with token)...");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        try {
            const response = yield fetch(`${BASE_URL}/api/auth/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            const data = yield response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Success: ${data.success}`);
            console.log(`\nUser Data:`);
            console.log(`  ID: ${data.data.user._id}`);
            console.log(`  Username: ${data.data.user.username}`);
            console.log(`  Email: ${data.data.user.email}`);
            console.log(`  Type: ${data.data.user.type}`);
            console.log(`  Created: ${new Date(data.data.user.createdAt).toLocaleString()}`);
            console.log(`  Updated: ${new Date(data.data.user.updatedAt).toLocaleString()}`);
            if (!response.ok || !data.success) {
                throw new Error(`Get me failed: ${response.statusText}`);
            }
            console.log("\n✅ Get Me Test Passed!\n");
        }
        catch (error) {
            console.error("\n❌ Get Me Test Failed:", error);
            throw error;
        }
    });
}
/**
 * Test 3: Get Me Without Token (should fail)
 */
function testGetMeWithoutToken() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n🚫 Testing Get Me WITHOUT token (should fail)...");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        try {
            const response = yield fetch(`${BASE_URL}/api/auth/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = yield response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Success: ${data.success}`);
            console.log(`Message: ${data.message}`);
            if (response.status === 401 && !data.success) {
                console.log("\n✅ Correctly rejected request without token!\n");
            }
            else {
                throw new Error("Expected 401 Unauthorized, but got different response");
            }
        }
        catch (error) {
            console.error("\n❌ Test Failed:", error);
            throw error;
        }
    });
}
/**
 * Main test runner
 */
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n" + "=".repeat(50));
        console.log("🧪 AUTH FLOW INTEGRATION TESTS");
        console.log("=".repeat(50));
        console.log(`\nTesting against: ${BASE_URL}`);
        console.log(`Credentials: ${TEST_USER.email}`);
        try {
            // Test 1: Sign in and get token
            const accessToken = yield testSignIn();
            // Test 2: Use token to get user data
            yield testGetMe(accessToken);
            // Test 3: Try without token (should fail)
            yield testGetMeWithoutToken();
            // Summary
            console.log("\n" + "=".repeat(50));
            console.log("✅ ALL TESTS PASSED!");
            console.log("=".repeat(50) + "\n");
            process.exit(0);
        }
        catch (error) {
            console.log("\n" + "=".repeat(50));
            console.log("❌ TESTS FAILED!");
            console.log("=".repeat(50) + "\n");
            console.error("Error:", error);
            process.exit(1);
        }
    });
}
// Check if server is running
function checkServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${BASE_URL}/health`);
            if (!response.ok)
                throw new Error("Server not responding");
            return true;
        }
        catch (error) {
            console.error("\n❌ Cannot connect to server!");
            console.error("Make sure the server is running on", BASE_URL);
            console.error("Start it with: npm run dev\n");
            process.exit(1);
        }
    });
}
// Run the tests
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield checkServer();
    yield runTests();
}))();
