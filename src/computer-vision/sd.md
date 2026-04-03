---
title: Stable Diffusion 绘世整合包完整教程
order: 1
category:
  - AI绘图
---

# Stable Diffusion 绘世整合包完整教程

## 前言

本文使用软件为**绘世整合包**，为目前市面上几乎是最容易使用的整合包，跳过了绝大多数对网络、Python的前置知识要求，整合了过往几个月中AI绘画需求集中爆发的时期中最核心的需求如ControlNet插件，自带了最新的深度学习轮子，且能够完全和外部环境隔离开。

这让完全没有编程知识的人也能够从0开始学习使用Stable Diffusion，并且在几乎0调整的前提下就可以享受最新最核心的技术。

---

## Stable Diffusion（SD）是什么

Stable Diffusion是2022年发布的深度学习文本到图像生成模型，它是一种潜在扩散模型，由创业公司Stability AI与多个学术研究者和非营利组织合作开发。

### 核心特点

- **开源免费**：源代码和模型都已经开源
- **本地运行**：可以在电脑本地上离线运行
- **硬件要求**：推荐至少12GB显存的NVIDIA显卡
- **社区维护**：在Github上由AUTOMATIC1111维护，全世界的开发者共同维护

### 官方地址

**Stable Diffusion Github官方托管地址：**
https://github.com/Stability-AI/stablediffusion

---

## SD基本概念

### 1. 大模型
- 用素材+SD低模（如SD1.5/SD1.4/SD2.1），深度学习之后炼制出的大模型
- 可以直接用来生图
- **决定了最终出图的大方向**，可以说是一切的底料
- 文件格式：CKPT/SAFETENSORS扩展名

### 2. VAE
- 类似滤镜，是对大模型的补充
- 稳定画面的色彩范围
- 文件格式：CKPT/SAFETENSORS扩展名

### 3. LoRA
- 模型插件，基于某个大模型深度学习后炼制出的小模型
- 需要搭配大模型使用
- 可以在中小范围内影响出图的风格，或增加大模型所没有的东西
- 基于SD底模炼制时通用性更好
- 基于特定大模型炼制时可能有针对性的极佳效果

### 4. ControlNet
- **神级插件**，让SD有了眼睛
- 能够基于现有图片得到诸如线条或景深的信息
- 可以反推用于处理图片

### 5. Stable Diffusion Web-UI（SD-WEBUI）
- 由开源大神AUTOMATIC1111基于Stability AI算法制作
- 能够展开浏览器，用图形界面操控SD
- 绘世整合包内置了Python环境和Git，无需额外配置

---

## 一、下载 Stable Diffusion

### 百度网盘下载链接

**链接：** https://pan.baidu.com/s/1F03aAzep_I5qRyGLpV0RIw?pwd=5jwi  
**提取码：** 5jwi

---

## 二、安装 Stable Diffusion

### 第一步：安装启动器运行依赖

打开 `启动器运行依赖-dotnet-6.0.11.exe` 进行安装。

### 第二步：解压包本体

解压 `sd-webui-aki-v4.zip`

> ⚠️ **注意**：解压好启动器本体后，暂时不要启动，先一起把模型安装了。

### 第三步：导入核心数据

#### 1. 下载并导入推荐大模型

**下载位置：** "推荐大模型"文件夹

**存放目录：**
```
\sd-webui-aki-v4\models\Stable-diffusion
```

#### 2. 下载并导入ControlNet模型

**存放目录：**
```
\sd-webui-aki-v4\models\ControlNet
```

#### 3. 下载并导入推荐LoRA

**存放目录：**
```
sd-webui-aki-v4\extensions\sd-webui-additional-networks\models\lora
```

> 💡 **提示**：这些LoRA是为了方便取用改了名的，上手之后可以在【大量模型·LoRA】文件夹中寻找自己想要的LoRA。

---

## 三、使用教程

### 启动软件

#### 1. 打开启动器
在安装目录下找到 `A启动器.exe`，双击运行。

#### 2. 一键启动
点击右下角的"一键启动"按钮。

#### 3. 等待加载
让启动界面运行一会儿，等待自动加载。

#### 4. 自动打开浏览器
软件会自动在浏览器中打开新页面。

> ⚠️ **注意事项：**
> - 有时候会出现警告错误或缺少模块，但不会影响正常运行
> - 如果没有自动打开，可以手动在浏览器输入：`http://127.0.0.1:7860`

### 基础生图示例

**操作步骤：**
1. 在正向提示词输入框输入关键词，例如："一个美女"
2. 点击"生成"按钮
3. 等待AI生成图片

---

## 创作示例

### 示例一：敦煌风格人像

#### 正面提示词
```
(RAW photogr，best qualtiy), best qualtiy, The is very detailed, tmasterpiece, ultra – detailed, one-girl, (huge boob，cleavage), dynamic angle, best qualtiy, extremely detailed CG unity 8k wal, 电影灯光, Dunhuang style
```

#### 反面提示词
```
(nsfw:1.5),(Monotonous color:1.2),sketches, (worst quality:2), (low quality:2), (normal quality:2), lowres, normal quality, ((monochrome)), ((grayscale)), skin spots, acnes, skin blemishes, age spot, (outdoor:1.6), manboobs, backlight,(ugly:1.331), (duplicate:1.331), (morbid:1.21), (mutilated:1.21), (tranny:1.331), mutated hands, (poorly drawn hands:1.331), blurry, (bad anatomy:1.21), (bad proportions:1.331), extra limbs, (disfigured:1.331), (more than 2 nipples:1.331), (missing arms:1.331), (extra legs:1.331), (fused fingers:1.61051), (too many fingers:1.61051), (unclear eyes:1.331), bad hands, missing fingers,(Four fingers:1.331), (six fingers:1.331),(extra hand:1.331), (extra leg:1.4),extra digit, (Pseudo Niang:1.1),(Ladyboy:1.4) ,bad body,(Watermark:1.4) ,(An incoherent picture:1.2),(No logic:1.331),(Less hair:1.2),(A gloomy picture:1.1), NG_DeepNegative_V1_75T, glans, refraction, diffusion, diffraction, (worst quality, low quality:1.4), bad anatomy, low quality lowres, low quality lowres low polygon 3D game, low quality lowres monochrome sketch rough graffiti, low quality lowres very ugly fat obesity scar, low quality lowres chibi, low quality lowres poorly drawn bad anatomy, low quality lowres graffiti unbecoming colorfully, low quality lowres incoherent background, low quality lowres long body, low quality lowres duplicate comparison, low quality lowres sketch retro_artstyle doujinshi, low quality lowres sketch, low quality lowres text font ui error missing digit blurry, low quality lowres JPEG artifacts signature hazy bleary, low quality lowres monochrome parody meme, low quality lowres historical picture, low quality lowres disfigured mutated malformed twisted human body, low quality lowres futanari tranny, low quality lowres tentacle skeleton
```

---

### 示例二：局部重绘（图生图）

#### 使用3Guofeng3模型

**操作步骤：**

1. **选择模型**：左上角模型选择 `3Guofeng3_v32Light`
2. **选择图生图**：进入"图生图 – 局部重绘"
3. **涂抹区域**：用画笔涂抹要重绘的部分
4. **输入关键词**

#### 正向关键词
```
masterpiece,(best quality),official art, extremely detailed cg 8k wallpaper,detailed photo,breast,pussy,nude
```

#### 反向关键词
```
(worst quality, low quality:1.4), (fuze:1.4),(worst quality:1.1), (low quality:1.4:1.1),blur photo,low quality
```

#### 3Guofeng3模型下载

**C站模型主页：**  
https://civitai.com/models/10415/3-guofeng3

**百度网盘：**  
链接: https://pan.baidu.com/s/1Jzw3Bgic5gh802D-qFD-Kw?pwd=1vzh  
提取码: 1vzh

---

## 总结

这是 Stable Diffusion WebUI 2.0 离线版：

✅ **优点：**
- 没网也能用
- 整合包约10G，加上模型、LoRA、ControlNet后约70G
- 效果不错，大部分模型来自Civitai社区
- 可以进行各种创作

✅ **特点：**
- 完全本地运行，保护隐私
- 内置Python环境，无需额外配置
- 支持ControlNet等高级功能
- 可以使用社区训练好的各种模型

---

## 结语

**自己动手，丰衣足食。**

开始你的AI绘画创作之旅吧！