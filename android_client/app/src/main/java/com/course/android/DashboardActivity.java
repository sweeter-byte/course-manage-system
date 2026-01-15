package com.course.android;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.course.android.adapter.CourseAdapter;
import com.course.android.model.ApiResponse;
import com.course.android.model.Course;
import com.course.android.network.RetrofitClient;
import com.course.android.util.SessionManager;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * 学生 Dashboard - 展示课程列表
 */
public class DashboardActivity extends AppCompatActivity {

    private RecyclerView rvCourses;
    private CourseAdapter adapter;
    private TextView tvWelcome;
    private Button btnLogout;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        sessionManager = SessionManager.getInstance(this);
        
        // 检查登录状态
        if (!sessionManager.isLoggedIn()) {
            navigateToLogin();
            return;
        }

        initViews();
        setupListeners();
        loadCourses();
    }

    private void initViews() {
        rvCourses = findViewById(R.id.rvCourses);
        rvCourses.setLayoutManager(new LinearLayoutManager(this));
        
        tvWelcome = findViewById(R.id.tvWelcome);
        btnLogout = findViewById(R.id.btnLogout);
        
        // 设置欢迎语
        String realName = sessionManager.getRealName();
        if (realName != null && !realName.isEmpty()) {
            tvWelcome.setText("欢迎，" + realName);
        } else {
            String username = sessionManager.getUsername();
            if (username != null) {
                tvWelcome.setText("欢迎，" + username);
            } else {
                tvWelcome.setText("我的课程");
            }
        }
    }

    private void setupListeners() {
        btnLogout.setOnClickListener(v -> showLogoutConfirmation());
    }

    private void loadCourses() {
        RetrofitClient.getApiService().getAllCourses().enqueue(new Callback<ApiResponse<List<Course>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Course>>> call, Response<ApiResponse<List<Course>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Course> courses = response.body().getData();
                    if (courses != null) {
                        adapter = new CourseAdapter(courses);
                        rvCourses.setAdapter(adapter);
                    }
                } else {
                    Toast.makeText(DashboardActivity.this, "加载课程失败", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Course>>> call, Throwable t) {
                Toast.makeText(DashboardActivity.this, "网络错误: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showLogoutConfirmation() {
        new AlertDialog.Builder(this)
                .setTitle("退出登录")
                .setMessage("确定要退出登录吗？")
                .setPositiveButton("确定", (dialog, which) -> {
                    sessionManager.clearSession();
                    navigateToLogin();
                })
                .setNegativeButton("取消", null)
                .show();
    }

    private void navigateToLogin() {
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}

