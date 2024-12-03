Your repo reached a stars milestone? Celebrate with a video of your stargazers!

## Example

https://user-images.githubusercontent.com/1911623/121809549-93342a80-cc33-11eb-88ff-e45f8b6dace4.mp4?width=200

## There are 2 ways to make your Stargazer video.

1. Make your Video locally
2. Make your Video using Github Actions (Easy)

## Make your own video (local)

1. [Use this repo as a template](https://github.com/pomber/stargazer/generate)

2. Go to https://github.com/settings/personal-access-tokens/new and create a token with default settings. Create a `.env` file and add it:

```
REMOTION_GITHUB_TOKEN=github_pat_...
```

3. Install dependencies:

```
npm i
```

4. Start the preview:

```
npm run dev
```

5. Open the right sidebar, enter your repo name and click "Render".  
   Or use the command line:

```
npx remotion render
```

## Make your own video (GitHub Actions)

1. Fork this repo
   <img src="https://user-images.githubusercontent.com/1911623/121809008-75fe5c80-cc31-11eb-8f44-5df6183deca5.png" width="720"/>

2. Go to Actions of the forked repo.
   <img src="https://user-images.githubusercontent.com/1911623/121809050-ae059f80-cc31-11eb-9af9-2aa05a24bc7f.png" width="720"/>

3. Click on `I understand my workforce, go ahead and enable them `
   <img src="https://user-images.githubusercontent.com/1911623/121809098-e1482e80-cc31-11eb-9ffc-e4d34f419fb1.png" width="720"/>

4. Go to the render video option in the workforce.
   <img src="https://user-images.githubusercontent.com/1911623/121809174-1e142580-cc32-11eb-84cc-c5aa19698fc1.png" width="720"/>

5. Over here enter the details of the repo for which you want to make the Stargazer video.
   <img src="https://user-images.githubusercontent.com/1911623/121809216-54ea3b80-cc32-11eb-8b22-7d74306adb9e.png" width="720"/>

6. Here you can see the progress of the rendering video.
   <img src="https://user-images.githubusercontent.com/1911623/121809344-cf1ac000-cc32-11eb-93c3-cc6e58ff7988.png" width="720"/>

7. By clicking on this you can get your Stargazer video.
   <img src="https://user-images.githubusercontent.com/1911623/121809394-fb364100-cc32-11eb-8a82-e9a6d25f37cf.png" width="720"/>

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
