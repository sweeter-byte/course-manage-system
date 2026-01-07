package com.course.android;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.RadioGroup;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.course.android.model.ApiResponse;
import com.course.android.model.User;
import com.course.android.network.RetrofitClient;
import com.google.android.material.textfield.TextInputEditText;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.UUID;

/**
 * 注册页面 - 新用户注册
 */
public class RegisterActivity extends AppCompatActivity {

    private TextInputEditText etPhone, etName, etPassword, etConfirmPassword;
    private RadioGroup rgRole;
    private Button btnRegister;
    private TextView tvBackToLogin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        initViews();
        setupListeners();
    }

    private void initViews() {
        etPhone = findViewById(R.id.etRegPhone);
        etName = findViewById(R.id.etRegName);
        etPassword = findViewById(R.id.etRegPassword);
        etConfirmPassword = findViewById(R.id.etRegConfirmPassword);
        rgRole = findViewById(R.id.rgRole);
        btnRegister = findViewById(R.id.btnRegister);
        tvBackToLogin = findViewById(R.id.tvBackToLogin);
    }

    private void setupListeners() {
        btnRegister.setOnClickListener(v -> attemptRegister());
        
        tvBackToLogin.setOnClickListener(v -> {
            finish(); // 返回登录页
        });
    }

    private void attemptRegister() {
        String phone = etPhone.getText().toString().trim();
        String name = etName.getText().toString().trim();
        String password = etPassword.getText().toString();
        String confirmPassword = etConfirmPassword.getText().toString();

        // 表单验证
        if (phone.isEmpty()) {
            etPhone.setError("请输入手机号");
            return;
        }
        if (phone.length() != 11) {
            etPhone.setError("请输入有效的11位手机号");
            return;
        }
        if (name.isEmpty()) {
            etName.setError("请输入姓名");
            return;
        }
        if (password.isEmpty()) {
            etPassword.setError("请输入密码");
            return;
        }
        if (password.length() < 6) {
            etPassword.setError("密码至少6位");
            return;
        }
        if (!password.equals(confirmPassword)) {
            etConfirmPassword.setError("两次输入的密码不一致");
            return;
        }

        // 获取选择的角色
        String role = rgRole.getCheckedRadioButtonId() == R.id.rbTeacher ? "teacher" : "student";

        // 构建用户对象
        User user = new User();
        user.setPhoneNumber(phone);
        user.setUsername(name);
        user.setRealName(name);
        user.setPassword(password);
        user.setRole(role);

        // 禁用按钮防止重复提交
        btnRegister.setEnabled(false);
        btnRegister.setText("注册中...");

        // 调用注册 API
        RetrofitClient.getApiService().register(user).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                btnRegister.setEnabled(true);
                btnRegister.setText("注册");

                if (response.isSuccessful() && response.body() != null) {
                    int code = response.body().getCode();
                    if (code == 200) {
                        Toast.makeText(RegisterActivity.this, "注册成功，请登录", Toast.LENGTH_LONG).show();
                        finish(); // 返回登录页
                    } else {
                        Toast.makeText(RegisterActivity.this, 
                            response.body().getMessage() != null ? response.body().getMessage() : "注册失败", 
                            Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(RegisterActivity.this, "注册失败，请稍后重试", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                btnRegister.setEnabled(true);
                btnRegister.setText("注册");
                Toast.makeText(RegisterActivity.this, "网络错误: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}
