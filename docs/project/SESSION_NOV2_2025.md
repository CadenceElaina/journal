# Session Plan - November 2, 2025

**Session Duration:** ~2 hours  
**Focus:** Frontend Journal Components

---

## 🎯 Today's Goals

1. **JournalEntryForm** - Complete the form for creating/editing journal entries
2. **JournalCard** - Display individual journal entries in the list
3. **JournalList** - Wire everything together with pagination

**Stretch Goal:** Start search/filter UI if time permits

---

## 📋 Tasks Breakdown

### Task 1: JournalEntryForm Component

**Goal:** Build a fully functional form for creating and editing journal entries

**Current State:**

- ✅ Basic structure exists
- ✅ Form state setup (title, content, tags, moods, isShared)
- ❌ Tag input needs implementation
- ❌ Mood selection UI needed
- ❌ Word count display missing
- ❌ API integration needed
- ❌ Loading/error states needed

**What needs to be done:**

- [ ] Tag input (adapt from onboarding TagInput)
- [ ] Mood selection UI (chips or dropdown)
- [ ] Word count auto-display
- [ ] Submit handler with API call
- [ ] Loading state during submission
- [ ] Error handling and display
- [ ] Success feedback
- [ ] Edit mode support (pre-populate form)

---

### Task 2: JournalCard Component

**Goal:** Display a single journal entry with all its information

**Current State:**

- ✅ Component file exists but empty
- ❌ No implementation

**What needs to be done:**

- [ ] Display title, content preview, date
- [ ] Display tags (styled chips)
- [ ] Display moods (styled icons/chips)
- [ ] Show word count
- [ ] Edit button (navigate to edit form)
- [ ] Delete button (with confirmation)
- [ ] Click to expand/view full entry
- [ ] Responsive card layout
- [ ] Date formatting (relative or absolute)

---

### Task 3: JournalList Component

**Goal:** Display all journals with pagination

**Current State:**

- ✅ Basic structure exists
- ✅ Connected to JournalsContext
- ❌ JournalCard not implemented
- ❌ Pagination controls missing
- ❌ Empty state missing
- ❌ Loading state missing

**What needs to be done:**

- [ ] Map through journals and render JournalCard for each
- [ ] Pagination controls (Previous/Next, page numbers)
- [ ] Empty state ("No journals yet" with CTA to create)
- [ ] Loading state (spinner or skeleton)
- [ ] Error state display
- [ ] Fetch journals on component mount
- [ ] Wire up pagination to JournalsContext

---

## 🗓️ Session Workflow

### 1. Task 1: JournalEntryForm (~45-60 min)

**Step 1: Understanding (10 min)**

- Review existing form structure
- Understand what props/state are needed
- Review JournalsContext methods available
- Look at onboarding TagInput for reference

**Step 2: Planning (5 min)**

- Break down the form into sub-components or sections
- Decide on UI approach for mood selection
- Plan form validation

**Step 3: Implementation (30-40 min)**

- Add tag input functionality
- Add mood selection UI
- Add word count calculation and display
- Wire up API integration
- Add loading/error states
- Test create and edit flows

**Step 4: Testing (5 min)**

- Test creating a journal
- Test editing a journal
- Test validation and error cases

---

### 2. Task 2: JournalCard (~30 min)

**Step 1: Planning (5 min)**

- Decide on card layout and styling
- Plan responsive behavior
- Decide on expand/collapse approach

**Step 2: Implementation (20 min)**

- Build card component with all journal data
- Add edit/delete buttons
- Add click handlers
- Style the card

**Step 3: Testing (5 min)**

- Test with different journal data
- Test edit/delete functionality
- Check responsive design

---

### 3. Task 3: JournalList (~20-30 min)

**Step 1: Implementation (15-20 min)**

- Wire up JournalCard rendering
- Add pagination controls
- Add empty/loading/error states
- Fetch journals on mount

**Step 2: Testing (5-10 min)**

- Test full CRUD flow
- Test pagination
- Test edge cases (no journals, errors)

---

## 📚 Concepts You'll Practice Today

**React Patterns:**

- Form handling and controlled components
- State management with Context API
- Component composition
- Conditional rendering (loading, error, empty states)
- Event handling
- Array mapping and rendering lists

**API Integration:**

- Making API calls with async/await
- Handling loading states
- Handling errors
- Updating context state after API calls

**UI/UX:**

- Form validation feedback
- Loading indicators
- Error messages
- Empty states
- Responsive design

---

## 🚀 Getting Started

**First Question:** Let's start with JournalEntryForm. Have you looked at the current implementation? What do you think the form needs in terms of:

1. Tag input - should it be like the onboarding one or different?
2. Mood selection - chips, dropdown, or something else?
3. Content textarea - should it support markdown or plain text?

---

## 📌 Notes Section

_(Use this space to document questions, insights, or issues during the session)_

---

**Session End:** Update LEARNING_PROGRESS.md with frontend concepts practiced
