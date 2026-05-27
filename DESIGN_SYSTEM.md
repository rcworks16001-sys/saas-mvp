# Ourivo Design System (Dayos)

## CSS Variables (already in globals.css)
--ice: #e5e7eb      /* page background */
--ink: #000000      /* primary text, buttons */
--white: #ffffff    /* card surfaces */
--fog: #979797      /* muted text */
--ash: #444444      /* secondary text */
--mist: #f3f3f3     /* input backgrounds, hover fills */
--green: #d1ffca    /* action green — positive accents */
--yellow: #fff100   /* alert yellow — urgent, hot leads */
--r-card: 32px      /* card border radius */
--r-btn: 8px        /* button border radius */
--r-nav: 12px       /* nav item border radius */
--font-display: Bebas Neue  /* headlines */
--font-body: Inter          /* body text */

## Rules
- No dark backgrounds. Background is always var(--ice) or #fff
- No blue accent (#4F8CFF gone). Use var(--ink) for CTAs
- No gradients, no box shadows
- Bebas Neue for all page headlines and section titles
- Inputs: mist background, ice border, black focus border
- Buttons: black background, white text. Disabled = mist bg
- Toggles: black when on, ice when off
- Cards: white bg, 1px #e8ecf4 border, var(--r-card) radius
- Remove all S = {} dark color objects
- Keep ALL logic identical — only visual changes
- Add 'use client' if the file has event handlers
- Use Image from 'next/image' instead of <img>
- Navbar: white bg, logo + nav links + sign in + start free trial
- Footer: white bg, standard links