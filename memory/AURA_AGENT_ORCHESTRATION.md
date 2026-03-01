# Aura Agent Orchestration Skill

**Purpose:** Systematic delegation and coordination of the 14 ECC specialized agents.

## Available Agents (14)

### High-Complexity (Use Codex 5.3)
| Agent | When to Use | Model |
|-------|-------------|-------|
| `architect` | System design, architecture decisions, scalability | codex 5.3 |
| `chief-of-staff` | Multi-agent coordination, project management | codex 5.3 |
| `planner` | Task breakdown, implementation planning | codex 5.3 |

### Standard Tasks (Use Kimi K2.5)
| Agent | When to Use | Model |
|-------|-------------|-------|
| `code-reviewer` | Code review, quality checks | kimi k2.5 |
| `security-reviewer` | Security audit, vulnerability scan | kimi k2.5 |
| `database-reviewer` | DB schema, query optimization | kimi k2.5 |
| `refactor-cleaner` | Code refactoring | kimi k2.5 |
| `tdd-guide` | Test-driven development | kimi k2.5 |
| `python-reviewer` | Python-specific review | kimi k2.5 |
| `go-reviewer` | Go-specific review | kimi k2.5 |
| `e2e-runner` | End-to-end testing | kimi k2.5 |
| `doc-updater` | Documentation updates | kimi k2.5 |

### Debug/Fix Tasks (Use Codex 5.3)
| Agent | When to Use | Model |
|-------|-------------|-------|
| `build-error-resolver` | Build failures, compilation errors | codex 5.3 |
| `go-build-resolver` | Go build issues | codex 5.5 |

---

## Selection Algorithm

When receiving a task, ask:

1. **Is this architectural/planning?** → `architect` / `planner` / `chief-of-staff`
2. **Is this code review?** → `code-reviewer` / `python-reviewer` / `go-reviewer`
3. **Is this debugging?** → `build-error-resolver` / `go-build-resolver`
4. **Is this security?** → `security-reviewer`
5. **Is this refactoring?** → `refactor-cleaner`
6. **Is this testing?** → `tdd-guide` / `e2e-runner`
7. **Is this documentation?** → `doc-updater`

---

## Delegation Patterns

### Pattern 1: Simple Delegation
For straightforward tasks, delegate to ONE agent:
```
Read ~/.openclaw/skills/ecc/agents/{agent}.md
Then execute: [task description]
```

### Pattern 2: Sequential Pipeline
For multi-step work, chain agents:
```
1. @planner → Break down task
2. @architect → Design structure  
3. @code-reviewer → Review design
4. Execute code → Build
5. @build-error-resolver → Fix if errors
6. @security-reviewer → Security audit
```

### Pattern 3: Parallel Review
For comprehensive review, spawn multiple agents simultaneously:
```
- @code-reviewer → General code quality
- @security-reviewer → Security issues
- @database-reviewer → DB concerns
```

### Pattern 4: Chief Coordination
For large projects, use chief-of-staff to coordinate:
```
@chief-of-staff Manage this project:
- Delegate X to architect
- Delegate Y to planner
- Synchronize results
```

---

## Command Reference

Available commands for workflows:

| Command | Purpose |
|---------|---------|
| `plan.md` | Create implementation plan |
| `code-review.md` | Run code review |
| `tdd.md` | TDD workflow |
| `build-fix.md` | Fix build errors |
| `refactor-clean.md` | Refactoring |
| `e2e.md` | E2E testing |
| `verify.md` | Verification pipeline |
| `orchestrate.md` | Multi-agent orchestration |
| `learn.md` | Continuous learning |
| `evolve.md` | Self-improvement |

---

## Skill Reference

Available skills for domain expertise:

| Skill | Purpose |
|-------|---------|
| `api-design/` | REST/GraphQL patterns |
| `backend-patterns/` | Microservices, monoliths |
| `database-migrations/` | DB migrations |
| `deployment-patterns/` | Docker, CI/CD |
| `security/` | Auth, validation |
| `testing/` | Unit, integration, E2E |
| `django-patterns/` | Django-specific |
| `docker-patterns/` | Docker best practices |

---

## Context Files

Load before relevant work:
- `dev.md` - Development context
- `review.md` - Code review context  
- `research.md` - Research context

---

## Execution Rules

1. **ALWAYS delegate** - Don't do specialist work myself
2. **Map to right model** - Codex 5.3 for complex, Kimi for fast
3. **Use patterns** - Simple/Sequential/Parallel/Chief
4. **Reference files** - Load agent/command/skill files explicitly
5. **Integrate results** - Combine agent outputs coherently

---

## Example Workflows

### New Feature Implementation
```
@planner → Break down
@architect → Design  
[Implement]
@code-reviewer → Review
@security-reviewer → Audit
@e2e-runner → Test
```

### Bug Fix
```
@build-error-resolver → Diagnose
[Fix code]
@code-reviewer → Verify fix
@tdd-guide → Add regression test
```

### Refactoring
```
@refactor-cleaner → Plan refactoring
[Execute changes]
@code-reviewer → Verify quality
@database-reviewer → Check DB impact
```

### Security Audit
```
@security-reviewer → Full audit
@database-reviewer → DB security
@python-reviewer`/`go-reviewer` → Code security
```
