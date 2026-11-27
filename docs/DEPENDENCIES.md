# Dependency maintenance

`package.json` declares the project's direct dependencies and supported version ranges. `package-lock.json` records the exact resolved dependency tree used by development, CI, and production builds. Keep both files in sync and commit them together whenever a dependency changes.

The project pins npm 10.9.4 in `package.json` and CI. Use this version when creating or regenerating the lockfile; npm major versions can produce lockfile metadata that an older CI npm cannot install.

## Update policy

- Prefer the newest stable release that remains compatible with the project's current supported major version and related framework packages.
- Do not add prereleases, wildcard (`*`) ranges, or `latest` tags. Review major-version upgrades separately for breaking changes before adopting them.
- Keep coupled packages aligned: Next.js and `eslint-config-next`, React and React DOM, and Three.js and `@types/three`.
- Three.js and its types use a `0.x` version line; only update them together after confirming compatibility rather than treating a minor-number increase as automatically safe.
- Dependabot checks npm dependencies weekly and opens update pull requests for compatible patch and minor releases. Major upgrades are intentionally left for a reviewed migration.
- Do not merge dependency updates until the required `PR Checks / Validate` workflow passes.

## Installing and updating dependencies

For a clean checkout, install exactly what the lockfile records:

```sh
npm ci
```

To add a dependency, select a reviewed stable version compatible with this project and install it through npm so both manifests are updated:

```sh
npm install <package>@<compatible-version>
npm install --save-dev <development-package>@<compatible-version>
```

When updating an existing dependency, check available releases and the current range first:

```sh
npm outdated
npm view <package> dist-tags
```

Use an explicit stable version within the intended compatibility range. Update coupled packages together. Then verify the lockfile can be installed from scratch and run the complete local checks:

```sh
npm install <package>@<compatible-version>
npm ci
npm run lint
npm test
npm run typecheck
npm run build
```

Review and commit `package.json` and `package-lock.json` together. Never hand-edit lockfile versions, remove required lock entries to silence `npm ci`, or switch CI to a non-lockfile installation. The CI workflow uses `npm ci`, so a missing or inconsistent lockfile entry fails the required check.

## Security updates

Review `npm audit` findings and the upstream release notes before applying security updates. Prefer the narrowest compatible release; do not use `npm audit fix --force` as a shortcut because it may introduce breaking major upgrades. Update and validate the lockfile through the same review and CI process.
