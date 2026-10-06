---
name: well-formed-outcome
description: Run the NLP Well-Formed Outcome frame on a goal, feature, or agent design to check all 7 conditions before building. Use when a goal is fuzzy, before writing a spec, or when asked to frame an outcome.
---

# Well-Formed Outcome

Run the 7-condition Well-Formed Outcome frame on any input. Works for product features, agent designs, personal goals, or business decisions. Forces clarity before action.

## Where this comes from

Outcome framing is one of the first things taught in NLP, neuro-linguistic programming, which looks at how the words we use shape what we do. AI agents are built from our language, so the questions that make a goal clear to a person make it clear to an agent too. That is why every condition below has an agent version.

## Mode Detection

Read the input. Pick the right mode.

| Signal | Mode | What to do |
|--------|------|------------|
| Vague, exploratory, "I want to..." "I'm thinking about..." | **Explore** | Ask one question at a time. Do research if needed. Help them discover what they want before framing. |
| Clear goal but unstructured | **Frame** | Run all 7 conditions, flag gaps, output the table |
| Agent or feature spec | **Check** | Scan for gaps in existing spec against the 7 conditions |
| Already clear with next step | **Pass** | Don't slow them down |

### Explore Mode

When the user doesn't know what they want yet, DO NOT output a table full of gaps. Instead:

1. Start with condition 1. Ask them: "What do you want this to do?" Wait for their answer.
2. If their answer is vague, do research first. Search the web, read code, check docs, whatever helps you ask a better follow-up.
3. Move to the next condition only when the current one has a real answer.
4. Keep it conversational. One question at a time. Fast answers, no essays.
5. After all 7 are answered, THEN output the completed frame table.

Research triggers during explore:
- User says "I don't know" or "maybe" or "something like..." → research options before asking again
- User references a tool/API/pattern they haven't used → look it up and present options
- User's answer conflicts with what's technically possible → research constraints and share them

The goal of explore mode is to help the user think, not to fill in a form.

### Iterative Gap Walkthrough Mode

This mode only kicks in **after Frame mode** has output its table and gaps. It is an alternative to dumping every gap back on the user at once.

After Frame outputs the table + Gaps list, the closing prompt should offer the walkthrough as the default path. If the user says yes (or jumps straight to "let's go through the gaps", "walk me through them", "one at a time", etc.), switch into iterative mode and follow these rules:

1. **One gap per turn.** Never present two open gaps in the same message. Same conversational tone as Explore mode.
2. **Full context on every gap.** For the gap you're presenting, include:
   - Which condition it is (number + name)
   - What the gap actually is (what's missing or weak in their input)
   - Why it matters (what breaks or stays fuzzy if it isn't resolved)
   - 2-3 concrete options OR a default recommendation they can accept, reject, or modify
3. **Wait for their answer.** Don't speculate forward or fill in the next gap preemptively.
4. **Lock it in.** When they answer, restate the locked answer in one line so they can confirm or correct, then move to the next gap.
5. **Research mid-walkthrough is allowed.** If a gap exposes a knowledge gap (an API, a constraint, a price, a pattern), research before presenting options. Same triggers as Explore mode.
6. **After all gaps resolved**, output the final **Reframed:** version with every answer baked in. Don't re-show the table unless asked, since the user already saw it. End with: `Ready to run, or want to tweak anything?`

If the user instead says "just give them all to me" or "I'll handle it", skip the walkthrough and leave Frame mode's output as-is.

#### Walkthrough example (one round)

> **Gap 1 of 3: Condition 3: Evidence**
>
> Right now there's no measurable definition of success. "Posts go live consistently" is directional but not testable.
>
> A few ways to make it concrete:
> - **A.** N posts/week shipped on schedule for 4 weeks straight
> - **B.** Engagement floor (e.g. avg 50 reactions/post across 4 weeks)
> - **C.** Both, cadence AND engagement floor
>
> Default rec: **A** for the first month, then layer in **B** once cadence is stable.
>
> Which way?

User: "A, but make it 5 posts/week."

> Locked: **5 posts/week shipped on schedule for 4 weeks.** Moving to Gap 2.
>
> **Gap 2 of 3: Condition 6: Ecology (with)** ...

## The 7 Conditions

Walk through each. Ask the question. Don't move on until it's answered.

### 1. Positive Outcome
**Ask:** What do you want? (not what you don't want)
**Agent equivalent:** System prompt defines success state, not failure avoidance
**Red flag:** Any "stop doing X" or "avoid Y" without a positive replacement

### 2. Self-Initiated
**Ask:** What can YOU control here? What's in your hands?
**Agent equivalent:** Scope to tools and permissions the agent actually has
**Red flag:** Outcome depends on someone else acting first

### 3. Sensory Evidence
**Ask:** How will you know when you have it? What does it look, feel, sound like?
**Agent equivalent:** Output validation, success criteria, test assertions
**Red flag:** "It should work better" with no measurable definition

### 4. Context
**Ask:** Where, when, with whom? What's the situation this applies to?
**Agent equivalent:** Context window, user persona, environment, constraints
**Red flag:** Universal solution with no boundaries

### 5. Ecology (Without)
**Ask:** What happens if you don't do this? What breaks? What do you lose?
**Agent equivalent:** Error states, fallback behavior, what fails downstream
**Red flag:** No answer means it might not matter enough to build

### 6. Ecology (With)
**Ask:** What changes in the system when this succeeds? Side effects? Who else is affected?
**Agent equivalent:** Side effects, state changes, downstream impacts, notifications
**Red flag:** No consideration of second-order effects

### 7. Next Step
**Ask:** What's the first concrete action?
**Agent equivalent:** First tool call, entry point, trigger
**Red flag:** Stuck in planning with no action defined

## Process

1. **Take the input** (goal, feature, agent spec, decision)
2. **Run each condition** as a question
3. **Flag gaps** where the answer is missing or weak
4. **Output the framed version**

## Output Format

```
**Input:** [raw goal/feature/spec]

**Frame:**

| # | Condition | Answer | Status |
|---|-----------|--------|--------|
| 1 | Positive Outcome | [what they want] | ok / gap |
| 2 | Self-Initiated | [what's in their control] | ok / gap |
| 3 | Evidence | [how they'll know] | ok / gap |
| 4 | Context | [where/when/who] | ok / gap |
| 5 | Ecology (without) | [cost of not doing it] | ok / gap |
| 6 | Ecology (with) | [system impact when done] | ok / gap |
| 7 | Next Step | [first action] | ok / gap |

**Gaps:** [list what's missing]

**Reframed:** [clean version with all 7 addressed]

---
Walk through the gaps one at a time? Or hand them back to you all at once?
```

## For Agent Design

When the input is an agent spec or system prompt, reframe the output:

```
**Agent:** [name/purpose]

| # | Condition | Agent Design Question | Answer |
|---|-----------|----------------------|--------|
| 1 | Positive Outcome | What does this agent produce? | |
| 2 | Self-Initiated | What tools/permissions does it have? | |
| 3 | Evidence | How does it validate success? | |
| 4 | Context | Who uses it, when, what's the input? | |
| 5 | Ecology (without) | What fails if this agent doesn't run? | |
| 6 | Ecology (with) | What changes in the system when it runs? | |
| 7 | Next Step | What's the trigger / entry point? | |

**Missing:** [gaps to fill before building]
```

## Examples

### Input: "I want to build a content scheduling agent"

**Frame:**

| # | Condition | Answer | Status |
|---|-----------|--------|--------|
| 1 | Positive Outcome | Agent that schedules content to LinkedIn on a consistent cadence | ok |
| 2 | Self-Initiated | Has access to drafts, scheduling API, posting permissions | ok |
| 3 | Evidence | Posts go live on schedule, engagement tracked | ok |
| 4 | Context | Solo founder, posting 3-5x/week, LinkedIn only | ok |
| 5 | Ecology (without) | Inconsistent posting, momentum dies, audience doesn't grow | ok |
| 6 | Ecology (with) | Consistent presence, but need to flag if voice drifts or content quality drops | gap |
| 7 | Next Step | Define post types and scheduling rules | ok |

**Gaps:** Condition 6 is thin. What happens to brand voice when an agent posts for you? What's the review process? Who catches a bad post?

---

### Input: "I want to make more money"

**Frame:**

| # | Condition | Answer | Status |
|---|-----------|--------|--------|
| 1 | Positive Outcome | ? "More" isn't specific | gap |
| 2 | Self-Initiated | ? What lever are you pulling | gap |
| 3 | Evidence | ? What number, by when | gap |
| 4 | Context | ? From which vehicle | gap |
| 5 | Ecology (without) | ? What's at risk if income stays flat | gap |
| 6 | Ecology (with) | ? What changes when income increases | gap |
| 7 | Next Step | ? No action possible without specifics | gap |

**Gaps:** Everything. Reframe: "I want to generate $X/month from [my app] by [date] by [specific mechanism]"

## Input

$ARGUMENTS
