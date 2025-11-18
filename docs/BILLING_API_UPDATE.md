# Billing API Update - API Key Info Structure

## API Response Changes

### Previous Structure:

```json
{
  "api_key": "ak_xxx",
  "api_key_expires_at": "2025-11-17T08:12:53"
}
```

### New Structure:

```json
{
  "api_key_info": {
    "api_key": "ak_ffa71bed943644af95fe7a2e468479df",
    "created": "2025-11-08T17:13:18",
    "expires": "2025-11-24T19:37:06",
    "active_for_days": 6
  }
}
```

## UI Updates

### New API Key Information Section

The user info section now displays a dedicated **API Key Information** section with:

1. **API Key Display**

   - Full API key shown in monospace font
   - Copyable format
   - Located in a card with secondary background

2. **Expiration Information**

   - Expiry date and time
   - Days remaining (active_for_days)
   - Orange text for urgency

3. **Creation Date**

   - When the API key was created
   - Formatted as locale string

4. **Status Badge**
   - **Active:** Green border if `active_for_days > 0`
   - **Expired:** Red border if `active_for_days <= 0`
   - Outline style (no fill)

### Layout

The API Key section appears between Basic Info and Points Info:

```
┌─────────────────────────────────────┐
│ Basic Info (Username, Email, etc.)  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ API Key Information (NEW)           │
│ ┌─────────────┬─────────────┐      │
│ │  API Key    │  Expires    │      │
│ ├─────────────┼─────────────┤      │
│ │  Created    │  Status     │      │
│ └─────────────┴─────────────┘      │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Points Information                   │
└─────────────────────────────────────┘
```

## Example Response

```json
{
  "id": "b6146d77-e",
  "username": "safwan",
  "email": "safwan@gmail.com",
  "role": "general_user",
  "api_key_info": {
    "api_key": "ak_ffa71bed943644af95fe7a2e468479df",
    "created": "2025-11-08T17:13:18",
    "expires": "2025-11-24T19:37:06",
    "active_for_days": 6
  },
  "points": {
    "total_points": 160000,
    "current_points": 160000,
    "total_used_points": 0,
    "paid_status": "Paid",
    "total_rq": 0
  },
  "active_suppliers": ["ean", "booking", "agoda"],
  "total_suppliers": 3,
  "created_at": "2025-11-08T17:13:18",
  "updated_at": "2025-11-17T19:37:06",
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

## Features

### Conditional Display

- API Key section only shows if `api_key_info` exists
- Handles null/undefined gracefully

### Visual Indicators

- **Active Keys:** Green border status badge
- **Expired Keys:** Red border status badge
- **Days Remaining:** Orange text for urgency
- **Monospace Font:** For API key readability

### Responsive Design

- 2-column grid on desktop
- Single column on mobile
- Equal height cards

## Testing

1. Search for user: `b6146d77-e`
2. Verify API Key section appears
3. Check all 4 cards display correctly:
   - API Key (full key)
   - Expires (date + days remaining)
   - Created (date)
   - Status (Active/Expired badge)

## Notes

- API key is displayed in full (not masked)
- This is admin view, so full visibility is appropriate
- Status automatically updates based on `active_for_days`
- All dates are formatted to user's locale
