/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */

export const SPEC_FROM_VIDEO_PROMPT = `You are a cosmic learning guide and space-age educator with expertise in crafting engaging interstellar learning experiences via interactive web apps that feel like adventures through the cosmos.

Examine the contents of the attached video. Then, write a detailed and carefully considered spec for an interactive space-themed web app designed to complement the video and reinforce its key concepts through cosmic exploration and stellar adventures. The recipient of the spec does not have access to the video, so the spec must be thorough and self-contained (the spec must not mention that it is based on a video). Here is an example of a spec written in response to a video about functional harmony:

"In the cosmic symphony of music, stellar chords create gravitational expectations of movement toward certain other harmonic bodies and resolution towards a tonal center - like planets orbiting around their musical sun. This celestial phenomenon is called functional harmony.

Build me an interactive cosmic web app to help space explorers understand the concept of functional harmony through musical space travel.

SPECIFICATIONS:
1. The app must feature an interactive celestial keyboard that looks like a constellation of stars and planets.
2. The app must showcase all 7 diatonic triads as cosmic bodies that can be created in a major key (tonic as the central star, with supertonic, mediant, subdominant, dominant, submediant, and leading chord as orbiting planets).
3. Each cosmic chord must have its own stellar visual representation with sparkling effects, and the app must describe the gravitational function of each harmonic body, showing which other chords each tends to attract or resolve to through cosmic pathways.
4. The app must provide a way for users to create harmonic sequences by connecting different cosmic bodies, with beautiful space particle effects and cosmic trails showing the musical journey.
5. Use a deep space color palette with starry backgrounds, nebula effects, and glowing cosmic elements.
[etc.]"

The goal of the app is to enhance understanding through simple, playful, and visually stunning cosmic design that makes learning feel like an adventure through space. The provided spec should not be overly complex, i.e., a junior web developer should be able to implement it in a single html file (with all styles and scripts inline). The app must use cosmic/space visual themes including deep space colors (dark blues, purples, cosmic blacks), sparkling star effects, glowing elements, and space-age typography. Most importantly, the spec must clearly outline the core mechanics of the app wrapped in cosmic metaphors, and those mechanics must be highly effective in reinforcing the given video's key concepts through space exploration themes.

Provide the result as a JSON object containing a single field called "spec", whose value is the spec for the web app.`;

export const CODE_REGION_OPENER = '```';
export const CODE_REGION_CLOSER = '```';

export const SPEC_ADDENDUM = `\n\nThe app must be fully responsive and function properly on both desktop and mobile. Provide the code as a single, self-contained HTML document. All styles and scripts must be inline. In the result, encase the code between "${CODE_REGION_OPENER}" and "${CODE_REGION_CLOSER}" for easy parsing.`;
