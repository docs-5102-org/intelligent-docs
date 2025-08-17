---
title: 百度云语音合成指南
category:
  - 语音技术
tag:
  - 语音合成
---

# 百度云语音合成指南

## 目录

[[toc]]

## 概述

百度云提供免费的文字转语音（Text-to-Speech, TTS）服务，可以将文本内容转换为自然流畅的语音。本文档将介绍如何在网页中集成百度语音合成功能。

## 特点

- 🆓 完全免费使用
- 🌐 无需API密钥
- 🎵 支持多种语音参数调节
- 📱 跨平台兼容
- ⚡ 实时语音合成

## 基本用法

### HTML 结构

```html
<div>
    <!-- 语音播放功能 -->
    <div>
        <input type="text" id="ttsText" placeholder="请输入要转换的文字">
        <input type="button" id="tts_btn" onclick="myplay()" value="播放">
    </div>
    <div id="bdtts_div_id">
        <audio id="tts_autio_id">
            <source id="tts_source_id" src="http://tsn.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=9&text=" type="audio/mpeg">
            <embed id="tts_embed_id" height="0" width="0" src="">
        </audio>
    </div>
</div>
```

### JavaScript 实现

```javascript
function myplay(){
    var ttsDiv = document.getElementById('bdtts_div_id');
    var ttsAudio = document.getElementById('tts_autio_id');
    var ttsText = document.getElementById('ttsText').value;
    
    // 移除旧的音频元素
    ttsDiv.removeChild(ttsAudio);
    
    // 构建新的音频元素
    var au1 = '<audio id="tts_autio_id" autoplay="autoplay">';
    var sss = '<source id="tts_source_id" src="http://tsn.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=2&text='+ttsText+'" type="audio/mpeg">';
    var eee = '<embed id="tts_embed_id" height="0" width="0" src="">';
    var au2 = '</audio>';
    
    // 重新插入音频元素
    ttsDiv.innerHTML = au1 + sss + eee + au2;
    
    // 获取新的音频元素并播放
    ttsAudio = document.getElementById('tts_autio_id');
    ttsAudio.play();
}
```

## API 参数说明

百度语音合成使用以下URL格式：
```
http://tsn.baidu.com/text2audio?参数1=值1&参数2=值2...
```

### 主要参数

| 参数 | 说明 | 可选值 | 默认值 |
|------|------|--------|--------|
| `tex` | 要合成的文本内容 | 任意文本 | 无 |
| `lan` | 语言选择 | `zh`（中文）、`en`（英文） | `zh` |
| `ie` | 文本编码 | `UTF-8`、`GBK` | `UTF-8` |
| `spd` | 语速 | 0-15（数字越大语速越快） | 5 |
| `pit` | 音调 | 0-15（数字越大音调越高） | 5 |
| `vol` | 音量 | 0-9（数字越大音量越大） | 5 |
| `per` | 发音人选择 | 0-4（不同的音色） | 0 |
| `cuid` | 用户唯一标识 | 任意字符串 | 无 |
| `ctp` | 客户端类型 | 1 | 1 |
| `pdt` | 产品类型 | 1、301 | 1 |

### 发音人说明

| per值 | 发音人 | 特点 |
|-------|--------|------|
| 0 | 度小美 | 女声，甜美 |
| 1 | 度小宇 | 男声，磁性 |
| 3 | 度逍遥 | 男声，温暖 |
| 4 | 度丫丫 | 女童声，可爱 |

## 示例代码

### 基础示例
```javascript
// 简单的文字转语音
const text = "你好，欢迎使用百度语音合成服务";
const url = `http://tsn.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=5&text=${encodeURIComponent(text)}`;

const audio = new Audio(url);
audio.play();
```

### 高级示例
```javascript
function speakText(text, options = {}) {
    const defaultOptions = {
        lan: 'zh',      // 语言
        ie: 'UTF-8',    // 编码
        spd: 5,         // 语速
        pit: 5,         // 音调
        vol: 5,         // 音量
        per: 0          // 发音人
    };
    
    const config = Object.assign(defaultOptions, options);
    const params = new URLSearchParams(config);
    params.append('text', text);
    
    const url = `http://tsn.baidu.com/text2audio?${params.toString()}`;
    const audio = new Audio(url);
    
    return new Promise((resolve, reject) => {
        audio.onloadeddata = () => resolve(audio);
        audio.onerror = reject;
        audio.play();
    });
}

// 使用示例
speakText("这是一个测试", {
    spd: 3,  // 较慢语速
    per: 1   // 男声
});
```

## Vue.js 集成示例

```vue
<template>
  <div class="tts-component">
    <textarea v-model="inputText" placeholder="请输入要转换的文字"></textarea>
    <div class="controls">
      <select v-model="voice">
        <option value="0">度小美（女声）</option>
        <option value="1">度小宇（男声）</option>
        <option value="3">度逍遥（男声）</option>
        <option value="4">度丫丫（童声）</option>
      </select>
      <input type="range" v-model="speed" min="1" max="15" />
      <button @click="playTTS" :disabled="!inputText">播放</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inputText: '',
      voice: '0',
      speed: '5'
    }
  },
  methods: {
    playTTS() {
      if (!this.inputText.trim()) return;
      
      const url = `http://tsn.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=${this.speed}&per=${this.voice}&text=${encodeURIComponent(this.inputText)}`;
      const audio = new Audio(url);
      audio.play();
    }
  }
}
</script>
```

## 注意事项

### 使用限制
- **文本长度**：免费接口建议不超过512个中文字符，官方接口不超过1024字节（GBK编码后）
- **请求频率**：频繁请求可能被限制，建议合理控制调用频率
- **语言支持**：目前主要支持中英文混合模式
- **字符编码**：文本需要使用UTF-8编码，可使用`encodeURIComponent()`进行编码

### 跨域问题
由于浏览器同源策略，直接在前端调用可能遇到跨域问题。解决方案：

1. **服务端代理**（推荐）：
   ```javascript
   // 通过后端接口代理
   fetch('/api/proxy/tts', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ text: '你好世界', spd: 5 })
   });
   ```

2. **CORS配置**：需要服务端支持
3. **JSONP方式**：部分接口支持

### 错误处理

```javascript
function safePlayTTS(text, options = {}) {
    return new Promise((resolve, reject) => {
        const params = {
            lan: 'zh',
            ie: 'UTF-8',
            spd: 5,
            ...options,
            text: encodeURIComponent(text)
        };
        
        const url = `http://tsn.baidu.com/text2audio?${new URLSearchParams(params)}`;
        const audio = new Audio(url);
        
        // 超时处理
        const timeout = setTimeout(() => {
            reject(new Error('请求超时'));
        }, 10000);
        
        audio.onloadeddata = () => {
            clearTimeout(timeout);
            audio.play().then(resolve).catch(reject);
        };
        
        audio.onerror = (error) => {
            clearTimeout(timeout);
            console.error('语音合成失败:', error);
            reject(new Error('语音合成失败，请检查网络连接或文本内容'));
        };
        
        audio.onended = () => {
            resolve('播放完成');
        };
    });
}

// 使用示例
safePlayTTS('你好，世界！', { spd: 3, per: 1 })
    .then(result => console.log(result))
    .catch(error => console.error('播放失败:', error.message));
```

### 移动端兼容性

```javascript
// 移动端自动播放限制处理
function mobileCompatiblePlay(audioUrl) {
    const audio = new Audio(audioUrl);
    
    // 检测移动设备
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IE# 百度云语音合成使用指南

## 概述

百度云提供免费的文字转语音（Text-to-Speech, TTS）服务，可以将文本内容转换为自然流畅的语音。本文档将介绍如何在网页中集成百度语音合成功能。

## 特点

- 🆓 完全免费使用
- 🌐 无需API密钥
- 🎵 支持多种语音参数调节
- 📱 跨平台兼容
- ⚡ 实时语音合成

## 基本用法

### HTML 结构

```html
<div>
    <!-- 语音播放功能 -->
    <div>
        <input type="text" id="ttsText" placeholder="请输入要转换的文字">
        <input type="button" id="tts_btn" onclick="myplay()" value="播放">
    </div>
    <div id="bdtts_div_id">
        <audio id="tts_autio_id">
            <source id="tts_source_id" src="http://tsn.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=9&text=" type="audio/mpeg">
            <embed id="tts_embed_id" height="0" width="0" src="">
        </audio>
    </div>
</div>
```

### JavaScript 实现

```javascript
function myplay(){
    var ttsDiv = document.getElementById('bdtts_div_id');
    var ttsAudio = document.getElementById('tts_autio_id');
    var ttsText = document.getElementById('ttsText').value;
    
    // 移除旧的音频元素
    ttsDiv.removeChild(ttsAudio);
    
    // 构建新的音频元素
    var au1 = '<audio id="tts_autio_id" autoplay="autoplay">';
    var sss = '<source id="tts_source_id" src="http://tsn.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=2&text='+ttsText+'" type="audio/mpeg">';
    var eee = '<embed id="tts_embed_id" height="0" width="0" src="">';
    var au2 = '</audio>';
    
    // 重新插入音频元素
    ttsDiv.innerHTML = au1 + sss + eee + au2;
    
    // 获取新的音频元素并播放
    ttsAudio = document.getElementById('tts_autio_id');
    ttsAudio.play();
}
```

## API 接口版本对比

### 1. 旧版本接口（免费，无需认证）
```
http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=2&text=*****
```

**特点：**
- ✅ 完全免费，无需API Key
- ✅ 无需注册开发者账号
- ❌ 参数选项较少
- ❌ 稳定性相对较低

### 2. 新版本接口（当前推荐）
```
http://tsn.baidu.com/text2audio?参数1=值1&参数2=值2...
```

**特点：**
- ✅ 免费额度充足
- ✅ 参数丰富，功能完整
- ✅ 相对稳定
- ❌ 可能需要一些基本参数

### 3. 官方API接口（企业级）
```
https://tsn.baidu.com/text2audio?参数列表
```
> 📋 **官方文档：** https://ai.baidu.com/ai-doc/SPEECH/Qk38y8lrl

**特点：**
- ✅ 企业级稳定性
- ✅ 完整技术支持
- ✅ 丰富的定制选项
- ❌ 需要access_token认证

## API 参数说明

### 免费版本参数（推荐使用）

| 参数 | 说明 | 可选值 | 默认值 |
|------|------|--------|--------|
| `text` | 要合成的文本内容 | 任意文本（小于512个中文字符） | 无 |
| `lan` | 语言选择 | `zh`（中文）、`en`（英文） | `zh` |
| `ie` | 文本编码 | `UTF-8`、`GBK` | `UTF-8` |
| `spd` | 语速 | 0-9（数字越大语速越快） | 5 |
| `pit` | 音调 | 0-9（数字越大音调越高） | 5 |
| `vol` | 音量 | 0-15（数字越大音量越大） | 5 |
| `per` | 发音人选择 | 0-4（不同的音色） | 0 |

### 官方API完整参数

| 参数 | 说明 | 可选值 | 默认值 | 是否必需 |
|------|------|--------|--------|----------|
| `tex` | 合成的文本（UTF-8编码） | 小于512个中文字符 | 无 | ✅ |
| `tok` | 开发者access_token | 从开放平台获取 | 无 | ✅ |
| `cuid` | 用户唯一标识 | MAC地址或IMEI码等 | 无 | ✅ |
| `ctp` | 客户端类型 | Web端固定值1 | 1 | ✅ |
| `lan` | 语言选择 | 固定值`zh` | zh | ❌ |
| `spd` | 语速 | 0-9 | 5 | ❌ |
| `pit` | 音调 | 0-9 | 5 | ❌ |
| `vol` | 音量 | 0-15 | 5 | ❌ |
| `per` | 发音人选择 | 0,1,3,4 | 0 | ❌ |

### 发音人说明

| per值 | 发音人 | 性别 | 特点 |
|-------|--------|------|------|
| 0 | 度小美 | 女声 | 普通女声，甜美自然 |
| 1 | 度小宇 | 男声 | 普通男声，磁性沉稳 |
| 3 | 度逍遥 | 男声 | 情感合成，温暖亲和 |
| 4 | 度丫丫 | 女童声 | 情感合成，可爱活泼 |

## 官方API认证配置

### 获取Access Token

如果使用官方API，需要先获取access_token：

```javascript
// 获取百度API Access Token
async function getBaiduAccessToken() {
    const API_KEY = 'your_api_key';
    const SECRET_KEY = 'your_secret_key';
    
    const response = await fetch('https://openapi.baidu.com/oauth/2.0/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: API_KEY,
            client_secret: SECRET_KEY
        })
    });
    
    const data = await response.json();
    return data.access_token;
}
```

### 获取CUID（用户标识）

在Windows系统中获取MAC地址作为CUID：

```bash
# 在命令行中执行
ipconfig /all
```

找到"以太网 本地连接"的物理地址作为CUID。

### API Key配置获取

1. 访问 [百度AI开放平台](https://ai.baidu.com/)
2. 登录并进入控制台
3. 创建应用并开通语音合成服务
4. 获取以下信息：
   - App ID: ****
   - API Key: ****
   - Secret Key: ****

## 示例代码

### 基础示例
```javascript
// 简单的文字转语音
const text = "你好，欢迎使用百度语音合成服务";
const url = `http://tsn.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=5&text=${encodeURIComponent(text)}`;

const audio = new Audio(url);
audio.play();
```

### 高级示例
```javascript
function speakText(text, options = {}) {
    const defaultOptions = {
        lan: 'zh',      // 语言
        ie: 'UTF-8',    // 编码
        spd: 5,         // 语速
        pit: 5,         // 音调
        vol: 5,         // 音量
        per: 0          // 发音人
    };
    
    const config = Object.assign(defaultOptions, options);
    const params = new URLSearchParams(config);
    params.append('text', text);
    
    const url = `http://tsn.baidu.com/text2audio?${params.toString()}`;
    const audio = new Audio(url);
    
    return new Promise((resolve, reject) => {
        audio.onloadeddata = () => resolve(audio);
        audio.onerror = reject;
        audio.play();
    });
}

// 使用示例
speakText("这是一个测试", {
    spd: 3,  // 较慢语速
    per: 1   // 男声
});
```

## Vue.js 集成示例

### 基础版本（免费接口）

```vue
<template>
  <div class="tts-component">
    <div class="input-section">
      <textarea 
        v-model="inputText" 
        placeholder="请输入要转换的文字（最多512个字符）"
        maxlength="512"
      ></textarea>
      <div class="char-count">{{ inputText.length }}/512</div>
    </div>
    
    <div class="controls">
      <div class="control-group">
        <label>发音人：</label>
        <select v-model="voice">
          <option value="0">度小美（女声）</option>
          <option value="1">度小宇（男声）</option>
          <option value="3">度逍遥（男声）</option>
          <option value="4">度丫丫（童声）</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>语速：</label>
        <input 
          type="range" 
          v-model="speed" 
          min="0" 
          max="9" 
          step="1"
        />
        <span>{{ speed }}</span>
      </div>
      
      <div class="control-group">
        <label>音调：</label>
        <input 
          type="range" 
          v-model="pitch" 
          min="0" 
          max="9" 
          step="1"
        />
        <span>{{ pitch }}</span>
      </div>
      
      <div class="control-group">
        <label>音量：</label>
        <input 
          type="range" 
          v-model="volume" 
          min="0" 
          max="15" 
          step="1"
        />
        <span>{{ volume }}</span>
      </div>
      
      <div class="action-buttons">
        <button @click="playTTS" :disabled="!inputText.trim() || isPlaying">
          {{ isPlaying ? '播放中...' : '播放' }}
        </button>
        <button @click="stopTTS" :disabled="!isPlaying">停止</button>
      </div>
    </div>
    
    <div class="status" v-if="status">
      {{ status }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaiduTTS',
  data() {
    return {
      inputText: '',
      voice: '0',      // 发音人
      speed: '5',      // 语速
      pitch: '5',      // 音调
      volume: '5',     // 音量
      isPlaying: false,
      currentAudio: null,
      status: ''
    }
  },
  methods: {
    playTTS() {
      if (!this.inputText.trim()) {
        this.showStatus('请输入要合成的文字');
        return;
      }
      
      // 停止当前播放
      this.stopTTS();
      
      try {
        // 使用免费接口
        const encodedText = encodeURIComponent(this.inputText);
        const url = `http://tsn.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=${this.speed}&pit=${this.pitch}&vol=${this.volume}&per=${this.voice}&text=${encodedText}`;
        
        this.currentAudio = new Audio(url);
        this.isPlaying = true;
        this.showStatus('正在播放...');
        
        this.currentAudio.onloadeddata = () => {
          this.currentAudio.play();
        };
        
        this.currentAudio.onended = () => {
          this.isPlaying = false;
          this.showStatus('播放完成');
          this.currentAudio = null;
        };
        
        this.currentAudio.onerror = (error) => {
          this.isPlaying = false;
          this.showStatus('播放失败，请检查网络连接');
          console.error('TTS播放错误:', error);
          this.currentAudio = null;
        };
        
      } catch (error) {
        this.isPlaying = false;
        this.showStatus('创建音频失败');
        console.error('TTS创建错误:', error);
      }
    },
    
    stopTTS() {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      this.isPlaying = false;
      this.showStatus('');
    },
    
    showStatus(message) {
      this.status = message;
      if (message) {
        setTimeout(() => {
          this.status = '';
        }, 3000);
      }
    }
  },
  
  beforeDestroy() {
    this.stopTTS();
  }
}
</script>

<style scoped>
.tts-component {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: Arial, sans-serif;
}

.input-section {
  position: relative;
  margin-bottom: 20px;
}

.input-section textarea {
  width: 100%;
  height: 120px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
}

.char-count {
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-size: 12px;
  color: #999;
}

.controls {
  display: grid;
  gap: 15px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  min-width: 60px;
  font-weight: bold;
}

.control-group select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.control-group input[type="range"] {
  flex: 1;
  max-width: 200px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.action-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.action-buttons button:first-child {
  background-color: #007bff;
  color: white;
}

.action-buttons button:last-child {
  background-color: #dc3545;
  color: white;
}

.action-buttons button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.status {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-align: center;
  color: #666;
}
</style>
```

### 高级版本（支持多种接口）

```vue
<template>
  <div class="advanced-tts">
    <div class="api-selector">
      <label>选择接口：</label>
      <select v-model="apiType" @change="onApiTypeChange">
        <option value="free">免费接口（推荐）</option>
        <option value="old">旧版接口</option>
        <option value="official">官方接口</option>
      </select>
    </div>
    
    <!-- 官方接口配置 -->
    <div v-if="apiType === 'official'" class="api-config">
      <div class="config-item">
        <label>Access Token:</label>
        <input v-model="accessToken" placeholder="请输入access_token" />
      </div>
      <div class="config-item">
        <label>CUID:</label>
        <input v-model="cuid" placeholder="用户唯一标识" />
      </div>
    </div>
    
    <!-- 文本输入 -->
    <div class="text-input">
      <textarea v-model="text" placeholder="请输入要转换的文字"></textarea>
    </div>
    
    <!-- 参数控制 -->
    <div class="params-control">
      <div class="param-item">
        <label>发音人：</label>
        <select v-model="per">
          <option value="0">度小美（女声）</option>
          <option value="1">度小宇（男声）</option>
          <option value="3">度逍遥（男声）</option>
          <option value="4">度丫丫（童声）</option>
        </select>
      </div>
      <div class="param-item">
        <label>语速：</label>
        <input type="range" v-model="spd" min="0" max="9" />
        <span>{{ spd }}</span>
      </div>
    </div>
    
    <button @click="speak" :disabled="!text || loading">
      {{ loading ? '处理中...' : '开始播放' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'AdvancedBaiduTTS',
  data() {
    return {
      apiType: 'free',
      text: '',
      per: '0',
      spd: '5',
      accessToken: '',
      cuid: '',
      loading: false,
      currentAudio: null
    }
  },
  methods: {
    onApiTypeChange() {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
    },
    
    async speak() {
      if (!this.text.trim()) return;
      
      this.loading = true;
      
      try {
        let url = '';
        const encodedText = encodeURIComponent(this.text);
        
        switch (this.apiType) {
          case 'free':
            url = `http://tsn.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=${this.spd}&per=${this.per}&text=${encodedText}`;
            break;
            
          case 'old':
            url = `http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=${this.spd}&text=${encodedText}`;
            break;
            
          case 'official':
            if (!this.accessToken || !this.cuid) {
              alert('官方接口需要配置Access Token和CUID');
              this.loading = false;
              return;
            }
            url = `https://tsn.baidu.com/text2audio?tex=${encodedText}&tok=${this.accessToken}&cuid=${this.cuid}&ctp=1&lan=zh&spd=${this.spd}&per=${this.per}`;
            break;
        }
        
        this.currentAudio = new Audio(url);
        
        this.currentAudio.oncanplay = () => {
          this.currentAudio.play();
          this.loading = false;
        };
        
        this.currentAudio.onerror = () => {
          alert('播放失败，请检查参数配置和网络连接');
          this.loading = false;
        };
        
      } catch (error) {
        console.error('TTS错误:', error);
        this.loading = false;
      }
    }
  }
}
</script>
```

## 替代方案

当百度TTS服务不可用时，可以考虑以下替代方案：

### 1. WebSpeech API（浏览器原生）

```javascript
// 使用浏览器原生语音合成
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 1;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    } else {
        alert('您的浏览器不支持语音合成');
    }
}
```

### 2. WebSpeech 插件

**参考链接：** http://www.eguidedog.net/cn/WebSpeech_cn.php

WebSpeech插件提供跨浏览器的语音合成解决方案。

### 3. Speak.js 插件

**参考链接：** http://www.5imoban.net/jiaocheng/jquery/201712183090.html

Speak.js是一个轻量级的JavaScript语音合成库。

```html
<script src="speak.js"></script>
<script>
    speak('你好，世界！');
</script>
```

### 4. Java后台实现

**参考项目：** novel-mp
**技术文档：** https://blog.csdn.net/u010138825/article/details/49228015

可以在Java后台集成百度语音合成SDK，然后通过Web接口提供服务。

```java
// Java后台示例伪代码
@RestController
public class TTSController {
    
    @PostMapping("/api/tts")
    public ResponseEntity<byte[]> textToSpeech(@RequestBody TTSRequest request) {
        // 调用百度SDK进行语音合成
        byte[] audioData = baiduTTSService.synthesize(request.getText());
        return ResponseEntity.ok()
            .header("Content-Type", "audio/mpeg")
            .body(audioData);
    }
}
```

## 使用建议

### 接口选择建议

1. **日常开发测试**：推荐使用免费版本接口
2. **生产环境**：建议使用官方API接口，稳定性更好
3. **离线应用**：考虑使用WebSpeech API或其他本地方案
4. **企业应用**：建议后台集成SDK，前端调用内部接口

### 性能优化建议

1. **文本预处理**：
   - 去除特殊字符和标点符号
   - 控制文本长度（建议单次不超过200字）
   - 对长文本进行分段处理

2. **音频缓存**：
   ```javascript
   // 音频缓存示例
   const audioCache = new Map();
   
   function getCachedAudio(text, params) {
       const key = `${text}_${JSON.stringify(params)}`;
       if (audioCache.has(key)) {
           return audioCache.get(key);
       }
       
       const audio = new Audio(buildTTSUrl(text, params));
       audioCache.set(key, audio);
       return audio;
   }
   ```

3. **错误重试机制**：
   ```javascript
   async function playWithRetry(url, maxRetries = 3) {
       for (let i = 0; i < maxRetries; i++) {
           try {
               const audio = new Audio(url);
               await new Promise((resolve, reject) => {
                   audio.oncanplay = resolve;
                   audio.onerror = reject;
               });
               audio.play();
               return;
           } catch (error) {
               if (i === maxRetries - 1) throw error;
               await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
           }
       }
   }
   ```

## 最佳实践

1. **文本预处理**：去除特殊字符，确保文本格式正确
2. **错误处理**：添加音频加载失败的处理逻辑
3. **用户体验**：添加加载提示和播放状态显示
4. **性能优化**：避免频繁创建音频对象，考虑使用音频池
5. **移动端适配**：注意移动设备的自动播放限制

## 总结

百度云语音合成服务提供了简单易用的TTS功能，适合各种Web应用场景。通过合理配置参数和处理异常情况，可以为用户提供良好的语音交互体验。

---

**相关链接：**
- [百度云官方文档](https://cloud.baidu.com/)
- [Web Audio API 参考](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Speak.js](http://www.5imoban.net/jiaocheng/jquery/201712183090.html)