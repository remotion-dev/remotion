# Animating the lights — script draft

I vibe-coded my own DJ show. Claude helped me animate the lights, and Remotion came in clutch for the visuals.

Today, let's talk about how you can program lights with agents.  
You need any device that speaks the DMX protocol.

To connect it to your computer, you need an Enttec DMX USB Pro Interface.  
To connect multiple devices, you directly daisy-chain them using DMX cables.

At the end of your daisy chain, you add this - a DMX terminator.
Make sure that each device has a unique DMX address so they don't conflict.

Once that is setup, you would normally control it using a program like QLC+, BUT here comes the 100x speedup. Use an agent to implement the DMX protocol via Web Serial and now you can control your lights using JavaScript.

I hooked it up to Remotion, so that when I press play, it plays a prerecorded light sequence.  
I even made my own recorder inside Remotion, which allows me to jam and record light sequences.

Then, to play it during my 75 minute DJ set, I simply hit play in Remotion. Aaand that's how
