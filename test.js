const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// 加载环境变量
require('dotenv').config();

// 解析 JSON 请求体
app.use(express.json());

// 目标 API 地址（根据您的项目需求修改）
const targetApiUrl = 'https://api.xai.com/v1/';

// 代理中间件
app.use(async (req, res) => {
  try {
    const url = targetApiUrl + req.path.substring(1); // 去掉前导 '/'
    const headers = { ...req.headers };
    delete headers.host; // 移除 host 头部，以防干扰

    const response = await axios({
      method: req.method,
      url,
      headers,
      data: req.body,
      responseType: 'stream', // 支持流式响应
    });

    // 设置响应头
    res.status(response.status);
    for (const [key, value] of Object.entries(response.headers)) {
      res.setHeader(key, value);
    }

    // 流式返回响应
    response.data.pipe(res);
  } catch (error) {
    console.error('Error forwarding request:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});