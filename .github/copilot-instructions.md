---
description: Code structure and style guidelines
---
# Code Structure and Style Guidelines

### File Length and Structure
- Never allow a file to exceed **500 lines**.  
- If a file approaches **400 lines**, break it up immediately into smaller, logically grouped files.  
- Treat **1000 lines as unacceptable**, even temporarily.  
- Use clear **naming conventions** to keep small files logically grouped.  

### Responsibility and Modularity
- Every functionality should exist in a **dedicated class, struct, or protocol**, even if small.  
- Follow the **Single Responsibility Principle**:  
  - Each file must focus on a **single responsibility**.  
  - Each view, manager, or view model should have one clear role.  
  - If something feels like it “does two things,” split it immediately.  
- Code should be modular and **reusable like Lego blocks**:  
  - Interchangeable, testable, and isolated.  
  - Ask: “Can this class be reused in a different screen or project?” If not, refactor.  
- Favor **composition over inheritance**, but always use object-oriented thinking.  

### Manager and Coordinator Patterns
- **ViewModel** → Handles UI-specific business logic.  
- **Manager** → Handles general business logic, services, or external dependencies.  
- **Coordinator** → Handles navigation and state flow between screens.  
- Avoid tightly coupling business logic directly into Views. Views should be kept lightweight.  

### Function and Class Size
- Keep functions under **30–40 lines** (48 lines maximum).  
- If a class gets over **200 lines**, assess whether it needs splitting into helper classes or extracting shared utilities.  
- Avoid “God classes” or “God functions” that know too much or do too many things.  

### Naming and Readability
- All class, method, and variable names must be **clear and descriptive**.  
- Avoid short or non-descriptive names like `x`, `tmp`, or `data`. Use intent-revealing names.  
- Methods should read like verbs or actions (`fetchUser`, `calculateTotal`).  
- Classes and structs should read like nouns (`UserManager`, `CheckoutCoordinator`).  

### Code Architecture and Reuse
- Favor **dependency injection** to reduce tight coupling between components.  
- Write code for reuse and scaling, not just to “make it work.”  
- Always separate concerns to maximize testability and maintainability.  

### Additional Best Practices
- Keep **protocols small and focused**, prefer fine-grained responsibilities over massive ones.  
- Ensure error handling is clear and consistent, never swallowed silently.  
- Write **unit tests** for business logic in Managers and ViewModels.  
- Use **extensions** to group related methods and improve readability within a file.  
- Maintain consistent code formatting (indentation, line spacing, and brace styles). VS Code should be configured with a formatter/prettier/linter so style is enforced automatically.