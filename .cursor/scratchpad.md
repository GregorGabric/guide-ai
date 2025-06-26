# TextToSpeech Refactor with RevenueCat Integration

## Background and Motivation

We need to refactor the current textToSpeech.ts implementation from a direct action pattern to Convex's recommended mutation + scheduled action pattern. This change is driven by:

1. **Rate Limiting**: Server-side enforcement to prevent API abuse and control costs
2. **Free Trial Management**: Track usage limits for trial users
3. **RevenueCat Integration**: Validate subscription status before processing TTS requests
4. **Business Model Enforcement**: Bulletproof server-side validation that can't be bypassed

Current implementation uses a direct action that clients call, which doesn't provide the necessary controls for a freemium business model.

## Key Challenges and Analysis

### Technical Challenges

- Refactoring from direct action to mutation + internal action pattern
- Adding database schema for TTS request tracking and user management
- Integrating RevenueCat subscription validation server-side
- Implementing proper rate limiting and trial management
- Maintaining backward compatibility during transition

### Business Logic Requirements

- Free trial: Limited TTS requests (e.g., 10 free requests or 3-day trial)
- Subscription validation: Check RevenueCat entitlements server-side
- Rate limiting: Prevent abuse (e.g., max 20 requests per hour per user)
- Paywall integration: Return specific errors that trigger paywall on client

## High-level Task Breakdown

### Phase 1: Database Schema Updates

- [ ] **Task 1.1**: Add `users` table for trial tracking

  - Success criteria: Schema includes `userId`, `trialTtsCount`, `trialExpiresAt`, `createdAt`
  - Verify: Schema validates and migrations work

- [ ] **Task 1.2**: Add `subscriptions` table for RevenueCat sync

  - Success criteria: Schema includes `userId`, `entitlements`, `isActive`, `expiresAt`, `revenuekatUserId`
  - Verify: Schema validates and can store RevenueCat data structure

- [ ] **Task 1.3**: Add `ttsRequests` table for request tracking
  - Success criteria: Schema includes `userId`, `text`, `status`, `audioData`, `createdAt`, `completedAt`, `errorMessage`
  - Verify: Schema supports tracking request lifecycle and rate limiting queries

### Phase 2: RevenueCat Server Integration

- [ ] **Task 2.1**: Create RevenueCat webhook handler

  - Success criteria: HTTP endpoint receives and validates RevenueCat webhooks
  - Verify: Webhook updates subscription status in database correctly

- [ ] **Task 2.2**: Implement subscription validation utilities
  - Success criteria: Functions to check active subscription and entitlements
  - Verify: Correctly identifies trial vs paid users, handles edge cases

### Phase 3: TTS Mutation Implementation

- [ ] **Task 3.1**: Create `requestTextToSpeech` mutation

  - Success criteria: Validates user limits, creates request record, schedules internal action
  - Verify: Returns appropriate errors for rate limits, expired trials, inactive subscriptions

- [ ] **Task 3.2**: Convert existing action to `generateTextToSpeech` internal action
  - Success criteria: Handles ElevenLabs API calls, updates request status, stores results
  - Verify: Maintains same audio quality and error handling as current implementation

### Phase 4: Rate Limiting & Business Logic

- [ ] **Task 4.1**: Implement trial limit enforcement

  - Success criteria: Tracks trial usage, blocks requests when limits exceeded
  - Verify: Trial users can't exceed limits, proper error responses trigger paywall

- [ ] **Task 4.2**: Implement rate limiting logic
  - Success criteria: Prevents abuse with configurable limits (e.g., 20/hour)
  - Verify: Rate limits work correctly, don't block legitimate usage

### Phase 5: Client Integration

- [ ] **Task 5.1**: Update client code to use new mutation

  - Success criteria: Replace direct action calls with mutation calls
  - Verify: Same user experience, proper error handling

- [ ] **Task 5.2**: Integrate paywall triggers
  - Success criteria: Show paywall when TTS limits exceeded or subscription expired
  - Verify: Paywall appears at right times, successful purchases restore access

### Phase 6: Testing & Cleanup

- [ ] **Task 6.1**: Write comprehensive tests

  - Success criteria: Test trial limits, rate limiting, subscription validation, error cases
  - Verify: All business logic edge cases covered

- [ ] **Task 6.2**: Remove old direct action (if not needed)
  - Success criteria: Clean up unused code, update any remaining references
  - Verify: No breaking changes, all functionality preserved

## Project Status Board

### Current Status / Progress Tracking

- [ ] Phase 1: Database Schema Updates
  - [ ] Task 1.1: Add `users` table for trial tracking
  - [ ] Task 1.2: Add `subscriptions` table for RevenueCat sync
  - [ ] Task 1.3: Add `ttsRequests` table for request tracking
- [ ] Phase 2: RevenueCat Server Integration
  - [ ] Task 2.1: Create RevenueCat webhook handler
  - [ ] Task 2.2: Implement subscription validation utilities
- [ ] Phase 3: TTS Mutation Implementation
  - [ ] Task 3.1: Create `requestTextToSpeech` mutation
  - [ ] Task 3.2: Convert existing action to `generateTextToSpeech` internal action
- [ ] Phase 4: Rate Limiting & Business Logic
  - [ ] Task 4.1: Implement trial limit enforcement
  - [ ] Task 4.2: Implement rate limiting logic
- [ ] Phase 5: Client Integration
  - [ ] Task 5.1: Update client code to use new mutation
  - [ ] Task 5.2: Integrate paywall triggers
- [ ] Phase 6: Testing & Cleanup
  - [ ] Task 6.1: Write comprehensive tests
  - [ ] Task 6.2: Remove old direct action (if not needed)

### Configuration Requirements

- Rate limit: 20 TTS requests per hour per user
- Trial limit: 10 free TTS requests OR 3-day trial period
- Required entitlement: 'pro' (matching existing paywall code)

## Executor's Feedback or Assistance Requests

_This section will be updated by the Executor during implementation_

## Lessons

_This section will capture any implementation insights, bug fixes, or corrections during development_

---

_Plan created: Ready for Executor implementation_
