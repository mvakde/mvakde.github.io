---
permalink: /blog/thoughts-on-AGI-essays/
title: "Thoughts on AGI Essays"
---
[Paras Chopra](https://invertedpassion.com/about/) is starting a long-term deeptech incubator/research program under [Lossfunk](lossfunk.com). This is my answer to one of the questions on the application:  
> Read these two docs and write a short note about what you think about them (i.e. questions, follow on ideas or what you agree and disagree with)
> - [Suchir Balaji's note on AGI](https://docs.google.com/document/d/1ItRqrpgQHJ05rQx0zc26t1_NgpUcw3znwTWpXxqH8uI/edit?tab=t.0#heading=h.qslpqdtnxw1r)
> - [Tyler Cowen on Slow Takeoff](https://marginalrevolution.com/marginalrevolution/2025/02/why-i-think-ai-take-off-is-relatively-slow.html)

## Suchir's Essay
Overall, I loved this essay. Suchir had Karpathy-esque explanation abilities. I mainly wanna talk about novelty.

I see the novelty framework as a brilliant way to get out of a local minima. When its combined with the reward function, alpha should tell how much cost increase can you tolerate in search of novelty which happens when you find a different downward slope to go down. (I am not that well versed in RL compared to DL, so forgive me if this is a known concept beforehand). I am not sure whether his math formalisation of novelty is correct though. Will it reward climbing up the local minima?

Question is - are there smarter ways to get out of these local minima? Current models use stochasticity, a very dumb form of novelty (explained more below). For example I think alpha should vary in real time. While solving a difficult problem in exams usually I start going down the obvious path (low alpha -> GD towards local minima). If I reach a point where there's a lot of drudgery ahead (rate of new insights on the problem per token I generate is slowing down), I switch to other weirder paths (increase alpha) hoping to gain a new insight (novelty / better world model) about the problem. 

Novelty would have been useful for Claude while playing Pokemon. It keeps getting stuck in places for no reason. If it prioritised increasing its understanding of the world, it would understand what to do. Instead it currently relies on stochasticity (in token generation) instead. Basically pure randomness in the hope that this makes the cost function land on the other side of the minima wall. (I should check the working of an LLM again once to confirm whether applying the cost function analogy makes sense during token generation)

My hypothesis - stochasticity is one of the core failures of LLMs, even reasoning models. R1 doesn't backtrack in a smart manner on a difficult math problem, its purely statistical. Hence reasoners perform well on problems in training set -> Statistically more likely to produce the right reasoning trace while backtracking. Problems outside the training set? Horrid performance. Clearly RL on reasoning traces can't make the model metalearn a smart way to get out of a local minima. o3 using search on reasoning traces is smarter method, but again not smart enough. I think token generation itself should look different for reasoning traces and normal tokens.

Anecdote about novelty -> My chat with a Nobel Laureate [[0]](../chat-with-a-nobel-laureate) (Tl;dr: He said he was too stupid to know what he was doing was impossible)

Random thoughts:
- "Intelligence is data efficiency not capabilities" -> YES. Cannot agree more. Matches my anecdotal experience [[1]](../anecdotes-on-intelligence) (Tl;dr: The smartest people learn new skills incredibly fast)
- "Speculation that level 4 paradigm is computationally more expensive / unwieldy" -> I feel the opposite, but I have no evidence for my claim. If Suchir is right, then bad implications for power concentration
- "Reject embodied" -> Yes. We learn skills in our sleep
- "Big blobs of compute" -> Right overall conclusion, wrong arguments. Yes, in the contemporary ML, modifying architecture and weights won't give us improvements and working on SGD+DNNs makes sense. But, IMO a new framework is needed. Who knows if terms like weights or architectures would apply when we finally get AGI?
- "AGI will be like building the brain" -> I feel the same way, but those aren't the arguments I'd use. (I should read up on human and animal intelligence more)
- Reject scaling hypothesis -> Yes. Scaling up improves capabilities on tasks in training set. Doesn't increase overall intelligence
- (Unhinged mode) I want to understand how these concepts connect with intelligence: Fractals, Chaos, Analog computing. For some reason, a lot of people (including me) intuitively think that these concepts are inherently linked with intelligence. Suchir brushes by each of these concepts in the essay too

## Tyler's essay: 
So the overall argument is that takeoff is slow because of human and societal factors that constrain change. Its a fair premise tbh -> Talk to any old indian doctor about AI or look at the regulatory hurdles for healthcare.

I have a more optimistic view though. I think the potential for change is so lucrative that people will start breaking these barriers, and such "high agency" people become valuable to society. Eg: Elon has said that he entered politics for the same reason. His actions on DOGE seem to corroborate this. (Not commenting on the politics of whether his actions are good/bad/have an ulterior motive). The extreme view of this would be creating new societal systems that remove such barriers completely. (Replace the politicians with AI systems! /jk)

Other random thoughts:
- This argument implies that breaking norms will be more lucrative for a builder. Also, build products for industries that don't exist yet/aren't under regulatory stranglehold yet. Also, build a better product to make it easy for the naysayers to adopt AI tech.
- I am not sure how much Tyler's economic arguments apply to possibility of the creation of completely new industries or the exploration of new resources in space. 
- Even if economic growth is slow, Quality of life improvements can be very high in narrow areas which make the investment in AI worth it. Curing a single disease that is very common may not boost the economy drastically, but it can bring large QOL improvements to parts of society. 
- This AI race can also have downstream effects of producing tech innovations in other sectors like Energy.
- We are also entering a world with high geopolitical uncertainty. Which direction would this swing AI adoption? I assume there will be high adoption in the National security apparatuses (a la manhattan-style projects)

[0] [mvakde.github.io/blog/chat-with-a-nobel-laureate](../chat-with-a-nobel-laureate)
[1] [mvakde.github.io/blog/anecdotes-on-intelligence](../anecdotes-on-intelligence)