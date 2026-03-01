# Everything Claude Code - Agent Skills

**Location:** `~/.openclaw/skills/ecc/`
**Source:** https://github.com/affaan-m/everything-claude-code

## Installed Capabilities

### 14 Specialized Agents
Location: `~/.openclaw/skills/ecc/agents/`

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| architect.md | System architecture design | Designing new systems, refactoring architecture |
| build-error-resolver.md | Fix build errors | Build failures, compilation errors |
| chief-of-staff.md | Project coordination | Multi-agent orchestration, PM tasks |
| code-reviewer.md | General code review | PR reviews, code quality checks |
| database-reviewer.md | DB schema review | Database design, query optimization |
| doc-updater.md | Documentation maintenance | Updating docs after changes |
| e2e-runner.md | E2E test execution | Running end-to-end tests |
| go-build-resolver.md | Go build fixes | Go-specific build errors |
| go-reviewer.md | Go code review | Go code quality |
| planner.md | Task planning | Breaking down large tasks |
| python-reviewer.md | Python code review | Python code quality |
| refactor-cleaner.md | Code refactoring | Improving existing code |
| security-reviewer.md | Security audit | Security reviews |
| tdd-guide.md | TDD workflow | Test-driven development |

### 32 Commands
Location: `~/.openclaw/skills/ecc/commands/`

Key commands for workflows:
- `plan.md` - Create implementation plans
- `code-review.md` - Run code reviews
- `tdd.md` - TDD workflow
- `build-fix.md` - Fix build errors
- `refactor-clean.md` - Refactoring workflow
- `e2e.md` - E2E testing
- `verify.md` - Verification pipeline
- `orchestrate.md` - Multi-agent orchestration
- `learn.md` - Continuous learning
- `evolve.md` - Self-improvement

### 56 Skills
Location: `~/.openclaw/skills/ecc/skills/`

Categories:
- API Design patterns
- Backend architecture patterns
- Database migrations
- Deployment patterns
- Security best practices
- Testing strategies
- Framework-specific patterns (Django, React, etc.)

### 102+ Rules
Location: `~/.openclaw/skills/ecc/rules/`

Organized by:
- `common/` - Universal rules
- `typescript/` - TypeScript-specific
- `python/` - Python-specific
- `golang/` - Go-specific

### Contexts
Location: `~/.openclaw/skills/ecc/contexts/`

- `dev.md` - Development context
- `review.md` - Code review context
- `research.md` - Research context

### Hooks & MCP Configs
- `~/.openclaw/skills/ecc/hooks/` - 12 workflow hooks
- `~/.openclaw/skills/ecc/mcp-configs/` - 14 MCP configurations

## Usage in Sessions

### Using Agents
When a task matches an agent's specialty, load their instructions:

```
Read ~/.openclaw/skills/ecc/agents/architect.md and apply to design a microservice for...
```

### Using Commands
For specific workflows:

```
Follow ~/.openclaw/skills/ecc/commands/plan.md to create a plan for...
```

### Using Skills
For specific expertise:

```
Apply patterns from ~/.openclaw/skills/ecc/skills/api-design/ to review this API
```

### Loading Contexts
For session context:

```
Load context from ~/.openclaw/skills/ecc/contexts/dev.md
```

## Integration Notes

These skills enhance my default capabilities. They are NOT committed to any repository - they are my personal configuration stored in ~/.openclaw/skills/

When I need specialized expertise, I should reference these files in my thinking or load them into context.

## Maintenance

To update:
```bash
cd ~/.openclaw/skills/ecc
git pull
```
