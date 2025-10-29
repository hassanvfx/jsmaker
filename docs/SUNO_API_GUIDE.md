# 🎵 Complete Suno API Implementation Guide

**Last Updated:** 2025-10-28

This guide provides complete documentation for the Suno API implementation in SunoMaker, including all 21 endpoints organized by functionality.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication](#authentication)
3. [Music Generation APIs](#music-generation-apis)
4. [Lyrics APIs](#lyrics-apis)
5. [Audio Processing APIs](#audio-processing-apis)
6. [Music Video API](#music-video-api)
7. [Status/Details APIs](#statusdetails-apis)
8. [Error Handling](#error-handling)
9. [Testing Guide](#testing-guide)

---

## 🚀 Quick Start

### Installation

```bash
npm install axios
```

### Configuration

Add to your `.env` file:

```bash
VITE_SUNO_API_KEY=your_api_key_here
VITE_SUNO_MODEL_VERSION=V5
```

### Basic Usage

```typescript
import { sunoService } from './services/suno';

// Generate music from lyrics
const taskId = await sunoService.generateMusic({
  prompt: 'Your lyrics here',
  title: 'My Song',
  style: 'Regional Mexican corrido',
  customMode: true,
  instrumental: false
});

// Wait for completion
const result = await sunoService.pollUntilComplete(taskId);
console.log('Audio URL:', result.audioUrl);
```

---

## 🔐 Authentication

All API requests require a Bearer token:

```typescript
Authorization: Bearer YOUR_API_KEY
```

Get your API key from: https://sunoapi.org/api-key

---

## 🎵 Music Generation APIs (8 Endpoints)

### 1. Generate Music

Create music from text description.

**Endpoint:** `POST /api/v1/generate`

**Usage:**
```typescript
const taskId = await sunoService.generateMusic({
  prompt: 'Your lyrics here',
  title: 'Song Title',
  style: 'Genre description',
  customMode: true,
  instrumental: false,
  model: 'V5'
});
```

**Parameters:**
- `prompt` (string): Lyrics or description
- `title` (string, optional): Song title
- `style` (string, optional): Genre/style description
- `customMode` (boolean): true = custom mode, false = auto mode
- `instrumental` (boolean): true = no vocals
- `model` ('V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5'): AI model version
- `personaId` (string, optional): Apply specific persona
- `negativeTags` (string, optional): Styles to avoid
- `vocalGender` ('m' | 'f', optional): Preferred vocal gender
- `styleWeight` (number 0-1, optional): Style guidance weight
- `weirdnessConstraint` (number 0-1, optional): Creative deviation
- `audioWeight` (number 0-1, optional): Audio influence weight

**Returns:** Task ID (string)

---

### 2. Extend Music

Continue existing track from timestamp.

**Endpoint:** `POST /api/v1/extend`

**Usage:**
```typescript
const taskId = await sunoService.extendMusic({
  audioId: 'existing_audio_id',
  continueAt: 120, // seconds
  prompt: 'Additional lyrics',
  style: 'Same style',
  title: 'Extended Song'
});
```

**Parameters:**
- `audioId` (string, required): ID of audio to extend
- `continueAt` (number, required): Timestamp in seconds
- `prompt` (string, optional): Continuation lyrics
- `style` (string, optional): Style for extension
- `title` (string, optional): Extended song title
- `customMode` (boolean): Custom mode flag
- `instrumental` (boolean): Instrumental flag
- `model` (SunoModel): AI model version

**Returns:** Task ID (string)

---

### 3. Upload and Cover Audio (REMIX MODE!)

**This is the correct endpoint for remixing with reference audio!**

**Endpoint:** `POST /api/v1/generate/upload-cover`

**Usage:**
```typescript
const taskId = await sunoService.uploadAndCover({
  uploadUrl: 'http://localhost:8888/reference.mp3',
  prompt: 'New lyrics',
  title: 'Cover Version',
  style: 'Regional Mexican',
  customMode: true,
  instrumental: false
});
```

**Parameters:**
- `uploadUrl` (string, required): URL to reference audio file
- `prompt` (string, optional): Lyrics for cover
- `title` (string, optional): Cover title
- `style` (string, optional): Style description
- `customMode` (boolean): Custom mode flag
- `instrumental` (boolean): Instrumental flag
- `model` (SunoModel): AI model version

**Returns:** Task ID (string)

**Important Notes:**
- Reference audio must be accessible via HTTP/HTTPS
- Maximum audio length: 8 minutes
- Audio will be analyzed for style/structure

---

### 4. Upload and Extend Audio

Upload file and extend it.

**Endpoint:** `POST /api/v1/generate/upload-extend`

**Usage:**
```typescript
const taskId = await sunoService.uploadAndExtend({
  uploadUrl: 'http://example.com/audio.mp3',
  continueAt: 60,
  prompt: 'Extended lyrics'
});
```

---

### 5. Add Instrumental

Generate instrumental for vocals.

**Endpoint:** `POST /api/v1/generate/add-instrumental`

**Usage:**
```typescript
const taskId = await sunoService.addInstrumental({
  audioId: 'vocal_track_id',
  style: 'Regional Mexican',
  title: 'With Instrumental'
});
```

---

### 6. Add Vocals

Generate vocals for instrumental.

**Endpoint:** `POST /api/v1/generate/add-vocals`

**Usage:**
```typescript
const taskId = await sunoService.addVocals({
  audioId: 'instrumental_id',
  prompt: 'Vocal lyrics',
  vocalGender: 'm'
});
```

---

### 7. Cover Music

Generate music cover from existing audio ID.

**Endpoint:** `POST /api/v1/cover`

**Usage:**
```typescript
const taskId = await sunoService.coverMusic({
  audioId: 'original_song_id',
  prompt: 'New arrangement',
  style: 'Different genre'
});
```

---

### 8. Boost Music Style

Enhance music style characteristics.

**Endpoint:** `POST /api/v1/boost-music-style`

**Usage:**
```typescript
const taskId = await sunoService.boostMusicStyle({
  audioId: 'song_id',
  model: 'V5'
});
```

---

## ✍️ Lyrics APIs (2 Endpoints)

### 1. Generate Lyrics

Create AI-powered lyrics from prompt.

**Endpoint:** `POST /api/v1/generate/lyrics`

**Usage:**
```typescript
const taskId = await sunoService.generateLyrics({
  prompt: 'A corrido about a hero from Sinaloa'
});

const lyrics = await sunoService.pollLyricsUntilComplete(taskId);
console.log(lyrics.text);
```

---

### 2. Get Timestamped Lyrics

Retrieve synced lyrics with timestamps.

**Endpoint:** `POST /api/v1/lyrics/timestamped`

**Usage:**
```typescript
const timestamped = await sunoService.getTimestampedLyrics({
  audioId: 'song_id'
});

timestamped.lyrics.forEach(line => {
  console.log(`${line.start}s - ${line.end}s: ${line.text}`);
});
```

---

## 🔊 Audio Processing APIs (3 Endpoints)

### 1. Separate Vocals

Extract vocals and instrumental tracks separately.

**Endpoint:** `POST /api/v1/separate-vocals`

**Usage:**
```typescript
const taskId = await sunoService.separateVocals({
  audioUrl: 'http://example.com/song.mp3',
  model: 'default'
});

const result = await sunoService.pollVocalSeparationUntilComplete(taskId);
console.log('Vocals:', result.vocalUrl);
console.log('Instrumental:', result.instrumentalUrl);
```

---

### 2. Convert to WAV

Convert audio to high-quality WAV format.

**Endpoint:** `POST /api/v1/convert-wav`

**Usage:**
```typescript
const taskId = await sunoService.convertToWav({
  audioId: 'song_id'
});

const result = await sunoService.pollWavUntilComplete(taskId);
console.log('WAV URL:', result.wavUrl);
```

---

### 3. Generate Persona

Create music persona from audio for reuse.

**Endpoint:** `POST /api/v1/generate/persona`

**Usage:**
```typescript
const persona = await sunoService.generatePersona({
  audioId: 'reference_song_id'
});

// Use persona in future generations
const taskId = await sunoService.generateMusic({
  prompt: 'New song',
  personaId: persona.personaId
});
```

---

## 🎬 Music Video API (1 Endpoint)

### Create Music Video

Generate visual music video from audio.

**Endpoint:** `POST /api/v1/create-music-video`

**Usage:**
```typescript
const taskId = await sunoService.createMusicVideo({
  audioId: 'song_id',
  imageUrl: 'http://example.com/cover.jpg', // optional
  videoPrompt: 'Vibrant Mexican landscapes' // optional
});

const video = await sunoService.pollVideoUntilComplete(taskId);
console.log('Video URL:', video.videoUrl);
```

---

## 📊 Status/Details APIs (7 Endpoints)

### 1. Get Music Generation Details

Check generation status and retrieve results.

**Endpoint:** `GET /api/v1/details?taskId=xxx`

**Usage:**
```typescript
const details = await sunoService.getMusicDetails(taskId);
console.log('Status:', details.status);
console.log('Audio URL:', details.audioUrl);
```

**Response Fields:**
- `id`: Task ID
- `status`: 'pending' | 'processing' | 'complete' | 'error'
- `audioUrl`: Download URL (when complete)
- `title`: Song title
- `lyric`: Lyrics used
- `duration`: Track length in seconds
- `modelName`: Model version used

---

### 2. Get Lyrics Generation Details

**Endpoint:** `GET /api/v1/lyrics/details?taskId=xxx`

---

### 3. Get WAV Conversion Details

**Endpoint:** `GET /api/v1/wav/details?taskId=xxx`

---

### 4. Get Vocal Separation Details

**Endpoint:** `GET /api/v1/vocal-separation/details?taskId=xxx`

---

### 5. Get Music Video Details

**Endpoint:** `GET /api/v1/music-video/details?taskId=xxx`

---

### 6. Get Cover Details

**Endpoint:** `GET /api/v1/cover/details?taskId=xxx`

---

### 7. Get Remaining Credits

Check account credit balance.

**Endpoint:** `GET /api/v1/credits`

**Usage:**
```typescript
const credits = await sunoService.getRemainingCredits();
console.log('Remaining:', credits.credits);
```

---

## ⚠️ Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Invalid parameters
- `401` - Unauthorized (bad API key)
- `404` - Invalid endpoint
- `405` - Rate limit exceeded
- `413` - Prompt/theme too long
- `429` - Insufficient credits
- `430` - Call frequency too high
- `455` - System maintenance
- `500` - Server error

### Error Response Format

```typescript
{
  code: 400,
  msg: "Invalid parameters",
  data: null
}
```

### Handling Errors

```typescript
try {
  const taskId = await sunoService.generateMusic({...});
  const result = await sunoService.pollUntilComplete(taskId);
} catch (error) {
  if (error.response) {
    console.error('API Error:', error.response.data.msg);
    console.error('Status Code:', error.response.data.code);
  } else {
    console.error('Network Error:', error.message);
  }
}
```

---

## 🧪 Testing Guide

### Test with curl

```bash
# Generate music
curl -X POST https://api.sunoapi.org/api/v1/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customMode": true,
    "instrumental": false,
    "model": "V5",
    "prompt": "Your lyrics here",
    "style": "Regional Mexican corrido",
    "title": "Test Song",
    "callBackUrl": "https://example.com/callback"
  }'

# Get status
curl -X GET "https://api.sunoapi.org/api/v1/details?taskId=TASK_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Test Remix Mode

```bash
# Start local audio server
cd ~/path/to/audio/files
python3 -m http.server 8888

# Then use in your app
const taskId = await sunoService.uploadAndCover({
  uploadUrl: 'http://localhost:8888/reference.mp3',
  prompt: 'New lyrics',
  title: 'Remix',
  customMode: true
});
```

---

## 📝 Best Practices

1. **Always use polling** - Don't rely on callbacks alone
2. **Handle timeouts** - Default is 5 minutes (60 attempts × 5s)
3. **Check credits** - Call `getRemainingCredits()` before generation
4. **Use appropriate models**:
   - V5: Best quality, fastest
   - V4_5PLUS: Longest tracks (8 min)
   - V4: Good balance
   - V3_5: Basic but reliable
5. **Custom mode** - Set `customMode: true` for precise control
6. **Reference audio** - Must be accessible via HTTP/HTTPS
7. **Error handling** - Always wrap API calls in try-catch

---

## 🔗 Resources

- **Official Docs**: https://docs.sunoapi.org/
- **API Key Management**: https://sunoapi.org/api-key
- **Support**: support@sunoapi.org

---

## 🎯 SunoMaker-Specific Usage

### Generate Corrido (Custom Mode)

```typescript
const taskId = await sunoService.generateMusic({
  prompt: enhancedLyrics, // From GPT enhancement
  title: project.name,
  style: 'Regional Mexican corrido',
  customMode: true,
  instrumental: false,
  model: 'V5'
});
```

### Remix with Reference Audio

```typescript
const taskId = await sunoService.uploadAndCover({
  uploadUrl: referenceAudioUrl, // From StyleSelector
  prompt: enhancedLyrics,
  title: project.name,
  style: 'Regional Mexican corrido',
  customMode: true,
  instrumental: false
});
```

---

**End of Documentation** 🎉
