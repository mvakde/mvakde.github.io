---
permalink: /blog/new-pareto-frontier-arc-agi/
title: "New Pareto Frontier on ARC-AGI"
---
27.5% on ARC-AGI-1 for just $2.  
Train from scratch in 2 hrs (333x cheaper than TRM)
No special architectures - just a vanilla transformer  
Fully open source  

Summary/Discussion on [Twitter](https://x.com/evilmathkid/status/2001689479476879448)  
Code on [Github](https://github.com/mvakde/mdlARC)  

<figure>
  <img src="../arc-leaderboard.png" alt="New pareto on arc"/>
  <span style = "text-align:center;"><figcaption>Performance on ARC-1 public eval (Note: this is superimposed on private eval chart - see why below)</figcaption></span>
</figure>
<!-- {Sneak peak: Before/after} -->
## First, some bragging 

**This draws a completely new Pareto frontier** on public eval of ARC-AGI-1.  
The cost is so low, its literally off the chart. No other model comes close in terms of training cost or speed. It is also unmatched in performance per training parameters at 28% accuracy in 28M. (Yes this also beats TRM/HRM in perf/params, in fact by more than 10x! - check notes)

**Beats every single non-thinking LLM in existence**
Beats them in both performance AND cost. In fact, the combined costs of my training and inference are less than the inference costs of most LLM based methods.

**333x cheaper** to train than TRM/HRM/other models
The recent models on ARC-AGI require multiple H100s for multiple days. You can train my model from scratch in 2 hours on a single A100. It will work on smaller GPUs too.

**Bitter lesson pilled**.
There are no special handcrafted architectures, no recursion. Just a vanilla transformer, 4 layers, standard autoregression.

**Quick Notes**:
- My cost includes inference AND training. Most others on this chart are just inference costs (and yet I beat them - another bragging point xD)
- One disclaimer, my results are on the public eval, while the chart is actually private eval. I admit, this is shady. But its a risky bet I'm making. I think my performance will be higher on private eval (which is unprecedented on ARC1). Reasons in appendix. 
- TRM has 7M parameters in the core network, but it trains a massive embedding table that has 100s of millions of parameters. A conservative estimate of total trainable parameters is then 300M+. Similar story for HRM. So while they perform better (~40%), they need to train 300M params to do so (hence take time)

Oh btw, all this is early results. 
I haven't yet ran hyperparameter sweeps (expect them to push performance to 35%). I haven't tried scaling the model and data either (I haven't found a ceiling yet). I haven't done GPU level performance engineering (10x improvements on the table, maybe more). There are also a few obvious research ideas to tackle next.  

I am confident of hitting 50% in the next few weeks. I also think its possible to beat the grand prize of 85% with human efficiency (this is ambitious though)

Fully open source. Try it yourself: [code](https://github.com/mvakde/mdlARC)

<!-- If you're too lazy to read the technical details, this twitter thread summarises it. -->

<!-- Notes -->
<!-- [0] TRM/HRM seem lower with 7M / 27M model parameters, but they additionally train 400M embedding params. All of it is used during inference. My model just needs 60k embedding params -->
## Content:  

1. What is new in my approach?  
2. Why does this work?  
3. Implementation details  
4. What's next?  
5. Thought process behind this research  

## What is new in my approach?
---
I apply Minimum Description Length (MDL) principles to fix all the faults in previous deep learning methods on ARC-AGI.

<!-- > I learnt about MDL recently, wrote this blog last month on how to improve every model on ARC. This is an application of what I talk about in the blog -->  

## 1) Joint self-supervised compression
Every previous attempt[1] uses a supervised learning approach on ARC. This means the models were only predicting the outputs. 
<!-- ### <span style = "font-size:1.25em;">Source 1: Example inputs</span> -->
<figure>
  <img src="../arc-sup.png" alt="my alt text"/>
  <span style = "text-align:center;"><figcaption>The inputs are fixed, and the model is only trained to predict the outputs. (A representative example of previous methods) </figcaption></span>
</figure>

Instead, I use an unsupervised learning approach - my model is trained on both **outputs AND inputs**. The loss function measures how well it predicts BOTH the grids. 
<figure>
  <img src="../arc-unsup.png" alt="my alt text"/>
  <span style = "text-align:center;"><figcaption>My model learns everything from scratch, including the inputs</figcaption></span>
</figure>
This one change (training on inputs) dramatically reduces the cost and time needed to train and also increases the performance.

Now, test time training is common tactic used in ARC-AGI (the answer grids of eval puzzles are hidden, so there's no cheating). Previously, every attempt[1] used 2 phases - offline training on all the public puzzles and then finetuning on the private puzzles during runtime.

Instead, I train the model from scratch during runtime on all public and private puzzles (answers hidden). This maximally compresses all available information. This is only possible because the training cost and time are so much lower thanks to the unsupervised approach. 
<figure>
  <img src="../arc-ttt.png" alt="my alt text"/>
  <span style = "text-align:center;"><figcaption>Test time training approach</figcaption></span>
</figure>

## 2) No special architectures - just a vanilla 4 layer transformer
Other deep learning methods use specially engineered architectures like:
- multi-level recursion on transformers (HRM/TRM), 
- equivariant VAEs (CompressARC), 
- DFS sampling/recursive latent sampling (The ARChitects), etc. 

Such approaches are not "bitter lesson" pilled.  They don't scale well and don't generalise to other problems. While within rules, its against the spirit of the benchmark. (Very cool engineering though!)

Instead I use a vanilla 4 layer transformer, with standard autoregression - Simple, scalable and bitter lesson friendly. 

The reason why a vanilla transformer has never worked before is because nobody tried to train it unsupervised. (Surprising, I know)

### 3) No offline training <!--(put this before at 2) (3) -->

For inference, I provide the test input grid tokens to the transformer and ask it to predict the output (like an LLM). This is faster than transductive approaches since the model doesn't do computations on the example pairs during inference time.

<!-- %% The reason it works is that it follows the Minimum Description Length principle. Previous methods were training lookup tables. I am focusing on generalisation. %% -->

### 4) Scalable (?)
Theoretically, the model should improve with more puzzles added to the dataset. Unfortunately, I was too GPU poor to test this properly. It seems to be true at small scales, and I haven't found a ceiling yet. I will be testing this hypothesis properly now.

Empirically, performance seems to improve with:
- increasing number of layers
- increasing training time
- increasing training datapoints (requires more compute)

Note:
- I do use augmentation during inference - AAIVR - like most other approaches on ARC-AGI. This is the one part of my model that is not "bitter lesson" pilled. Obviously, I hate it. My main focus next will be to remove this. I am confident of being able to do so without losing performance.  

## Why does this work?

> Being honest, idk. This is ongoing research. I am posting things as they evolve. Here is my best guess below. There are other theories - some ppl think its the 3D RoPE. I will keep running ablations and update the blog as I get new information. I encourage you to do so too

My best guess - **Compression**.  
There are 3 questions to be answered here
1) Why is compression useful?  
2) Why would compressing these extra grids help?  
3) How to compress something?  

**How is compression useful?**
Empirically, we have found that greater the compression of a model, the greater the intelligence and generalisation. This has been studied under MDL and Kolmogorov complexity extensively.

Intuitively: 
Whenever you have repeated patterns in your dataset, you can reduce the size of the dataset by finding a small rule that correctly produces the pattern. Turns out, such a rule generalises beyond the original data it compressed. 

To see this, take a string with a million 0s: `"000...0"`. We can shorten it into 24 characters by writing it as a rule - `"repeat 0 1,000,000 times"`. This new string/rule can represent many datapoints with just small changes. Eg: `"repeat abcd 1,000,000 times"`.


**Why compress these extra grids?**
All the grids in the dataset have common patterns and structures that are often repeated. If you don't compress every single one of them, you have lesser chances of finding better abstractions. In technical terms, whenever mutual information is present between 2 datasources, it is always better to jointly compress both of them than it is to compress them in isolation which in turn is better than not compressing at all.

I explain this in a lot more depth in my [previous blogpost](./why-all-ARC-solvers-fail-today.md)

**So how do I compress the input grids too?**  
We already know that a good predictor is a good compressor. Previous methods only try to predict the output. Instead, my model tries to predict both the outputs AND inputs. 

I implement this by expanding the loss function to include the input tokens. This is not something new. Its the exact process used in the pretraining phase of an LLM. Essentially, I took the mechanism that makes LLMs generalise and applied it to the ARC-AGI dataset.

## Implementation details
### Overview
I use a simple 4 layer transformer, with 28M parameters. First I convert an ARC pair into a single sequence of tokens. Then I use standard autoregressive training on all such sequences.

<!-- [IMAGE] -->

I use the same "puzzle" embedding for every sequence in a puzzle, 3D RoPE for position embeddings, and both color and dihedral data agumentations. For inference I use the standard AAIVR. (I hate AAIVR with the passion of a 1000 suns. It will be removed asap).


### Standard autoregressive training
Each input-output pair is tokenised into a single sequence. We have a vocabulary of 14 tokens: 10 numbers (0-9) and 4 special tokens `<start>, <\n>, <inp_out_sep>, <end>`. Then we use normal autoregressive loss exactly like the pre-training phase of an LLM. The loss is on the entire sequence, not just the output.  

### 3D RoPE
The start token is always (0,0,0).
The input grid is placed in the z=1 plane, with the top left token being (0,0,1)
The input-output separator token is always (0,0,2)
The output grid is placed in the z=3 plane, with the top left token being (0,0,3)
The end token is always (0,0,4)

This allows a clean mapping between the input-output grids as they are placed on top of each other. 2D RoPE was often discussed among friends (someone implemented recently iirc). I think its suboptimal because it forces the transformer to learn the size of grid in a convoluted manner

### Per-task embedding
A single embedding is used for every pair in a task, whether augmented or not. This teaches the model that all pairs follow the same rule, and not to treat augmentations differently. The embedding vector is added to all tokens in the sequence.

I am particularly proud of this. I think its is very suited for self-supervised compression, because it reduces description length and gives a clean separation of common patterns and differing patterns between the pairs. 
<!-- (Forgive me if someone has implemented this before, I did not check) -->

Intuitively, the mutual information in all pairs of a task is cleanly stored into the same embedding vector, while the differences between them are encoded into grids themselves. This reduces the description length drastically:
- The grids are a forced cost that must be generated, and is obviously different for each grid. Therefore the specific implementation of the task rule for that pair can be stored here.
- All the mutual information (common patterns) among all pairs of a task is stored in a single vector accessible to every token. 

Previous approaches like TRM and HRM use per-pair embedding. I didn't like this for 2 reasons:
1) It incentivises memorisation
   The model can store the exact transform of each pair in the embedding (like a lookup table)
2) It increases number of params and training time considerably
   For example, TRM has 7M core network params but trains 300M+ params totally - most of which are parameters of the dataset embedding table. This is one reason why it takes very long to train (3 days on 4 H100s or more).  



### Augmentations
I use dihedral (rotations/reflections) and color augmentations during both training and inference in a standard AAIVR fashion. I also add extra tasks to the training set (ConceptARC). I did not include any tasks from ARC-2 dataset.

For those unfamiliar with ARC approaches, AAIVR works this way:
- Take the test input grid $x$
- Apply different augmentations to get the set of augmented input grids $\{f_i(x)\}$
- Run inference on all augmented grids separately
- For each output produced, apply the inverse of the augmentation
- Group the identical grids together
- Submit the 2 most common grids as the answer

Notes: 
- While augmentations is common on most approaches today, it is ugly, anti-bitter lesson and I hate it. My main focus next will be to remove it.
- All my results have 8x dihedral and 100x color (totalling 800x). This is slightly lesser than than 1000x augmentations used in TRM/HRM
- I genuinely haven't tried removing conceptARC. I think performance will reduce, will check.

### Misc
- Inference is fully deterministic. I haven't used temperature, top-k, top-p or beam search. I haven't tried them either. I do expect implementing them to improve performance slightly. Feel free to do so
- I implemented KV cache, but haven't tried MLA/other variants. Should reduce costs further (maybe improve performance?)
- Embedding is added to the vector instead of concatenating. Haven't tried concatenating. I haven't thought about the mechanics of whether this will improve performance, will do so once I get time.

That's it

If there is any confusion, please do ask me on the twitter thread. I'll answer the question and also add it to this blog 

### What's next?
- I want to understand why this works. So I'll start with basic ablations and hyperparameter sweeps. 
   - I expect 35%, maybe more with just basic stuff like hparam sweeps. I invite the community to do this too. The code is open source
   - Why this works can only be answered by more ablations. I was too GPU poor to try anything. I will do so now. Feel free to try some yourself and improve the theories
- Reduce training and inference costs. I expect 10x is possible. 100x is a bit ambitious but possible if we do a nanogpt speedrun like optimisation.
	- I haven't yet learnt GPU programming so haven't tried this. 
- Scaling - haven't hit the ceiling yet. I think performance will scale with more data and compute. I have only added the conceptARC dataset. What happens if I add other ARC datasets? What about the non-overlapping puzzles from ARC-2? What about all the synthetic datasets? Idk the answer yet, but we'll see soon.
	- Be careful not to mix ARC1 and ARC2 for the public eval. This should not matter for private eval though.
- I expect to hit 50% with scaling and a few obvious research ideas
- I now genuinely think 85% is possible at human efficiency. That is my goal 
- Data augmentations MUST be removed. It will be my main focus next. Its ugly and I hate it. It must go.

---
### What led me to try this
I started by thinking about how exactly humans solve ARC puzzles. I sat for 3 hours solving every puzzle in existence and I noticed this pattern:
- I look at the train grids and come up with a hypothesis that fits all
- Then when I look at the test input, I immediately corrected the hypothesis

This correction obviously cannot happen during inference - I am actually learning something new from the test input. Learning implies I need to train on the test input. 

I looked at the every approach and realised not a single one of them do this (other than compressARC). The obvious next thing was to think what about the train inputs? I checked and none of the approaches did that either. 

Now I could justify training on test inputs as "modifying train hypothesis", but I wasn't sure how to justify training on the train input grids. Training on it would be unsupervised learning, so I watched Ilya's video on generalisation and unsupervised learning. He talked about kolmogorov complexity, so I read the book and the MDL tutorial suggested by him. I got conviction and immediately posted a blog on my theory last month.

No one read the blog (ofc, talk is cheap). So I decided to do it myself.

We know a good predictor is a good compressor so a vanilla transformer should be enough to compress everything. Figuring out most of the implementation details took about an hour. Per-example embeddings and 3D RoPE were pretty obvious (to compress info better). Everyone talks about 2D RoPE for ARC (later on someone implemented it iirc), but its obviously suboptimal in this case so never tried it. 

And that's pretty much it. It worked first try. 

<!-- Okay the one exception was compressARC. This does unsupervised compression. Its brilliant, but my approach performs better, is much much cheaper, is more bitter-lesson pilled and can scale in the future:
1) Joint compression is better than separate compression
   Iliao's approach trains a new model from scratch on each task, but this is suboptimal. A single model trained on all tasks will perform better. In technical terms, he compresses each task individually, but my approach of jointly compressing all tasks will always perform better (can be proved mathematically). To his credit, he points this out too, in his blog.
2) Cost seems to be much cheaper. 
   The blog says 86hrs on a 4070 for 20% on the public eval set. 
3) Easier to train: 
   Isaac has a lot of neat engineering tricks to make training stable. Even with that, the KL floor can arbitrarily collapse. Mine has no such instabilities. It is almost guaranteed to work off the bat.
4) No specially constructed architectures
   He created an extremely clever equivariant architecture that is handcrafted for ARC-AGI. It is equivariant to color, diagonal, and xyz transformations. It is brilliant, but such handcrafting is anti-bitter lesson. In comparison, I am using a vanilla transformer.
   
Note: I do use dihedral and color augmentations (like every other major approach on ARC today). In a way this is equally anti-bitter lesson as Iliao's architecture. I think there is a one-one mapping between the inductive biases produced by augmentations and equivariant architectures. Also, it just pushes the human engineering aspect from the architecture to the data. 

Even then, this is still better - mine only engineers color and dihedral inductive biases. His has extra equivariances like (a), (b) (c). The latter 3 are taken care of by the attention mechanism of a transformer. -->
<!-- 
## Appendix  
### List of problems in each approach

| Approach | Uncompressed Test Input | Uncompressed Example Inputs  | Uncompressed Private Puzzles | Human Intervention | Comments |  
| --- | --- | --- | --- | --- | --- |  
| [MindsAI (TTFT, AIRV)](https://arxiv.org/pdf/2506.14276)  | ✓   | ✓ | ✓ (example outputs are compressed though) | Augmented puzzles |  |  
|[Combining induction and transduction](https://arxiv.org/pdf/2411.02272) (both approaches) | ✓ | ✓ | ✓ | Large synthetic dataset |  |  
| [CompressARC](https://iliao2345.github.io/blog_posts/arc_agi_without_pretraining/arc_agi_without_pretraining.html)   | | | ✓ | special decoder architecture with ARC-related biases |   |  
| [TRM](https://github.com/SamsungSAILMontreal/TinyRecursiveModels) / [HRM](https://github.com/sapientinc/HRM) |✓ | ✓ | ✓ (example outputs are compressed though) | Augmented puzzles | |
| [ARChitects](https://da-fr.github.io/arc-prize-2024/the_architects.pdf) |✓ | ✓ | ✓ (example outputs are compressed though)| Augmentations |  |
| [Surprising Effectiveness of Test-Time Training](https://ekinakyurek.github.io/papers/ttt.pdf) | ✓ | ? | ✓ (coz test inputs uncompressed) | Synthetic dataset | training on example inputs performed worse for them, but lots of confounding factors  |
| [Ouellette' Neurally-Guided Program Induction](https://arxiv.org/html/2411.17708v1)| ✓ | ✓ | ✓ | hardcoded DSL + synthetic data | |
| [OmniARC](https://ironbar.github.io/arc24/05_Solution_Summary/) |  | ✓ | ✓ (example outputs are compressed though) | puzzle augmentations, extra datasets | TBD. | 
| [Latent program network](https://arxiv.org/pdf/2411.08706) | ✓ | ✓  | ✓ |  Augmented puzzles | Searches in latent space for a function that solves the example pairs; encoder/decoder conditioned on the train set. |  
| [Greenblatt's "Draw more samples"](https://blog.redwoodresearch.org/p/getting-50-sota-on-arc-agi-with-gpt) | ✓ (only on private set) | ✓ (only on private set) | ✓ | Some, [mentioned here](https://blog.redwoodresearch.org/i/145731248/appendix-a-bunch-of-tricks-used-in-my-solutions)  | Frontier LLMs likely trained on public set |  
| [Evolutionary Test-time compute](https://jeremyberman.substack.com/p/how-i-got-the-highest-score-on-arc-agi-again)   | ✓ (only on private set) | ✓ (only on private set) |✓ | -  | Frontier LLMs likely trained on public set |  
| [Efficient Evolutionary Program Synthesis](https://ctpang.substack.com/p/arc-agi-2-sota-efficient-evolutionary) | ✓ (only on private set) | ✓ (only on private set) |✓ | - | Frontier LLMs likely trained on public set |  
| [Icecuber](https://github.com/victorvikram/ARC-icecuber) | ✓ | ✓ | ✓ | Intentionally designed DSL |  |  
| [A 2D nGPT Model for ARC Prize](https://www.kaggle.com/competitions/arc-prize-2024/discussion/545844)| ✓ | ✓ | ✓ (example outputs are compressed though)| Augmented puzzles |  |  
| [Partial Functions](https://github.com/cristianoc/arc-agi-2-abstraction-dataset/blob/main/dsl/arc_model_domains.pdf) | ? | ✓ | ✓ | - | (Theoretical approach) Domain restriction might cause some test input compression |  

[^1]: Everything below applies to deep learning just as well as program synthesis. Gradient descent is just a locally aware search algorithm. A Neural network is a set of programs. Each unique weights combination corresponds to one program  
[^2]: There are some technical caveats here. It is possible to find a pathological turing machine where this is the best compression, but a more careful application of MDL avoids this.  
[^3]: These comparisons hold asymptotically. The original length is ~$O(2n)$ bits. Naive solver costs  ~$O(n) + O(1)$ bits. Alternate solver costs  $O(log(n)$ bits  
[^4]: Technically, this is strict only in the limit becuase of the constant term from the cost of F and the "apply ..." instruction
[^5]: with some caveats  $KC(X\|Y) \le KC(X) + O(1)$  
[^6]: Technically, there are 2 types of compression possible here: *conditional* and *joint*. We use it interchangeably because you can prove that both are better than isolated compression.  
[^7]: Unless you're in a pathological turing machine. If that's the case, move to a better one.   -->