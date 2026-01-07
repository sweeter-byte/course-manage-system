package com.course.system.controller;

import com.course.system.service.SmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sms")
public class SmsController {

    @Autowired
    private SmsService smsService;

    @PostMapping("/send")
    public Map<String, Object> sendCode(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        String phoneNumber = request.get("phoneNumber");
        String type = request.get("type"); // REGISTER, LOGIN, RESET_PASSWORD

        if (phoneNumber == null || phoneNumber.isEmpty()) {
            response.put("code", 400);
            response.put("message", "手机号不能为空");
            return response;
        }

        if (type == null || type.isEmpty()) {
            type = "LOGIN"; // Default type
        }

        // Validate type
        if (!type.equals("REGISTER") && !type.equals("LOGIN") && !type.equals("RESET_PASSWORD")) {
            response.put("code", 400);
            response.put("message", "无效的验证码类型");
            return response;
        }

        boolean success = smsService.sendCode(phoneNumber, type);

        if (success) {
            response.put("code", 200);
            response.put("message", "验证码发送成功");
        } else {
            response.put("code", 500);
            response.put("message", "验证码发送失败");
        }

        return response;
    }
}
