# Media Skip Timer

## About

Media Skip Timer is an extension that automatically skips media after a set time.

### Why?

I've been testing out drawing streams recently, and I kept running into a problem: the music in playlists, with each track lasting 1-2 hours things got repetitive too quickly and I had to manually change it every few minutes. So I decided to create this simple extension.

_I am not sure if there's something similar to this, but I wanted an excuse to develop my own extension._

## TODO

- [x] Fix default checkbox state
- [x] When time is set using input, the decrement button clears it.
- [x] Fix icon getting stuck in active mode when one-shot timer triggers.
- [x] Make active indicator on icon larger
- [x] Implement save on change
- [x] Dry run bool
- [x] If popup is open, it doesn't update when timer runs out. (maybe another event listener for alarm)

### Maybe

- [ ] ? Merge both buttons into one (start, clear)

Better way to skip media? Built in action perhaps?

## Assets

- [Icon (CC0)](https://www.svgrepo.com/svg/155032/sand-clock)
- [Remix Icon](https://remixicon.com/)
