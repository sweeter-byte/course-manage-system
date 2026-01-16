package com.course.android;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.course.android.model.ApiResponse;
import com.course.android.model.User;
import com.course.android.network.RetrofitClient;
import com.course.android.util.SessionManager;
import com.google.android.material.textfield.TextInputEditText;
import java.util.HashMap;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * 个人中心页面 - 查看和修改个人信息、修改密码
 */
public class ProfileActivity extends AppCompatActivity {

    private SessionManager sessionManager;

    // 显示信息
    private TextView tvUserName, tvUserRole, tvUserId, tvPhone, tvEmail, tvCollege;

    // 编辑信息
    private TextInputEditText etRealName, etEmail, etCollege, etMajor;
    private Button btnSaveInfo;

    // 修改密码
    private TextInputEditText etOldPassword, etNewPassword, etConfirmPassword;
    private Button btnChangePassword;

    private ImageButton btnBack;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_profile);

        sessionManager = SessionManager.getInstance(this);

        // 检查登录状态
        if (!sessionManager.isLoggedIn()) {
            Toast.makeText(this, "请先登录", Toast.LENGTH_SHORT).show();
            navigateToLogin();
            return;
        }

        initViews();
        setupListeners();
        loadUserInfo();
    }

    private void initViews() {
        // 返回按钮
        btnBack = findViewById(R.id.btnBack);

        // 显示信息
        tvUserName = findViewById(R.id.tvUserName);
        tvUserRole = findViewById(R.id.tvUserRole);
        tvUserId = findViewById(R.id.tvUserId);
        tvPhone = findViewById(R.id.tvPhone);
        tvEmail = findViewById(R.id.tvEmail);
        tvCollege = findViewById(R.id.tvCollege);

        // 编辑信息
        etRealName = findViewById(R.id.etRealName);
        etEmail = findViewById(R.id.etEmail);
        etCollege = findViewById(R.id.etCollege);
        etMajor = findViewById(R.id.etMajor);
        btnSaveInfo = findViewById(R.id.btnSaveInfo);

        // 修改密码
        etOldPassword = findViewById(R.id.etOldPassword);
        etNewPassword = findViewById(R.id.etNewPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        btnChangePassword = findViewById(R.id.btnChangePassword);
    }

    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());
        btnSaveInfo.setOnClickListener(v -> saveUserInfo());
        btnChangePassword.setOnClickListener(v -> changePassword());
    }

    private void loadUserInfo() {
        // 先从本地缓存加载
        displayLocalUserInfo();

        // 从服务器获取最新信息
        String userId = sessionManager.getUserId();
        if (userId == null) return;

        RetrofitClient.getApiService().getUserById(userId).enqueue(new Callback<ApiResponse<User>>() {
            @Override
            public void onResponse(Call<ApiResponse<User>> call, Response<ApiResponse<User>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getCode() == 200) {
                    User user = response.body().getData();
                    if (user != null) {
                        displayUserInfo(user);
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<User>> call, Throwable t) {
                // 加载失败时使用本地缓存
            }
        });
    }

    private void displayLocalUserInfo() {
        String realName = sessionManager.getRealName();
        String username = sessionManager.getUsername();
        String role = sessionManager.getRole();
        String phone = sessionManager.getPhoneNumber();
        String userId = sessionManager.getUserId();

        tvUserName.setText(realName != null && !realName.isEmpty() ? realName : username);
        tvUserRole.setText(getRoleDisplayName(role));
        tvUserId.setText(userId != null ? userId : "--");
        tvPhone.setText(phone != null ? phone : "--");

        if (realName != null) {
            etRealName.setText(realName);
        }
    }

    private void displayUserInfo(User user) {
        if (user == null) return;

        // 更新显示信息
        String displayName = user.getRealName() != null && !user.getRealName().isEmpty()
                ? user.getRealName() : user.getUsername();
        tvUserName.setText(displayName);
        tvUserRole.setText(getRoleDisplayName(user.getRole()));
        tvUserId.setText(user.getUserId() != null ? user.getUserId() : "--");
        tvPhone.setText(user.getPhoneNumber() != null ? user.getPhoneNumber() : "--");
        tvEmail.setText(user.getEmail() != null ? user.getEmail() : "--");
        tvCollege.setText(user.getCollege() != null ? user.getCollege() : "--");

        // 填充编辑表单
        if (user.getRealName() != null) {
            etRealName.setText(user.getRealName());
        }
        if (user.getEmail() != null) {
            etEmail.setText(user.getEmail());
        }
        if (user.getCollege() != null) {
            etCollege.setText(user.getCollege());
        }
        if (user.getMajor() != null) {
            etMajor.setText(user.getMajor());
        }

        // 更新本地缓存
        sessionManager.saveUserDetails(user.getRealName(), user.getPhoneNumber());
    }

    private String getRoleDisplayName(String role) {
        if (role == null) return "用户";
        switch (role) {
            case "student":
                return "学生";
            case "teacher":
                return "教师";
            case "officer":
                return "教务员";
            default:
                return role;
        }
    }

    private void saveUserInfo() {
        String userId = sessionManager.getUserId();
        if (userId == null) {
            Toast.makeText(this, "用户信息获取失败", Toast.LENGTH_SHORT).show();
            return;
        }

        String realName = etRealName.getText() != null ? etRealName.getText().toString().trim() : "";
        String email = etEmail.getText() != null ? etEmail.getText().toString().trim() : "";
        String college = etCollege.getText() != null ? etCollege.getText().toString().trim() : "";
        String major = etMajor.getText() != null ? etMajor.getText().toString().trim() : "";

        // 禁用按钮
        btnSaveInfo.setEnabled(false);
        btnSaveInfo.setText("保存中...");

        Map<String, Object> userData = new HashMap<>();
        userData.put("userId", userId);
        if (!realName.isEmpty()) userData.put("realName", realName);
        if (!email.isEmpty()) userData.put("email", email);
        if (!college.isEmpty()) userData.put("college", college);
        if (!major.isEmpty()) userData.put("major", major);

        RetrofitClient.getApiService().updateUser(userData).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                btnSaveInfo.setEnabled(true);
                btnSaveInfo.setText("保存修改");

                if (response.isSuccessful() && response.body() != null && response.body().getCode() == 200) {
                    Toast.makeText(ProfileActivity.this, "保存成功！", Toast.LENGTH_SHORT).show();
                    // 更新本地缓存
                    if (!realName.isEmpty()) {
                        sessionManager.saveUserDetails(realName, sessionManager.getPhoneNumber());
                    }
                    // 刷新显示
                    loadUserInfo();
                } else {
                    String msg = response.body() != null ? response.body().getMessage() : "保存失败";
                    Toast.makeText(ProfileActivity.this, msg, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                btnSaveInfo.setEnabled(true);
                btnSaveInfo.setText("保存修改");
                Toast.makeText(ProfileActivity.this, "网络错误: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void changePassword() {
        String userId = sessionManager.getUserId();
        if (userId == null) {
            Toast.makeText(this, "用户信息获取失败", Toast.LENGTH_SHORT).show();
            return;
        }

        String oldPassword = etOldPassword.getText() != null ? etOldPassword.getText().toString() : "";
        String newPassword = etNewPassword.getText() != null ? etNewPassword.getText().toString() : "";
        String confirmPassword = etConfirmPassword.getText() != null ? etConfirmPassword.getText().toString() : "";

        // 验证
        if (oldPassword.isEmpty()) {
            etOldPassword.setError("请输入当前密码");
            return;
        }
        if (newPassword.isEmpty()) {
            etNewPassword.setError("请输入新密码");
            return;
        }
        if (newPassword.length() < 6) {
            etNewPassword.setError("新密码至少6位");
            return;
        }
        if (!newPassword.equals(confirmPassword)) {
            etConfirmPassword.setError("两次输入的密码不一致");
            return;
        }

        // 禁用按钮
        btnChangePassword.setEnabled(false);
        btnChangePassword.setText("修改中...");

        Map<String, String> passwordData = new HashMap<>();
        passwordData.put("userId", userId);
        passwordData.put("oldPassword", oldPassword);
        passwordData.put("newPassword", newPassword);

        RetrofitClient.getApiService().updatePassword(passwordData).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                btnChangePassword.setEnabled(true);
                btnChangePassword.setText("修改密码");

                if (response.isSuccessful() && response.body() != null && response.body().getCode() == 200) {
                    Toast.makeText(ProfileActivity.this, "密码修改成功！", Toast.LENGTH_SHORT).show();
                    // 清空输入框
                    etOldPassword.setText("");
                    etNewPassword.setText("");
                    etConfirmPassword.setText("");
                } else {
                    String msg = response.body() != null ? response.body().getMessage() : "修改失败";
                    Toast.makeText(ProfileActivity.this, msg, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                btnChangePassword.setEnabled(true);
                btnChangePassword.setText("修改密码");
                Toast.makeText(ProfileActivity.this, "网络错误: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void navigateToLogin() {
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
