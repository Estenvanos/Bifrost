# Company Flow Analysis & Fixes

## Summary
I've analyzed the company controller, test file, and user creation flow. Here's what I found and fixed:

---

## ✅ What's Working Correctly

### 1. **Company Model** (`Company.ts`)
- ✅ Has `ownerId` field (line 12) - required, indexed, references User
- ✅ Has all necessary fields: name, slug, email, phone, address, status, etc.

### 2. **Company Controller** (`company.controller.ts`)
- ✅ **Line 176**: Correctly sets `ownerId: userId` when creating company
- ✅ **Line 186**: Correctly updates user with `companyId: newCompany._id`
- ✅ Handles two scenarios:
  - **Scenario 1** (lines 78-102): Logged user creates company → promotes to vendor
  - **Scenario 2** (lines 104-170): No logged user → creates new vendor user

### 3. **User Creation** (`auth.controller.ts`)
- ✅ Creates users with all fields correctly
- ✅ User model has `companyId` field (line 25-29 in User.ts)
- ✅ User gets linked to company via `companyId` update

---

## 🔧 Issues Found & Fixed in Test File

### Issue 1: Wrong Field Names
**Problem**: Test was using incorrect field names that don't match controller expectations.

**Fixed in Test (Line 113-119)**:
```typescript
// ❌ BEFORE
const newCompany = {
  email: "test@testcorp.com",        // Wrong: should be contact_email
  phone: "+1-555-TEST",              // Wrong: should be phone_number
  address: { street: "..." },        // Wrong: should be string, not object
};

// ✅ AFTER
const newCompany = {
  contact_email: "test@testcorp.com",  // Correct
  phone_number: "+1-555-TEST",         // Correct
  address: "123 Test Street",          // Correct
};
```

### Issue 2: contactEmail vs contact_email
**Fixed in Test (Line 177)**:
```typescript
// ❌ BEFORE
contactEmail: "contact@testcompany.com"

// ✅ AFTER
contact_email: "contact@testcompany.com"
```

### Issue 3: Non-existent Field Reference
**Fixed in Test (Line 148)**:
```typescript
// ❌ BEFORE
console.log(`Type: ${data.data.user.type}`);  // Controller doesn't return 'type'

// ✅ AFTER
// Removed this line - controller doesn't return a 'type' field
```

---

## 📋 Controller Field Mapping

The controller accepts multiple field name variations for backward compatibility:

```typescript
// Company name
name || company_name

// Company email
contact_email || req.body.contact_email

// These are mapped on lines 37-38 of company.controller.ts
```

**Recommendation**: Use the standard field names:
- `name` (for company name)
- `contact_email` (for company email)
- `phone_number` (for phone)
- `address` (as string)

---

## 🔍 User-Company Relationship Flow

### When Logged User Creates Company:
1. User is already authenticated (has userId from token)
2. Controller checks user's role
3. If user is "customer", promotes to "vendor" (line 92)
4. Creates company with `ownerId: userId` (line 176)
5. Updates user with `companyId: newCompany._id` (line 186)
6. Returns company + user info (no new tokens)

### When No User is Logged In:
1. Controller validates email/password for new user
2. Creates new user with role "vendor" (line 149)
3. Generates userId from new user
4. Creates company with `ownerId: userId` (line 176)
5. Updates user with `companyId: newCompany._id` (line 186)
6. Generates and returns access/refresh tokens (lines 156-160)

---

## ✅ Verification Checklist

- [x] Company model has `ownerId` field
- [x] Controller sets `ownerId` when creating company
- [x] Controller updates user with `companyId`
- [x] Test uses correct field names (`contact_email`, `phone_number`, `address`)
- [x] Test doesn't reference non-existent fields (`type`)
- [x] User creation in auth controller works correctly
- [x] Both scenarios (with/without logged user) handle ownerId correctly

---

## 🚀 Next Steps

The test should now work correctly. To run it:

```bash
npx tsx tests/company-flow.test.ts
```

Make sure:
1. Server is running on port 4000
2. Database is seeded with test users (john@customer.com, admin@admin.com)
3. Redis is running (for session management)
