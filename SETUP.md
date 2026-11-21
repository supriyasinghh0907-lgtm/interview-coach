# Put Interview Coach online for free (Cloudflare)
 
Visitors use the app directly: no API key, no account, no sign-up. It runs on Cloudflare Workers AI's free daily allowance, so it costs nothing. Takes about 15 minutes.
 
## Part 1: Put the site on GitHub Pages
 
1. Upload `index.html`, `worker.js`, `SETUP.md` and `README.md` to your public GitHub repo (**Add file → Upload files → Commit changes**).
2. Go to **Settings → Pages**, set **Branch** to `main` and `/ (root)`, and click **Save**.
3. After a minute or two, your site is at `https://YOURNAME.github.io/interview-coach/`.
## Part 2: Create the free Cloudflare worker
 
1. Sign up at https://dash.cloudflare.com. Choose the **Free** plan and **don't add a payment method**.
2. In the left menu, go to **Workers & Pages** (under Compute), then click **Create** → **Create Worker** (or **Start with Hello World**).
3. Name it `interview-coach-api` and click **Deploy**.
4. Click **Edit code**. Delete all the code, paste the whole contents of `worker.js`, and click **Deploy**.
## Part 3: Connect Workers AI to the worker
 
1. Go back to the worker's page and open **Settings**.
2. Under **Bindings**, click **Add** → **Workers AI**.
3. Set **Variable name** to `AI` (capital letters) and click **Add Binding** / **Deploy**.
4. Under **Variables and Secrets**, click **Add**:
   - Type: **Text**
   - Name: `ALLOWED_ORIGIN`
   - Value: `https://YOURNAME.github.io` (no `/interview-coach`, no slash at the end)
   Click **Deploy**.
5. At the top of the worker page, copy its address, like `https://interview-coach-api.YOURNAME.workers.dev`.
## Part 4: Point the site at the worker
 
1. On GitHub, open `index.html` and click the pencil icon.
2. Press **Cmd + F** (Mac) or **Ctrl + F** and search for `PROXY_URL: ''`.
3. Paste your worker address between the quotes:
```js
PROXY_URL: 'https://interview-coach-api.YOURNAME.workers.dev',
```
 
4. Click **Commit changes** twice.
5. Wait a minute, open your site, and press **Cmd + Shift + R**. The API key box is gone. Click **try a sample interview** to test it.
## Good to know
 
- **Free daily allowance:** Workers AI gives every account a daily free allowance, shared by all your visitors. When it runs out, visitors see "Today's free practice limit was reached, come back tomorrow." On the Free plan with no payment method, you can't be charged.
- **How many interviews per day:** each practice round uses about four AI calls. The large model uses more of the allowance than the small one, so expect a limited number of full rounds per day across everyone. Check usage under **AI → Workers AI** in the Cloudflare dashboard.
- **Stretch the allowance:** in `worker.js`, change the `quick` model (follow-up questions) to `@cf/meta/llama-3.1-8b-instruct-fast`. More rounds fit in a day, but in testing the small model wrote confusing follow-ups, so both use the larger model by default.
- **Quality:** Llama models score differently from Claude and may quote your answer less exactly. The app shows "Quote not found" when that happens, which is the point of the evidence check. Rerun calibration mode on this version before quoting agreement numbers.
- **Microphone:** works normally on your own site. Chrome asks "Allow microphone?" the first time.
- **Saved data:** each visitor's answers stay in their own browser.
## Part 5 (optional, recommended): Turn on anonymous analytics
 
This lets you see your north star (users who improved) and other usage numbers on a private page. Only event names and daily counts are stored, never resumes or answers.
 
1. In Cloudflare, open **Storage & databases → KV** (it may be under **Workers & Pages → KV**) and click **Create** (or **Create a namespace**). Name it `interview-coach-stats`.
2. Open your worker, `interview-coach-api` → **Settings → Bindings → Add → KV namespace**.
   - Variable name: `STATS`
   - KV namespace: `interview-coach-stats`
   - Click **Add binding** / **Deploy**.
3. In **Settings → Variables and Secrets → Add**:
   - Type: **Secret**
   - Name: `STATS_KEY`
   - Value: any password you choose, like `mystats2026`
   - Click **Deploy**.
4. Make sure the worker code is the latest `worker.js` (Edit code → paste → Deploy).
5. Open your stats page (bookmark it, and don't share it):
   `https://interview-coach-api.YOURNAME.workers.dev/stats?key=YOUR_STATS_KEY`
What it shows for the last 7 days: users who improved (north star), visitors, activation, completion, return rate, learning actions, and guardrails (scoring failures, disputes, realistic-question ratings), plus a day-by-day table.
 
Good to know: the free KV plan allows about 1,000 writes a day, and each event is one write. If that runs out, the app keeps working; only counting pauses until the next day. Counts are approximate when many people use the site at the same moment.
 
