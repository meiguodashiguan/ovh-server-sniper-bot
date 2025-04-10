
const express = require('express');
const cors = require('cors');
const ovh = require('ovh');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 根据传入的配置创建OVH客户端
const createOvhClient = (config) => {
  return ovh({
    endpoint: config.endpoint,
    appKey: config.appKey,
    appSecret: config.appSecret,
    consumerKey: config.consumerKey
  });
};

// 检查服务器可用性
app.post('/api/check-availability', async (req, res) => {
  try {
    const config = req.body;
    const client = createOvhClient(config);

    console.log(`正在检查服务器可用性，配置:`, config);
    
    // 查询OVH API获取服务器可用性 (使用正确的API路径)
    let availability = 'unknown';
    
    try {
      // 这个路径需要根据OVH API文档确定
      const result = await client.requestPromised('GET', `/dedicated/server/supplierPlan/availability`, {
        planCode: config.planCode,
        zone: config.zone
      });
      
      // 解析API返回的数据
      if (result && Array.isArray(result)) {
        const datacenterInfo = result.find(item => 
          (!config.datacenter || item.datacenter === config.datacenter)
        );
        
        if (datacenterInfo && datacenterInfo.availability === 'available') {
          availability = 'available';
        } else {
          availability = 'unavailable';
        }
      }
    } catch (apiError) {
      console.error('OVH API错误:', apiError);
      availability = 'unknown';
    }
    
    const response = [{
      fqn: `KS-${config.planCode}`,
      datacenter: config.datacenter || 'default',
      availability: availability
    }];
    
    res.json(response);
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// 购买服务器
app.post('/api/purchase-server', async (req, res) => {
  try {
    const { config, serverStatus } = req.body;
    const client = createOvhClient(config);
    
    console.log(`尝试购买服务器:`, serverStatus);
    console.log(`配置:`, config);
    
    try {
      // 创建订单 - 请根据OVH API文档调整API路径和参数
      const orderParams = {
        planCode: config.planCode,
        duration: config.duration,
        pricingMode: 'default',
        quantity: 1,
        configuration: [
          { label: 'os', value: config.os }
        ]
      };
      
      // 添加选项
      if (config.options && Array.isArray(config.options)) {
        config.options.forEach(option => {
          orderParams.configuration.push({
            label: 'option',
            value: option
          });
        });
      }
      
      // 添加数据中心选择
      if (config.datacenter) {
        orderParams.configuration.push({
          label: 'datacenter',
          value: config.datacenter
        });
      }
      
      // 实际购买请求
      const order = await client.requestPromised('POST', `/order/dedicated/server/${config.zone}`, orderParams);
      
      // 返回订单信息
      res.json({
        success: true,
        orderId: order.orderId,
        orderUrl: `https://www.ovh.com/manager/order/follow.html?orderId=${order.orderId}`
      });
    } catch (apiError) {
      console.error('OVH API购买错误:', apiError);
      res.status(400).json({
        success: false,
        error: apiError.message || '购买失败'
      });
    }
  } catch (error) {
    console.error('服务器错误:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器正在监听端口: ${PORT}`);
});
