---
id: lambda-setup
title: Lambda setup
slug: /lambda/setup
---

## 1. Install `@remotion/lambda`

Check the newest version number in the #lambda Discord channel

```
npm i @remotion/lambda@<version-number>
```

Also update **all the other Remotion packages** to have the same version. Make sure no package version number has a `^` character in front of it as it will install a different version.

## 2. Create role policy

- Go to AWS account IAM section
- Create a new policy
- Click on JSON
- Type in `npx remotion-lambda policies role` and copy it into the JSON field
- Go to tags, no tags are needed
- Give the policy the name `remotion-lambda-policy`!

## 3. Create a role

- Go to AWS account IAM section
- Create a new role
- Use case: Select `Lambda`
- Click next
- Attach permissions role: `remotion-lambda-policy`
- Permissions boundary: Skip it
- Tags: Skip it
- Role name: Name it `remotion-lambda-role` exactly!

## 4. Create an user

- Click `Create user`
- Select any username
- Programmatic access = YES
- Management console access = NO
- Click next
- Tags: Skip
- Click "Create user"
- Copy Access key ID and Secret Access Key
- Add a `.env` file to your project

```dotenv
AWS_ACCESS_KEY_ID=xxxxxx
AWS_SECRET_ACCESS_KEY=xxx

```

## 5. Add permissions to your user

- Click on your user
- Click "Add inline policy"
- Click JSON
- Enter in your terminal: `npx remotion-lambda policies user` and copy it in
- Give the policy a name, can be anything
- Click "Create policy"

## 6. Optional: Validate the permission setup

- Run `npx remotion-lambda policies validate`

## 7. Deploy a lambda

- Run `npx remotion-lambda functions deploy`

## 8. Deploy a website

- Run `npx remotion-lambda sites create src/index.tsx`

## 9. Render a video

- Run `npx remotion-lambda render <serve-url> <composition-name>`
