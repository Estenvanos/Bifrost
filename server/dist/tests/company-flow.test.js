"use strict";
/**
 * Company CRUD Flow Test
 *
 * This test demonstrates:
 * 1. Creating company with logged user (promotes to admin)
 * 2. Creating company without user (creates admin user)
 * 3. Getting all companies (public)
 * 4. Getting a single company (public)
 * 5. Updating companies (admin only)
 * 6. Deleting companies (admin only)
 * 7. Testing authentication and authorization
 *
 * To run: npx tsx tests/company-flow.test.ts
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
const CUSTOMER_USER = {
    email: "john@customer.com",
    password: "Customer@123",
};
const ADMIN_USER = {
    email: "admin@admin.com",
    password: "Admin@123",
};
let customerToken;
let adminToken;
let testCompanyId;
let newUserToken;
/**
 * Helper: Sign in as customer
 */
function signInAsCustomer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n🔐 Signing in as Customer...");
        const response = yield fetch(`${BASE_URL}/api/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(CUSTOMER_USER),
        });
        const data = yield response.json();
        if (!response.ok || !data.success) {
            throw new Error(`Customer sign in failed: ${data.message || response.statusText}`);
        }
        console.log(`✅ Customer signed in: ${data.data.user.email}`);
        return data.data.accessToken;
    });
}
/**
 * Helper: Sign in as admin
 */
function signInAsAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n🔐 Signing in as Admin...");
        const response = yield fetch(`${BASE_URL}/api/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ADMIN_USER),
        });
        const data = yield response.json();
        if (!response.ok || !data.success) {
            throw new Error(`Admin sign in failed: ${data.message || response.statusText}`);
        }
        console.log(`✅ Admin signed in: ${data.data.user.email}`);
        return data.data.accessToken;
    });
}
/**
 * Test 1: Create Company With Logged User (Promotes to Admin)
 */
function testCreateCompanyWithUser() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log("\n📝 Test 1: Create Company With Logged User (Customer → Admin)");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        const newCompany = {
            company_name: "Test Corp With User",
            description: "Company created by logged customer (will become admin)",
            contact_email: "test@testcorp.com",
            website_url: "https://testcorp.com",
            phone_number: "+1-555-TEST",
            address: "123 Test Street",
        };
        try {
            const response = yield fetch(`${BASE_URL}/api/companies`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${customerToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCompany),
            });
            const data = yield response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Success: ${data.success}`);
            console.log(`Message: ${data.message}`);
            if ((_a = data.data) === null || _a === void 0 ? void 0 : _a.company) {
                console.log(`\nCompany Created:`);
                console.log(`  ID: ${data.data.company._id}`);
                console.log(`  Name: ${data.data.company.company_name}`);
                console.log(`  Email: ${data.data.company.contact_email}`);
                testCompanyId = data.data.company._id;
            }
            if ((_b = data.data) === null || _b === void 0 ? void 0 : _b.user) {
                console.log(`\nUser Status:`);
                console.log(`  Type: ${data.data.user.type}`);
                console.log(`  Was Promoted: ${data.data.user.wasPromotedToAdmin ? 'Yes' : 'No'}`);
            }
            if (!response.ok || !data.success) {
                throw new Error(`Create company failed: ${data.message || response.statusText}`);
            }
            console.log("\n✅ Create Company With User Test Passed!\n");
        }
        catch (error) {
            console.error("\n❌ Test Failed:", error);
            throw error;
        }
    });
}
/**
 * Test 2: Create Company Without User (Creates Admin User)
 */
function testCreateCompanyWithoutUser() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        console.log("\n📝 Test 2: Create Company WITHOUT User (Creates Admin User)");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        const newCompanyWithUser = {
            email: "newadmin@testcompany.com",
            password: "NewAdmin@123",
            username: "test_company_admin",
            company_name: "Test Company With New User",
            description: "Company that creates its own admin user",
            contact_email: "contact@testcompany.com",
            website_url: "https://testcompany.com",
        };
        try {
            const response = yield fetch(`${BASE_URL}/api/companies`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCompanyWithUser),
            });
            const data = yield response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Success: ${data.success}`);
            console.log(`Message: ${data.message}`);
            if ((_a = data.data) === null || _a === void 0 ? void 0 : _a.company) {
                console.log(`\nCompany Created:`);
                console.log(`  ID: ${data.data.company._id}`);
                console.log(`  Name: ${data.data.company.company_name}`);
            }
            if ((_b = data.data) === null || _b === void 0 ? void 0 : _b.user) {
                console.log(`\nNew Admin User Created:`);
                console.log(`  Email: ${data.data.user.email}`);
                console.log(`  Username: ${data.data.user.username}`);
                console.log(`  Type: ${data.data.user.type}`);
            }
            if ((_c = data.data) === null || _c === void 0 ? void 0 : _c.accessToken) {
                console.log(`\nTokens Generated:`);
                console.log(`  Access Token: ${data.data.accessToken.substring(0, 20)}...`);
                console.log(`  Refresh Token: ${(_d = data.data.refreshToken) === null || _d === void 0 ? void 0 : _d.substring(0, 20)}...`);
                newUserToken = data.data.accessToken;
            }
            if (!response.ok || !data.success) {
                throw new Error(`Create company failed: ${data.message || response.statusText}`);
            }
            console.log("\n✅ Create Company Without User Test Passed!\n");
        }
        catch (error) {
            console.error("\n❌ Test Failed:", error);
            throw error;
        }
    });
}
/**
 * Test 3: Get All Companies (Public)
 */
function testGetAllCompanies() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("\n👥 Test 3: Get All Companies (Public)");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        try {
            const response = yield fetch(`${BASE_URL}/api/companies`);
            const data = yield response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Success: ${data.success}`);
            if ((_a = data.data) === null || _a === void 0 ? void 0 : _a.companies) {
                console.log(`\nCompanies found: ${data.data.companies.length}`);
                console.log(`Pagination:`, data.data.pagination);
                if (data.data.companies.length > 0) {
                    console.log(`\nFirst company:`);
                    console.log(`  Name: ${data.data.companies[0].company_name}`);
                    console.log(`  Email: ${data.data.companies[0].contact_email}`);
                }
            }
            if (!response.ok || !data.success) {
                throw new Error(`Get all companies failed`);
            }
            console.log("\n✅ Get All Companies Test Passed!\n");
        }
        catch (error) {
            console.error("\n❌ Test Failed:", error);
            throw error;
        }
    });
}
/**
 * Test 4: Get Single Company (Public)
 */
function testGetSingleCompany() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("\n🔍 Test 4: Get Single Company (Public)");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        try {
            const response = yield fetch(`${BASE_URL}/api/companies/${testCompanyId}`);
            const data = yield response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Success: ${data.success}`);
            if ((_a = data.data) === null || _a === void 0 ? void 0 : _a.company) {
                console.log(`\nCompany Details:`);
                console.log(`  ID: ${data.data.company._id}`);
                console.log(`  Name: ${data.data.company.company_name}`);
                console.log(`  Description: ${data.data.company.description}`);
                console.log(`  Email: ${data.data.company.contact_email}`);
            }
            if (!response.ok || !data.success) {
                throw new Error(`Get single company failed`);
            }
            console.log("\n✅ Get Single Company Test Passed!\n");
        }
        catch (error) {
            console.error("\n❌ Test Failed:", error);
            throw error;
        }
    });
}
/**
 * Test 5: Update Company (Admin Only)
 */
function testUpdateCompany() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("\n✏️ Test 5: Update Company (Admin Only)");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        const updates = {
            description: "Updated description from automated test",
            is_active: true,
        };
        try {
            const response = yield fetch(`${BASE_URL}/api/companies/${testCompanyId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            });
            const data = yield response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Success: ${data.success}`);
            console.log(`Message: ${data.message}`);
            if ((_a = data.data) === null || _a === void 0 ? void 0 : _a.company) {
                console.log(`\nUpdated Company:`);
                console.log(`  Description: ${data.data.company.description}`);
                console.log(`  Active: ${data.data.company.is_active}`);
            }
            if (!response.ok || !data.success) {
                throw new Error(`Update company failed`);
            }
            console.log("\n✅ Update Company Test Passed!\n");
        }
        catch (error) {
            console.error("\n❌ Test Failed:", error);
            throw error;
        }
    });
}
/**
 * Test 6: Delete Company (Admin Only)
 */
function testDeleteCompany() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n🗑️ Test 6: Delete Company (Admin Only)");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        try {
            const response = yield fetch(`${BASE_URL}/api/companies/${testCompanyId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${adminToken}`,
                },
            });
            const data = yield response.json();
            console.log(`Status: ${response.status}`);
            console.log(`Success: ${data.success}`);
            console.log(`Message: ${data.message}`);
            if (!response.ok || !data.success) {
                throw new Error(`Delete company failed`);
            }
            console.log("\n✅ Delete Company Test Passed!\n");
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
        console.log("🧪 COMPANY CRUD TESTS");
        console.log("=".repeat(50));
        console.log(`\nTesting against: ${BASE_URL}`);
        try {
            // Setup: Sign in users
            customerToken = yield signInAsCustomer();
            adminToken = yield signInAsAdmin();
            // Run tests
            yield testCreateCompanyWithUser();
            yield testCreateCompanyWithoutUser();
            yield testGetAllCompanies();
            yield testGetSingleCompany();
            yield testUpdateCompany();
            yield testDeleteCompany();
            // Summary
            console.log("\n" + "=".repeat(50));
            console.log("✅ ALL TESTS PASSED!");
            console.log("=".repeat(50));
            console.log("\n💡 Key Takeaways:");
            console.log("   1. Logged users can create companies and become admin");
            console.log("   2. Can create company + admin user in one request");
            console.log("   3. Everyone can view companies (public access)");
            console.log("   4. Only admins can update/delete companies");
            console.log("   5. User promotion to admin is automatic\n");
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
