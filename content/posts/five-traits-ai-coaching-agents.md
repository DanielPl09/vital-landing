---
title: Building an AI coaching agent? Five AI traits you must know
date: 2026-09-05
tag: Essay
image: assets/img/blog/five-traits.svg
excerpt: Some examples worth knowing for anyone building around AI for coaching — the overlooked third agent, the tendency to agree, the advice trap, the limits of self-evaluation, and what happens when the model plays the client.
---

It is widely discussed how Generative AI is reshaping the software development process.

At the same time, it is also reshaping the way builders draw their expectations from conversational components. Builders of chat companions and AI coaching agents are becoming increasingly curious in the opportunities and limitations of Gen AI in their domain, and sometimes even openly discuss technical aspects revolving around it, like hallucinations and context rot.

News reports are full of stories of AI breaking cages, running around in the wild and scaring off people. Sometimes it is overwhelming.

For this reason, we grouped in this post some examples that we think are worth knowing, for everyone interested in building around AI for coaching, whether it's a specialized GPT agent or even a system that connects to calendar and books an appointment from chat.

## 1. You wouldn't guess the must-have agent in an orchestrated team of AI coach agents

::: source
Google Research, "The Anatomy of a Personal Health Agent," 2025
:::

Last semester in class, early in the agentic-architectures topic, I stopped for a mind drill. So far, you've seen several examples of complementary agents working as a team, I told them. So:

> If you were asked to build a personal coaching agent, which three agent specialties would you pick?

The first role came up fast — a coaching agent that delivers messages with motivational interviewing practice in mind. I was curious about their third pick, so I gave the second away: "domain expert," whether that's sleep, sports, whatever. Also obvious. No surprised faces.

But here comes the catch. The third agent will surprise you. "Always keep a numbers guy around" I joked, and some of them smiled curiously.

Google's Personal Health Agent work — evaluated over ten benchmark tasks with more than 7,000 human annotations and some 1,100 hours of health experts' and end-users' time — landed on exactly that third seat: a Data Science agent alongside the coach and the domain expert. Turns out that telling a coherent story from raw wearable data points produces reusable context the other two agents can work with. With the DS agent in the team, the quality of the data-analysis plans behind the conversation jumped from **53.7% to 75.6%** compared to a setup without the DS agent.

![Same coach, same domain expert. The only difference is the third seat — and the analysis-plan quality behind the conversation goes from 53.7% to 75.6%.](assets/img/blog/trait-data-science.svg)

## 2. "Toxic Positivity" — secret trait personal growth

::: source
Cheng et al., *Science*, 2026
:::

On our previous blog post in the series, we posted a reflective piece, "Chat thinks I'm funny," which aims to describe why conversational AI are tools that are commercially designed with a confirmation tendency, since it can play a role in user engagement. But here in this post, we want to dive into this trait and see how it can affect personal growth goals if not mitigated carefully.

A Stanford team found chatbots endorsed a user's side of a conflict about **49% more often** than human respondents did — and the people who got the agreement trusted it more, and were less likely to go patch things up afterward.

At the same time, it is no secret that when a person commits to a process, the constructive friction plays a key role in the process. In their simple words, this type of friction and mitigated challenging of some assumptions could make a difference on whether someone is able to reflect and overcome mental barriers.

The tension between the conversational AIs tendency to agree more frequently with users raises the concern that it might avoid friction where a professional dietitian would rather stop and dig.

## 3. The Advice Trap

::: source
Srinivas et al., "Substance Over Style," ACL 2025
:::

Rooted in the same tendency to agree with the user, we highlight another linked pitfall in LM-based coaching. A necessary part of any behaviour-change process includes managed friction: stopping to dig into ambivalence, calling out subtle rejection signals. But language models are tuned to serve as helpful assistants, and they strive to conclude with a practical answer or a piece of advice, sooner rather than later. That's the tension. Where an experienced coach might hold off and ask one more question, the model tends to close.

This reflex is known in professional coaching as the Advice Trap. Because models are instruction-tuned to be instantly satisfying, they jump to solutions instead of doing the basic clarifying work: exploring a client's unique constraints and prior attempts.

Ask before you suggest. As one of the clinical experts in the Substance over Style study (University of Washington and Google Research) summarized:

> You want to ask more questions before you start jumping in with suggestions. That's kind of like basic questioning 101.

During multi-turn dialogues, models also suffer from conversational drift, often sliding into fixated questioning, drilling relentlessly down a narrow, surface-level rabbit hole, or leaking premature advice anyway. To prevent this, builders of AI coaches must separate context-gathering from recommendation by locking the early phase of the dialogue strictly to anchor topics.

![The clarifying work is the three questions in the middle. The model leaps them and lands on the advice.](assets/img/blog/trait-advice-trap.svg)

## 4. LLM as a Judge — can LLM reliably judge their own bonding with humans?

::: source
Srinivas et al., "Substance Over Style," ACL 2025
:::

In early days of LLMs a pretty reasonable term came up for an increased evaluation of LLM generated content. It is called "LLM as a Judge," you probably heard of it already. It suggests that if you want to evaluate the performance of a conversation or an artifact, don't use the exact same LLM that generated it, as it is biased to favour its own text.

But here we tackle a more profound issue. How well can LLM read the room when it comes to judging coaching metrics like motivation, alliance of work and others. A recent paper, "Substance Over Style" by Google Research Labs, comes with a strong insight that is carried into the article name:

> Users who received stylish answers with no substance or understanding, perceived the agent as unreliable.

This makes quite sense — when we hear someone talking politely but with no actual substance we tag it as suspiciously nonsense. Whether the style was interrogative or facilitative doesn't make much difference, as long as it was perceived as lacking substance.

The same study found something sharper: the single item that best predicted a patient's overall satisfaction was also the item the auto-rater read most wrong, off by a wide margin from expert judgment. The construct that mattered most to the person in the conversation was the one furthest outside the machine's ability to grade itself.

::: take
No in-silico scorer for subjective constructs, period. Empathy, felt warmth, alliance — human-only evaluation, by design, not by omission.
:::

## 5. And now, the AI on the other side of the bar: persona simulation

::: source
Yosef et al., patient-simulator study, CLPsych 2024
:::

Everything so far described the model playing the coach. Flip the seat. What happens when the model plays the client?

On paper, using AI to simulate coaching clients is compelling. Instead of recruiting human testers for early-stage trials, builders can spin up diverse synthetic personas: a stressed manager struggling to sleep, a parent trying to eat healthier. An immediate, low-cost sandbox to see how your coaching agent handles different personalities.

The catch is already in Lessons 2 and 3. The same model, with the same tendency to agree and the same pull toward closing the loop, is now cast as the person who was supposed to push back. So the persona inherits both traits, only they land worse from this side. Your coach can violate basic questioning 101, ignore a stated constraint, or loop endlessly, and the simulated client will still say "thanks, I'll try that!" It is a severe courtesy bias, and it creates a false sense of security in the lab that collapses when real, easily frustrated humans get in.

To bypass this, some exploratory research has introduced an interesting, though still experimental, approach. Instead of handing the simulated user an explicit prompt like "you have no time to cook," the model is grounded in a natural, real-world profile with a hidden obstacle it is forbidden from naming. The persona has to communicate the struggle implicitly, through dialogue. The method is early, and a persona is still a model, carrying the same assumptions about how patients behave. It supplements human testing; it does not replace it. As a probe for whether your agent listens, it is worth watching.

![The obstacle is seeded into the persona and never named. Each question the coach asks brings a little more of it into view.](assets/img/blog/trait-persona-loop.svg)

---

Five slots in one blueprint, and the pattern across all five is the same: know exactly what the model is good at proving about itself, and route everything else to a person whose judgment it was never going to replace.

## Sources

- Google Research, "The Anatomy of a Personal Health Agent," 2025 (Data Science agent: 75.6% vs. 53.7% analysis-plan quality).
- Cheng et al., "Sycophantic AI Decreases Prosocial Intentions and Promotes Dependence," *Science*, 2026.
- Yosef et al., patient-simulator study, CLPsych 2024.
- Srinivas et al., "Substance Over Style," ACL 2025 (working-alliance ICC data).

---

Want to see it running on your own protocols? [Book a demo](index.html#demo).
