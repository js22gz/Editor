# Editor

A PWA file-editor. Single file, HTML, CSS, vanilla Javascript.

## Custom Domain: editor.uppslag.se

This site is deployed via GitHub Pages at **editor.uppslag.se**.

### How it works

The [`CNAME`](./CNAME) file in the repository root tells GitHub Pages to serve the site under the custom domain `editor.uppslag.se`.

### DNS configuration at HostUp

To complete the redirect you need to add the following DNS record in your HostUp control panel for the `uppslag.se` domain:

| Type  | Name   | Value              | TTL  |
|-------|--------|--------------------|------|
| CNAME | editor | js22gz.github.io   | 3600 |

**Steps:**

1. Log in to your HostUp account and open the DNS management page for `uppslag.se`.
2. Add a new **CNAME** record:
   - **Name / Host:** `editor`
   - **Points to / Value:** `js22gz.github.io`
   - **TTL:** 3600 (or the default offered by HostUp)
3. Save the record. DNS propagation typically takes a few minutes up to a few hours.
4. In your GitHub repository go to **Settings → Pages** and confirm that the *Custom domain* field shows `editor.uppslag.se`. GitHub will automatically provision a TLS certificate once the DNS record is verified.

Once propagation is complete, the app will be accessible at <https://editor.uppslag.se>.
