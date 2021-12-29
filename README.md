# Cribbage [WIP]

This is a(n incomplete) single-page application for the card game Cribbage. A user can create an online room and play remotely against another user who joins the room. Alternatively, a user can play locally against a computer player, or two users can play locally.

If you want to clone the repository, you'll need to add definitions for `publishKey` and `subscribeKey` at `src/pubnubKeys.js`.

## Play

On GitHub Pages at [https://kr-matthews.github.io/cribbage](https://kr-matthews.github.io/cribbage).

## Features

### Current

None (yet).

### Potential Future

See [enhancements](https://github.com/kr-matthews/cribbage/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement) on GitHub.

- Allow sending of short (possibly pre-defined) messages.

## Original Intentions

Quick and clean implementation with proper use of hooks and good separation of concerns. Better management of state shared between users (than Connect 4).

## Focus

- Sharing state (in particular, deck of cards) across multiple users. (Previous Connect 4 game required extremely simple, straightforward sharing.)

## Flaws

See the [issues](https://github.com/kr-matthews/cribbage/issues) on GitHub.
