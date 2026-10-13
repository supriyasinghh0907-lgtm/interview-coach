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
- **Stretch the allowance:** in `worker.js`, change the `default` model to `@cf/meta/llama-3.1-8b-instruct-fast`. Many more rounds fit in a day, but scoring is less careful.
- **Quality:** Llama models score differently from Claude and may quote your answer less exactly. The app shows "Quote not found" when that happens, which is the point of the evidence check. Rerun calibration mode on this version before quoting agreement numbers.
- **Microphone:** works normally on your own site. Chrome asks "Allow microphone?" the first time.
- **Saved data:** each visitor's answers stay in their own browser.
