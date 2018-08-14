package com.pinyougou.sms;

import com.aliyuncs.dysmsapi.model.v20170525.SendSmsResponse;
import com.aliyuncs.exceptions.ClientException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import javax.jms.JMSException;
import javax.jms.MapMessage;
import javax.jms.Message;
import javax.jms.MessageListener;

public class SmsMessageListener implements MessageListener {
    @Autowired
    private SmsUtil smsUtil;

    @Value("${templateCode_smsCode}")
    private String templateCode_smsCode;//短信模板编号

    @Value("${templateParam_smsCode}")
    private String templateParam_smsCode;//短信参数

    @Override
    public void onMessage(Message message) {
        MapMessage mapMessage=(MapMessage)message;
        try {
            String mobile= mapMessage.getString("mobile");
            String smsCode= mapMessage.getString("smsCode");
            System.out.println("从MQ中提取出消息--- 手机号："+mobile+"  验证码："+smsCode);

            String param=  templateParam_smsCode.replace("[value]",smsCode);
            SendSmsResponse smsResponse = smsUtil.sendSms(mobile, templateCode_smsCode, param);
            System.out.println(smsResponse.getCode()+":"+ smsResponse.getMessage());

        } catch (JMSException e) {
            e.printStackTrace();
        } catch (ClientException e) {
            e.printStackTrace();
        }
    }
}
