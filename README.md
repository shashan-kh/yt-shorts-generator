# yt-shorts-generator

# Automated YouTube Shorts Generator with Remotion & GitHub Actions

This project runs a fully automated cloud video generation pipeline. By leaving a comment on any GitHub issue containing your script, GitHub Actions compiles your script into timed visual components, renders a vertical YouTube Short using **Remotion**, and comments the download preview link right back to your issue thread.

## Design & Editing Rules Applied
1. **Clear Hero Focus:** Optimized vertical layout (1080x1920 at 30 fps).
2. **Animated Text Sync:** Voiceover text segments are mapped automatically to frame timelines with bold uppercase typography.
3. **Motion Graphics:** Integrated vector icon containers and subtle animated gradients.
4. **YouTube Safe Zones:** All text and critical graphics remain positioned strictly inside safe margins away from bottom captions and right-side action buttons.
5. **Smooth Motion:** Smooth continuous scaling zoom without sudden jump cuts.

---

## Setup Guide

1. **Create Repository:** Push all project files into a new GitHub repository.
2. **Configure Node & Remotion:** Ensure `package.json` and workflow definitions match the provided setup.
3. **Trigger Video Generation:**
   - Open an issue in your repository.
   - Post a comment using the exact command format:
     ```text
     /create-short Stop scrolling right now. This automated pipeline creates viral YouTube shorts instantly using code and Remotion.
     ```
   - Watch the **Actions** tab build your video automatically. Once complete, the bot will post a comment with your direct preview link!
