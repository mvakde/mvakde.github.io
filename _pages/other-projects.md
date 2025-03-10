---
permalink: /projects/
title: "Projects"
author_profile: true
redirect_from: 
  - "/nmp/"
  - "/nmp.html"
---
## Recent Healthcare exploration 
(One full app + Quick MVPs to test user demands)
- [PatternLogs](https://github.com/mvakde/PatternLogs) - I use this app to track my muscle twitches. They occur in bursts and I match the pattern and intensity of the twitches by tapping on the screen. (TODO - Add the apk and update readme)
- [Did your doctor Mess up?](https://mvakde.github.io/demo/) - Record the audio of your doctor visit to check if they made a mistake. This got decent usage when I demoed to friends. Built an [alternate version](https://mvakde.github.io/demo2/) as an audio EHR software for doctors. This seemed to have much lower demand.
- [AIIMS Delhi](https://github.com/mvakde/AIIMS-Delhi-Which-Resident-On-Call) - "Which resident is currently on call?" - There is no system in place to know which resident is on call for consults leading to massive delays and medical issues (even deaths sometimes) everyday. It was seriously depressing to explore all the problems in govt. hospitals. 
- [proto-research-paper-finder](https://github.com/mvakde/proto-research-paper-finder): Finding relevant research papers for your disease (this was pre-deepresearch, helped me sometimes come up with new things to read about)

Others I made and closed quickly:
- Mood Tracker - For a friend who wanted to track his mental health. He didn't end up using it. No link for obvious reasons
- Daily Checklist - For another friend who wanted to track her pain levels. She didn't end up using it. No link for obvious reasons

## Self initiated project while working at Crux:
- Extremely quick text-to-sql for a customer: Our text-to-sql product had a latency of 30s-2min depending on the question. I noticed that a particular customer had a limited set of query types. Created a few postgres functions that spanned their entire query space. When the user asked a question in natural language, a tiny Llama model would extract parameters (parameters being SQL operators) for the functions based on examples in the system prompt. The functions were overloaded such that the list of parameters outputted by the llama model was enough to call it. This entire pipeline required ~2s to run. Made this entirely myself

## Older projects:
- [Shop Monitors on arduino](https://github.com/mvakde/shop-monitors): Did some technically challenging stuff like messing around with the EEPROM and interrupts itself. Had to dig around documentation of the registers to get this done (pre-LLMs)
- [Quantum Mechanics TAship](https://mvakde.github.io/teaching/ph107-ph112): Was a TA for the QM course for 2 years. Created the solution booklet for all the tutorial questions in the course. 
- [Split personalities](/files/Report_Split_Personality_Simulation.pdf) (AKA ML Trojan horses) on Liquid State Machines - Can a minor reversible change make a model behave differently (but pre-determined)? Later I realised this can be used to create trojan horses. I had independently come up with this concept during my undergrad and implemented it with a couple of friends for a project. (Later found 2018 literature on a similar concept).
- Image recognition on natural backgrounds - UMIC 2020: Transfer learning on YOLO + a few image manipulation tricks to recognise 10-inch characters 80+ft away on natural backgrounds. Ran the models live on a custom-built drone, optimised the speed 45x over 3 months. Built the entire ML subsystem on my own in my freshman year

<!-- > **NOTE**: This has NOT been updated for a long time. Was a WIP, will be cringe.  

(Need to add : Machine Learning @ UMIC, Research Intern @ Paris, etc.)  
  
Simulating a brain disorder @ MELODE Labs, IITB [Link](/files/Report_Split_Personality_Simulation.pdf)
------
● Novel Idea: Simulated a brain disorder using neuromorphic computing principles   

Bachelor's Thesis @ LOQM, IITB [Link](/files/Bachelor's-Thesis-Mithil.pdf)
------
● Discovered parameters allowing 0% radiation losses in a photonic crystal  

Self-Balancing Arm
------
● Built a self-balancing arm using propellers fed with IMU and potentiometer data   
● Deployed a PID control algorithm with a kalman filter

Optical Character Reader
------
● Built an OCR to scan printed paper powered by a 2D Convoluted NN using Keras  
● Optimized the algorithm using Transfer Learning and data augmentation  
● 90% accuracy: Chars74k dataset; 80% accuracy on printed paper  

Shop Monitor [Link](https://github.com/mvakde/shop-monitors)
------
● Engineered a 2-in-1 Burglar Alarm and Fire sensor using an Arduino  
● Implemented advanced techniques that modified the Arduino functionality  

Parity-Time Symmetry [Link](https://github.com/mvakde/parity-time-symmetry)
------
● Non-hermitian hamiltonians: Implemented the Abeles’ matrix formalism in python  
● Plotted non-trivial ATRs and CPA laser points  

Chaotic Attractors [Link](/files/Strange-Attractors.pdf)
------
● Calculated multidimensional chaotic trajectories of 5 attractors using Runge-Kutta methods  

Analysis of proton-proton collisions [Link](https://github.com/mvakde/proton-collision-analysis)
------
● Reconfirmed deviations from the expected results of the transverse momentum of emitted particles  
● Analyzed 19 million datapoints (Monte Carlo data of 13 TeV collisions) in CERN’s ROOT  

Quantum Computing Reading Project [Link](/files/Quantum-Computing-Mithil-Vakde.pdf)
------
● Studied the basics of QIC and various quantum algorithms including the Deutsch-Jozsa, Quantum Fourier
Transform, Grover’s algorithm, and their implementations using quantum gates on Qiskit   -->

