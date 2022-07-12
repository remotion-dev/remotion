compositions=($(npx remotion compositions src/index.tsx -q))


for composition in "${compositions[@]}"
do
  echo $composition
  npx remotion render src/index.tsx $composition $composition.mp4
done
