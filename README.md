# Interview Coach

An AI interview coach whose feedback you can check.

Most AI interview coaches give you a score and expect you to trust it. This one shows the evidence behind every score, checks that evidence, and refuses to invent achievements when it rewrites your answer.

**Live demo:** https://YOURNAME.github.io/interview-coach/ (replace with your link)

## What it does

1. **Setup:** paste or upload your resume and paste a job description. The coach pulls out the role's main requirements and the facts on your resume, and writes the first question in the same step.
2. **Question:** each question targets the requirement you've practiced least and refers to something real on your resume. You can rate whether it feels realistic, or skip it.
3. **Follow-up:** one probing follow-up aimed at the vaguest part of your answer, and a second one only if you're still vague.
4. **Self-score (optional):** score yourself before seeing feedback.
5. **Feedback:** five rubric scores (relevance, structure, specificity, impact, clarity), each quoting the words that earned it, plus a stronger version of your answer.
6. **Report:** an end-of-interview report with patterns across answers, requirement coverage, and delivery stats.

## Product decisions

- **Every score shows its evidence.** The coach must quote your answer. The page checks the quote is really there and marks the score "Quote not found" if not.
- **Rewrites can't invent facts.** The stronger version only uses what you said and what's on your resume. Missing details become placeholders, and numbers or names not found in your answer or resume are flagged.
- **Voice is scored separately.** Questions are read aloud and answered by speaking. You fix the transcript before scoring, so transcription errors never lower content scores. Pace, filler words and pauses are reported separately.
- **You can grade the grader.** Self-scores, a "Disagree" button on every score, and trust metrics in Progress.
- **Practice only.** No help during live interviews.

## Measuring quality

- **Calibration mode** (open it from "How scoring works"): build a test set, score it by hand (optionally with a second rater), run the coach, and compare agreement per dimension against the human-to-human baseline.
- **Rubric versions:** edit rubric anchors, save a new version, and compare agreement between versions.
- **Consistency check:** score each answer twice and measure how often the coach gives the same score.

## Known limitations

- The fabrication check catches numbers and capitalized names or tools, but not invented outcomes in plain words.
- Voice answers need Chrome, Edge or Safari. Speech recognition often drops "um" and "uh," so filler counts run low.
- Runs on Cloudflare Workers AI's free daily allowance, shared by all visitors, so heavy traffic can hit the daily limit.

## How it's built

One self-contained `index.html` with no build step, hosted free on GitHub Pages. AI calls go through a small Cloudflare Worker (`worker.js`) running Llama models on Cloudflare Workers AI's free tier, so visitors need no account or key. Data is saved in the visitor's browser. PDF resumes are read with pdf.js, and voice uses the browser's Web Speech API.

Setup steps are in `SETUP.md`.
