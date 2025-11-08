# Hotel Search UI Guide

## Updated Hotel Search Interface

### Before (Old Implementation)

- Basic search input
- Manual hotel name entry
- No suggestions
- Limited feedback

### After (New Implementation)

#### 1. Initial State

```
┌─────────────────────────────────────────────────┐
│  🔍 Type to search hotels (e.g., 'brazil'...)  │
└─────────────────────────────────────────────────┘

        🔍 Start typing to search hotels
        Enter a hotel name, city, or country
```

#### 2. Typing State (e.g., user types "braz")

```
┌─────────────────────────────────────────────────┐
│  🔍 braz                                        │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  ⟳ Searching...                                 │
└─────────────────────────────────────────────────┘
```

#### 3. Suggestions Dropdown

```
┌─────────────────────────────────────────────────┐
│  🔍 brazil                                      │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  🏢 Brazil Hotel                                │
│     📍 Rio de Janeiro, Brazil          [hotel]  │
├─────────────────────────────────────────────────┤
│  🏢 Brazilian Beach Resort                      │
│     📍 Salvador, Brazil                [resort] │
├─────────────────────────────────────────────────┤
│  🏢 Copacabana Palace                           │
│     📍 Rio de Janeiro, Brazil          [hotel]  │
└─────────────────────────────────────────────────┘
```

#### 4. Loading Hotel Details

```
┌─────────────────────────────────────────────────┐
│  🔍 Brazil Hotel                                │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  ⟳ Loading hotel details...                    │
└─────────────────────────────────────────────────┘
```

#### 5. Hotel Details Displayed

```
┌─────────────────────────────────────────────────┐
│  🔍 Brazil Hotel                                │
└─────────────────────────────────────────────────┘

Found 1 hotel

┌─────────────────────────────────────────────────┐
│  🏢  Brazil Hotel                    ⭐ 4       │
│      ID: ITT123456                              │
│      📍 Av. Atlantica, 1702                     │
│                                                 │
│      [mapped]  [Hotel]                      👁  │
└─────────────────────────────────────────────────┘
```

## Key Features

### 1. Autocomplete Dropdown

- Appears after typing 2+ characters
- Shows hotel name, location, and type
- Clickable suggestions
- Smooth animations
- Max height with scroll

### 2. Visual Feedback

- Loading spinner during search
- Different states for searching vs loading details
- Error messages in red
- Success indicators

### 3. Hotel Card

- Hotel icon with colored background
- Hotel name and rating
- ITTID for reference
- Address with location icon
- Status badges (mapped/unmapped/pending)
- Property type badge
- Eye icon for view action

### 4. Responsive Design

- Works on mobile and desktop
- Touch-friendly click targets
- Scrollable suggestions list
- Truncated text for long names

## Color Scheme

### Status Badges

- **Mapped**: Green background (#dcfce7), green text (#166534)
- **Unmapped**: Yellow background (#fef9c3), yellow text (#854d0e)
- **Pending**: Blue background (#dbeafe), blue text (#1e40af)

### UI Elements

- **Primary**: Blue (#007bff)
- **Success**: Green (#28a745)
- **Error**: Red (#dc3545)
- **Gray**: Various shades for backgrounds and text

## User Interactions

### Keyboard

- Type to search
- Enter key (future: navigate suggestions)
- Escape key (future: close dropdown)

### Mouse/Touch

- Click suggestion to select
- Click hotel card to view details
- Hover effects on interactive elements

## Accessibility

- Clear labels and placeholders
- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Focus indicators
