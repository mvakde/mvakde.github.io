---
permalink: /misc/
title: "Misc"
author_profile: true
redirect_from: 
  - "/projects/"
  - "/projects"
  - "/nmp/"
  - "/nmp.html"
---

Just a dump of stuff I explored a long time ago. 

## Very quick text-to-SQL:
- While I worked at Crux (2024), we initially worked on text-to-sql. Our product had a latency of 30s-2min depending on the question. I noticed that a particular customer had a limited set of query types. Created a few postgres functions that spanned their entire query space. When the user asked a question in natural language, a tiny Llama model would extract parameters (parameters being SQL operators) for the functions based on examples in the system prompt. The functions were overloaded such that the list of parameters outputted by the llama model was enough to call it. This entire pipeline required ~2s to run. Made this entirely myself. I wish we hadn't pivoted a few weeks later. This was a good idea to explore

## Healthcare exploration (~2024 end / 2025 start)
(One full app + Quick MVPs to test user demands)
- [PatternLogs](https://github.com/mvakde/PatternLogs) - I used this app to track my muscle twitches. They occur in bursts and I match the pattern and intensity of the twitches by tapping on the screen. Helped me find triggers
- [Did your doctor Mess up?](https://mvakde.github.io/demo/) - Record the audio of your doctor visit to check if they made a mistake. This got decent usage when I demoed to friends. In hindsight, this was a very good entry point to build a healthcare AI startup, and I should have continued. I had also tried an [alternate version](https://mvakde.github.io/demo2/): an audio EHR software for doctors. This seemed to have much lower demand.
- [AIIMS Delhi](https://github.com/mvakde/AIIMS-Delhi-Which-Resident-On-Call) - "Which resident is currently on call?" - There is no system in place to know which resident is on call for consults leading to massive delays and medical issues (and even deaths) every hour, every day. Exploring problems in govt. hospitals was vv depressing. Bureaucracy fucking sucks. V few people genuinely care about their work.
- [proto-research-paper-finder](https://github.com/mvakde/proto-research-paper-finder): Finding relevant research papers for your disease (this was pre-deepresearch, helped me sometimes come up with new things to read about for my own health)
- Mood tracker, Pain Tracker - For a friends who wanted to track their pain / mental health levels. Both products didn't end up getting used. This made me realise users don't know what they want, and in general have very low agency. No link for obvious reasons



## Older stuff in college:

- [Quantum Mechanics TAship](/misc/ph107-ph112/): Was a TA for the QM course for 2 years (2022-23). Was in charge of 1500 freshman and all 40 TAs. Also created the solution booklet for all the tutorial questions in the course. I think its still used today. 
- Image recognition on natural backgrounds (part of UMIC, a student tech team): Transfer learning on YOLO + a few image manipulation tricks to recognise 10-inch characters 80+ft away on natural backgrounds. Ran the models live on a custom-built drone, optimised the speed 45x over 3 months. Built the entire ML subsystem of the drone on my own in my freshman year 
- [Shop Monitors on arduino](https://github.com/mvakde/shop-monitors): Did some technically challenging stuff like messing around with the EEPROM and interrupts itself. Had to dig around documentation of the registers to get this done (this was pre-LLMs). Final implementation is much simpler.
- [ROOT Installation Guide for Windows (WSL)](/misc/root-installation-guide/): A guide to install WSL w graphics support and CERN ROOT for the data analysis course. Made this coz most of my classmates were afraid of the terminal

<!-- - [Split personalities](/files/Report_Split_Personality_Simulation.pdf) (AKA ML Trojan horses) on Liquid State Machines - Can a minor reversible change make a model behave differently (but pre-determined)? Later I realised this can be used to create trojan horses. I had independently come up with this concept during my undergrad and implemented it with a couple of friends for a project. (Later found 2018 literature on a similar concept). -->


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

