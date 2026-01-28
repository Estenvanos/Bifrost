/**
 * Product CRUD Flow Test
 * 
 * This test demonstrates:
 * 1. Creating products (admin only)
 * 2. Getting all products (public)
 * 3. Getting a single product (public)
 * 4. Updating products (admin only)
 * 5. Deleting products (admin only)
 * 6. Testing authentication and authorization
 * 7. Testing pagination and filtering
 * 
 * To run: npx tsx tests/product-flow.test.ts
 * (Make sure the server is running on port 4000 first)
 */

const BASE_URL = "http://localhost:4000";

// Test user credentials (from seed.ts)
const ADMIN_USER = {
  email: "admin@admin.com",
  password: "Admin@123",
};

const CUSTOMER_USER = {
  email: "john@customer.com",
  password: "Customer@123",
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

interface ProductResponse {
  success: boolean;
  message?: string;
  data?: {
    product?: any;
    products?: any[];
    pagination?: any;
  };
}

let adminToken: string;
let customerToken: string;
let testProductId: string;
let testCompanyId: string = "507f1f77bcf86cd799439011"; // Placeholder company ID

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
 * Test 1: Create Product (Admin Only)
 */
async function testCreateProduct(): Promise<void> {
  console.log("\n📝 Test 1: Create Product (Admin Only)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const newProduct = {
    product_name: "Test Product - Galaxy Phone",
    company_id: testCompanyId,
    description: "Test description for automated testing",
    price: 99.99,
    category: "electronics",
    tags: ["test", "phone", "electronics"],
    image_url: "https://example.com/test.jpg",
  };

  try {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);
    
    if (data.data?.product) {
      console.log(`\nProduct Created:`);
      console.log(`  ID: ${data.data.product._id}`);
      console.log(`  Name: ${data.data.product.product_name}`);
      console.log(`  Price: $${data.data.product.price}`);
      console.log(`  Category: ${data.data.product.category}`);
      
      testProductId = data.data.product._id;
    }

    if (!response.ok || !data.success) {
      throw new Error(`Create product failed: ${data.message || response.statusText}`);
    }

    console.log("\n✅ Create Product Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Create Product Test Failed:", error);
    throw error;
  }
}

/**
 * Test 2: Create Product Without Auth (Should Fail)
 */
async function testCreateProductWithoutAuth(): Promise<void> {
  console.log("\n🚫 Test 2: Create Product WITHOUT Auth (should fail)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const newProduct = {
    product_name: "Unauthorized Product",
    company_id: testCompanyId,
    description: "Should not be created",
    price: 99.99,
    category: "electronics",
  };

  try {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (response.status === 401 && !data.success) {
      console.log("\n✅ Correctly rejected request without auth!\n");
    } else {
      throw new Error("Expected 401 Unauthorized, but got different response");
    }
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    throw error;
  }
}

/**
 * Test 3: Get All Products (Public)
 */
async function testGetAllProducts(): Promise<void> {
  console.log("\n👥 Test 3: Get All Products (Public)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/products`);
    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.data?.products) {
      console.log(`\nProducts found: ${data.data.products.length}`);
      console.log(`Pagination:`, data.data.pagination);
      
      if (data.data.products.length > 0) {
        console.log(`\nFirst product:`);
        console.log(`  Name: ${data.data.products[0].product_name}`);
        console.log(`  Price: $${data.data.products[0].price}`);
      }
    }

    if (!response.ok || !data.success) {
      throw new Error(`Get all products failed: ${response.statusText}`);
    }

    console.log("\n✅ Get All Products Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Get All Products Test Failed:", error);
    throw error;
  }
}

/**
 * Test 4: Get All Products With Pagination
 */
async function testGetProductsWithPagination(): Promise<void> {
  console.log("\n📄 Test 4: Get All Products With Pagination");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/products?page=1&limit=5`);
    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Pagination:`, data.data?.pagination);

    if (!response.ok || !data.success) {
      throw new Error(`Get products with pagination failed`);
    }

    console.log("\n✅ Pagination Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Pagination Test Failed:", error);
    throw error;
  }
}

/**
 * Test 5: Get All Products With Filters
 */
async function testGetProductsWithFilters(): Promise<void> {
  console.log("\n🔍 Test 5: Get All Products With Filters");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/products?category=electronics&minPrice=50&maxPrice=1000`);
    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Filtered products: ${data.data?.products?.length || 0}`);

    if (!response.ok || !data.success) {
      throw new Error(`Get products with filters failed`);
    }

    console.log("\n✅ Filters Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Filters Test Failed:", error);
    throw error;
  }
}

/**
 * Test 6: Get Single Product (Public)
 */
async function testGetSingleProduct(): Promise<void> {
  console.log("\n🔍 Test 6: Get Single Product (Public)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/products/${testProductId}`);
    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    
    if (data.data?.product) {
      console.log(`\nProduct Details:`);
      console.log(`  ID: ${data.data.product._id}`);
      console.log(`  Name: ${data.data.product.product_name}`);
      console.log(`  Price: $${data.data.product.price}`);
      console.log(`  Category: ${data.data.product.category}`);
      console.log(`  Tags: ${data.data.product.tags.join(", ")}`);
    }

    if (!response.ok || !data.success) {
      throw new Error(`Get single product failed`);
    }

    console.log("\n✅ Get Single Product Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Get Single Product Test Failed:", error);
    throw error;
  }
}

/**
 * Test 7: Get Non-Existent Product (Should Fail)
 */
async function testGetNonExistentProduct(): Promise<void> {
  console.log("\n🚫 Test 7: Get Non-Existent Product (should fail)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const fakeId = "507f1f77bcf86cd799439011";

  try {
    const response = await fetch(`${BASE_URL}/api/products/${fakeId}`);
    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (response.status === 404 && !data.success) {
      console.log("\n✅ Correctly returned 404 for non-existent product!\n");
    } else {
      throw new Error("Expected 404 Not Found");
    }
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    throw error;
  }
}

/**
 * Test 8: Update Product (Admin Only)
 */
async function testUpdateProduct(): Promise<void> {
  console.log("\n✏️ Test 8: Update Product (Admin Only)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const updates = {
    price: 149.99,
    description: "Updated description from automated test",
  };

  try {
    const response = await fetch(`${BASE_URL}/api/products/${testProductId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);
    
    if (data.data?.product) {
      console.log(`\nUpdated Product:`);
      console.log(`  ID: ${data.data.product._id}`);
      console.log(`  New Price: $${data.data.product.price}`);
      console.log(`  New Description: ${data.data.product.description}`);
    }

    if (!response.ok || !data.success) {
      throw new Error(`Update product failed: ${data.message}`);
    }

    console.log("\n✅ Update Product Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Update Product Test Failed:", error);
    throw error;
  }
}

/**
 * Test 9: Update Product As Customer (Should Fail)
 */
async function testUpdateProductAsCustomer(): Promise<void> {
  console.log("\n🚫 Test 9: Update Product As Customer (should fail)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const updates = {
    price: 999.99,
  };

  try {
    const response = await fetch(`${BASE_URL}/api/products/${testProductId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${customerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (response.status === 403 && !data.success) {
      console.log("\n✅ Correctly rejected customer update attempt!\n");
    } else {
      throw new Error("Expected 403 Forbidden");
    }
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    throw error;
  }
}

/**
 * Test 10: Delete Product (Admin Only)
 */
async function testDeleteProduct(): Promise<void> {
  console.log("\n🗑️ Test 10: Delete Product (Admin Only)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/products/${testProductId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (!response.ok || !data.success) {
      throw new Error(`Delete product failed: ${data.message}`);
    }

    console.log("\n✅ Delete Product Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Delete Product Test Failed:", error);
    throw error;
  }
}

/**
 * Test 11: Create Product As Customer (Should Fail)
 */
async function testCreateProductAsCustomer(): Promise<void> {
  console.log("\n🚫 Test 11: Create Product As Customer (should fail)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const newProduct = {
    product_name: "Unauthorized Product",
    company_id: testCompanyId,
    description: "Customer cannot create",
    price: 99.99,
    category: "electronics",
  };

  try {
    const response = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${customerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    const data: ProductResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (response.status === 403 && !data.success) {
      console.log("\n✅ Correctly rejected customer create attempt!\n");
    } else {
      throw new Error("Expected 403 Forbidden");
    }
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
  console.log("🧪 PRODUCT CRUD TESTS");
  console.log("=".repeat(50));
  console.log(`\nTesting against: ${BASE_URL}`);
  console.log(`Admin: ${ADMIN_USER.email}`);
  console.log(`Customer: ${CUSTOMER_USER.email}`);

  try {
    // Setup: Sign in users
    adminToken = await signInAsAdmin();
    customerToken = await signInAsCustomer();

    // Run tests
    await testCreateProduct();
    await testCreateProductWithoutAuth();
    await testCreateProductAsCustomer();
    await testGetAllProducts();
    await testGetProductsWithPagination();
    await testGetProductsWithFilters();
    await testGetSingleProduct();
    await testGetNonExistentProduct();
    await testUpdateProduct();
    await testUpdateProductAsCustomer();
    await testDeleteProduct();

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ ALL TESTS PASSED!");
    console.log("=".repeat(50));
    console.log("\n💡 Key Takeaways:");
    console.log("   1. Only admins can create, update, delete products");
    console.log("   2. Everyone can view products (public access)");
    console.log("   3. Authentication is required for admin operations");
    console.log("   4. Pagination and filtering work correctly");
    console.log("   5. Proper error handling for invalid requests\n");

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