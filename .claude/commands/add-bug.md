Add a new bug entry to `packages/bugs/api/[v].ts`.

The user will describe the bug and the affected version(s). Add the new entry at the top of the `bugs` array (after the opening bracket), following the existing format:

```ts
{
    title: '<short title>',
    description: '<description with upgrade instruction>',
    link: 'https://remotion.dev/changelog',
    versions: ['<affected versions>'],
},
```

Rules:
- The description should tell users which version to upgrade to.
- The link should be `https://remotion.dev/changelog` unless the user provides a specific link.
- Add the entry at the top of the array so the most recent bugs come first.
