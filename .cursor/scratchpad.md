# Project Restructuring: Feature-Based Organization

## Background and Motivation

The user has requested help organizing their React Native/Expo project structure to be feature-based. Currently, the project follows a mixed organizational pattern with some components organized by type (`_components/`, `services/`, `convex/`) and others by routing structure (`(tabs)/`, `(api)/`).

**Current Project Type**: React Native/Expo app with:

- AI-powered travel guide functionality
- Location-based services (maps, places)
- Chat/messaging features
- Attraction discovery and carousel displays
- Convex backend integration
- Expo Router for navigation

**Current Structure Issues**:

- Components scattered across `app/_components/`, `components/`, and mixed with pages
- Business logic split between `services/`, `convex/`, and components
- No clear feature boundaries
- Mixed concerns in file organization

## Key Challenges and Analysis

### Identified Features/Domains:

1. **Places/Attractions** - Core feature for discovering and displaying locations

   - Files: `services/places/`, `convex/places.ts`, `convex/placesActions.ts`, `app/_components/attraction-*`
   - Includes: place search, display, carousel, bottom sheets, map integration

2. **AI Chat** - Conversational interface for travel assistance

   - Files: `app/_components/ai-chat/`, `convex/chat.ts`, `convex/messages.ts`
   - Includes: chat interface, message handling, streaming

3. **Maps/Location** - Geographic and navigation functionality

   - Files: Location logic in `app/index.tsx`, map components
   - Includes: map display, location services, navigation

4. **Text-to-Speech** - Audio/voice functionality

   - Files: `convex/textToSpeech.ts`
   - Includes: speech synthesis

5. **Shared/Core** - Common utilities and components
   - Files: `components/ui/`, `lib/`, `utils/`, `store/`
   - Includes: UI primitives, themes, utilities, state management

### Technical Considerations:

- Expo Router file-based routing must be preserved in `app/` directory
- Convex backend files should stay in `convex/` for deployment compatibility
- Shared UI components need to remain accessible across features
- Import paths will need systematic updating

## High-level Task Breakdown

### Phase 1: Analysis and Planning

- [x] **Task 1.1**: Analyze current project structure and identify features ✅
- [x] **Task 1.2**: Document current file organization and dependencies ✅
- [x] **Task 1.3**: Design new feature-based structure ✅
- [ ] **Task 1.4**: Create migration plan with import path updates

### Phase 2: Core Feature Extraction

- [ ] **Task 2.1**: Create `src/features/` directory structure
  - Success Criteria: New directory exists with feature folders
- [ ] **Task 2.2**: Extract Places/Attractions feature
  - Success Criteria: All attraction-related components, services, and types moved to `src/features/places/`
- [ ] **Task 2.3**: Extract AI Chat feature
  - Success Criteria: All chat components and logic moved to `src/features/chat/`
- [ ] **Task 2.4**: Extract Maps/Location feature
  - Success Criteria: Location services and map logic organized in `src/features/maps/`

### Phase 3: Shared Resources Organization

- [ ] **Task 3.1**: Organize shared UI components in `src/shared/ui/`
  - Success Criteria: Reusable components accessible to all features
- [ ] **Task 3.2**: Consolidate utilities and libs in `src/shared/lib/`
  - Success Criteria: Common utilities centralized and accessible
- [ ] **Task 3.3**: Organize store/state management in `src/shared/store/`
  - Success Criteria: Global state organized by domain

### Phase 4: Import Path Updates and Testing

- [ ] **Task 4.1**: Update all import statements to new paths
  - Success Criteria: No import errors, all references updated
- [ ] **Task 4.2**: Update TypeScript path mappings and build config
  - Success Criteria: Build system recognizes new structure
- [ ] **Task 4.3**: Test app functionality after reorganization
  - Success Criteria: All features working correctly, no broken imports

### Phase 5: Final Cleanup and Documentation

- [ ] **Task 5.1**: Remove empty directories and update .gitignore if needed
  - Success Criteria: Clean directory structure
- [ ] **Task 5.2**: Update any documentation or README files
  - Success Criteria: Documentation reflects new structure

## Proposed New Structure

```
guide-ai/
├── app/                          # Expo Router - routing only
│   ├── (tabs)/
│   ├── (api)/
│   ├── _layout.tsx
│   ├── index.tsx                 # Main map screen (orchestrates features)
│   └── modal.tsx
├── src/
│   ├── features/
│   │   ├── places/
│   │   │   ├── components/
│   │   │   │   ├── attraction-carousel/
│   │   │   │   ├── attraction-bottom-sheet.tsx
│   │   │   │   └── index.ts
│   │   │   ├── services/
│   │   │   │   ├── placesService.ts
│   │   │   │   └── types.ts
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── chat/
│   │   │   ├── components/
│   │   │   │   ├── ai-chat.tsx
│   │   │   │   ├── ai-chat-input.tsx
│   │   │   │   ├── ai-chat-message.tsx
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   ├── maps/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   └── index.ts
│   │   └── audio/
│   │       ├── services/
│   │       └── index.ts
│   └── shared/
│       ├── ui/                   # Reusable UI components
│       ├── lib/                  # Utilities, theme, etc.
│       ├── hooks/                # Shared hooks
│       ├── store/                # Global state management
│       ├── services/             # Shared services
│       └── types/                # Shared types
├── convex/                       # Backend stays here for deployment
├── assets/
└── ...config files
```

## Project Status Board

### Current Sprint: Planning Phase

- [x] Analyze current structure
- [x] Identify features and domains
- [x] Design new structure
- [ ] **NEXT**: Get approval for migration plan from user
- [ ] Create feature directories
- [ ] Begin Places feature extraction

### Blockers

- None currently

### Completed

- ✅ Current structure analysis
- ✅ Feature identification
- ✅ New structure design
- ✅ Migration plan creation

## Current Status / Progress Tracking

**Status**: Planning Complete - Ready for Implementation
**Current Phase**: Phase 1 - Analysis and Planning  
**Next Phase**: Phase 2 - Core Feature Extraction

The analysis has identified 5 main features that can be cleanly separated:

1. Places/Attractions (largest feature)
2. AI Chat
3. Maps/Location
4. Audio/Text-to-Speech
5. Shared utilities

The proposed structure maintains Expo Router compatibility while creating clear feature boundaries with proper separation of concerns.

## Executor's Feedback or Assistance Requests

_None at this time - planning phase complete_

## Lessons

_Will be populated during implementation_
