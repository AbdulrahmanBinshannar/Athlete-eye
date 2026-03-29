# Implementation Plan: Profile & Team Discovery Menu

I will implement two main components to improve navigation and team management.

## User Review Required

> [!IMPORTANT]
> The **Public Team Discovery** will make team names visible to all logged-in players. They will still need your approval to join and see any performance data.

## Proposed Changes

### 1. Unified Profile Page
#### [NEW] [/app/profile/page.tsx](file:///c:/Users/Admin/Documents/Athlete%20eye/app/profile/page.tsx)
-   **Biological Data**: Displays user name, role, and joined date.
-   **Role-Based Listings**:
    -   **Coaches**: Shows all teams they manage with 5-digit codes.
    -   **Players**: Shows all teams they have joined.
-   **Technical Aesthetic**: Uses the technical grid background and glass-cards.

### 2. Team Discovery (Public Menu)
#### [MODIFY] [/app/player/join/page.tsx](file:///c:/Users/Admin/Documents/Athlete%20eye/app/player/join/page.tsx)
-   **Selectable Menu**: Add a tab to browse all teams created by coaches.
-   **Search Bar**: Easily filter teams by name.
-   **Request Admission**: A simple button to request entry to any squad.

### 3. Navigation Update
#### [MODIFY] [BottomNav & CoachNav](file:///c:/Users/Admin/Documents/Athlete%20eye/components/BottomNav.tsx)
-   Add a "Profile" icon to the bottom navigation bar for quick access.

## Verification Plan

### Manual Verification
-   Navigate to `/profile` as both a Coach and a Player.
-   In `/player/join`, switch to the "Browse Directory" tab and verify teams list behaves correctly.
-   Ensure the 5-digit code search still works.
