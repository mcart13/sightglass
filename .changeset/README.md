# Changesets

Sightglass uses Changesets to manage package versioning for the publishable packages in `packages/`.

Typical flow:

1. Add a changeset with `yarn changeset`.
2. Review the generated markdown note under `.changeset/`.
3. Apply versions with `yarn version:packages`.
4. Publish with `yarn release:packages` once registry credentials are configured.
