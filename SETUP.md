# Put Interview Coach online for free

This takes about 15 minutes and costs nothing. You need a GitHub account and a Google account.

## Step 1: Get a free Gemini API key

1. Go to https://aistudio.google.com/apikey and sign in with your Google account.
2. Click **Create API key** and copy it somewhere safe.
3. **Don't turn on billing** for this Google project. Without billing, you stay on the free tier and can never be charged. If the free limit runs out, the app just says "try again later."

## Step 2: Put the site on GitHub Pages

1. On GitHub, click **New repository**. Name it `interview-coach`, set it to **Public**, and click **Create repository**.
2. Click **uploading an existing file**, then drag in `index.html`, `README.md`, `SETUP.md` and `worker.js`. Click **Commit changes**.
3. Go to the repo's **Settings → Pages**.
4. Under **Branch**, choose `main` and `/ (root)`, then click **Save**.
5. Wait about a minute and refresh. Your site's address appears at the top, like `https://yourname.github.io/interview-coach/`.

Open it in Chrome. Paste your API key in the box at the top, and you're ready. The microphone works here: Chrome will simply ask "Allow microphone?" the first time you press **Start speaking**.

**Never paste your API key into `index.html`.** The repo is public, so anyone could copy it.

At this point the site works, but every visitor needs to paste their own free key. That's fine for your demo video. For a public post, do Step 3 so visitors can use it with no key.

## Step 3 (recommended for public sharing): Hide your key with a free Cloudflare Worker

1. Sign up at https://dash.cloudflare.com (free plan).
2. Go to **Workers & Pages → Create → Create Worker**. Name it `interview-coach-api` and click **Deploy**.
3. Click **Edit code**, delete everything, paste the contents of `worker.js`, and click **Deploy**.
4. Go to the worker's **Settings → Variables and Secrets** and add:
   - `GEMINI_API_KEY` as a **Secret**, with your key from Step 1.
   - `ALLOWED_ORIGIN` as a **Variable** (plain text), with your site's origin, for example `https://yourname.github.io` (no path, no slash at the end).
5. Copy the worker's address, like `https://interview-coach-api.yourname.workers.dev`.
6. On GitHub, open `index.html`, click the pencil icon to edit, and find this line near the top of the script:

   ```js
   PROXY_URL: '',
   ```

   Put your worker's address between the quotes:

   ```js
   PROXY_URL: 'https://interview-coach-api.yourname.workers.dev',
   ```

7. Click **Commit changes**. After a minute, refresh your site. The API key box is gone, and anyone can practice.

## Good to know

- **Privacy:** on the free tier, Google may use what visitors send to improve its models, and people may review it. The site says this on the setup screen. Keep it there.
- **Limits:** the free tier has daily and per-minute limits. If many people use it at once, some will see "The free Gemini limit was reached." You'll never get a bill as long as billing stays off.
- **Saved data:** each visitor's answers and reports are saved only in their own browser.
- **Model names:** if Google retires `gemini-flash-latest`, change the two model names in `worker.js` (and in `index.html` if you're not using the worker) to a current free model listed in Google AI Studio.
- **Scoring:** Gemini may score differently from Claude. Rerun your calibration test on this version before quoting agreement numbers.
