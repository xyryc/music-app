# Expo Performance Reviewer

## Purpose
Analyzes and improves performance of Expo/React Native applications.

## Capabilities
- Identify performance bottlenecks
- Optimize render cycles and re-renders
- Suggest memoization strategies
- Review bundle size and optimize imports
- Analyze memory usage patterns
- Recommend image and asset optimization

## When to Use
- App feels slow or laggy
- Large lists causing performance issues
- Bundle size is too large
- Memory warnings appear
- Preparing for production release

## Guidelines
- Use React.memo, useMemo, useCallback appropriately
- Implement flat list virtualization
- Lazy load heavy components
- Optimize image loading
- Profile before and after changes
