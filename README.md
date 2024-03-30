# suno-ai

suno-ai is a Node.js library for interacting with the Suno AI music generation service. It provides a set of methods for generating songs, retrieving metadata, saving generated songs, and more.

[简体中文](README-zh.md)

## Installation

```bash
npm install suno-ai
```

## Usage

1. Import the library and initialize the SunoAI instance:

```javascript
const { SunoAI } = require('suno-ai');
const cookie = 'your cookie';
const suno = new SunoAI(cookie);
await suno.init();
```

2. Generate songs:

```javascript
const payload = {
  gpt_description_prompt: 'a blues song about always being by your side',
  mv: 'chirp-v3-0',
  prompt: '',
  make_instrumental: false
};

const songInfo = await suno.generateSongs(payload);
```

3. Save generated songs:

```javascript
const outputDir = './output';
await suno.saveSongs(songInfo, outputDir);
```

4. Get metadata:

```javascript
const ids = ['79742cdf-86c9-432f-81f2-8c2126de42d9', 'ae5ccb5-f4f8-49c9-8f5c-192e43ed9b0c'];
const songs = await suno.getMetadata(ids);
```

5. Get all generated songs:

```javascript
const allSongs = await suno.getAllSongs();
```

6. Generate lyrics:

```javascript
const lyrics = await suno.generateLyrics('hissin in the kitchen');
console.log(lyrics);
```

## API

### `SunoAI(cookie)`

- `cookie` (string): The cookie for the Suno AI service.

### `init()`

Initializes the SunoAI instance. Must be called before using any other methods.

### `generateSongs(payload)`

- `payload` (object): Parameters for generating songs.
  - `gpt_description_prompt` (string): Prompt for generating lyrics with GPT.
  - `prompt` (string): Custom lyrics.
  - `tags` (string): Music genre tags.
  - `make_instrumental` (boolean): Whether to generate instrumental music (no lyrics).
  - `title` (string): Song title.
  - `mv` (string): Video style, options: ('chirp-v2-xxl-alpha').
  - `continue_clip_id` (string): ID for continuing song generation.
  - `continue_at` (number): Seconds to continue generation from.

Returns information about the generated songs.

### `getRequestIds(payload)`

- `payload` (object): Same as `generateSongs` method.

Returns a list of request IDs.

### `getMetadata(ids = [])`

- `ids` (string[]): List of song IDs. If empty, returns all songs.

Returns metadata for the specified songs.

### `getAllSongs()`

Returns metadata for all generated songs.

### `saveSongs(songInfo, outputDir)`

- `songInfo` (object): Song information object.
- `outputDir` (string): Output directory path.

Saves the generated songs to the specified directory.

### `generateLyrics(prompt)`

- `prompt` (string): Prompt for generating lyrics.

Returns the generated lyrics.

### `getLimitLeft()`

Returns the remaining request limit.

## Example

Here's a complete example demonstrating how to use the suno-ai library to generate and save songs:

```javascript
const { SunoAI } = require('suno-ai');

async function main() {
  try {
    const cookie = 'your cookie';
    const suno = new SunoAI(cookie);
    await suno.init();

    const payload = {
      gpt_description_prompt: 'a blues song about always being by your side',
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

## Notes

- You must call the `init()` method to initialize the SunoAI instance before using any other methods.
- Make sure to provide a valid cookie, otherwise you won't be able to interact with the Suno AI service.
- Generating songs takes some time, please be patient.
- This library is for learning and research purposes only. Please do not use the generated songs for any commercial purposes.

## Here are some common payload examples:

1. **Generate lyrics with GPT and generate a song with lyrics**

```javascript
const payload = {
  gpt_description_prompt: "a blues song about always being by your side",
  mv: "chirp-v3-0",
  prompt: "",
  make_instrumental: false
};
```

2. **Generate instrumental music (no lyrics)**

```javascript
const payload = {
  gpt_description_prompt: "a funky instrumental song about dancing",
  mv: "chirp-v3-0", 
  prompt: "",
  make_instrumental: true
};
```

3. **Generate a song with custom lyrics**

```javascript
const payload = {
  prompt: "First line of lyrics\nSecond line of lyrics\nThird line of lyrics",
  tags: "dreamy children's music",
  mv: "chirp-v3-0",
  title: "Song Title",
  make_instrumental: false,
  continue_clip_id: null,
  continue_at: null
};
```

4. **Continue generating a song from a specific point**

```javascript
const payload = {
  prompt: "",
  tags: "futuristic jazz",
  mv: "chirp-v3-0",
  title: "",
  continue_clip_id: "d55b5269-6bad-4f61-a8f5-871fb124044d",
  continue_at: 109
};
```

5. **Remix and continue generating a song**

```javascript
const payload = {
  prompt: "[Verse]\nWalking down the street, no one takes a glance\nBlending in the crowd, just another stranger (oh-oh-oh)\nBut I don't wanna fade into the gray, I wanna burst with color\nI wanna soar high in this city\n\n[Verse 2]\nIn the world of trends and fashion, I don't fit in\nBut I'm proud to be different, no need to apologize (oh-oh-oh)\nI won't follow the game's rules, I'll pave my own way\nLet my soul fly free\n\n[Chorus]\nHey world, look at me (look at me)\nThe one you once ignored, now shining bright (oh-oh-oh)\nI'll dance to my own beat, sing my own song (sing it loud)\nI won't be forgotten in the crowd for long (forgotten)",
  tags: "electronic hip hop",
  mv: "chirp-v3-0", 
  title: "Lost in the Shuffle",
  continue_clip_id: "62ed33cb-f802-47d3-a233-9a7f3fc804a3",
  continue_at: 90.36
};
```

These examples cover using GPT to generate lyrics, generating instrumental music, using custom lyrics, continuing generation from a specific point, and remixing and continuing generation. You can modify the parameters in the payload object to suit your needs.