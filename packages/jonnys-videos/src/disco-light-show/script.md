# Disco light show — script

I vibe-coded my own DJ show. Claude is helping me animate lights, and visuals are made in Remotion.

Then I threw a party for my birthday and played it for my friends. Let's see if I can get them to dance.

For this track, I took the music video and inserted animated captions in between the foreground and the background.

I found this Text-behind-video demo from Hugging Face, which works completely locally by leveraging all the cool technology.

The demo itself is quite limited, and we cannot insert an animated video layer. But since it is open source, I can just fork the project and make a custom version that fits my needs, exporting foreground and background separately as transparent layers using Mediabunny.

Now I can drag both videos into Remotion and put an HTML layer in between using another agent or do it old school by going into the code.

The result, in my opinion, is super fresh.
