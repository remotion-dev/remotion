# Documentation dependencies

`cube-presentation-1.0.2.tgz` contains the published
`@remotion-dev/cube-presentation` version 1.0.2 used by the Cube transition demo.
It includes the package's license and unchanged distribution files.

The archive keeps documentation builds independent of the Remotion Pro package
download endpoint. When updating it, replace the archive with the new published
package, update `packages/docs/package.json`, and run `bun install` at the
repository root to refresh `bun.lock`.
