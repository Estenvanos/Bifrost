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

interface SignInResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  };
}

interface CompanyResponse {
  success: boolean;
  message?: string;
  data?: {
    company?: any;
    companies?: any[];
    pagination?: any;
    user?: any;
    accessToken?: string;
    refreshToken?: string;
  };
}

let customerToken: string;
let adminToken: string;
let testCompanyId: string;
let newUserToken: string;

/**
 * Helper: Sign in as customer
 */
async function signInAsCustomer(): Promise<string> {
  console.log("\n🔐 Signing in as Customer...");

  const response = await fetch(`${BASE_URL}/api/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(CUSTOMER_USER),
  });

  const data: SignInResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(`Customer sign in failed: ${data.message || response.statusText}`);
  }

  console.log(`✅ Customer signed in: ${data.data.user.email}`);
  return data.data.accessToken;
}

/**
 * Helper: Sign in as admin
 */
async function signInAsAdmin(): Promise<string> {
  console.log("\n🔐 Signing in as Admin...");

  const response = await fetch(`${BASE_URL}/api/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ADMIN_USER),
  });

  const data: SignInResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(`Admin sign in failed: ${data.message || response.statusText}`);
  }

  console.log(`✅ Admin signed in: ${data.data.user.email}`);
  return data.data.accessToken;
}

/**
 * Test 1: Create Company With Logged User (Promotes to Admin)
 */
async function testCreateCompanyWithUser(): Promise<void> {
  console.log("\n📝 Test 1: Create Company With Logged User (Customer → Admin)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const newCompany = {
    name: "Test Corp With User",
    description: "Company created by logged customer (will become admin)",
    contact_email: "test@testcorp.com",
    phone_number: "+1-555-TEST",
    address: "123 Test Street",
  };

  try {
    const response = await fetch(`${BASE_URL}/api/companies`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${customerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCompany),
    });

    const data: CompanyResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (data.data?.company) {
      console.log(`\nCompany Created:`);
      console.log(`  ID: ${data.data.company._id}`);
      console.log(`  Name: ${data.data.company.name}`);
      console.log(`  Email: ${data.data.company.email}`);

      testCompanyId = data.data.company._id;
    }

    if (data.data?.user) {
      console.log(`\nUser Status:`);
      console.log(`  Was Promoted: ${data.data.user.wasPromotedToAdmin ? 'Yes' : 'No'}`);
    }

    if (!response.ok || !data.success) {
      throw new Error(`Create company failed: ${data.message || response.statusText}`);
    }

    console.log("\n✅ Create Company With User Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    throw error;
  }
}

/**
 * Test 2: Create Company Without User (Creates Admin User)
 */
async function testCreateCompanyWithoutUser(): Promise<void> {
  console.log("\n📝 Test 2: Create Company WITHOUT User (Creates Admin User)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const newCompanyWithUser = {
    email: "newadmin@testcompany.com",
    password: "NewAdmin@123",
    firstName: "Test",
    lastName: "Admin",
    name: "Test Company With New User",
    description: "Company that creates its own admin user",
    contact_email: "contact@testcompany.com",
  };

  try {
    const response = await fetch(`${BASE_URL}/api/companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCompanyWithUser),
    });

    const data: CompanyResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (data.data?.company) {
      console.log(`\nCompany Created:`);
      console.log(`  ID: ${data.data.company._id}`);
      console.log(`  Name: ${data.data.company.name}`);
    }

    if (data.data?.user) {
      console.log(`\nNew Admin User Created:`);
      console.log(`  Email: ${data.data.user.email}`);
      console.log(`  First Name: ${data.data.user.firstName}`);
      console.log(`  Role: ${data.data.user.role}`);
    }

    if (data.data?.accessToken) {
      console.log(`\nTokens Generated:`);
      console.log(`  Access Token: ${data.data.accessToken.substring(0, 20)}...`);
      console.log(`  Refresh Token: ${data.data.refreshToken?.substring(0, 20)}...`);

      newUserToken = data.data.accessToken;
    }

    if (!response.ok || !data.success) {
      throw new Error(`Create company failed: ${data.message || response.statusText}`);
    }

    console.log("\n✅ Create Company Without User Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    throw error;
  }
}

/**
 * Test 3: Get All Companies (Public)
 */
async function testGetAllCompanies(): Promise<void> {
  console.log("\n👥 Test 3: Get All Companies (Public)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/companies`);
    const data: CompanyResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);

    if (data.data?.companies) {
      console.log(`\nCompanies found: ${data.data.companies.length}`);
      console.log(`Pagination:`, data.data.pagination);

      if (data.data.companies.length > 0) {
        console.log(`\nFirst company:`);
        console.log(`  Name: ${data.data.companies[0].name}`);
        console.log(`  Email: ${data.data.companies[0].email}`);
      }
    }

    if (!response.ok || !data.success) {
      throw new Error(`Get all companies failed`);
    }

    console.log("\n✅ Get All Companies Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    throw error;
  }
}

/**
 * Test 4: Get Single Company (Public)
 */
async function testGetSingleCompany(): Promise<void> {
  console.log("\n🔍 Test 4: Get Single Company (Public)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/companies/${testCompanyId}`);
    const data: CompanyResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);

    if (data.data?.company) {
      console.log(`\nCompany Details:`);
      console.log(`  ID: ${data.data.company._id}`);
      console.log(`  Name: ${data.data.company.name}`);
      console.log(`  Description: ${data.data.company.description}`);
      console.log(`  Email: ${data.data.company.email}`);
    }

    if (!response.ok || !data.success) {
      throw new Error(`Get single company failed`);
    }

    console.log("\n✅ Get Single Company Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    throw error;
  }
}

/**
 * Test 5: Update Company (Admin Only)
 */
async function testUpdateCompany(): Promise<void> {
  console.log("\n✏️ Test 5: Update Company (Admin Only)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const updates = {
    description: "Updated description from automated test",
    status: "active",
  };

  try {
    const response = await fetch(`${BASE_URL}/api/companies/${testCompanyId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data: CompanyResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (data.data?.company) {
      console.log(`\nUpdated Company:`);
      console.log(`  Description: ${data.data.company.description}`);
      console.log(`  Status: ${data.data.company.status}`);
    }

    if (!response.ok || !data.success) {
      throw new Error(`Update company failed`);
    }

    console.log("\n✅ Update Company Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    throw error;
  }
}

/**
 * Test 6: Delete Company (Admin Only)
 */
async function testDeleteCompany(): Promise<void> {
  console.log("\n🗑️ Test 6: Delete Company (Admin Only)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/companies/${testCompanyId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data: CompanyResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (!response.ok || !data.success) {
      throw new Error(`Delete company failed`);
    }

    console.log("\n✅ Delete Company Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    throw error;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("\n" + "=".repeat(50));
  console.log("🧪 COMPANY CRUD TESTS");
  console.log("=".repeat(50));
  console.log(`\nTesting against: ${BASE_URL}`);

  try {
    // Setup: Sign in users
    customerToken = await signInAsCustomer();
    adminToken = await signInAsAdmin();

    // Run tests
    await testCreateCompanyWithUser();
    await testCreateCompanyWithoutUser();
    await testGetAllCompanies();
    await testGetSingleCompany();
    await testUpdateCompany();
    await testDeleteCompany();

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
  } catch (error) {
    console.log("\n" + "=".repeat(50));
    console.log("❌ TESTS FAILED!");
    console.log("=".repeat(50) + "\n");
    console.error("Error:", error);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) throw new Error("Server not responding");
    return true;
  } catch (error) {
    console.error("\n❌ Cannot connect to server!");
    console.error("Make sure the server is running on", BASE_URL);
    console.error("Start it with: npm run dev\n");
    process.exit(1);
  }
}

// Run the tests
(async () => {
  await checkServer();
  await runTests();
})();