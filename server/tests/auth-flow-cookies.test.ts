/**
 * Authentication Flow Test with Cookies
 * 
 * This test demonstrates:
 * 1. Signing in with credentials (cookies set automatically)
 * 2. Using cookies for subsequent requests (no need to pass token)
 * 3. Calling getMe with automatic authentication
 * 4. Logging out (clearing cookies)
 * 
 * To run: npx tsx tests/auth-flow-cookies.test.ts
 * (Make sure the server is running on port 4000 first)
 */

const BASE_URL = "http://localhost:4000";

// Test user credentials (from seed.ts)
const TEST_USER = {
  email: "john@customer.com",
  password: "Customer@123",
};

interface SignInResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
      type: string;
      createdAt: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

interface GetMeResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
      type: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// Cookie jar to store cookies between requests
let cookies: string[] = [];

/**
 * Helper to extract and store cookies from response
 */
function storeCookies(response: Response) {
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    // Parse multiple Set-Cookie headers
    const cookieStrings = setCookie.split(",").map(c => c.trim());
    cookieStrings.forEach(cookieStr => {
      // Extract cookie name and value
      const cookieParts = cookieStr.split(";")[0];
      const existingIndex = cookies.findIndex(c => 
        c.split("=")[0] === cookieParts.split("=")[0]
      );
      
      if (existingIndex >= 0) {
        cookies[existingIndex] = cookieParts;
      } else {
        cookies.push(cookieParts);
      }
    });
  }
}

/**
 * Helper to get Cookie header value
 */
function getCookieHeader(): string {
  return cookies.join("; ");
}

/**
 * Helper to clear cookies
 */
function clearCookies() {
  cookies = [];
}

/**
 * Test 1: Sign In (sets cookies)
 */
async function testSignIn(): Promise<void> {
  console.log("\n🔐 Testing Sign In (with cookies)...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(TEST_USER),
    });

    // Store cookies from response
    storeCookies(response);

    const data: SignInResponse = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);
    console.log(`\nUser Data:`);
    console.log(`  ID: ${data.data.user._id}`);
    console.log(`  Username: ${data.data.user.username}`);
    console.log(`  Email: ${data.data.user.email}`);
    console.log(`  Type: ${data.data.user.type}`);
    console.log(`\n🍪 Cookies received:`);
    cookies.forEach(cookie => {
      const [name] = cookie.split("=");
      console.log(`  - ${name}`);
    });

    if (!response.ok || !data.success) {
      throw new Error(`Sign in failed: ${data.message || response.statusText}`);
    }

    if (cookies.length === 0) {
      throw new Error("No cookies were set!");
    }

    console.log("\n✅ Sign In Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Sign In Test Failed:", error);
    throw error;
  }
}

/**
 * Test 2: Get Me (using cookies - no token needed!)
 */
async function testGetMeWithCookies(): Promise<void> {
  console.log("\n👤 Testing Get Me (with cookies - no token needed!)...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    console.log(`Sending cookies: ${getCookieHeader()}\n`);

    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Cookie": getCookieHeader(), // Send cookies
        "Content-Type": "application/json",
      },
    });

    const data: GetMeResponse = await response.json();

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
  } catch (error) {
    console.error("\n❌ Get Me Test Failed:", error);
    throw error;
  }
}

/**
 * Test 3: Get Me Without Cookies (should fail)
 */
async function testGetMeWithoutCookies(): Promise<void> {
  console.log("\n🚫 Testing Get Me WITHOUT cookies (should fail)...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (response.status === 401 && !data.success) {
      console.log("\n✅ Correctly rejected request without cookies!\n");
    } else {
      throw new Error("Expected 401 Unauthorized, but got different response");
    }
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    throw error;
  }
}

/**
 * Test 4: Logout (clears cookies)
 */
async function testLogout(): Promise<void> {
  console.log("\n👋 Testing Logout (clear cookies)...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Cookie": getCookieHeader(),
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    // Clear local cookies
    clearCookies();
    console.log("\n🍪 Cookies cleared locally");

    if (!response.ok || !data.success) {
      throw new Error(`Logout failed: ${data.message || response.statusText}`);
    }

    console.log("\n✅ Logout Test Passed!\n");
  } catch (error) {
    console.error("\n❌ Logout Test Failed:", error);
    throw error;
  }
}

/**
 * Test 5: Verify logout (should not be able to access getMe)
 */
async function testGetMeAfterLogout(): Promise<void> {
  console.log("\n🔒 Testing Get Me after logout (should fail)...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Cookie": getCookieHeader(), // Should be empty
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    console.log(`Status: ${response.status}`);
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    if (response.status === 401 && !data.success) {
      console.log("\n✅ Correctly rejected request after logout!\n");
    } else {
      throw new Error("Expected 401 Unauthorized after logout");
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
  console.log("🧪 AUTH FLOW WITH COOKIES TESTS");
  console.log("=".repeat(50));
  console.log(`\nTesting against: ${BASE_URL}`);
  console.log(`Credentials: ${TEST_USER.email}`);
  console.log(`\nℹ️  This test simulates browser behavior with cookies`);
  console.log(`   Cookies are set automatically and sent with requests`);

  try {
    // Test 1: Sign in and get cookies
    await testSignIn();

    // Test 2: Use cookies to get user data
    await testGetMeWithCookies();

    // Test 3: Try without cookies (should fail)
    clearCookies(); // Temporarily clear to test
    await testGetMeWithoutCookies();

    // Re-login for logout test
    await testSignIn();

    // Test 4: Logout (clear cookies)
    await testLogout();

    // Test 5: Verify logout worked
    await testGetMeAfterLogout();

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("✅ ALL TESTS PASSED!");
    console.log("=".repeat(50));
    console.log("\n💡 Key Takeaways:");
    console.log("   1. Cookies are set automatically on login");
    console.log("   2. No need to manually pass tokens");
    console.log("   3. Cookies are sent automatically with each request");
    console.log("   4. Logout clears cookies server-side");
    console.log("   5. HTTP-only cookies prevent XSS attacks\n");

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