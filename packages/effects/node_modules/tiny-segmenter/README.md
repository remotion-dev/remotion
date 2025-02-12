tiny-segmenter
==============

Mirror of [TinySegmenter](http://chasen.org/~taku/software/TinySegmenter/), the super compact Japanese tokenizer in Javascript.

For publishing it as an npm package.

## Install

```shell
npm i tiny-segmenter --save
```

## Usage

```javascript
// sample code from http://chasen.org/~taku/software/TinySegmenter/
var segmenter = new TinySegmenter(); // インスタンス生成
var segs = segmenter.segment("私の名前は中野です"); // 単語の配列が返る
console.log(segs.join(" | ")); // 表示
```
