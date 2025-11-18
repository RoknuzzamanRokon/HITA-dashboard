# Billing Page API Integration

## Authentication

All API endpoints require Bearer token authentication. The token is automatically retrieved from `localStorage` and included in the request headers.

```javascript
headers: {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json",
}
```

## API Endpoints

### 1. Check User Information

**Endpoint:** `GET http://127.0.0.1:8001/v1.0/user/check-user-info/{user_id}`

**Authentication:** Required (Bearer token)

**Request Example:**

```javascript
const response = await fetch(
  `http://127.0.0.1:8001/v1.0/user/check-user-info/b6146d77-e`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);
```

**Response Example:**

```json
{
  "id": "b6146d77-e",
  "username": "safwan",
  "email": "safwan@gmail.com",
  "role": "general_user",
  "api_key": null,
  "api_key_expires_at": null,
  "points": {
    "total_points": 80000,
    "current_points": 80000,
    "total_used_points": 0,
    "paid_status": "Paid",
    "total_rq": 0
  },
  "active_suppliers": ["agoda", "ean", "booking"],
  "total_suppliers": 3,
  "created_at": "2025-11-08T17:13:18",
  "updated_at": "2025-11-17T17:43:40",
  "user_status": "general_user",
  "is_active": true,
  "using_rq_status": "Active",
  "created_by": "super_user: ursamroko@romel.com",
  "viewed_by": {
    "user_id": "1a203ccda4",
    "username": "ursamroko",
    "email": "ursamroko@romel.com",
    "role": "super_user"
  }
}
```

**Features in UI:**

- Search by user ID
- Press Enter or click Search button
- Display all user information
- Show points breakdown
- Display active suppliers
- Show metadata (created by, viewed by)
- Empty state when no search performed
- Loading state during fetch
- Error handling for 401 Unauthorized

---

### 2. Give Points to User

**Endpoint:** `POST http://127.0.0.1:8001/v1.0/user/points/give`

**Authentication:** Required (Bearer token)

**Request Example:**

```javascript
const response = await fetch("http://127.0.0.1:8001/v1.0/user/points/give", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    receiver_email: "safwan@gmail.com",
    receiver_id: "b6146d77-e",
    allocation_type: "one_month_package",
  }),
});
```

**Request Body:**

```json
{
  "receiver_email": "safwan@gmail.com",
  "receiver_id": "b6146d77-e",
  "allocation_type": "one_month_package"
}
```

**Allocation Types:**

- `admin_user_package` - Full admin access package
- `one_year_package` - Annual subscription
- `one_month_package` - Monthly subscription
- `per_request_point` - Pay per request
- `guest_point` - Guest user points

**Response Example:**

```json
{
  "message": "Successfully gave 80000 points to safwan."
}
```

**Features in UI:**

- Input receiver email and ID
- Select allocation type from dropdown
- Form validation
- Success message display
- Auto-clear form after success
- Error handling for 401 Unauthorized

---

## Error Handling

### 401 Unauthorized

When the API returns 401, the UI displays:

```
"Unauthorized. Please login again."
```

### Missing Token

If no token is found in localStorage:

```
"Authentication token not found. Please login again."
```

### Network Errors

Any other errors display the error message from the API or a generic message.

---

## Token Storage

The authentication token is stored in `localStorage` with the key `"token"`.

**Retrieval:**

```javascript
const token = localStorage.getItem("token");
```

---

## Testing

### Test User Info Search

1. Navigate to `http://localhost:3000/dashboard/billing`
2. Enter user ID: `b6146d77-e`
3. Click Search or press Enter
4. Verify user information displays correctly

### Test Give Points

1. Navigate to `http://localhost:3000/dashboard/billing`
2. Scroll to "Give Points" section
3. Enter:
   - Receiver Email: `safwan@gmail.com`
   - Receiver ID: `b6146d77-e`
   - Allocation Type: `One Month Package`
4. Click "Give Points"
5. Verify success message appears

---

## Security Notes

- All endpoints require authentication
- Token is sent via Authorization header
- 401 responses prompt user to re-login
- No sensitive data is logged to console
- API keys are nullable and handled safely
