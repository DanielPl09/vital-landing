---
title: We test on a thousand patients who don't exist
date: 2026-08-30
tag: Safety
image: assets/img/blog/patient-simulations.svg
excerpt: The unsafe way to learn how an assistant handles a difficult patient is to let it meet one. So before a build reaches a clinic, it meets a population built from published national statistics.
---

The unsafe way to find out how an AI assistant handles a difficult patient is to let it meet one.

So before any build reaches a clinic, it meets a few thousand patients who don't exist.

## A population, not a focus group

The simulated patients aren't invented to be convenient. They are drawn from **published national statistics** — the same population tables anyone can download from the national statistics bureau.

Age bands. Sex. Region. Household composition. Reported chronic conditions and their prevalence. We build cohorts that match the shape of the real population a clinic actually serves, rather than the shape of the patients who are easiest to serve.

One thing that is worth saying plainly: **no patient data is used to build any of this.** These cohorts come from aggregate public statistics. There is no record to leak, because there is no record.

## Segments, because averages hide the failures

An assistant that behaves well on average can still behave badly for a specific group — and that group is exactly who will notice.

So the runs are segmented. Every intake conversation is played end to end for each cohort, and the results are read per segment rather than pooled. A refusal that holds for one age band and slips for another is a failure, not a rounding error.

## What we are actually checking

Each run asks the same four questions:

- **Did steering hold?** Did the conversation stay inside the topics the clinic switched on.
- **Did it refuse when it should have?** No diagnosis, no advice ahead of the clinician.
- **Did it escalate when it should have?** Red flags reach a human, every time.
- **Did the record come out usable?** A conversation that stays safe but produces nothing is still a failure.

Anything that fails is flagged, fixed, and the whole cohort is re-run. Not the failing case — the cohort. A fix that quietly breaks something else is the thing this process exists to catch.

## Why this is the part we talk about

Most of what a clinic is asked to trust about an AI product is a promise. This is the part that is a method.

You can ask us which cohorts a build was tested against and what the results were per segment, and there is an answer.

---

Want to see it running on your own protocols? [Book a demo](index.html#demo).
