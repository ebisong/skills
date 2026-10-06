# Screen kit

The exact markup for a wireframe file built from `assets/template.html`. Everything here is plain HTML. Use only the classes listed. Do not add `<style>`, `<script>`, images, or links to anything outside the file.

`assets/example-content.html` shows all of this in a finished project.

## The four things you write

### 1. Project

Replace the attributes and the text of the existing element.

```html
<div id="wf-project" hidden
     data-name="Pawline"
     data-client="Sam's Dog Grooming"
     data-version="0.1"
     data-date="2026-10-06"
     data-accent="#1f7a6d">
  One or two sentences on what is being built and for whom.
</div>
```

`data-accent` is the color of primary buttons and highlights. Leave it empty for the default blue. Pick a color dark enough for white text.

### 2. Requirements

One `<li>` each, above the `<!-- wf:requirements -->` marker.

```html
<li data-id="BOOK-1" data-source="Brief, page 1">An owner can book a groom without creating an account.</li>
```

- `data-id`: capital letters, a hyphen, a number. Unique.
- `data-source`: where it came from, in the person's words.
- The text is one testable sentence.

### 3. Journeys

One `<ol>` per kind of person, above the `<!-- wf:journeys -->` marker. One `<li>` per step.

```html
<ol data-role="Owner (Maya)">
  <li data-screen="B1">Opens the booking link and picks a service.</li>
  <li data-screen="B2">Picks a time, or sees that the week is full.</li>
</ol>
```

`data-screen` is a screen label (`B1`) or a parent label (`B2`, covering `B2.1` and `B2.2`). These steps become the sign-off sheet.

### 4. Screens

One `<section class="wf">` each, above the `<!-- wf:screens -->` marker, in walking order.

```html
<section class="wf" id="b2-1" data-k="B2.1" data-parent="B2" data-parent-name="Pick a time"
         data-name="Slots available" data-who="Maya · phone" data-group="Booking"
         data-scope="required" data-url="pawline.example/sam/time" data-device="phone">
  <p class="lede">Only times Sam can take a 90-minute groom are shown.</p>
  <div class="screen">
    ... the wireframe, built from the kit below ...
  </div>
  <aside class="note" data-kind="req">
    <ul><li>A slot appears only if the whole service fits. <code>BOOK-3</code></li></ul>
  </aside>
  <aside class="note" data-kind="open">
    <ul><li>Should there be a waitlist?</li></ul>
  </aside>
</section>
```

| Attribute | Required | What it is |
|-----------|----------|------------|
| `id` | yes | Lowercase, unique, no dots: `b2-1`. Used in links and `data-go`. |
| `data-k` | yes | The label people say out loud: `B2.1`. Unique. Never changes once shared. |
| `data-name` | yes | Short name of this state: `Slots available`. |
| `data-group` | yes | Heading it sits under in the list. Usually the kind of person or the area. |
| `data-who` | recommended | Who sees it and on what: `Maya · phone`. |
| `data-scope` | for product screens | `required`, `needed`, or `extra`. Leave it off for guide pages. |
| `data-scope-why` | for extras | One sentence on why an extra is worth considering. |
| `data-parent` | for states | Parent label when this is one state of a screen: `B2`. |
| `data-parent-name` | first state only | Parent's name: `Pick a time`. |
| `data-url` | optional | Text for the address bar. Use a made-up address like `app.example/orders`, or `Messages`, or `Email`. |
| `data-device` | optional | `phone` draws a narrow phone frame. Leave it off for desktop. |

Inside the section, in this order:

1. `<p class="lede">`: one or two sentences. What moment this is, what matters.
2. `<div class="screen">`: the wireframe. Exactly one.
3. `<aside class="note" data-kind="...">`: zero or more. Each holds one `<ul>`.

Never put a `<section>` inside a screen. Use `<div>`.

### Notes

| `data-kind` | Heading shown | Use for |
|-------------|---------------|---------|
| `req` | Requirements shown | What this screen satisfies. End each line with the requirement ID in `<code>`. |
| `open` | Open decisions | Questions the client must answer. One question per `<li>`. |
| `decided` | Decided | Answers already given. Say when and by whom. |
| `info` | Notes | Anything else worth saying. |

`data-title="..."` overrides the heading, for example `data-title="Decided in the review, Oct 9"`.

Only IDs inside a `req` note count toward coverage. Every ID you cite must be in the requirements list.

### Click-through

Add `data-go="screen-id"` to any button or row that leads to another screen. Use the `id`, not the label.

```html
<span class="btn primary" data-go="b3">Continue</span>
```

## The kit

Buttons, fields, and choices are drawn, not real. Use `<span>` and `<div>`, never `<button>`, `<input>`, or `<a>`.

### Layout

| Class | What it does |
|-------|--------------|
| `stack` | Children top to bottom with even gaps. The default wrapper for forms and phone screens. |
| `row` | Children side by side, wrapping. |
| `spread` | Side by side, pushed to opposite ends. A title and its button. |
| `cols` | Two equal columns. `cols c3` and `cols c4` for three and four. |
| `narrow` | Centered, at most 520px wide. Sign-in and other single-purpose pages. |
| `side` | Left menu plus main area. First child is `<nav>`, second is the content. |
| `tw` | Wrap every `<table>` in this so it scrolls on small screens. |

```html
<header class="topbar"><b>App name</b><nav><span aria-current="page">Today</span><span>Week</span></nav></header>

<div class="side">
  <nav><span aria-current="page">Orders</span><span>Customers</span><span>Settings</span></nav>
  <div class="stack">...</div>
</div>
```

Repeat the same `topbar` or `side` menu on every screen of the same app area, with the right item marked `aria-current`.

### Content

| Class | What it draws |
|-------|---------------|
| `card` | A bordered box. Start it with `<h5>` for a small heading. |
| `num` | A big number, for dashboards. |
| `label` | A small uppercase heading above a field or group. |
| `muted` | Secondary text. |
| `mono` | Fixed-width text for times, codes, IDs. |
| `pill` | A status tag. Add `good`, `warn`, `crit`, or `accent`. |
| `ph` | A hatched placeholder for images, charts, and maps. Say what it stands for inside it. |
| `banner` | A message strip. Add `good`, `warn`, or `crit`. |
| `empty` | A dashed box for "nothing here yet". Say what to do next inside it. |
| `prog` | A progress bar: `<div class="prog"><b style="width:60%"></b></div>`. |
| `toast` | A small dark confirmation message. |
| `modal` | A dialog box, centered. |
| `mail` | An email. Start with `<div class="hdr">From: ... · To: ...</div>`. |
| `chat` + `msg` | A conversation or text message. `msg me` is the person's own message. |
| `flow` + `step` | A row of numbered steps, for overview pages. |

Use `<h2>` for the page title inside a screen and `<h3>` for section titles.

### Controls

```html
<span class="btn primary">Save</span>          <!-- the one main action -->
<span class="btn">Cancel</span>                <!-- secondary -->
<span class="btn danger">Delete</span>
<span class="btn link">Forgot password?</span>
<span class="btn disabled">Send</span>

<div><span class="label">Email</span><div class="field">name@company.com</div></div>
<div><span class="label">Email</span><div class="field filled">maya@example.com</div></div>
<div><span class="label">Phone</span><div class="field filled error">555 010</div><div class="help error">That number looks too short.</div></div>
<div class="field area">Longer text</div>

<div class="choice on"><i></i>Selected option</div>
<div class="choice"><i></i>Another option</div>

<div class="check done"><i></i>Finished item</div>
<div class="check"><i></i>Item to do</div>

<div class="seg"><span aria-current="true">Day</span><span>Week</span><span>Month</span></div>
```

A `field` with only the class shows placeholder text in grey. Add `filled` when it holds a value the person typed.

### Small adjustments

A `style` attribute is fine for spacing and sizing only: `style="margin-top:14px"`, `style="min-height:160px"`, `style="width:60%"`. Never use it for colors or fonts.

## Common screens

**List page.** `topbar`, a `spread` with the `<h2>` and the primary button, then a table in `tw`. Put a status `pill` in its own column and the row action in the last column.

**Detail page.** `topbar`, a `spread` title row, then `cols` with the main `card` on the left and facts on the right.

**Form.** `stack` of label and field pairs, one primary button at the bottom. Draw the error state as its own screen with one field marked `error`.

**Dashboard.** `cols c3` or `cols c4` of cards with `num`, then a table or a `ph` chart below.

**Empty state.** The same page frame with an `empty` box where the content would be, saying what is missing and the one thing to do next.

**Error or blocked state.** A `banner crit` or `banner warn` at the top saying what happened and what the person can do. Never only "Something went wrong".

**Email or text message.** A `mail` or a `chat` with one `msg`, with `data-url="Email"` or `data-url="Messages"`. Write the real wording.

**Sign-in.** `narrow` containing a `stack`: title, one field, one primary button, a `btn link`.

**Confirmation step.** A `modal` over the page's `topbar`, with the consequence stated in the title and two buttons.

## Before you finish

- Every product screen has `data-scope`. Guide pages do not.
- Every `required` screen cites at least one requirement.
- Every `extra` screen has `data-scope-why`.
- Every requirement is cited on at least one screen.
- Every product screen is a step, or the parent of a step, in a journey.
- Every `data-go` points at an `id` that exists.
- The three `<!-- wf:... -->` markers are still in the file.
- Names, dates, and numbers agree across screens.
