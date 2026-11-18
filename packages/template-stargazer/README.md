Your repo reached a stars milestone? Celebrate with a video of your stargazers!

## Example

https://user-images.githubusercontent.com/1911623/121809549-93342a80-cc33-11eb-88ff-e45f8b6dace4.mp4?width=200

## Authentication

This template displays stargazers' names and avatars. GitHub [restricts access to this data to repository admins and collaborators](https://docs.github.com/en/rest/activity/starring#new-access-restrictions), including for public repositories.

Set `REMOTION_GITHUB_TOKEN` to a token from an account with admin or collaborator access to the repository you want to feature in the video. Creating a token does not grant access to another repository's stargazers.

1. [Create a fine-grained personal access token](https://github.com/settings/personal-access-tokens/new).
2. Set the Resource owner to the user or organization that owns the repository you want to feature. Under Repository access, select that repository. This is the repository whose stars you want to show, which may be different from your copy of this template.
3. Keep the Metadata repository permission set to Read-only. If your organization requires token approval, have the token approved before rendering.

If you cannot select the target repository, check [GitHub's token limitations](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#fine-grained-personal-access-tokens-limitations), including those affecting outside collaborators.

Use the token locally or in GitHub Actions as described below.

## Make your own video (local)

1. [Use this repo as a template](https://github.com/pomber/stargazer/generate)

2. Follow the [authentication steps](#authentication), then create a `.env` file in the project root and add your token:

```
REMOTION_GITHUB_TOKEN=github_pat_...
```

Restart Remotion Studio after creating or updating `.env`.

3. Install dependencies:

```
npm i
```

4. Start the preview:

```
npm run dev
```

5. Open the right sidebar and replace the example `repoOrg` and `repoName` with the repository your token can access. Click "Render".

Or use the command line:

```
npx remotion render
```

## Make your own video (GitHub Actions)

1. Fork this repo and follow the [authentication steps](#authentication).
2. In your fork, go to Settings → Secrets and variables → Actions → New repository secret. Name the secret `REMOTION_GITHUB_TOKEN` and paste your token as its value.
3. Open the Actions tab and enable workflows if prompted.
4. Select Render video → Run workflow. Enter the owner and name of the repository your token can access, along with the star count and duration.
5. When the workflow finishes, download `out.mp4` from its artifacts.

The workflow uses your `REMOTION_GITHUB_TOKEN` secret. The automatic `GITHUB_TOKEN` [is scoped to the repository running the workflow](https://docs.github.com/en/actions/concepts/security/github_token), so it does not grant access to another repository's stargazer list.

## Troubleshooting authentication

### `REMOTION_GITHUB_TOKEN is missing`

For local renders, check that `.env` is in the project root and restart Remotion Studio. For GitHub Actions, add the `REMOTION_GITHUB_TOKEN` repository secret to the fork running the workflow.

### `401`, `403`, or `Resource not accessible by integration`

Check that the token has not expired, its account is an admin or collaborator of the target repository, and the target repository is included in the token's access. For organization repositories, check any required approval or SSO authorization. Confirm that `repoOrg` and `repoName` identify that repository.

If GitHub explicitly reports a rate limit, wait until the limit resets before retrying.

### No stargazers returned

Check whether the repository has stars. GitHub may also return an empty list when the token lacks access to its stargazers; follow the authentication checks above.

## Upgrade Remotion

```
npx remotion upgrade
```

## Credits

Made with [Remotion](https://www.remotion.dev/)

## License

The code in this repository: Licensed under MIT.  
The Remotion framework (a dependency of this project): Normally, companies need to obtain a paid license.  
However, creating videos of this template [is accepted](https://github.com/pomber/stargazer/issues/19#issuecomment-1868469783) without needing a company license.
