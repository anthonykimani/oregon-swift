# Database migrations

Schema changes are managed with TypeORM migrations. `synchronize` is **off by
default** and must never be enabled in production. It can only be turned on by
setting `DB_SYNC=true` for a throwaway local database.

## Existing databases

Databases created before migrations existed were kept in sync automatically by
`synchronize: true` and already match the baseline schema. Record the baseline
as applied **once**, without re-running its SQL:

```bash
cd api
NODE_ENV=production npm run migration:run -- --fake
```

After that the database is migration-managed and future `migration:run` calls
apply only new migrations.

## Fresh databases

```bash
createdb oregon_courier
cd api
NODE_ENV=production npm run migration:run
```

The baseline migration creates the `uuid-ossp` extension and every table.

## Creating a new migration

1. Edit the entity under `api/service/models/`.
2. Generate a migration by diffing entities against the database:

   ```bash
   cd api
   NODE_ENV=development npm run migration:generate -- service/migrations/DescribeChange
   ```

3. Review the generated SQL (it is not applied yet).
4. Apply it with `npm run migration:run`.

`migration:revert` rolls back the most recently applied migration.

## Deployment order

1. Back up the database.
2. Run `NODE_ENV=production npm run migration:run`.
3. Deploy the application.

Because `synchronize` is disabled, the application never mutates the schema on
startup.
