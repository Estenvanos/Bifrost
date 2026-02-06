/**
 * Product Ownership Flow Test
 * 
 * Tests the new ownership model where:
 * 1. Users can only create/update/delete products from their own company
 * 2. Users without companies cannot create products
 * 3. Cross-company modifications are blocked
 * 
 * To run: npx tsx tests/ownership-flow.test.ts
 * (Make sure server is running and run integrated seed first)
 */

const BASE_URL = "http://localhost:4000";

const TECH_OWNER = {
  email: "owner@techcorp.com",
  password: "Admin@123",
};

const FASHION_OWNER = {
  email: "owner@fashion.com",
  password: "Admin@123",
};

const CUSTOMER_NO_COMPANY = {
  email: "customer@test.com",
  password: "Customer@123",
};

interface SignInResponse {
  success: boolean;
  data: { accessToken: string; user: any };
}

interface ProductResponse {
  success: boolean;
  message?: string;
  data?: any;
}

let techOwnerToken: string;
let fashionOwnerToken: string;
let customerToken: string;
let techProductId: string;
let fashionProductId: string;

async function signIn(credentials: any): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data: SignInResponse = await response.json();
  if (!response.ok) throw new Error(`Sign in failed: ${data}`);
  return data.data.accessToken;
}

/**
 * Test 1: Tech Owner creates product
 */
async function testTechOwnerCreateProduct(): Promise<void> {
  console.log("\n📝 Test 1: Tech Owner Creates Product");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const product = {
    name: "iPhone 15 Pro",
    description: "Latest Apple smartphone",
    price: 1199.99,
    category: "electronics",
    tags: ["smartphone", "apple"],
  };

  const response = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${techOwnerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  const data: ProductResponse = await response.json();
  console.log(`Status: ${response.status}`);
  console.log(`Success: ${data.success}`);
  console.log(`Product: ${data.data?.product?.name}`);
  console.log(`Company: ${data.data?.product?.companyId}`);

  if (!response.ok || !data.success) {
    throw new Error("Tech owner should be able to create products");
  }

  techProductId = data.data.product._id;
  console.log("\n✅ Test Passed!\n");
}

/**
 * Test 2: Fashion Owner creates product
 */
async function testFashionOwnerCreateProduct(): Promise<void> {
  console.log("\n📝 Test 2: Fashion Owner Creates Product");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const product = {
    name: "Designer Handbag",
    description: "Luxury leather handbag",
    price: 499.99,
    category: "fashion",
    tags: ["handbag", "luxury"],
  };

  const response = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${fashionOwnerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  const data: ProductResponse = await response.json();
  console.log(`Status: ${response.status}`);
  console.log(`Success: ${data.success}`);
  console.log(`Product: ${data.data?.product?.name}`);

  if (!response.ok || !data.success) {
    throw new Error("Fashion owner should be able to create products");
  }

  fashionProductId = data.data.product._id;
  console.log("\n✅ Test Passed!\n");
}

/**
 * Test 3: Customer without company tries to create product (SHOULD FAIL)
 */
async function testCustomerCreateProduct(): Promise<void> {
  console.log("\n🚫 Test 3: Customer Without Company Tries to Create (should fail)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const product = {
    name: "Unauthorized Product",
    description: "Should not be created",
    price: 99.99,
    category: "other",
  };

  const response = await fetch(`${BASE_URL}/api/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${customerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  const data: ProductResponse = await response.json();
  console.log(`Status: ${response.status}`);
  console.log(`Success: ${data.success}`);
  console.log(`Message: ${data.message}`);

  if (response.status === 403) {
    console.log("\n✅ Correctly blocked! Customers need admin role + company.\n");
  } else {
    throw new Error("Should have blocked customer without admin/company");
  }
}

/**
 * Test 4: Tech Owner updates their own product (SHOULD WORK)
 */
async function testOwnerUpdateOwnProduct(): Promise<void> {
  console.log("\n✏️ Test 4: Owner Updates Own Product (should work)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const updates = {
    price: 1099.99,
    description: "Updated description",
  };

  const response = await fetch(`${BASE_URL}/api/products/${techProductId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${techOwnerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const data: ProductResponse = await response.json();
  console.log(`Status: ${response.status}`);
  console.log(`Success: ${data.success}`);
  console.log(`Updated Price: $${data.data?.product?.price}`);

  if (!response.ok || !data.success) {
    throw new Error("Owner should be able to update own products");
  }

  console.log("\n✅ Test Passed!\n");
}

/**
 * Test 5: Tech Owner tries to update Fashion product (SHOULD FAIL)
 */
async function testOwnerUpdateOtherCompanyProduct(): Promise<void> {
  console.log("\n🚫 Test 5: Owner Tries to Update Other Company's Product (should fail)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const updates = {
    price: 9999.99,
  };

  const response = await fetch(`${BASE_URL}/api/products/${fashionProductId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${techOwnerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  const data: ProductResponse = await response.json();
  console.log(`Status: ${response.status}`);
  console.log(`Success: ${data.success}`);
  console.log(`Message: ${data.message}`);

  if (response.status === 403) {
    console.log("\n✅ Correctly blocked cross-company modification!\n");
  } else {
    throw new Error("Should have blocked cross-company update");
  }
}

/**
 * Test 6: Owner deletes own product (SHOULD WORK)
 */
async function testOwnerDeleteOwnProduct(): Promise<void> {
  console.log("\n🗑️ Test 6: Owner Deletes Own Product (should work)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const response = await fetch(`${BASE_URL}/api/products/${techProductId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${techOwnerToken}`,
    },
  });

  const data: ProductResponse = await response.json();
  console.log(`Status: ${response.status}`);
  console.log(`Success: ${data.success}`);
  console.log(`Message: ${data.message}`);

  if (!response.ok || !data.success) {
    throw new Error("Owner should be able to delete own products");
  }

  console.log("\n✅ Test Passed!\n");
}

/**
 * Test 7: Owner tries to delete other company's product (SHOULD FAIL)
 */
async function testOwnerDeleteOtherCompanyProduct(): Promise<void> {
  console.log("\n🚫 Test 7: Owner Tries to Delete Other Company's Product (should fail)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const response = await fetch(`${BASE_URL}/api/products/${fashionProductId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${techOwnerToken}`,
    },
  });

  const data: ProductResponse = await response.json();
  console.log(`Status: ${response.status}`);
  console.log(`Success: ${data.success}`);
  console.log(`Message: ${data.message}`);

  if (response.status === 403) {
    console.log("\n✅ Correctly blocked cross-company deletion!\n");
  } else {
    throw new Error("Should have blocked cross-company delete");
  }
}

/**
 * Test 8: Get all products (PUBLIC - should work)
 */
async function testGetAllProducts(): Promise<void> {
  console.log("\n👥 Test 8: Get All Products (public access)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const response = await fetch(`${BASE_URL}/api/products`);
  const data: ProductResponse = await response.json();

  console.log(`Status: ${response.status}`);
  console.log(`Success: ${data.success}`);
  console.log(`Products found: ${data.data?.products?.length || 0}`);

  if (!response.ok || !data.success) {
    throw new Error("Public should be able to view products");
  }

  console.log("\n✅ Test Passed!\n");
}

async function runTests() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 PRODUCT OWNERSHIP TESTS");
  console.log("=".repeat(60));
  console.log("\n⚠️  Make sure you ran: npm run seed:integrated\n");

  try {
    // Sign in all users
    console.log("🔐 Signing in users...");
    techOwnerToken = await signIn(TECH_OWNER);
    console.log(`✅ Tech owner signed in`);
    fashionOwnerToken = await signIn(FASHION_OWNER);
    console.log(`✅ Fashion owner signed in`);
    customerToken = await signIn(CUSTOMER_NO_COMPANY);
    console.log(`✅ Customer signed in\n`);

    // Run ownership tests
    await testTechOwnerCreateProduct();
    await testFashionOwnerCreateProduct();
    await testCustomerCreateProduct();
    await testOwnerUpdateOwnProduct();
    await testOwnerUpdateOtherCompanyProduct();
    await testOwnerDeleteOtherCompanyProduct();
    await testGetAllProducts();
    await testOwnerDeleteOwnProduct();

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL OWNERSHIP TESTS PASSED!");
    console.log("=".repeat(60));
    console.log("\n💡 Ownership Model Verified:");
    console.log("   ✅ Owners can only manage their own company's products");
    console.log("   ✅ Users without companies cannot create products");
    console.log("   ✅ Cross-company modifications are blocked");
    console.log("   ✅ Public can view all products\n");

    process.exit(0);
  } catch (error) {
    console.log("\n" + "=".repeat(60));
    console.log("❌ TESTS FAILED!");
    console.log("=".repeat(60) + "\n");
    console.error("Error:", error);
    process.exit(1);
  }
}

async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) throw new Error("Server not responding");
  } catch (error) {
    console.error("\n❌ Cannot connect to server!");
    console.error("Start it with: npm run dev\n");
    process.exit(1);
  }
}

(async () => {
  await checkServer();
  await runTests();
})();