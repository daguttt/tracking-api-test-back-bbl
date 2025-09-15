/*
These triggers prevent mutations to the checkpoints table at the database level.
You can manually attach these triggers to the checkpoints table using the following Cloudflare CLI (wrangler) command:

```bash
pnpm wrangler d1 execute prod-tracking-api --local --file=./src/modules/shipments/prevent-checkpoints-mutations.sql
# Note: Use the --local flag or --remote flag to specify the database you want to attach the triggers to.
```


📌 D1 Cloudflare Triggers Note:
The triggers need to be written on a SINGLE LINE: See https://github.com/cloudflare/workers-sdk/issues/4998#issuecomment-2051860036
*/
 

-- Block updates to checkpoints
CREATE TRIGGER prevent_checkpoint_update BEFORE UPDATE ON checkpoints BEGIN SELECT RAISE(ABORT, 'Updates to checkpoints are not allowed.'); END;

-- Block deletions of checkpoints
CREATE TRIGGER prevent_checkpoint_delete BEFORE DELETE ON checkpoints BEGIN SELECT RAISE(ABORT, 'Deletions of checkpoints are not allowed.'); END;