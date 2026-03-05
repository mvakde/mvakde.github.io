---
permalink: /blog/44-on-arc-1/
title: "44% on ARC-AGI-1 in 67 cents"
---

I trained a small transformer from scratch in 1.5hrs on a 5090  
Same performance as TRM, beats HRM and many LLMs

This is an upgrade to my [previous](https://x.com/evilmathkid/status/2001689479476879448) [model](https://mvakde.github.io/blog/new-pareto-frontier-arc-agi/#implementation-details)    
Faster, better, cheaper and still open source.  


Also gets 7% on ARC-2

[Discussion on Twitter](https://x.com/evilmathkid/status/2029519274835148829), [Code on github](https://github.com/mvakde/mdlARC/)

<!-- HN discussion -->

<figure>
  <img src="../hero-img.png" alt="ARC-1 Public Eval"/>
  <span style = "text-align:center;"><figcaption>Performance on ARC-1 public eval. I only compare against models that do similar test time training</figcaption></span>
</figure>

## Changes since last time:
This is just an upgrade to the previous model. The only major change is I don't train on input tokens anymore. Here are the links to the [technical details of the old model](https://mvakde.github.io/blog/new-pareto-frontier-arc-agi/#implementation-details) and the [full list of changes in this model](#full-list-of-changes)

The biggest increases in scores were due to
- modern architecture (SwiGlu instead of GELU, RMSnorm not layernorm, etc.)
- More data diversity, better shuffling of data 
- scaling up: 8 layers instead of 4, 

Cost decreases mainly due to:
- Way fewer augmentations (more sample efficient!)
- AdamW -> Normuon
- flash attention with varlen training + flex attention kernels for inference

I also switched from an unsupervised training approach to supervised (no longer training on inputs). Turns out the performance is pretty much the same, with supervised giving less variance and more stability. This also completely negates the criticism off training on test inputs 

<!-- (EXPLAIN IN DEPTH)  -->

Interestingly, Supervised training has a much worse training loss. Yet the performance is about the same. 
<!-- (POINT TOWARDS THE RECENT NEOLAB AND THE PERPLEXITY PAPER -- DO RREAD IT THOUGH, ALSO CHECK LOSS WITH THE WHOLE AUGMENTED DATASET?) -->

I still think the unsupervised style training can be used in other scenarios, and I am evaluating this.

## Ablations and analysis

Ablations:
- Running the model compressARC style (training on each task separately), gives a drops performance down to 20%
- Unsupervised style performs about the same -> ~40%
- Switching from 3D RoPE to 1D drops score to 24%
- Removing the per-task embeddings drops score to 24%

<!-- Traditional test time finetuning, No augmentations, Removing extra datasets -->

So biggest contribution to performance seems to be good representations (3D RoPE + per-task embedding). 

<figure>
  <img src="../rep-ablation.png" alt="Ablating RoPE and per-task embeddings"/>
  <span style = "text-align:center;"><figcaption>Removing 3D RoPE or the per-task embedding gives a steep drop. Both ablations saturate at 25%</figcaption></span>
</figure>


<!-- My analysis.  
Obviously I hate augmentations

Unlike augmentations, I think 3D RoPE is fair. The positional information it provides is also given to human solvers. Per-task embeddings are also fine, otherwise the model will not be able to distinguish between different tasks (same info provided to human solvers). Both their representations are learnt by the model not handcoded anyway.

Unsupervised has lower test loss yet score is the same. This is super weird. -->

<!-- My best guess is 3D RoPE + per-task embeddings. 50% drop in performance when either of them are independently removed (CHECK WITH SL). Feels weird coz these were decisions I made in 5 min. But if true, then maybe the takeaway is good representations is all you need.

But its very well possible that these ablations will reach the same performance when trained for long enough. Hard to say. I defer to Noam Shazeer's quote, and am blackpilled any ML paper that explains why something works. I do not think enough effort is put into ablations. I now think how fast a model learns (in both time and number of samples), is way more important than

I now realise that engineering skills/implementation details matter a lot and am generally blackpilled on ML research papers in general. I bet a significant number of them have minor implementation bugs that completely change results or didn't put enough effort in ablations (PUT THIS HERE OR NEXT ) -->

<!-- Muon Loiters (ADD) -->
## Why is this work important?
I think sample efficiency is the most important problem in AI today and I want to solve it. 

ARC is a great benchmark to measure sample efficiency (More details in the appendix):
- Very few samples (only a 1000 puzzles) in a high dimensional space
- Its a metalearning benchmark, so each puzzle uses a different rule, with some common concepts
- Very few priors needed: every concept needed in the eval set is present in the train set
- It is incredibly easy for humans to solve, and accessible to even poor AI researchers
- Benchmark is still unsaturated if you ignore approaches that use tons of synthetic data or human inductive biases.

The intention behind this work is to find the limits of sample efficiency when restricted to transformers and today's deep learning methods. Next, I'll work on new research ideas to break the limits.

For example, I didn't expect to reach 45% with just the transformer, I thought this would need new ideas. I certainly didn't expect to reach it at such low costs/flops. The ablations show that a surprising amount of perfomance is retained even without augmentations or synthetic data or when training on test examples one at a time. Now I'm pretty sure 65% can be reached within the transformer framework

Tbh, I don't understand why others didn't figure this out. Its just a transformer with the most obvious representation. Maybe researchers underestimate deep learning? Maybe the cost of experimentation was high enough that they couldn't run ablations properly? Engineering skills?

I intend to continue keeping the costs low so that anyone in the world can work on this.
## How can others contribute?
The code is open source. Feel free to find modifications that improve score or reduce cost. (Pls don't increase training data)

Try reaching 65% -- you won't need many modifications. Evidence: I took the union of all solved tasks from multiple runs, and got 55%. Also a bunch of other tasks are "almost" solved. Some ideas:
- RoPE mixes positional and content information, which probably worsens performance. PoPE should perform on par or better. Or maybe invent a new pos embedding
- The architecture can definitely be modernised further 

Costs can probably be reduced 10x with handmade GPU code. There are architectural changes that can also do this. 

Lastly, figure out how to remove data augmentations. (I hate that I used it, ignore everyone who thinks its okay). There are a few obvious ways to do so, but the challenge is keeping training costs low. 

## Appendix
### Mistakes that I think other approaches are making
**Assuming recursion is the next big thing**  (Eg: [HRM](https://arxiv.org/pdf/2506.21734), [TRM](https://arxiv.org/pdf/2510.04871), [Arcprize blog](https://arcprize.org/blog/arc-prize-2025-results-analysis))  
I do see the appeal, but there aren't good enough ablations to prove this. And my model shows you can reach the same performance without recursion. The only confirmed benefit of recursion is allowing you to increase compute without increasing memory movement.

I also don't like that TRM was called a 7M model when there are [O(100M+) embedding weights being trained](https://github.com/SamsungSAILMontreal/TinyRecursiveModels/issues/18). It is misleading, makes it more like a lookup table, and calls into question what causes the performance. It should have been called 7M "active" weights. [Same for HRM](https://github.com/sapientinc/HRM/issues/67). 



**I don't like LLM based approaches on ARC anymore**:
Watching LLMs climb the ARC leaderboard has been useful as [explained below](#learnings-from-llms-on-arc-agi), but I don't think there's much to learn from their ARC-1/ARC-2 anymore:
- Increases in LLM scores are now mainly driven by post training, and are probably a function of amount of synthetic data. They are learning to solve ARC tasks, not learn general abstract reasoning (if such a thing even exists)
- There's also too many confounding factors to glean anything from new scores. Comparing LLMs based on benchmarks is bad science in general.
- Their scores on the public leaderboard is useless, the answers are available on the internet, and are trained on. For LLMs, only private scores should count.
- Using harnesses on top of LLMs to improve performance makes little sense to me. All the post-training magic is happening inside the frontier labs, and they can build harnesses themselves. I think its unlikely continual learning will be solved by a harness.

**Misc**
I have already argued [before](https://mvakde.github.io/blog/why-all-ARC-solvers-fail-today/#human-interventions) that synthetic data and augmentations are bad. Designing inductive biases into the model is also bad. The fact that we can't scale this benchmark without cheating like this shows that there are still breakthroughs waiting. I hope more people try to reduce these anti-bitter lesson tricks.

### Previous criticism about my approach
There was a lot of heated discussion on twitter last time, with lot of experienced researchers chipping in, both for and against. Thread 1, [thread 2](https://x.com/giffmana/status/2002128356901597509), 
<!-- ... (TODO Link stuff like Lucas' tweet, Howard, Susan, improve wording) -->

Listed the criticisms here with answers
- This is "training on test"
	- No this is false. "Training on test" means training on test outputs/labels. That is not the case here as the test outputs were hidden.
- Training on test inputs is bad / leaks information 
	- Not in this case. This is a metalearning benchmark, and access to test inputs is always provided, and is fair game to train upon.
	- This dogma of ignoring test inputs doesn't make sense in a world trying to solve continual learning
	- Note: I have removed input training for now, but it is still allowed
- This is against testing policy
    - No this is false. There is some ambiguous wording in the policy that causes the confusion but anyone who has . Keeping the legalese aside, it also follows the spirit of a meta learning benchmark. 
- You are not including training costs
	- No, this is false. Lifetime compute is cost of training the model  from scratch + cost of running inference on all tasks. Yes it totally amounts to 70 cents. Check the prices for 1.5hrs of a 5090 on vast.ai
- Test time training is traditionally done one task at a time. All tasks at once is unrealistic
	- This is valid, but again nuanced.
	- Humans can only learn from one test input at a time (unclear)
	- Brought up [here](https://x.com/BlackHC/status/2002316964010557444), here and here
- Providing cost per task amortises cost of training since all test tasks are trained on at once
	- This is nuanced. I showed cost per task because that's how the organisers compare every model. They did the same for TRM which also trains on all tasks at once
	- I was also more generous by including training and inference costs while LLMs and other models exclude pre-training/offline training costs.
	- But I agree its apples to oranges so I have switched to (a) showing lifetime compute cost, (b) only compare with TRM, HRM and CompressARC and (c) added ablations with comparable training styles.

I made 3 changes to sort this out
- Show charts on lifetime compute instead of per task, remove LLMs and compare only with similar approaches like CompressARC, TRM, HRM
- Switched to supervised training regime so no training on Inputs (I think inputs are absolutely fine btw, but this is easier to train and shows how good a transformer can perform with less controversy)
- Ablations showing performance in different scenarios without test time training

### Previous criticism about ARC-AGI itself
When I posted last time, there was a lot of debate about ARC-AGI itself. Some were valid, but a lot of them were questions Chollet has answered many times before:
- What does ARC even test for? (fluid intelligence)
- Why should we care about ARC? (Fluid intelligence isn't fully solved)
- Solving ARC-AGI will not lead to AGI (No one claimed that)
- ARC keeps shifting goalposts / its adversarially constructed for LLMs (Both are false)

Chollet's paper and these tweets[^1] are good sources. Summing up his stance: The benchmark intended to test fluid intelligence, which he considers necessary but not sufficient for AGI. Solving ARC-1 / 2 implies non-zero fluid intelligence, but it isn't an upper bound. The benchmarks don't signal AGI is reached, they intend to point out the right research questions to ask. There were no goalposts moved: ARC-1 precedes LLMs, ARC-2 was announced pre-chatGPT and ARC-3 was announced before ARC-2 was saturated. He's also happy about progress on ARC since it documents progress in AI.

I mainly care about ARC since it can be used to test for sample efficiency which is an important unsolved problem today! It's also a well constructed meta-learning benchmark, and is accessible to GPU poor peeps. Historically, its been great at [pointing out the strengths and flaws](#learnings-from-llms-on-arc-agi) of LLMs. I also think its cool that the benchmark stood unsaturated for 6 years, despite being high profile / having a large cash prize since we now know DL can perform extraordinarily well on ARC-1/2.

There are some valid criticisms IMO:
- They should switch focus of ARC-1/2 to sample efficiency instead of only trying to test fluid intelligence now that its saturated. This would also complement ARC-3 very well. 
	- Disallow synthetic data for ARC-1/2 (it made sense till 2024 when DL scores on it sucked). We now know LLMs/DL can learn anything given enough training data.
- A single leaderboard graph comparing multiple types of models doesn't make sense. It brings the following 3 problems (solution: separate charts)
	- The x-axis is cost/task. But it only counts online compute cost.Some of these models (like LLMs) have massive offline pretraining phases whose costs arent counted. You can use infinite training compute to effectively bring the test set into distribution, so these models should be evaluated separately.
    - Dividing cost by number of tasks makes no sense for the models that train on all test tasks at once (like mine, TRM & HRM)
	- Comparing LLMs on the public eval set makes no sense since the answers to the public puzzles are available on the internet
- They drew premature conclusions from TRM and HRM and attributed success to recursive loops+deep supervision. I think this bias is because they hypothesise pure deep learning can't solve ARC (eg: base LLMs still suck at ARC-2). I disagree
- The wording of the testing policy can be improved

Regarding testing policy: The policy says "test taker must not know what the test will be". People interpreted this as saying TTT is banned. But it actually refers to the human designing the AI system, not the AI system itself. Eg: to discourage designing inductive biases based on the eval set. (Its a meta learning benchmark. This is fine)

To anyone active in the ARC community, this has always been clear since test time training has been allowed and encouraged. [Steven](https://x.com/sd_marlow/status/2002498207235125669) and [Chew's](https://x.com/chewkokwah/status/2002686360344527304) comments clarify this and other concerns. 

### Full list of changes
Changes that modify training dynamics
1. Optimizer changed from AdamW-only to NorMuon + auxiliary AdamW
2. LR schedule changed from warmup+cosine to WSD schedule (warmup %, hold, then linear decay to floor).
3. `LayerNorm` was replaced by `RMSNorm`
4. FFN changed from `Linear -> GELU -> Linear` to SwiGLU-style gated FFN (`chunk + SiLU gate`).
5. Weight decay changed from “non-attention linear only” to explicit group-wise decay: attention weights, token embeddings, and task/dihedral embeddings each have their own WD knobs.
6. Training objective changed from `outputs["loss"]` (unsupervised style input+output LM loss) to `outputs["output_loss"]` (supervised style) only.
7. Training batching changed from smart bucketing based on length to true random batching (bucketing retained for inference paths).
8. Straggler/incomplete batches are now dropped in training (`drop_last=True` enforced).
9. Dataset construction now supports/uses broader sources (ARC-1, ARC-2, ConceptARC, optional filtered cross-dataset tasks, submission/private modes), changing train data composition.
10. Color augmentation changed from one global epoch-level permutation to per-example augmentation tuples (color + dihedral).
11. Color permutation domain changed to excludes output-only colors, instead of blind 1..9 permutations.
12. Augmentation generation now deduplicates transformed inputs via hashing across a task (higher unique-sample diversity).
13. Augmentation selection is now epoch-cycled with shuffled candidate order (without-replacement per cycle behavior)
14. Changes in hyperparams: optimizer/hparams, epochs, augment cap/type, depth (`n_layers`), and dataset path.
15. A new `dihedral_embedding` was added and is now summed into token conditioning. (Only a very mild performance increase)

Speed increases without changing training dynamics:
1. Training batches changed from padded `[B,S]` to packed token stream with `cu_seqlens` (no pad tokens in train path).
2. Attention path changed from padded SDPA masking to packed varlen flash-attention support (`cu_seqlens`), plus flex-attention decode kernels.
3. Dihedral augmentation moved from offline dataset expansion to online augmentation selection at collate time.
4. Build-time training split changed from `("train","test")` to `("train",)`

Misc.
1. Resume behavior changed: optimizer-switch/hparam-change detection now can reset/rewarm schedule, altering resumed-run dynamics.
2. Scheduler stepping changed to fractional epoch progress when training, instead of pure per-step cosine progression.

### Learnings from LLMs on ARC-AGI
LLMs have now saturated v1 and v2 of this benchmark. Here's what I infer from their progress:

ARC-AGI predates LLMs. They performed terribly on the benchmarks initially, showing that pretraining doesn't confer general reasoning capabilities and that LLMs can suck at tasks that are incredibly easy for humans 

OpenAI's O1 getting 75% was a big win for LLMs. It suggested that given enough data, LLMs can learn any task during post-training. I assume this is what Sholto Douglas [often argues about](https://www.youtube.com/watch?v=64lXQP6cs5M).  

When ARC-2 came out, it reset progress of all LLMs, including the thinking ones. This suggests even post-training doesn't confer general reasoning capabilities, otherwise a model that performs well on ARC-1 would automatically perform well on ARC-2.  

Basically, the models are learning how to solve ARC puzzles, not general abstract reasoning and its scores on a task are dependent on how well it is represented in its training data. (I'm not sure whether "general reasoning" even exists in the first place? Maybe humans are specialised too)

Since then, thinking LLMs have made steady progress on ARC-2. People often think this means models are better at general reasoning BUT what they don't notice is that the base models are stuck at single digits. Taken with [other evidence](https://arcprize.org/blog/arc-prize-2025-results-analysis#overfitting-on-knowledge), this suggests:
- Scores on ARC-2 are driven by post-training. (Probably largely depend on amount of synthetic ARC data?)
- Labs are benchmaxxing (probably coz customers care about benchmark performance?)
- LLMs are not sample efficient in any way.

Don't get me wrong, I am very bullish on LLMs. The trends on ARC-2 show that performance will keep improving with increase in compute and data. Also its incredible to see the reduction in inference costs.

<!-- Then what's the use of the benchmark? Sample efficiency (and related problems like continual learning). There will always be tasks where there is simply no training data or very little of it. ARC is a good benchmark as it has very few samples per concept, is well constructed to require very few priors and is easy to solve for humans. But you gotta be disciplined. No pretraining on the internet or using synthetic data or augmentations.  -->


[^1]: Chollet's [original paper](https://arxiv.org/abs/1911.01547) about the ARC benchmark, some of his tweets [explaining](https://x.com/fchollet/status/2022090111832535354) what it [intends](https://x.com/fchollet/status/1874877373629493548) to [test](https://x.com/fchollet/status/2004276612385108221), and [two](https://x.com/fchollet/status/2022036543582638517) [tweets](https://x.com/fchollet/status/2022040149794967763) explaining the timeline of how the benchmark has evolved. 