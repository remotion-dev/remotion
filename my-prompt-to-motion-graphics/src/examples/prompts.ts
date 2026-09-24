export const examplePrompts = [
  {
    id: "text-typewriter",
    headline: "Typewriter text",
    icon: "Type",
    prompt: `Generate the text "Hello world" with world in yellow highlighting. Black text, white background. That words should be shown next to each other in the center of the screen.

Animation: Let the words fade in from left to right and then highlight "world" yellow. Mimic a typewriter effect for the text appearance with a blinking cursor at the end of the text.`,
    color: "#fdba74",
  },
  {
    id: "chat-bubbles",
    headline: "Chat messages",
    icon: "MessageCircle",
    prompt: `WhatsApp-style chat bubbles that appear one by one with a bouncy spring animation, alternating between sent and received messages.
Use green for sent messages and gray for received messages. Position them on left and right sides respectively.`,
    color: "#86efac",
  },
  {
    id: "counter",
    headline: "Metric counters",
    icon: "Hash",
    prompt: `Three animated number counters showing Users (10,000), Revenue ($50,000), and Growth (127%) that count up from zero with staggered timing.

Show all metrics at the same time, use this color #fde047. Focus on no overlaps and no flickering. Show the metrics in the center.`,
    color: "#fde047",
  },
  {
    id: "bar-chart",
    headline: "Bar chart",
    icon: "BarChart3",
    prompt: `An animated histogram with the gold price for the following data:
{
  "title": "Gold Price 2024",
  "unit": "USD per troy ounce",
  "data": [
    { "month": "Jan", "price": 2039 },
    { "month": "Feb", "price": 2024 },
    { "month": "Mar", "price": 2160 },
    { "month": "Apr", "price": 2330 },
    { "month": "May", "price": 2327 },
    { "month": "Jun", "price": 2339 },
    { "month": "Jul", "price": 2426 },
    { "month": "Aug", "price": 2503 },
    { "month": "Sep", "price": 2634 },
    { "month": "Oct", "price": 2735 },
    { "month": "Nov", "price": 2672 },
    { "month": "Dec", "price": 2650 }
  ]
}`,
    color: "#a5b4fc",
  },
  {
    id: "doge-dvd",
    headline: "Doge screensaver",
    icon: "Disc",
    prompt: `Create a DVD-Rom Style animation of this image https://i.pinimg.com/600x/ac/82/57/ac8257e1cfc4e63f5c63f3d4869eb7c4.jpg
The graphic moves smoothly across the screen in a straight line, bouncing off the edges of the screen whenever it hits a border. Each time it hits a corner or side, it changes direction, creating a continuous floating, ricocheting motion. The speed is steady, the movement is linear, and the object keeps rotating around the screen endlessly, just like the classic DVD logo screensaver.

Change the color on every bounce, no rotation, Make the animation speed fast.`,
    color: "#f9a8d4",
  },
] as const;

export type ExamplePrompt = (typeof examplePrompts)[number];
