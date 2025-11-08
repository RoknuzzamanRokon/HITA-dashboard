# Hotel Autocomplete Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                  (app/dashboard/hotels/page.tsx)             │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ uses
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                   HOTEL SEARCH COMPONENT                     │
│         (lib/components/hotels/hotel-search-compact.tsx)     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Search     │  │ Suggestions  │  │    Hotel     │     │
│  │    Input     │  │   Dropdown   │  │    Card      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ calls
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      HOTEL SERVICE                           │
│                   (lib/api/hotels.ts)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  autocompleteHotel(query)                          │    │
│  │  → GET /content/autocomplete/?query={query}        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  searchHotelByName(hotelName)                      │    │
│  │  → POST /content/search_with_hotel_name            │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ uses
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                       API CLIENT                             │
│                   (lib/api/client.ts)                        │
│                                                              │
│  • Handles HTTP requests                                    │
│  • Manages authentication                                   │
│  • Error handling                                           │
│  • Response parsing                                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND API                             │
│                  http://127.0.0.1:8002/v1.0                 │
│                                                              │
│  • /content/autocomplete/                                   │
│  • /content/search_with_hotel_name                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Autocomplete Flow

```
User Types "braz"
       │
       ↓
┌──────────────────┐
│  Input onChange  │
│   (debounced)    │
└────────┬─────────┘
         │ 300ms delay
         ↓
┌──────────────────┐
│ fetchSuggestions │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  HotelService    │
│ .autocomplete()  │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   API Client     │
│  GET request     │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Backend API     │
│  /autocomplete/  │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   Response:      │
│  [suggestions]   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ setSuggestions() │
│ setShowDropdown()│
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Render Dropdown  │
│  with results    │
└──────────────────┘
```

### Hotel Details Flow

```
User Clicks Suggestion
       │
       ↓
┌──────────────────┐
│ handleSuggestion │
│     Click()      │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│fetchHotelByName()│
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  HotelService    │
│.searchByName()   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   API Client     │
│  POST request    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Backend API     │
│ /search_with_    │
│  hotel_name      │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   Response:      │
│  {hotel data}    │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Transform to     │
│  Hotel type      │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   setHotels()    │
│ onHotelSelect()  │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Render Hotel    │
│      Card        │
└──────────────────┘
```

---

## 🎯 Component State Management

```
HotelSearchCompact Component
├── State
│   ├── hotels: Hotel[]
│   ├── suggestions: Suggestion[]
│   ├── loading: boolean
│   ├── loadingDetails: boolean
│   ├── error: string | null
│   ├── searchQuery: string
│   └── showSuggestions: boolean
│
├── Effects
│   └── useEffect (searchQuery change)
│       └── Debounced fetchSuggestions()
│
├── Handlers
│   ├── handleSuggestionClick()
│   ├── fetchSuggestions()
│   └── fetchHotelByName()
│
└── Render
    ├── Search Input
    ├── Suggestions Dropdown
    ├── Loading Indicators
    ├── Error Messages
    └── Hotel Results
```

---

## 📦 Type Definitions

```typescript
// Suggestion from autocomplete
interface Suggestion {
  name: string;
  type: string;
  country?: string;
  city?: string;
}

// Hotel from search
interface Hotel {
  ittid: string;
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  rating?: string;
  propertyType: string;
  mapStatus: string;
  createdAt: string;
  updatedAt: string;
}

// API Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    status: number;
    message: string;
    details?: any;
  };
}
```

---

## 🔐 Authentication Flow

```
┌──────────────────┐
│  localStorage    │
│ admin_auth_token │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   API Client     │
│  adds Bearer     │
│     token        │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  HTTP Headers    │
│  Authorization:  │
│  Bearer {token}  │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Backend API     │
│   validates      │
│     token        │
└──────────────────┘
```

---

## ⚡ Performance Optimizations

### Debouncing

```
User Types: b → r → a → z → i → l
            │   │   │   │   │   │
            ↓   ↓   ↓   ↓   ↓   ↓
Timer:      ⏱   ⏱   ⏱   ⏱   ⏱   ⏱
            ✗   ✗   ✗   ✗   ✗   ✓
                                │
                                └→ API Call
```

### Conditional Rendering

```
if (loading) → Show spinner
else if (error) → Show error
else if (suggestions.length > 0) → Show dropdown
else if (hotels.length > 0) → Show results
else → Show empty state
```

---

## 🎨 UI Component Hierarchy

```
HotelSearchCompact
│
├── Search Input Container
│   ├── Search Icon
│   └── Input Field
│
├── Suggestions Dropdown (conditional)
│   └── Suggestion Items
│       ├── Building Icon
│       ├── Hotel Name
│       ├── Location (city, country)
│       └── Type Badge
│
├── Loading Indicator (conditional)
│   └── Spinner + Message
│
├── Error Message (conditional)
│   └── Error Text
│
└── Hotel Results (conditional)
    ├── Results Header
    │   └── Count + "View All" button
    │
    └── Hotel Cards
        ├── Hotel Icon
        ├── Hotel Info
        │   ├── Name + Rating
        │   ├── ITTID + Address
        │   └── Badges (status, type)
        └── View Icon
```

---

## 🔄 State Transitions

```
Initial State
    ↓
User Types (< 2 chars)
    ↓
[No Action]
    ↓
User Types (≥ 2 chars)
    ↓
Loading Suggestions
    ↓
Suggestions Loaded
    ↓
User Clicks Suggestion
    ↓
Loading Hotel Details
    ↓
Hotel Details Loaded
    ↓
Display Hotel Card
    ↓
User Clicks Hotel
    ↓
Navigate to Details Page
```

---

## 📊 Error Handling

```
API Call
    │
    ├─→ Success
    │   └─→ Display Data
    │
    ├─→ Network Error
    │   └─→ Show "Network Error" message
    │
    ├─→ CORS Error
    │   └─→ Show "CORS Error" + instructions
    │
    ├─→ 401 Unauthorized
    │   └─→ Redirect to login
    │
    ├─→ 404 Not Found
    │   └─→ Show "Not found" message
    │
    └─→ 500 Server Error
        └─→ Show "Server error" message
```

---

## 🧪 Testing Strategy

```
Unit Tests
├── API Functions
│   ├── autocompleteHotel()
│   └── searchHotelByName()
│
├── Component Logic
│   ├── fetchSuggestions()
│   ├── fetchHotelByName()
│   └── handleSuggestionClick()
│
└── State Management
    ├── Debouncing
    ├── Loading states
    └── Error handling

Integration Tests
├── User types → Suggestions appear
├── Click suggestion → Details load
└── Error scenarios

E2E Tests
└── Complete user flow
    ├── Navigate to page
    ├── Type search query
    ├── Click suggestion
    └── Verify hotel details
```

---

## 🚀 Deployment Checklist

- [x] Code implemented
- [x] Types defined
- [x] Error handling added
- [x] Loading states implemented
- [x] Documentation created
- [x] Test file created
- [x] No TypeScript errors
- [x] No console errors
- [x] API endpoints verified
- [x] Environment variables set
- [x] CORS configured
- [x] Authentication working

---

**Architecture Version**: 1.0.0  
**Last Updated**: November 8, 2025  
**Status**: Production Ready
