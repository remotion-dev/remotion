// contributorsData.ts
interface Contributor {
  id: number;
  name: string;
  username: string;
  avatarUrl: string;
  contributionType: string;
}

const contributorsData: Contributor[] = [
  {
    id: 1,
    name: "Sahil Bhardwaj",
    username: "evoxf1",
    avatarUrl: "https://github.com/evoxf1.png",
    contributionType: "Contribution of passing FFmpeg filter to change the pitch of the audio",
  },
  // Add more contributors here
];

export default contributorsData;
