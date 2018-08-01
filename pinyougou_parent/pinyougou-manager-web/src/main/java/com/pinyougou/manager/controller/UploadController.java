package com.pinyougou.manager.controller;

import com.alibaba.fastjson.JSON;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import utils.FastDFSClient;

import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@RestController
public class UploadController {

    //获取服务器路径
    @Value("${FILE_SERVER_URL}")
    private String file_server_url;

    @Autowired
    private HttpServletResponse response;

    @RequestMapping("/upload")
    public void uploadFile(@RequestParam("imgFile") MultipartFile[] imgFile) {
        try {
            //获取响应输出流对象
            PrintWriter out = response.getWriter();

            //创建FastDFS客户端对象
            FastDFSClient client = new FastDFSClient("classpath:config/fdfs_client.conf");

            for (MultipartFile file : imgFile) {
                //获取文件全名
                String filename = file.getOriginalFilename();
                //截取文件后缀名
                String extName = filename.substring(filename.indexOf(".")+1);
                try {

                    //上传文件，返回路径
                    String path = client.uploadFile(file.getBytes(), extName);

                    //创建map，存储数据
                    Map map = new HashMap();
                    map.put("error", 0);
                    map.put("url", file_server_url + path);
                    //响应输出
                    out.print(JSON.toJSON(map));
                } catch (Exception e) {
                    e.printStackTrace();
                }

            }

            //关流
            out.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
