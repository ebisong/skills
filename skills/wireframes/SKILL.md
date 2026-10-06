---
name: wireframes
description: Turn a statement of work, brief, or call notes into a clickable wireframe file a client can review and sign before development. Use for wireframes, mockups, or feedback on wireframes it made.
---

# Wireframes

Draw every screen of a product before anyone builds it. The person gives you their source documents and what they are trying to deliver. You give back one HTML file they can open by double-clicking, walk through with the client, and get signed.

The person running this is usually a product or client-facing person, not an engineer. They know the client and the requirements. They should never have to think about files, code, or tooling.

## What you produce

One file, `index.html`, built from `assets/template.html` in this skill's folder. It works offline and needs nothing installed. Inside it:

- Every screen, one state per screen, each with a stable label like `B2.1`
- Under each screen, the requirements it shows and the decisions still open
- A list of screens grouped by who uses them, with Previous and Next
- A feedback box on every screen, and one button that copies all feedback as text
- Review pages the file builds by itself: requirement coverage, open decisions, a printable sign-off sheet

Wireframes here are mid-fidelity. Layout and wording are real. Colors, fonts, and polish are not the point and should not be debated in review.

## How to talk to the person

- Plain words. Say "screen", "step", "who uses it". Never say HTML, section, attribute, or scope tag unless they do first.
- One question at a time. Offer your best guess with every question so they can answer "yes".
- Ask only what the documents do not answer. Never ask them to repeat what they gave you.
- If they do not know, do not stall. Write it down as an open decision on the screen and keep going. The review is where those get answered.
- Never ask about tech stack, databases, or frameworks. Wireframes do not need them.

## The steps

### 1. Collect the sources

Ask for whatever they have: the statement of work, a brief, proposals, meeting notes, transcripts, emails, sketches, an existing app to replace. Attached files, a folder, pasted text, or a connected drive or knowledge base all work.

Read before asking anything, in this order:

1. **Find the document that governs.** Usually the signed statement of work. When there are several versions, use the newest signed one, and tell the person which one you used and why.
2. **Read that one in full.** It decides what is in scope.
3. **Skim the rest for detail** the governing document leaves out: exact wording, field lists, rules, examples. With a large pile, read what the governing document refers to and skip the rest.
4. **Note where documents disagree.** A count that differs between two documents, or a feature one mentions and the other doesn't, becomes an open decision later. Never settle it quietly yourself.

If they have no documents, interview them instead. Start with "Who uses this, and what is the first thing each of them needs to do?"

### 2. Say back what you understood

Before drawing anything, give them a short summary to correct:

- **Who uses it.** Each kind of person, how they get in, what they do there.
- **What it must do.** A numbered list of requirements in plain sentences. Give each an ID with a short prefix for its area, like `BOOK-1`, `BOOK-2`, `DAY-1`. If the documents already number their requirements, keep their numbers. Note where each came from ("SOW section 2.3", "call on Sep 30"). Size each one so a person could look at a screen and say yes or no to it. A typical project lands between 15 and 40. Leave out anything no screen could show, like hosting, speed, or security rules.
- **What is unclear.** Gaps and contradictions you found.

Fix whatever they correct. Do not move on until they agree the list is right, because every screen points back to it.

### 3. Close the gaps

Ask about the gaps one at a time, most important first. Good questions are about what a person sees and does:

- "What does someone see the very first time, before there is any data?"
- "What happens if the email never arrives?"
- "Can they change this afterwards, or is it final?"

Stop when the main path for each kind of person is clear. Five to ten questions is typical. Anything still unanswered becomes an open decision on the screen it affects.

### 4. Agree the screen list

Show a table of every screen you plan to draw, grouped by who uses it, and get a yes before drawing. A list is cheap to change. Drawn screens are not.

| Label | Screen | Who | Why it exists |
|-------|--------|-----|---------------|
| A1 | Who uses it | everyone | guide page |
| B1 | Pick a service | owner | required: BOOK-1, BOOK-2 |
| B2.1 | Pick a time · Slots available | owner | required: BOOK-3 |
| B2.2 | Pick a time · No slots left | owner | needed: the week can be full |

Rules for the list:

- **One state per screen.** The empty version, the error version, and the normal version of a page are three screens. Give them dotted labels under one parent (`B2.1`, `B2.2`) so feedback can point at exactly one.
- **Labels.** One letter per group of screens, then a number. Keep them short. Once the person has seen a label, never change it or reuse it.
- **Start with a guide page** (`A1 Who uses it`) that names each kind of person and shows the overall flow.
- **Mark why each screen exists**, in one of three ways:
  - `required`: a requirement names it
  - `needed`: no requirement names it, but the product cannot work without it (sign-in, empty states, errors, confirmation emails)
  - `extra`: beyond the requirements. Say why it is worth considering.
- **Draw the lean set first.** Draw every required and needed screen. List the extras as suggestions and draw only the ones the person picks. Extras are where scope grows quietly, so keep them visible and few.
- **Think through each person's whole path**, from how they first get in to the last thing they see, including messages sent to them (emails, texts). This is where missed requirements tend to show up.
- **Then walk each path again looking for what goes wrong.** At every step ask: what if there is nothing here yet, what if it fails, what if they are late, what if the wrong person opens it, what if they come back a week later? Each real answer is a `needed` screen. Documents rarely mention these, and they are a large share of what gets built.
- **Find the people the documents forget.** Someone creates the accounts, fixes bad data, and answers support requests. If that is the team building the product, they need screens too. Ask who does it.

### 5. Draw

1. Copy `assets/template.html` to the output location as `index.html`. Copy the file. Never retype it. The styles and the script are the working shell and must stay exactly as shipped.
2. Fill in the `#wf-project` element: name, client, version `0.1`, today's date, a one or two sentence summary. Set `data-accent` to the client's brand color if you know it. Leave it empty otherwise.
3. Add the requirements above the `<!-- wf:requirements -->` marker.
4. Add one journey per kind of person above the `<!-- wf:journeys -->` marker. Each step names the screen where it happens.
5. Add the screens above the `<!-- wf:screens -->` marker, a few at a time, in the order someone would walk through them. Keep the markers in place so more can be added later.

Read `references/screen-kit.md` before writing the first screen. It has the exact markup and every building block. `assets/example-content.html` is a complete worked example. Match its quality. To see that example as a finished file, run `node scripts/check.mjs --example example.html` and open it.

What makes a screen good:

- **Real content.** Real-looking names, numbers, dates, and button labels. Never lorem ipsum, never "Label 1". Wording is half of what the client is signing.
- **One cast, one story.** Invent a small set of named people and one organization and use them on every screen, at moments on one timeline. The client reads it as a story, and inconsistencies jump out.
- **One primary action per screen.** One filled button. Everything else is secondary.
- **A one-line explanation** above each screen saying what moment this is and what matters about it.
- **Every requirement note cites its ID** in `<code>` tags. That is what builds the coverage page.
- **Unknowns become open decisions** under the screen, phrased as a question the client can answer. Keep these for questions where the answer would change the screen or the scope. For small things, pick the sensible default, draw it, and list it in an `info` note titled "Assumed". A review can get through about one open decision per two screens. Many more than that and the important ones get lost.
- **Buttons that lead somewhere get `data-go`** pointing at the next screen, so the person can click through the main path.
- **Phone screens** get `data-device="phone"` when the person will mostly be on a phone.

### 6. Check your work

If you can run commands:

```
node scripts/check.mjs path/to/index.html
```

Fix every error. Fix or be ready to explain every warning. If you cannot run commands, read back through the file against the rules in `references/screen-kit.md`. The file also checks itself: when it has problems, a **File checks** page appears in its list.

Then confirm by reading the result: every requirement appears on at least one screen, every required and needed screen sits in someone's journey, and every screen has its explanation line.

### 7. Hand it over

Give them the file and tell them, in a few lines:

- Double-click `index.html` to open it. It works offline.
- Arrow keys or Next move through the screens. Start at A1.
- How many screens there are, how many decisions are open, and the two or three open decisions that matter most.
- In the review, type notes into the box under each screen. At the end open **Feedback**, press **Copy all feedback**, and paste it back to you.
- **Sign-off sheet** prints for a signature. **Print every screen** saves the whole catalog as a PDF to send.

In Claude Code, save to `wireframes/index.html` in the project (or `docs/wireframes/index.html` if the project has a `docs` folder) and offer to open it. In the Claude app, create the file and share it so they can download it.

### 8. Apply review feedback

When the person comes back with pasted feedback, meeting notes, or a transcript:

1. Work from the existing `index.html`. Never start over.
2. Match every comment to a screen label. If a comment does not say which screen, ask.
3. Change the screens. When an open decision gets answered, move it to a decided note with the date and who decided ("Decided in the review, Oct 9").
4. Add new screens with new labels. Remove cut screens, and never give their labels to anything else.
5. If the feedback changes a requirement, change the requirements list too, and tell the person plainly that the requirement changed. A changed requirement changes scope, and they should bring that to the client deliberately.
6. Raise the version (`0.1` to `0.2`) and the date. Run the check again.
7. Tell them what changed, screen by screen, and what is still open.

Repeat until the open decisions are gone and the sheet is signed.

## Where this stops

- No high-fidelity design. If they ask for final colors and polish, say this version settles layout, wording, and flow first, and that visual design comes after sign-off.
- No working features. Buttons move between screens and nothing else.
- No estimates, tech choices, or build plans. The signed wireframes are the input to those.

## Input

$ARGUMENTS
