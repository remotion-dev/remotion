compositions=($(npx remotion compositions src/index.ts -q))


for composition in "${compositions[@]}"
do
  echo $composition
  npx remotion render src/index.ts $composition $composition.mp4
done
