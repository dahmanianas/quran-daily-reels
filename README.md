# Card-free deployment: GitHub Pages + GitHub Actions

This is the no-credit-card alternative to Cloudflare R2. A **public** GitHub repository hosts the 602 provided Quran videos through GitHub Pages (188 MB total; GitHub Pages allows sites up to 1 GB). A daily GitHub Action uses Instagram's official API and records a page only after Instagram confirms it.

This means the source videos will be publicly accessible, which matches the intended public Instagram publishing. Do not use this design if that is unacceptable.

## Free-tier reality

- GitHub Pages public sites have a recommended/source limit of 1 GB and a soft 100 GB/month bandwidth limit. This collection is 188 MB.
- Standard GitHub Actions runners are free in a public repository. The workflow commits updated progress after each successful Reel, which keeps the repository active; GitHub can disable scheduled workflows in public repositories after 60 days without activity.
- There is no card or subscription requirement for this design. Limits can change, so this cannot honestly be guaranteed forever.

## Setup the agent will perform

1. Create a public repository named `quran-daily-reels`.
2. Extract and upload the 602 videos to `videos/`, then enable GitHub Pages from the `main` branch.
3. Set the GitHub Actions variable `VIDEO_BASE_URL` to the resulting Pages URL.
4. Add `IG_USER_ID` and `IG_ACCESS_TOKEN` as GitHub Action secrets.
5. Enable the scheduled workflow. It runs at 08:05 Europe/Berlin; adjust `.github/workflows/publish.yml` to change the time.

## Meta requirement

Your Creator account is compatible with Meta's current Instagram Login publishing API. We still need to create a personal Meta developer app and obtain a long-lived Instagram token with only `instagram_business_basic` and `instagram_business_content_publishing`. The token is held only as a GitHub Actions secret. It eventually expires; that is the unavoidable maintenance item in an official API solution.
