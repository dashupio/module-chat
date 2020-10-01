Dashup Module Chat
&middot;
[![Latest Github release](https://img.shields.io/github/release/dashup/module-chat.svg)](https://github.com/dashup/module-chat/releases/latest)
=====

A connect interface for chat on [dashup](https://dashup.io).

## Contents
* [Get Started](#get-started)
* [Connect interface](#connect)

## Get Started

This chat connector adds chats functionality to Dashup chats:

```json
{
  "url" : "https://dashup.io",
  "key" : "[dashup module key here]"
}
```

To start the connection to dashup:

`npm run start`

## Deployment

1. `docker build -t dashup/module-chat .`
2. `docker run -d -v /path/to/.dashup.json:/usr/src/module/.dashup.json dashup/module-chat`