# WRITING.md - the comedy engine (read before writing ANY script)

Goal: every episode is funny enough that people send it to a friend and go back to watch the earlier ones. That is built, not hoped for. A scene that is only "nice to look at" or that explains a lesson has failed.

## The engine
Each episode = **relatable trader pain** + **a character collision** + **three escalating jokes** + **a physical payoff** + **one quotable line**.

## Who is funny and how
| Character | Comedy job | Signature |
|---|---|---|
| **Grandma** | **Savage roast queen who speed-talks and yaps** (voice +24% speed, long rapid-fire runs of insults). Roasts EVERYONE: the devil, the guru, every new character, even Pipi. Backs up the angel. Long arc: she and Pipi end up rich together, so she stays savage all the way up. | Specific, creative insults; "Sit down."; the spoon as a punchline weapon |
| **Angel** | Sweet-voiced assassin. Polite on the surface, brutal underneath. Sometimes teams up with Grandma. | "Bless his heart."; "I have the paperwork." |
| **Devil** | Loud, dramatic, fragile ego, terrible advice (FOMO, revenge, all-in). Gets owned every time and comes back anyway. **He can cry (tears), faint (dizzy stars) and get carried out.** | "I RESIGNED!"; the heaven insecurity; carried out by the horns |
| **Guru** | Fake rich, caught lying, always renting something. | rented Lambo, rented jet, fake mustache |
| **Pipi** | The straight man with a deadpan streak. Earnest, sometimes the funniest line is his one-word reaction. | "...Okay." |

## Structure (35-45 s)
1. **0-2 s hook = the funniest/most shocking line or image** (an insult, a disaster, a reveal). Frame 0 must also work as the loop frame.
2. **Setup in under 5 s** (one trader situation everyone knows: FOMO, moved stop loss, revenge trade, signal sellers, blown account).
3. **Three escalating beats** (rule of three: each one funnier/meaner than the last).
4. **Physical payoff** of an earlier line (a spoken insult comes back as a visual: "carried out by the horns" -> he is carried out by the horns).
5. **Button**: the last line is a quotable one-liner that carries the lesson inside a joke. Then the loop.

## Joke rules
- **Specific beats generic.** "Stupid" is nothing; "couldn't even qualify for Earth" is a joke.
- **The punchline is the last word.** Cut anything after it. Never explain a joke.
- Every line must **set up or pay off**. If it does neither, cut it.
- **Reaction beats**: after a punchline leave 0.4-0.8 s (`pause=`) and show the victim's face. Silence is where the laugh lives.
- **Callbacks** to earlier episodes (the spoon, the rented Lambo, "I RESIGNED!", the moth) so new viewers want to go back.
- **Hide the lesson inside the punchline.** Never lecture. If a line sounds like a trading textbook, rewrite it as an insult or a joke.
- Roast the **behaviour**, never real people, nationalities or traders by name.

## The share test (all must be yes before rendering)
1. Is there a line someone would quote or screenshot?
2. Would a trader tag a friend ("this is you")?
3. Is there a laugh about every 4 s?
4. Is there a visual gag that works on mute?
5. Is there something that makes a new viewer want to watch the earlier episodes (callback / easter egg)?

## Process (not luck)
Write 3 versions of every key line, keep the funniest, read it aloud for timing, run a punch-up pass, run the share test. Then deliver with performance: per-line pace/pitch, pauses before punchlines, sound effects (burn/rimshot) on roasts.

## Running gags and starter bank (add to it every episode)
- Devil: "I RESIGNED!" / carried out by security / "That's slander!... is it slander if it's true?"
- Grandma: "Don't listen to that stupid red thing. He couldn't even stay in heaven." / "You couldn't even qualify for Earth. That's why they sent you down." / "That's not a strategy, that's a hostage situation." / "Your stop loss is more of a vibe." / "Your risk management is a toddler holding a lit candle." / "The bus already left. You'd be buying the bus stop." / "Honey, that chart has more red than a stop sign factory."
- Angel: "Bless his heart." / "I have the paperwork." / "Heaven has a file on you."
- Pipi deadpan: "...Okay." / "I love you, Grandma, and that was brutal."
- Guru: renting everything (Lambo, jet, dog), fake accents, disguises.

## Delivery rules (added 2026-11-17 from the owner's feedback)
- Grandma yaps: fast, long insult runs, gestures with the free hand. More roasts per episode; no one is safe (guru, Pipi, new characters).
- Devil and Angel are physical: crying (`cry` prop on Devil), fainting (rotate + dizzy stars), being carried out (Angel flies off with him).
- **Sounds spoken as sounds, not letters:** write "Mm-hm." or "Hmmm." in the dialogue. Do not write MMHM in capitals (the voice would spell it). Checked: "Mm-hm." gives a ~0.4 s hum, not spelled letters.
- Delivery speeds: Grandma +24%, Pipi +14%, Angel +12%, Devil +8%, gap 0.2 s. Use `pause=0.5` after a punchline for the reaction beat. Roast sound effects: `sfx_burn`, `sfx_rimshot`, `sfx_faint`, `sfx_boing`.
- Target length 35-45 s (ep 6 ran 56 s: cut lines before cutting jokes).
