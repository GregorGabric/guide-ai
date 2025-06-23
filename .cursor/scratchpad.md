# Visited Places Tracking Feature Implementation Plan

## Background and Motivation

The user has requested a comprehensive new feature to track all visited places with relevant statistics. This feature will enhance the Guide AI app by providing users with a visual record of their travels and exploration history.

**Feature Requirements:**

1. **Globe View**: Interactive 3D globe showing all visited places
2. **Automatic Tracking**: Automatically add places when attraction bottom sheet is opened
3. **Manual Addition**: Allow users to manually add locations they've visited
4. **Statistics**: Display relevant stats about visited places
5. **Visual Experience**: Engaging 3D globe interface for place visualization

**Current App Context:**

- The app already has attraction discovery via Google Places API
- Places data is stored in Convex database (`places.ts`, `placesActions.ts`)
- Bottom sheet component (`attraction-bottom-sheet.tsx`) shows place details
- Location services are already implemented (`useLocation.ts`)
- App has established design system and UI components

**Business Value:**

- Gamification: Encourages users to explore more places
- Memory Keeping: Personal travel journal functionality
- Social Sharing: Potential for sharing travel achievements
- User Engagement: Visual progress tracking increases app stickiness

## Key Challenges and Analysis

### Technical Challenges:

1. **3D Globe Implementation**: Need to choose and integrate a 3D globe library (React Native Three.js, react-native-maps 3D, or custom WebGL)
2. **Performance**: 3D rendering with potentially hundreds of markers needs optimization
3. **Database Design**: New schema for visited places with stats tracking
4. **Automatic Detection**: Integrate with existing attraction bottom sheet to automatically track visits
5. **Coordinate Management**: Handle coordinate conversion, accuracy, and duplicate detection
6. **Offline Support**: Consider caching and offline functionality for visited places

### UX/Design Challenges:

1. **Globe Navigation**: Intuitive controls for rotating, zooming, and interacting with 3D globe
2. **Place Visualization**: Clear markers/pins that work well on 3D surface
3. **Information Density**: Showing place details without cluttering the globe
4. **Manual Addition Flow**: Smooth UX for users to add places they've visited
5. **Statistics Presentation**: Meaningful and engaging stats display

### Data Architecture Challenges:

1. **Visit Detection Logic**: Define what constitutes a "visit" (opening bottom sheet, time spent, etc.)
2. **Duplicate Prevention**: Avoid multiple entries for the same place
3. **Data Migration**: Handle existing users who may have interacted with places before
4. **Statistics Calculation**: Real-time vs. computed stats for performance
5. **Privacy Considerations**: User control over visit tracking

## High-level Task Breakdown

### Phase 1: Database Schema and Backend Foundation

- [ ] **Task 1.1**: Design visited places database schema and Convex functions

  - **Success Criteria**: Schema defined with visits table, functions for CRUD operations, automatic visit tracking logic implemented
  - **Estimated Time**: 2-3 hours

- [ ] **Task 1.2**: Implement visit statistics calculation system

  - **Success Criteria**: Functions to calculate total visits, countries/cities visited, distance traveled, etc.
  - **Estimated Time**: 2-3 hours

- [ ] **Task 1.3**: Create manual place addition backend logic
  - **Success Criteria**: API to add places manually, search integration, coordinate validation
  - **Estimated Time**: 2-3 hours

### Phase 2: 3D Globe Implementation

- [ ] **Task 2.1**: Research and select 3D globe library for React Native

  - **Success Criteria**: Library selected, basic globe rendering working, performance acceptable
  - **Estimated Time**: 3-4 hours

- [ ] **Task 2.2**: Implement basic globe with place markers

  - **Success Criteria**: Interactive 3D globe displaying visited places as markers
  - **Estimated Time**: 4-5 hours

- [ ] **Task 2.3**: Add globe interaction controls (zoom, rotate, tap)
  - **Success Criteria**: Smooth gesture controls, place selection, marker interaction
  - **Estimated Time**: 3-4 hours

### Phase 3: Integration with Existing Features

- [ ] **Task 3.1**: Integrate automatic visit tracking with attraction bottom sheet

  - **Success Criteria**: Opening attraction bottom sheet automatically records visit
  - **Estimated Time**: 2-3 hours

- [ ] **Task 3.2**: Implement manual place addition UI and flow

  - **Success Criteria**: User can search and add places manually, intuitive UX
  - **Estimated Time**: 3-4 hours

- [ ] **Task 3.3**: Create visited places screen with globe and stats
  - **Success Criteria**: Complete screen with 3D globe, statistics panel, navigation integration
  - **Estimated Time**: 4-5 hours

### Phase 4: Statistics and Polish

- [ ] **Task 4.1**: Implement comprehensive statistics dashboard

  - **Success Criteria**: Display total visits, unique places, countries, distance, time-based stats
  - **Estimated Time**: 3-4 hours

- [ ] **Task 4.2**: Add place detail views and visit history

  - **Success Criteria**: Detailed view for each visited place, visit timestamps, notes capability
  - **Estimated Time**: 2-3 hours

- [ ] **Task 4.3**: Performance optimization and error handling
  - **Success Criteria**: Smooth performance with many markers, proper error handling, loading states
  - **Estimated Time**: 2-3 hours

### Phase 5: Testing and Enhancement

- [ ] **Task 5.1**: Implement comprehensive testing for visit tracking

  - **Success Criteria**: Unit tests for database operations, integration tests for automatic tracking
  - **Estimated Time**: 3-4 hours

- [ ] **Task 5.2**: Add data migration for existing users

  - **Success Criteria**: Existing users' place interactions migrated to new visit system
  - **Estimated Time**: 2-3 hours

- [ ] **Task 5.3**: Final UX polish and accessibility
  - **Success Criteria**: Smooth animations, accessibility features, final design polish
  - **Estimated Time**: 2-3 hours

## Project Status Board

### 🚀 Ready to Start

- (None)

### 📋 In Progress

- Task 1.2: Implement visit statistics calculation system

### ✅ Completed

- Task 1.1: Design visited places database schema and Convex functions

### ❌ Blocked

- (None)

## Current Status / Progress Tracking

**Current Status**: Phase 1 Implementation In Progress - Core backend functionality implemented

**Completed Implementation**:

1. ✅ **Database Schema**: Added `visitedPlaces` and `visitStats` tables to Convex schema with proper indexing
2. ✅ **Backend Functions**: Created comprehensive Convex functions in `visitedPlaces.ts`:
   - `recordVisit` - Records new visits with duplicate prevention
   - `getVisitedPlaces` - Retrieves all visited places
   - `getVisitStats` - Gets aggregated statistics
   - `addManualVisit` - Allows manual place addition
3. ✅ **UI Components**:
   - Created visited places screen (`/(tabs)/visited.tsx`) with satellite/hybrid map view
   - Added visited places button to bottom tabs
   - Updated tab navigation structure
4. ✅ **Automatic Tracking**: Added visit recording logic to attraction bottom sheet (pending Convex API regeneration)

**Current Blockers**:

- Convex API needs to be regenerated to include new `visitedPlaces` functions
- Some type errors in visited places screen due to missing API

**Ready for Next Steps**:

- Need to run Convex development server to regenerate API
- Complete automatic visit tracking integration
- Add manual place addition functionality

**Project Overview**: This is a new major feature addition to the Guide AI app. The visited places tracking feature will add significant value by:

- Providing visual travel history through an interactive 3D globe
- Automatically tracking user engagement with places
- Enabling manual curation of travel experiences
- Displaying meaningful statistics about user's exploration

**Technical Architecture Decisions Needed**:

1. **3D Globe Library Selection**:

   - Options: React Native Three.js, react-native-maps with 3D, Expo GL, Web-based solution in WebView
   - Considerations: Performance, bundle size, platform compatibility, ease of implementation

2. **Database Schema Design**:

   ```typescript
   // Proposed schema additions:
   visitedPlaces: {
     placeId: string,  // Reference to existing places
     userId: string,   // If user system exists
     visitedAt: number,
     visitType: 'automatic' | 'manual',
     coordinates: { lat: number, lng: number },
     placeName: string,
     placeAddress?: string,
     notes?: string,
     photos?: string[], // File IDs
   }

   visitStats: {
     userId: string,
     totalVisits: number,
     uniquePlaces: number,
     countriesVisited: string[],
     citiesVisited: string[],
     lastUpdated: number,
   }
   ```

3. **Integration Points**:
   - Hook into `AttractionBottomSheet` component for automatic tracking
   - Add new tab or screen for globe view
   - Integrate with existing location services
   - Connect with places search functionality

**Integration Analysis Complete**:

Based on my analysis of the codebase, I've identified key integration points:

1. **Automatic Visit Tracking**: The `AttractionBottomSheet` component (`src/features/places/components/attraction-bottom-sheet.tsx`) is triggered when users interact with attractions. This is the perfect place to automatically record visits.

2. **Existing Database Structure**:

   - `places` table with comprehensive place data including coordinates
   - `messages` table linked to locationId for chat functionality
   - Current schema supports Google Places API data

3. **Navigation Structure**:

   - App uses Expo Router with tabs (`src/app/(tabs)/_layout.tsx`)
   - Currently has placeholder tabs that can be replaced with our visited places feature
   - Main map screen at `src/app/index.tsx` handles attraction selection

4. **Technical Stack Already Present**:
   - Convex database with TypeScript support
   - React Native Maps for 2D mapping
   - Reanimated 3 for animations
   - TanStack Query for data fetching
   - Expo for cross-platform development

**Recommended Architecture**:

- Add `visitedPlaces` table to existing Convex schema
- Hook into `AttractionBottomSheet` mounting to trigger visit recording
- Replace one of the placeholder tabs with visited places globe
- Use react-native-three.js or WebGL for 3D globe implementation

**Next Steps**:

1. Begin Phase 1 with database schema design and automatic visit tracking
2. Research optimal 3D globe library (leaning toward react-three-fiber for React Native)
3. Implement visit recording in attraction bottom sheet component

## Executor's Feedback or Assistance Requests

_This section will be populated by the Executor as implementation progresses_

### Questions for User:

1. **Globe Library Preference**: Do you have a preference for the 3D globe implementation? (React Native Three.js, Web-based, native maps)
2. **Visit Definition**: What should trigger an "automatic visit"? (Opening bottom sheet, staying on screen for X seconds, etc.)
3. **Statistics Priority**: Which statistics are most important? (Total places, countries, distance traveled, etc.)
4. **Navigation Integration**: Where should the visited places globe be accessible? (New tab, modal, separate screen)
5. **Manual Addition UX**: Should manual addition use search, map selection, or both?

### Technical Considerations:

- Performance implications of 3D rendering on lower-end devices
- Data privacy and user control over visit tracking
- Offline functionality requirements
- Integration with existing Convex database structure

## Lessons

_This section will be populated with lessons learned during implementation_

### Technical Lessons:

- Include info useful for debugging in the program output
- Read the file before editing it
- Check for vulnerabilities with npm audit before proceeding
- Always ask before using -force git commands

---

**Plan Status**: ✅ Complete and Ready for Review
**Last Updated**: Initial Creation - Visited Places Feature Planning
**Total Estimated Implementation Time**: 32-42 hours
**Priority**: High - Major feature addition
**Dependencies**: Existing location services, places API, Convex database
