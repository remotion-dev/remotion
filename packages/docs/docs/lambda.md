---
id: lambda
sidebar_label: Overview
title: "@remotion/lambda"
---

## How it works

## Architecture

## Setup

## Considerations

## Limitations

## Cost

## Chunk optimization

## Create user role

## AWS permissions

## CLI

## Node.JS API

## Known issues

- [ ] There is no cleanup on AWS, unnecessary files stay after the render
- [ ] Sometimes an error `Unable to spawn browser` is shown - you can ignore it
- [ ] Most CLI options known from Remotion are ignored
- [ ] Currently only MP4 files can be rendered
- [ ] AWS permissions are too loose and validation command sometimes breaks
- [ ] Chunk optimization currently works on a global scope and does not differentiate between S3 site deployments
- [ ] Costs are not calculated accurately (probably slightly higher than effective)
- [ ] Parallelism is not configurable

## License

- [Permissions](/docs/lambda-permissions)
