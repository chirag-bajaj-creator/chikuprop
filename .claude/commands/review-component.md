Review the React component at: $ARGUMENTS

## Checklist — check each one and report pass/fail

### Loading & Error States
- [ ] Shows a loading indicator while fetching data
- [ ] Handles error state (shows message, not blank screen)
- [ ] Handles empty state (no data available)

### useEffect & Cleanup
- [ ] useEffect has proper cleanup (return cleanup function)
- [ ] No missing dependencies in dependency arrays
- [ ] No state updates on unmounted components

### API & Data
- [ ] API calls wrapped in try-catch
- [ ] User input validated before sending to backend
- [ ] Proper error responses caught and displayed

### Security
- [ ] No sensitive data (passwords, tokens) in component state
- [ ] No dangerouslySetInnerHTML with user input
- [ ] Auth check before rendering protected data

### Performance
- [ ] No unnecessary re-renders
- [ ] Lists use proper keys (not array index)
- [ ] Images have alt text

### Code Quality
- [ ] Component has one clear responsibility
- [ ] Naming is descriptive
- [ ] No repeated code that could be extracted

## What to do when a check fails
1. Show which check failed
2. Show the exact line with the problem
3. Show the corrected code

If everything passes, say so — don't invent problems.
