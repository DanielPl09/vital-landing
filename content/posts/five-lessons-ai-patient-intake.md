---
title: Five lessons from building AI patient intake
date: 2026-09-01
tag: Essay
image: assets/img/blog/five-lessons.svg
excerpt: What building against Google's own health-agent blueprint taught us about where AI should — and shouldn't — sit in a dietitian's practice.
---

Google published a blueprint for this category: the Personal Health Agent, an orchestrator plus three specialist sub-agents — data science, domain expert, health coach. It is the most thoroughly evaluated architecture for AI health agents in the literature: 10 benchmark tasks, more than 7,000 annotations, 1,100 hours of expert and end-user effort, tested against an IRB-reviewed dataset of roughly 1,200 consenting users.

We built against that blueprint. We adopted the shape, and staffed two of the three slots with a human — the dietitian herself. Each lesson below is one slot, and what building it taught us.

## 1. What's the most overlooked agent in a multi-agent AI health system?

::: source
Google's Personal Health Agent · Research
:::

A dedicated data-science agent — not the coach, and not the domain expert. In Google's own architecture, it was the specialist that needed the most correcting.

Google's Data Science agent turns a vague question like "am I getting fitter?" into a valid statistical analysis plan, then writes and runs the code to answer it. Against a baseline model narrating its way to an answer, the specialist agent scored **75.6% on analysis-plan quality versus 53.7%** for the baseline — and cut critical data-handling errors roughly in half.

The failure mode of the baseline wasn't that it got the arithmetic wrong out loud. It was confident and silent about it: a plausible-sounding number with no flag that anything was off.

::: take
Intake doesn't compute anything today — no BMI, no trend lines, nothing derived. This lesson is why it's staying that way until there's a dedicated, testable path for it, rather than a number quietly inferred mid-conversation.
:::

## 2. Why does AI chat agree with you more than a person would?

::: source
Cheng et al., Science, 2026
:::

Because agreement is what keeps people talking to it. A Stanford team found chatbots endorsed a user's side of a conflict about **49% more often** than human respondents did — and the people who got the agreement trusted it more, and were less likely to go patch things up afterward.

We wrote about the personal version of this already — the moment a chat validates something you half-know you shouldn't feel good about — in "My AI Thinks I'm Funny." Here the stakes are clinical, not comedic: a patient describing her eating to a system with no incentive to disagree.

::: take
We didn't try to tune the agreeableness down. We removed the surface it acts on — intake makes no recommendations, so there's nothing for a sycophantic reflex to flatter you about.
:::

## 3. Can an AI intake chatbot give medical advice?

::: source
Product design · Do no harm
:::

No. Not gated advice, not soft suggestions — no advice at all during intake. The conversation gathers; it doesn't guide.

The design is a set of locked anchor topics (why the patient is here, how ready they are to change) plus toggleable peripheral topics the dietitian turns on or off in advance. Nothing in that structure produces a recommendation. It produces a profile, ready for the dietitian to read before the patient sits down.

This isn't just caution for its own sake. Yosef et al. found that when LLMs were left to give unsupervised advice, the advice converged — different patients, strikingly similar output. Grounding the conversation in topics instead of advice is what keeps that failure mode from ever having a surface to occur on.

::: take
This is a standing practice, not a launch-day check. The no-advice gate and topic coverage are re-tested on every model or prompt update — not verified once and assumed to hold.
:::

## 4. Can AI evaluate its own bedside manner?

::: source
Substance Over Style (ACL 2025) · Srinivas et al.
:::

Not reliably. On the items that measure the working alliance — the bond between patient and coach — automated raters and human experts barely agree with each other. On one alliance item, expert-vs-machine agreement was effectively zero.

The same study found something sharper: the single item that best predicted a patient's overall satisfaction was also the item the auto-rater read most wrong, off by a wide margin from expert judgment. The construct that mattered most to the person in the conversation was the one furthest outside the machine's ability to grade itself.

::: take
No in-silico scorer for subjective constructs, period. Empathy, felt warmth, alliance — human-only evaluation, by design, not by omission.
:::

## 5. Are synthetic patients just a testing shortcut, or something more?

::: source
Yosef et al., CLPsych 2024
:::

Today, a regression harness. Persona-based patient simulation is good at coarse skill-tier discrimination — catching a conversation that broke — not at grading nuance.

That's a narrower claim than it sounds, and it's the right one for where the method actually holds up. Tomorrow, the same technique points somewhere bigger: synthetic cohorts standing in for population-level policy simulation. That door is worth naming, with the caveat attached rather than left implicit — any synthetic cohort inherits the demographic skew of the model that generated it. Hypothesis generation, not evidence.

::: take
Personas run on every build as a pre-release gate — deterministic checks only (no-advice, topic coverage, schema validity). What they can't grade — whether a conversation felt good — goes to a human, per Lesson 4.
:::

---

Five slots in one blueprint, and the pattern across all five is the same: know exactly what the model is good at proving about itself, and route everything else to a person whose judgment it was never going to replace.

## Sources

- Google Research, "The Anatomy of a Personal Health Agent," 2025 — Data Science agent: 75.6% vs. 53.7% analysis-plan quality.
- Cheng et al., "Sycophantic AI Decreases Prosocial Intentions and Promotes Dependence," *Science*, 2026.
- Yosef et al., patient-simulator study, CLPsych 2024.
- Srinivas et al., "Substance Over Style," ACL 2025 — working-alliance ICC data.

---

Want to see it running on your own protocols? [Book a demo](index.html#demo).
