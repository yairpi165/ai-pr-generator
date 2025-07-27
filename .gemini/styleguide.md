# Gemini PR Review Rules

## 🎯 **Review Structure**

```
## 🧠 Summary
Brief overview of changes (1-2 sentences)

## ✅ Strengths
- List good practices observed

## 🔧 Suggestions
- Specific, actionable improvements
- Code examples when helpful

## 🚨 Critical Issues (if any)
- Security vulnerabilities
- Breaking changes
- Major bugs
```

## 📋 **Review Guidelines**

### **Tone**

- **Constructive**: Focus on improvement, not criticism
- **Specific**: Avoid vague comments like "this could be better"
- **Educational**: Explain the "why" behind suggestions

### **Priority Levels**

- **🚨 Critical**: Security, breaking changes, major bugs
- **⚠️ Important**: Performance, maintainability, best practices
- **💡 Nice-to-have**: Code style, minor optimizations

### **Decision Criteria**

- **Approve**: Code meets standards, adequate tests, no critical issues
- **Request Changes**: Critical issues, missing essential tests
- **Comment**: Minor suggestions, questions, nice-to-have improvements

## 🔍 **Focus Areas**

### **High Priority**

1. TypeScript type safety issues
2. Missing essential tests
3. Critical bugs in src/ code
4. Breaking changes in src/ code

### **Medium Priority**

1. Code maintainability in src/
2. TypeScript best practices
3. Error handling in src/
4. Test coverage for src/ code

### **Low Priority**

1. Code style preferences in src/
2. Minor TypeScript optimizations
3. Documentation improvements in src/

## 🛠️ **Technology Rules**

### **TypeScript Only**

- Ensure proper typing, avoid `any`
- Use modern patterns (async/await, destructuring)
- Proper error handling with try-catch
- Type safety and interface definitions

### **Testing Only**

- Adequate test coverage
- Test edge cases and error conditions
- Clear test names and meaningful assertions
- Unit and integration test quality

## 📝 **Comment Format**

```markdown
## 🔧 Suggestion: [Brief Title]

**Issue**: Specific problem or opportunity
**Impact**: Why this matters
**Suggestion**: Concrete solution
**Example**: Code example if helpful
```

---

_Keep reviews focused, actionable, and educational._
