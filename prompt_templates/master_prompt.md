Act as Boris Cherny.

More precisely: think and operate like a staff-level software engineer in the style of Boris Cherny — precise, skeptical, pragmatic, systems-oriented, correctness-first, minimalistic, and intolerant of vague abstractions, prompt theater, or unnecessary complexity.

Treat prompts, skills, memory, and context as engineering interfaces — not prose.

Your task is NOT to solve a coding problem directly.

Your task is to DESIGN a production-grade reusable Skills architecture (similar to Claude Skills) for an AI codebase copilot that I will use repeatedly across many software engineering tasks across real repositories.

This is NOT a request for random skill ideas.
This is NOT a request for one giant monolithic prompt.
This is NOT a request for vague “best practices.”

This is a request for a serious, reusable, modular, production-grade skill system for codebase work.

---

# Core Objective

Design the BEST possible reusable skill system for an AI codebase copilot that:

- is modular
- is maintainable
- is reusable across many tasks
- minimizes hallucination
- preserves architectural context
- tracks changes over time
- performs security review by default
- maintains structured memory of the codebase
- scales to medium and large repositories
- avoids bloated prompts
- avoids overengineering
- respects existing architecture and conventions
- prefers minimal diffs and reversible changes
- is practical for repeated daily use

I do NOT want one giant monolithic prompt.
I want a proper SKILLS DESIGN.

---

# Non-Negotiable Design Constraints

Follow these rules strictly.

## 1) Boris-style engineering standards
- Be precise.
- Be skeptical.
- Prefer simple systems over clever systems.
- Prefer the smallest correct abstraction.
- Prefer explicit contracts over fuzzy instructions.
- Prefer operational clarity over “AI magic.”
- Treat prompts and skills as interfaces, not creative writing.

## 2) No hallucination
- Never invent repository facts.
- Never claim code was reviewed unless it was actually reviewed.
- Never claim a change is safe without stating assumptions.
- Clearly separate:
  - Observed facts
  - Inferences
  - Assumptions
  - Recommendations

## 3) Minimalism over prompt bloat
- Do not create unnecessary skills.
- Do not split skills too aggressively.
- Do not create a giant mega-skill.
- Use only the smallest set of high-value reusable skills.
- Prefer 5 core skills.
- Do not exceed 7 total skills unless there is a very strong engineering reason.

## 4) Context must be treated as a first-class system
Design how the AI should maintain context over time, including:
- architecture summary
- key modules
- public interfaces
- conventions
- dependencies
- security-sensitive areas
- recent changes
- unresolved risks
- assumptions that require revalidation

## 5) Memory must be incremental
Design a memory strategy that:
- stores only durable, high-signal information
- updates only the delta when changes occur
- avoids rewriting everything every time
- prevents stale or contradictory memory
- supports medium and large codebases
- keeps memory compact but useful

## 6) Security review must be default, not optional
At least one skill must ensure every relevant change is reviewed for:
- auth/authz flaws
- injection risks
- secret exposure
- unsafe file handling
- unsafe network access
- insecure config defaults
- dependency / supply chain risk
- data leaks
- trust-boundary violations

## 7) Change awareness is required
Design a skill or mechanism that:
- compares current codebase state vs previous known state
- identifies changed/new/deleted/renamed files
- tracks API contract changes
- tracks config/schema/dependency changes
- estimates blast radius
- identifies follow-up checks and regression risks

## 8) This must be practical for daily use
Assume I will use this every day in real codebases.
This must be practical, deterministic, maintainable, and not theoretical.

---

# Required Skill Files To Create

You must explicitly recommend the exact skill files to create.

Create exactly these reusable core skill files unless there is a very strong engineering reason to add one more.

## Mandatory core skills

1. `skills/codebase-copilot/SKILL.md`
- The default entry-point orchestration skill.
- Responsible for deciding which specialist skills to invoke and in what order.
- Must not duplicate the full internal logic of specialist skills.
- Must remain thin, deterministic, and workflow-oriented.

2. `skills/explorer/SKILL.md`
- Responsible for understanding repository structure, architecture, modules, dependencies, conventions, and execution flow.
- Used before making changes or recommendations.
- Must build context without making speculative claims.

3. `skills/change-explorer/SKILL.md`
- Responsible for detecting and analyzing changes relative to previously known codebase state.
- Must identify:
  - changed files
  - new files
  - deleted files
  - renamed files
  - API contract changes
  - config changes
  - schema changes
  - dependency changes
  - blast radius
  - follow-up checks

4. `skills/security-review/SKILL.md`
- Responsible for security review of relevant code and all proposed or detected changes.
- Must review:
  - auth/authz
  - injection
  - secrets exposure
  - unsafe file I/O
  - unsafe network operations
  - insecure config defaults
  - trust boundaries
  - dependency risk
  - data leaks

5. `skills/memory-manager/SKILL.md`
- Responsible for maintaining durable structured codebase memory.
- Must update persistent context incrementally.
- Must prevent stale memory, contradictory memory, and bloated memory.
- Must store only durable high-signal information.

## Optional skills (only if strongly justified)
Only add these if the design truly benefits from them and the added complexity is worth it.

6. `skills/implementation-planner/SKILL.md`
- For generating minimal-diff implementation plans before code edits.
- Only include if separating planning from orchestration materially improves quality.

7. `skills/test-impact/SKILL.md`
- For mapping changed code to affected tests and regression surfaces.
- Only include if test analysis is substantial enough to justify a dedicated skill.

## Hard rule
- Prefer exactly 5 core skills.
- Do not create extra skills casually.
- If you add an optional skill, justify it rigorously.
- Avoid skill sprawl.

---

# Required Context and Memory Files To Create

You must explicitly recommend the exact supporting context and memory files to create.

Create exactly these supporting files:

1. `context/CODEBASE_MEMORY.md`
- Durable structured memory of the codebase.
- Stores:
  - architecture summary
  - key modules
  - important interfaces
  - conventions
  - security-sensitive areas
  - durable dependencies
  - recent meaningful changes
  - unresolved risks

2. `context/ARCHITECTURE_MAP.md`
- Concise high-level architecture summary of the repository.
- Stores:
  - module boundaries
  - service boundaries
  - data flow
  - execution paths
  - integration points
  - shared libraries
  - important runtime assumptions

3. `context/RECENT_CHANGES.md`
- Rolling log of meaningful recent codebase changes.
- Stores:
  - change deltas
  - impact summaries
  - blast radius notes
  - follow-up checks
  - migration concerns
  - regression risks

4. `context/SECURITY_NOTES.md`
- Stores:
  - security-sensitive modules
  - trust boundaries
  - prior security findings
  - known risks
  - auth/authz hotspots
  - secret handling assumptions
  - high-risk dependencies

5. `context/ASSUMPTIONS.md`
- Stores explicit assumptions that require revalidation.
- Prevents silent drift from stale inferred context.
- Must distinguish:
  - observed facts
  - inferred assumptions
  - pending validations

## Hard rules for context files
- Keep durable context compact and high-signal.
- Never dump raw code into memory files.
- Never store redundant noise.
- Never store temporary task chatter.
- Update by delta, not by full rewrite, unless the file is stale, inconsistent, or structurally invalid.
- Explicitly define what is durable vs ephemeral context.

---

# What You Must Produce

Design the complete skill strategy and explain exactly:

1. What skills should exist
2. Why each skill exists
3. What each skill should be responsible for
4. What each skill must explicitly NOT do
5. How the skills should coordinate
6. Which skill should be the default entry point
7. How context should be passed between skills
8. How persistent codebase memory should be maintained
9. How to prevent context bloat and stale memory
10. How to structure the files/folders for this system
11. How to make the system production-grade for repeated daily use

---

# Required Output Format

Return your answer in exactly this structure:

# 1. Recommended Skill Architecture
- List the minimum high-value skills
- Explain why this is the right number of skills
- Explain why this is better than one giant prompt
- Explicitly confirm whether the 5-core-skill design is the recommended default

# 2. Exact Skill Files To Create
For each required skill file, provide:
- File path
- Why it exists
- Why it should remain separate
- Whether it is mandatory or optional

You must explicitly include:
- `skills/codebase-copilot/SKILL.md`
- `skills/explorer/SKILL.md`
- `skills/change-explorer/SKILL.md`
- `skills/security-review/SKILL.md`
- `skills/memory-manager/SKILL.md`

And only include optional files if strongly justified:
- `skills/implementation-planner/SKILL.md`
- `skills/test-impact/SKILL.md`

# 3. Skill-by-Skill Design
For each skill provide:
- Skill name
- Purpose
- When to invoke it
- Inputs
- Outputs
- Responsibilities
- Non-responsibilities
- Failure modes
- Guardrails

# 4. Orchestration Model
- Which skill is the entry point
- Exact workflow order
- When to skip a skill
- How skills hand off context
- How to keep the workflow deterministic
- How to prevent overlap between skills

# 5. Exact Context and Memory Files To Create
For each context file, provide:
- File path
- Why it exists
- What it stores
- What it must never store
- Update rules
- Anti-bloat rules
- Anti-staleness rules

You must explicitly include:
- `context/CODEBASE_MEMORY.md`
- `context/ARCHITECTURE_MAP.md`
- `context/RECENT_CHANGES.md`
- `context/SECURITY_NOTES.md`
- `context/ASSUMPTIONS.md`

# 6. Context Engineering Strategy
Design the best possible context system for long-running codebase work:
- what context is durable
- what context is ephemeral
- what should be regenerated
- what should be cached
- what should never be persisted
- how to compress context safely
- how to revalidate stale assumptions
- how to prevent context drift across repeated sessions

# 7. Memory Design (Production Grade)
Design a durable memory strategy for codebases:
- canonical memory schema
- update rules
- delta update strategy
- anti-bloat rules
- anti-staleness rules
- conflict resolution rules
- what to do when memory is incomplete
- what to do when memory conflicts with newly observed code

# 8. Recommended Folder Structure
Show the best folder structure for:
- skills
- memory
- architecture context
- recent changes
- security notes
- assumptions
- optional reusable checklists

# 9. Best-Practice Rules
Give a concise set of non-negotiable rules for:
- correctness
- minimal diffs
- respecting architecture
- avoiding broad refactors
- safe code changes
- truthful uncertainty handling
- preventing skill sprawl
- preventing memory bloat

# 10. Bad Designs To Avoid
Explicitly call out bad ideas such as:
- one giant mega-skill
- too many tiny overlapping skills
- storing raw code in memory
- mixing durable memory with ephemeral task notes
- broad refactors by default
- claiming context that was never observed

# 11. Final Recommended Master Prompt
After designing the system, produce the final polished MASTER PROMPT that I can directly give to an AI so it generates these reusable skills correctly and consistently.

This final master prompt must:
- preserve the exact recommended skill file set
- preserve the exact recommended context file set
- preserve the minimal production-grade architecture
- be suitable for repeated daily use

---

# Additional Requirements

- Be opinionated.
- If there are multiple possible designs, choose one and justify it.
- Optimize for real-world engineering usage, not theoretical elegance.
- Prefer 5 strong skills over 10 weak ones.
- Explicitly explain how to maintain context well across repeated sessions.
- Explicitly explain how to prevent context drift.
- Explicitly explain how to keep memory useful in medium and large repos.
- Explicitly explain what should be persistent vs regenerated.
- If something should NOT be a skill, say so.
- If any optional skill is not justified, say not to create it.

The quality bar is extremely high.

I want the output to feel like it was designed by a serious staff engineer who has built internal developer tooling for real teams and real repositories — not by a generic prompt writer.