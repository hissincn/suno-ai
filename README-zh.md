# suno-ai

suno-ai 是一个 Node.js 库，用于与 Suno AI 音乐生成服务进行交互。它提供了一系列方法来生成歌曲、获取元数据、保存生成的歌曲等功能。

[English](README.md)

## 安装

```bash
npm install suno-ai
```

## 使用

1. 导入库并初始化 SunoAI 实例:

```javascript
const { SunoAI } = require('suno-ai');
const cookie = '你的 cookie';
const suno = new SunoAI(cookie);
await suno.init();
```

2. 生成歌曲:

```javascript
const payload = {
  gpt_description_prompt: '一首关于永远陪伴在你身边的蓝调歌曲',
  mv: 'chirp-v3-0',
  prompt: '',
  make_instrumental: false
};

const songInfo = await suno.generateSongs(payload);
```

3. 保存生成的歌曲:

```javascript
const outputDir = './output';
await suno.saveSongs(songInfo, outputDir);
```

4. 获取元数据:

```javascript
const ids = ['79742cdf-86c9-432f-81f2-8c2126de42d9', 'ae5ccb5-f4f8-49c9-8f5c-192e43ed9b0c'];
const songs = await suno.getMetadata(ids);
```

5. 获取所有生成的歌曲:

```javascript
const allSongs = await suno.getAllSongs();
```

6. 生成歌词:

```javascript
const lyrics = await suno.generateLyrics('hissin in the kitchen');
console.log(lyrics);
```

## API

### `SunoAI(cookie)`

- `cookie` (string): Suno AI 服务的 cookie。

### `init()`

初始化 SunoAI 实例。必须在使用其他方法之前调用。

### `generateSongs(payload)`

- `payload` (object): 生成歌曲的参数。
  - `gpt_description_prompt` (string): 使用 GPT 生成歌词的提示。
  - `prompt` (string): 自定义歌词。
  - `tags` (string): 音乐风格标签。
  - `make_instrumental` (boolean): 是否生成纯音乐(无歌词)。
  - `title` (string): 歌曲标题。
  - `mv` (string): 视频风格, 选项 ('chirp-v2-xxl-alpha')。
  - `continue_clip_id` (string): 继续生成歌曲的 ID。
  - `continue_at` (number): 从指定秒数继续生成。

返回生成的歌曲信息。

### `getRequestIds(payload)`

- `payload` (object): 同 `generateSongs` 方法。

返回请求 ID 列表。

### `getMetadata(ids = [])`

- `ids` (string[]): 歌曲 ID 列表。如果为空则返回所有歌曲。

返回指定歌曲的元数据。

### `getAllSongs()`

返回所有生成的歌曲元数据。

### `saveSongs(songInfo, outputDir)`

- `songInfo` (object): 歌曲信息对象。
- `outputDir` (string): 输出目录路径。

将生成的歌曲保存到指定目录。

### `generateLyrics(prompt)`

- `prompt` (string): 生成歌词的提示。

返回生成的歌词。

### `getLimitLeft()`

返回剩余的请求次数。

## 示例

下面是一个完整的示例，展示了如何使用 suno-ai 库生成和保存歌曲:

```javascript
const { SunoAI } = require('suno-ai');

async function main() {
  try {
    const cookie = '你的 cookie';
    const suno = new SunoAI(cookie);
    await suno.init();

    const payload = {
      gpt_description_prompt: '一首关于永远陪伴在你身边的蓝调歌曲',
      mv: 'chirp-v3-0',
      prompt: '',
      make_instrumental: false
    };

    const songInfo = await suno.generateSongs(payload);
    const outputDir = './output';
    await suno.saveSongs(songInfo, outputDir);

    const ids = ['79742cdf-86c9-432f-81f2-8c2126de42d9', 'ae5ccb5-f4f8-49c9-8f5c-192e43ed9b0c'];
    const songs = await suno.getMetadata(ids);

    const allSongs = await suno.getAllSongs();

    const lyrics = await suno.generateLyrics('hissin in the kitchen');
    console.log(lyrics);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## 注意事项

- 在使用任何其他方法之前，必须先调用 `init()` 方法初始化 SunoAI 实例。
- 请确保提供有效的 cookie，否则无法与 Suno AI 服务进行交互。
- 生成歌曲需要一些时间,请耐心等待。
- 本库仅用于学习和研究目的,请勿将生成的歌曲用于任何商业用途。

## 以下是一些常用的 payload 示例:

1. **使用 GPT 生成歌词并生成带歌词的歌曲**

```javascript
const payload = {
  gpt_description_prompt: "一首关于永远陪伴在你身边的蓝调歌曲",
  mv: "chirp-v3-0",
  prompt: "",
  make_instrumental: false
};
```

2. **生成纯音乐(无歌词)歌曲**

```javascript
const payload = {
  gpt_description_prompt: "一首关于跳舞的放克风格纯音乐",
  mv: "chirp-v3-0", 
  prompt: "",
  make_instrumental: true
};
```

3. **使用自定义歌词生成歌曲**

```javascript
const payload = {
  prompt: "第一行歌词\n第二行歌词\n第三行歌词",
  tags: "梦幻 儿童音乐",
  mv: "chirp-v3-0",
  title: "歌曲标题",
  make_instrumental: false,
  continue_clip_id: null,
  continue_at: null
};
```

4. **从指定位置继续生成歌曲**

```javascript
const payload = {
  prompt: "",
  tags: "未来爵士风",
  mv: "chirp-v3-0",
  title: "",
  continue_clip_id: "d55b5269-6bad-4f61-a8f5-871fb124044d",
  continue_at: 109
};
```

5. **remix 并继续生成歌曲**

```javascript
const payload = {
  prompt: "[Verse]\n行走在街头,无人侧目\n融入人群中,只是个陌生人 (oh-oh-oh)\n但我不愿混同化灰,我要绽放色彩\n要在这座城市里翱翔高飞\n\n[Verse 2]\n在潮流时尚的世界里,我格格不入\n但我为自己与众不同而自豪,无需道歉 (oh-oh-oh)\n我不会遵循游戏规则,我要自己走出一条路\n让我的灵魂自由飞翔\n\n[Chorus]\n嘿,世界,看看我 (看看我)\n你曾无视的我,现在正绽放光芒 (oh-oh-oh)\n我要跳着自己的舞步,唱着自己的歌曲 (大声唱)\n我不会在人群中太久就被遗忘 (遗忘)",
  tags: "电子嘻哈",
  mv: "chirp-v3-0", 
  title: "Lost in the Shuffle",
  continue_clip_id: "62ed33cb-f802-47d3-a233-9a7f3fc804a3",
  continue_at: 90.36
};
```

这些示例涵盖了使用 GPT 生成歌词、生成纯音乐、使用自定义歌词、从特定位置继续生成以及 remix 并继续生成等多种情况。您可以根据需求修改 payload 中的参数来满足不同的需求。