---
title: 微软Edge大声朗读功能API调用指南
category:
  - 语音技术
tag:
  - 语言合成
---

# 微软Edge大声朗读功能API调用指南

## 简介

微软Edge浏览器的大声朗读（Read Aloud）功能提供了高质量的文本转语音服务。本文档详细介绍如何通过API调用这项功能，实现程序化的文本转语音。

## 功能特点

- 支持多种语言和声音选项
- 高质量的语音合成
- 实时流式音频输出
- 免费使用（基于Edge浏览器服务）

## API端点

### 1. 获取可用语音列表

```
GET https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4
```

### 2. WebSocket连接进行语音合成

```
WSS wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4
```

## 调用流程

1. **建立WebSocket连接**
2. **发送音频格式配置**
3. **发送SSML文本请求**
4. **接收音频数据流**
5. **处理接收完成信号**

## 消息格式

### 音频格式配置消息

```
X-Timestamp:{timestamp}
Content-Type:application/json; charset=utf-8
Path:speech.config

{
    "context": {
        "synthesis": {
            "audio": {
                "metadataoptions": {
                    "sentenceBoundaryEnabled": "false",
                    "wordBoundaryEnabled": "true"
                },
                "outputFormat": "webm-24khz-16bit-mono-opus"
            }
        }
    }
}
```

### SSML文本请求

```
X-RequestId:{requestId}
Content-Type:application/ssml+xml
X-Timestamp:{timestamp}
Path:ssml

<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
    <voice name='Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)'>
        <prosody pitch='+0Hz' rate='+0%' volume='+0%'>
            Hello world
        </prosody>
    </voice>
</speak>
```

## Python实现示例

### 依赖安装

```bash
pip install websocket-client requests
```

### 完整Python代码

```python
import websocket
import json
import uuid
import threading
import time
from datetime import datetime
import re

class EdgeTTS:
    def __init__(self):
        self.base_url = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1"
        self.trusted_token = "6A5AA1D4EAFF4E9FB37E23D68491D6F4"
        self.audio_data = []
        self.request_id = str(uuid.uuid4()).replace("-", "")
        
    def get_voices_list(self):
        """获取可用的语音列表"""
        import requests
        url = f"https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list"
        params = {"trustedclienttoken": self.trusted_token}
        
        try:
            response = requests.get(url, params=params)
            return response.json()
        except Exception as e:
            print(f"获取语音列表失败: {e}")
            return None
    
    def create_audio_config_message(self, output_format="webm-24khz-16bit-mono-opus"):
        """创建音频配置消息"""
        timestamp = datetime.now().strftime("%a %b %d %Y %H:%M:%S GMT%z (中国标准时间)")
        
        config = {
            "context": {
                "synthesis": {
                    "audio": {
                        "metadataoptions": {
                            "sentenceBoundaryEnabled": "false",
                            "wordBoundaryEnabled": "false"
                        },
                        "outputFormat": output_format
                    }
                }
            }
        }
        
        message = f"X-Timestamp:{timestamp}\r\n"
        message += "Content-Type:application/json; charset=utf-8\r\n"
        message += "Path:speech.config\r\n\r\n"
        message += json.dumps(config, separators=(',', ':'))
        
        return message
    
    def create_ssml_message(self, text, voice_name, language="zh-CN"):
        """创建SSML消息"""
        timestamp = datetime.now().strftime("%a %b %d %Y %H:%M:%S GMT%z (中国标准时间)")
        
        ssml = f"<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='{language}'>"
        ssml += f"<voice name='{voice_name}'>"
        ssml += f"<prosody pitch='+0Hz' rate='+0%' volume='+0%'>{text}</prosody>"
        ssml += "</voice></speak>"
        
        message = f"X-RequestId:{self.request_id}\r\n"
        message += "Content-Type:application/ssml+xml\r\n"
        message += f"X-Timestamp:{timestamp}\r\n"
        message += "Path:ssml\r\n\r\n"
        message += ssml
        
        return message
    
    def on_message(self, ws, message):
        """处理WebSocket消息"""
        if isinstance(message, str):
            # 文本消息处理
            if "Path:turn.start" in message:
                print("开始合成...")
            elif "Path:turn.end" in message:
                print("合成完成")
                ws.close()
            elif "Path:response" in message:
                print("收到响应")
            else:
                print(f"未知消息: {message}")
        else:
            # 二进制音频数据处理
            if len(message) > 3 and message[0] == 0x00 and message[1] == 0x67 and message[2] == 0x58:
                # 空音频片段，表示结束
                pass
            else:
                # 提取音频数据
                binary_delim = "Path:audio\r\n"
                message_str = message.decode('utf-8', errors='ignore')
                if binary_delim in message_str:
                    index = message_str.find(binary_delim) + len(binary_delim)
                    audio_chunk = message[index:]
                    self.audio_data.extend(audio_chunk)
    
    def on_error(self, ws, error):
        """错误处理"""
        print(f"WebSocket错误: {error}")
    
    def on_close(self, ws, close_status_code, close_msg):
        """连接关闭处理"""
        print(f"WebSocket连接关闭，音频数据长度: {len(self.audio_data)} 字节")
    
    def on_open(self, ws):
        """连接打开处理"""
        print("WebSocket连接已建立")
    
    def text_to_speech(self, text, voice_name="Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)", 
                      language="zh-CN", output_file="output.webm"):
        """文本转语音主函数"""
        self.audio_data = []
        url = f"{self.base_url}?trustedclienttoken={self.trusted_token}"
        
        # 创建WebSocket连接
        ws = websocket.WebSocketApp(url,
                                  on_open=self.on_open,
                                  on_message=self.on_message,
                                  on_error=self.on_error,
                                  on_close=self.on_close)
        
        def send_messages():
            time.sleep(0.1)  # 等待连接建立
            
            # 发送音频配置
            audio_config = self.create_audio_config_message()
            ws.send(audio_config)
            
            # 发送SSML请求
            ssml_message = self.create_ssml_message(text, voice_name, language)
            ws.send(ssml_message)
        
        # 启动发送消息的线程
        threading.Thread(target=send_messages).start()
        
        # 运行WebSocket
        ws.run_forever()
        
        # 保存音频文件
        if self.audio_data:
            with open(output_file, 'wb') as f:
                f.write(bytes(self.audio_data))
            print(f"音频文件已保存为: {output_file}")
            return output_file
        else:
            print("未接收到音频数据")
            return None

# 使用示例
if __name__ == "__main__":
    tts = EdgeTTS()
    
    # 获取可用语音列表
    print("获取语音列表...")
    voices = tts.get_voices_list()
    if voices:
        print(f"可用语音数量: {len(voices)}")
        # 显示前5个中文语音
        chinese_voices = [v for v in voices if 'zh-CN' in v.get('Locale', '')][:5]
        for voice in chinese_voices:
            print(f"- {voice.get('ShortName', 'Unknown')}: {voice.get('FriendlyName', 'Unknown')}")
    
    print("\n开始语音合成...")
    # 进行语音合成
    result = tts.text_to_speech(
        text="你好，这是微软Edge的文本转语音功能测试。",
        voice_name="Microsoft Server Speech Text to Speech Voice (zh-CN, XiaoxiaoNeural)",
        language="zh-CN",
        output_file="test_output.webm"
    )
    
    if result:
        print(f"语音合成成功！文件保存为: {result}")
    else:
        print("语音合成失败")
```

### 简化使用示例

```python
# 快速使用示例
def quick_tts(text, output_file="output.webm"):
    tts = EdgeTTS()
    return tts.text_to_speech(text, output_file=output_file)

# 使用
quick_tts("Hello, this is a test message.", "hello.webm")
```

## 常见语音选项

| 语言 | 语音名称 | 性别 |
|------|---------|------|
| 中文(简体) | zh-CN-XiaoxiaoNeural | 女 |
| 中文(简体) | zh-CN-YunxiNeural | 男 |
| 英语(美国) | en-US-JennyNeural | 女 |
| 英语(美国) | en-US-GuyNeural | 男 |
| 日语 | ja-JP-NanamiNeural | 女 |

## 注意事项

1. **音频格式限制**: 目前只支持 `webm-24khz-16bit-mono-opus` 格式
2. **SSML限制**: 不支持完整的Azure语音服务SSML标签，如 `mstts:express-as` 等
3. **Token**: 当前使用的是硬编码token，实际使用中可能需要定期更新
4. **格式转换**: 如需其他音频格式，需要使用FFmpeg等工具进行转换

## 格式转换示例

使用FFmpeg将webm转换为mp3：

```bash
ffmpeg -i output.webm -acodec libmp3lame output.mp3
```

## 参考资料

https://blog.csdn.net/qq_41755979/article/details/125725807

## 结语

微软Edge的大声朗读功能提供了便捷的文本转语音服务，通过WebSocket接口可以实现实时的语音合成。虽然存在一些格式和功能限制，但对于大多数应用场景来说已经足够使用。