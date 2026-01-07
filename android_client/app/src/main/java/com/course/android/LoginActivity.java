package com.course.android;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.course.android.model.ApiResponse;
import com.course.android.model.User;
import com.course.android.network.RetrofitClient;
import com.course.android.util.SessionManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import java.util.HashMap;
import java.util.Map;

/**
 * 登录页面 - 用户身份认证入口
 */
public class LoginActivity extends AppCompatActivity {

    private EditText etPhoneNumber;
    private EditText etPassword;
    private Button btnLogin;
    private TextView tvRegister;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // 初始化 RetrofitClient
        RetrofitClient.init(this);
        
        sessionManager = SessionManager.getInstance(this);
        
        // 检查是否已登录
        if (sessionManager.isLoggedIn()) {
            navigateToDashboard(sessionManager.getRole());
            return;
        }

        initViews();
        setupListeners();
    }

    private void initViews() {
        etPhoneNumber = findViewById(R.id.etPhoneNumber);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvRegister = findViewById(R.id.tvRegister);
    }

    private void setupListeners() {
        btnLogin.setOnClickListener(v -> attemptLogin());
        
        tvRegister.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });
    }

    private void attemptLogin() {
        String phone = etPhoneNumber.getText().toString().trim();
        String password = etPassword.getText().toString();

        // 表单验证
        if (phone.isEmpty()) {
            etPhoneNumber.setError("请输入手机号");
            return;
        }
        if (password.isEmpty()) {
            etPassword.setError("请输入密码");
            return;
        }

        // 禁用按钮防止重复提交
        btnLogin.setEnabled(false);
        btnLogin.setText("登录中...");

        // 构建登录请求
        Map<String, String> loginData = new HashMap<>();
        loginData.put("phoneNumber", phone);
        loginData.put("password", password);

        // 调用登录 API
        RetrofitClient.getApiService().login(loginData).enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                btnLogin.setEnabled(true);
                btnLogin.setText("登 录");

                if (response.isSuccessful() && response.body() != null) {
                    int code = response.body().getCode();
                    if (code == 200) {
                        User user = response.body().getData();
                        if (user != null) {
                            // 保存登录会话
                            sessionManager.saveLoginSession(
                                user.getUserId(),
                                user.getUsername(),
                                user.getRole(),
                                user.getToken()
                            );
                            sessionManager.saveUserDetails(
                                user.getRealName(),
                                user.getPhoneNumber()
                            );
                            
                            Toast.makeText(LoginActivity.this, "登录成功", Toast.LENGTH_SHORT).show();
                            
                            // 根据角色导航到不同的 Dashboard
                            navigateToDashboard(user.getRole());
                        }
                    } else {
                        String message = response.body().getMessage();
                        Toast.makeText(LoginActivity.this, 
                            message != null ? message : "登录失败", 
                            Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(LoginActivity.this, "登录失败，请检查网络", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                btnLogin.setEnabled(true);
                btnLogin.setText("登 录");
                Toast.makeText(LoginActivity.this, "网络错误: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    /**
     * 根据用户角色导航到对应的 Dashboard
     */
    private void navigateToDashboard(String role) {
        Intent intent;
        if ("teacher".equals(role)) {
            intent = new Intent(this, TeacherDashboardActivity.class);
        } else {
            // 学生和其他角色进入学生 Dashboard
            intent = new Intent(this, DashboardActivity.class);
        }
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}

