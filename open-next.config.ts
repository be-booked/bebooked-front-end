import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
// TODO: Re-enable R2 incremental cache once the bucket is provisioned:
//   1. wrangler r2 bucket create bebooked-cache
//   2. Add r2_buckets binding to wrangler.jsonc (see commented block there)
//   3. Uncomment the import and incrementalCache line below
// See https://opennext.js.org/cloudflare/caching for details.

export default defineCloudflareConfig({
  // incrementalCache: r2IncrementalCache,
});
