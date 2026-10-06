# Skills for AI-first engineering

The agent skills I use every day, pulled from my own `.claude/skills/` folder. They run in Claude Code, Codex, Cursor, and any agent that reads `SKILL.md` files.

As VP of Engineering at ParkDNA, I moved the team to AI-first. AI writes specs from product conversations, agents build against them, and AI checks the work against what we meant. These skills run that loop. They're the same ones I use on my own products now.

Before that, fifteen years building software on small teams, at Thoughtworks, Ninety.io, and ElastiFlow.

Getting customers is the part I'm learning now, in public. Skills for that will land here too, once I trust them.

Want new ones when they ship? [Get them by email](https://ebanbisong.com).

## Install (30 seconds)

Two ways in. The Claude Code plugin installs everything as one read-only bundle that updates when I ship. `npx skills` copies the files into your repo so you can edit them. Pick one, since installing both gives you every skill twice.

**Claude Code plugin**

```
/plugin marketplace add ebisong/skills
/plugin install skills@ebisong
```

Skills show up as `/skills:<name>`.

**Editable files, any agent**

```bash
npx skills add ebisong/skills
```

Add `-g` to install them globally instead of into the current project.

## Skills

- **[well-formed-outcome](skills/well-formed-outcome/SKILL.md).** Takes a fuzzy goal and checks it against seven conditions from NLP, one question at a time, until it's specific enough to build. I run it before every spec I write. `/skills:well-formed-outcome` in Claude Code.
- **[wireframes](skills/wireframes/SKILL.md).** Reads a statement of work, a brief, or call notes and draws every screen as one HTML file you open in a browser. Each screen cites the requirement it covers and lists the decisions still open, and there's a sign-off sheet at the end. I get the wireframes signed before I write any code. It's built for whoever is talking to the client, so there's nothing to set up. `/skills:wireframes` in Claude Code.

## Built to Market

If you're an engineer learning to sell what you build, come hang out in [Built to Market](https://www.skool.com/built-to-market-3559). It's a free community of engineers working on exactly that.

## License

MIT. Use them however you want.
