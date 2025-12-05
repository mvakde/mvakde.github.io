---
permalink: /blog/why-all-ARC-solvers-fail-today/
title: "Why all ARC-AGI solvers fail today (and how to fix them)"
---
Twitter thread: https://x.com/evilmathkid/status/1988233092663050340

<figure>
  <img src="../img-hero.png" alt="my alt text"/>
  <span style = "text-align:center;"></span>
</figure>
<!-- {Sneak peak: Before/after} -->

Every solver today fails because it leaves some data uncompressed.  

Fixing this will boost accuracy and allow us to drop hard-coded tricks like augmentations. 

Outline:
- there are 3 uncompressed data sources
- compressing each one will boost performance mathematically
	- this explains why "test time training" is necessary

- augmentations / other tricks are unnecessary and can backfire
- simple predictions you can falsify


## Introduction
The ideas in this blog are built on the MDL principle:
> **Minimum Description Length**  
> The best AI model describes the data (and itself) in the fewest bits

This act of describing lots of data in very few "bits" is called compression.  

MDL says that a more intelligent AI model will compresses its training dataset better

(Btw: If "compression" sounds weird anywhere, replace it with "is trained to predict")

---
[ARC-AGI](https://arcprize.org/play?task=3e6067c3) is a  benchmark that tests how well your AI model can solve simple spatial puzzles.  

Every AI model today fails at it.  

I claim  this is because **no AI model compresses all data sources** provided by ARC.  

Specifically, there are  3 uncompressed sources:  
 - example input grids
 - test input grids
 - private puzzles

Instead of fixing this flaw, **approaches today rely on human scaffolding**  
(This means hardcoded data augmentations, special architectures and custom DSLs)  

This is bad - It is not scalable, is mathematically unnecessary and can backfire  

But first, let's look at the   

## Uncompressed data sources
We'll explore each data source use this naive approach[^1]:  <!-- wtf is this line bro -->
> **Naive AI model:**  
> Given an ARC puzzle,  
> Find the shortest program $P$ such that $P(\text{Input}) = \text{Output}$ for all example pairs.

This looks like MDL, but it is mathematically wrong.  
It leaves all 3 sources uncompressed
### <span style = "font-size:1.25em;">Source 1: Example inputs</span>
<figure>
  <img src="../img-inputs-compressible.png" alt="my alt text"/>
  <span style = "text-align:center;"><figcaption>Fig 2: The example pairs of a particular puzzle. The inputs are highlighted in pink.  Clearly they have common patterns</figcaption></span>
</figure>

In the naive solver, $P$ *consumes* the input and *produces* the output.  
This is bad - it completely fails to compress the input grids.

**Proof**:  
Let’s write the training data as  
  
$$D_E = (I_1, O_1, \dots, I_n, O_n).$$  
  
Each grid is expensive to describe (~=3000 bits), so $D_E$ is long.  

**Naive method**:  
We find the shortest $P$ such that $P(I_k) = O_k$ for all $k$.  
We can now shorten the description: 
  
$$\boxed{D_E = \big(I_1, \dots, I_n, \text{"apply on every input"}, P\big).}$$
  
Look closely:  
This only replaces the ***outputs*** by a short program.   
The inputs $I_1,\dots,I_n$ are still listed verbatim, so they are not compressed at all.  

This is terrible because the input grids in ARC are highly regular and compressible. This means a shorter description definitely exists.  
(Eg: In Fig 2, all example inputs share obvious structure: same kinds of red squares, same object layouts, same background patterns, etc. These patterns can be used to compress the input.)  <!-- maybe add path TM exception-->

In short, the naive method violates MDL: **we know $D_E$ can be shortened further.[^2]**  

**Better alternative:**  
Instead, let's find a program $F$ such that $F(k) = (I_k,O_k)$
Immediately we have a much shorter description[^3]:  
  
$$\boxed{D_E = \big(\text{"for every integer from 1 to n, apply"}, F\big).}$$  
  
Here $F$ jointly compresses **both** inputs and outputs. Any regularity that appears in *either* the inputs, the outputs, or their relationship can be folded into a single short program.   

This is strictly a better compression[^4] than only explaining $O_k$ given $I_k$.  

The only approach doing this is CompressARC (though it still has problem 2).


> We can generalise this concept:
> > Whenever datasets $A$ and $B$ share **mutual information**,  
> > compressing them **together** is shorter (in bits) than separately
> 
> Think of it as the compressor exploiting common patterns in A and B.
> 
> ARC has a lot of such common patterns to exploit.  
> Eg: Both the inputs and outputs are grids built from the same kinds of objects, shapes, colors, symmetries, etc.
> 
> Notes:
> - This can be made technically sound with Kolmogorov complexity[^5]
> - Jointly[^6] modelling inputs and outputs feels strange from a supervised-learning perspective, but we already do this in many self-supervised setups (e.g. language modelling)
>  
  
This generalised principle makes it easy to prove the MDL violation for the next 2 uncompressed sources:  


### <span style = "font-size:1.25em;">Source 2: Private puzzles</span>
<figure>
  <img src="../img-concept-reused.png" alt="my alt text"/>
  <span style = "text-align:center;"><figcaption>Fig 3. Multiple puzzles use the same concept - "fill in the blanks"</figcaption></span>
</figure>
There is a HUGE amount of mutual information among all puzzles.  

1. Every puzzle in ARC is built using the same basic concepts like objectness, geometric transforms, etc.  
2. Crucially, almost all concepts needed for the eval puzzles already appear in the train puzzles. Eg: occlusion, symmetry, color swaps, etc.  
  
Now we apply the same (generalised) argument:  
Because every puzzle shares common patterns, MDL demands compressing ALL of them  together, **including the private ones**.  

Hence, the naive solver fails again - it trains on each puzzle separately. (This also applies to "no-pretraining" methods like CompressARC and NCAs)
  
#### Test time training
The need to compress private puzzles implies that test time training is 100% necessary.  
Every approach must train on the public puzzles offline AND on the private puzzles during runtime.  
However, all current "test time training" methods are suboptimal because they ignore data sources 1 and 3

### <span style = "font-size:1.25em;">Source 3: Test inputs</span>
<figure>
  <img src="../img-test-input.png" alt="my alt text"/>
  <span style = "text-align:center;"><figcaption>Fig 4. The test input shares common patterns with the example grids.  Note that it has some extra information: rotation equivariance</figcaption></span>
</figure>

The test grid in the figure clearly shares patterns with the example grids. Hence, MDL says compressing them jointly will improve performance (same mutual info argument). Obviously, this proves that the naive method fails too.  

Ideally we'd be done here, but there's a catch:
  
**Test inputs are distribution shifted**  
In a typical ARC puzzle,  
If the examples pairs are sampled from some distribution ~$X$ then the grids are sampled from a *transformed* distribution ~$\mathcal{f}(X)$. Eg: In fig 3, the test grid is rotated 90 degrees  

This is bad.  
Vanilla MDL applies ONLY when training and inference are from the **same** distribution. To make MDL applicable, we need to train on a dataset that is sampled from a union of $\mathcal{f}(X)$ and $X$.   
  
Luckily, jointly compressing the example pairs and train input grids does exactly this.  
  
 *"Doesn't unsupervised generalisation happens on different distributions"*  
  
No, generalisation only happens AFTER you jointly compress some part of the new distribution.  
Eg: Base LLMs are terrible chatbots. They only become good at chatting AFTER they are trained on chat conversations (supervised finetuning).  
  
**Wait, then most ARC solvers are dead on arrival!**  
Yeah, the only approach today that compresses the test inputs is CompressARC
The rest should all score 0 since they can't generalise across the distribution shift  
  
Obviously, many of them do get a non-zero score. This is because:  
1. In some puzzles $\mathcal{f}$ is an identity transform. Here, MDL works  
2. Some puzzles reuse $\mathcal{f}$ from the example grids of other puzzles. (This makes $\mathcal{f}$ a part of $X$, hence MDL works)  
3. Some approaches are designed with hardcoded augmentations or special DSLs/architectures.  


(3) is actually very problematic.  
Special architectures/DSLs  essentially bake $\mathcal{f}$ into the model itself. Augmentations expand $X$, making it a superset of $\mathcal{f}(X)$. Both these tricks allow MDL to apply again. 

However such human intervention is **anti-bitter lesson**.  
It is not scalable and goes against the spirit of the benchmark. It should not be done.  

We discuss this below.
## Human interventions 
### Hardcoding augmentations (synthetic data)
Augmentations can make a lot of puzzles trivial to solve. We just discussed why this happens - it expands the train distribution to cover the test distribution. For example, a tiny NCA model immediately solves this when augmented:

<figure>
  <img src="../img-augment-puzzle.png" alt="my alt text"/>
  <span style = "text-align:center;"><figcaption>Fig 5. The test input has an unseen square. A tiny NCA model initially struggles but easily solves it with augmentations</figcaption></span>
</figure>

But augmentations can also make a puzzle impossible to solve. 
In this puzzle for example, an AI model might memorise brown to be filling color. It won't know what to do when it sees the test input: <!-- fix this fool -->

<figure>
  <img src="../img-bad-augment.png" alt="my alt text"/>
  <span style = "text-align:center;"><figcaption>Fig 6. A catastrophic augmentation that makes the puzzle impossible to solve</figcaption></span>
</figure>

Theoretically, augmentations are unnecessary. 
By definition, a Kolmogorov compressor with access to all data will solve the puzzle without augmentations.[^7] Augmentations can only worsen its performance (by contradicting correct information)

So if your AI model _needs_ augmentations, that means:
- it is a weak compressor (augmentation transforms data into a format it recongises) or
- it forgot to compress some necessary source of data (and the augmentation is accidentally leaking bits from here)

Keeping the math aside, the main problem is that it is hardcoded

In general, anything intentionally designed by a human:
- moves some of the "intelligence" from the AI model into the human who designed the trick
- and is not scalable (testmaker can always create a new puzzle that is out of distribution)
- might fail by contradicting info not available to the human (eg: private puzzles)

### Hardcoded architectures/DSLs
(By “architecture” I mean the neural network design and by “DSLs” I mean the hand-picked set of operations allowed in program synthesis)  

Same problem as augmentations: doing this smuggles in extra information about the task that never appears in the data. This can make some puzzles trivial. It can also make some puzzles impossible to solve  

For example, the puzzle above requires partial color equivariance. If you bake it into the architecture, then it becomes trivial. In an ideal world, your AI model should learn this equivariance by itself.   
  
## Testable predictions  
  
**Predictions**:  
1.⁠ Every solver will improve once it starts compressing currently ignored data sources  
2.⁠ ⁠Once those are compressed, handcrafted tricks can be removed without losing performance  
3.⁠ ⁠For some methods, performance will improve when you remove the tricks
  
The modifications required to execute (2) and (3) might be very complex.  

The appendix lists the exact problems of each approach

## Conclusion

Scores on ARC-AGI can be improved  

You just gotta compress everything

I'm gonna test this in the next few days.

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
[^7]: Unless you're in a pathological turing machine. If that's the case, move to a better one.  