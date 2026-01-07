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
 * 教师 Dashboard - 展示教师执教的课程，提供发布作业入口
 */
public class TeacherDashboardActivity extends AppCompatActivity {

    private RecyclerView rvCourses;
    private CourseAdapter adapter;
    private TextView tvWelcome;
    private Button btnCreateAssignment, btnRefresh, btnLogout;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_teacher_dashboard);

        sessionManager = SessionManager.getInstance(this);
        
        // 检查登录状态
        if (!sessionManager.isLoggedIn()) {
            navigateToLogin();
            return;
        }

        initViews();
        setupListeners();
        loadTeacherCourses();
    }

    private void initViews() {
        rvCourses = findViewById(R.id.rvTeacherCourses);
        rvCourses.setLayoutManager(new LinearLayoutManager(this));
        
        tvWelcome = findViewById(R.id.tvTeacherWelcome);
        btnCreateAssignment = findViewById(R.id.btnCreateAssignment);
        btnRefresh = findViewById(R.id.btnRefresh);
        btnLogout = findViewById(R.id.btnLogout);
        
        // 设置欢迎语
        String realName = sessionManager.getRealName();
        if (realName != null && !realName.isEmpty()) {
            tvWelcome.setText("欢迎，" + realName + " 老师");
        } else {
            tvWelcome.setText("教师工作台");
        }
    }

    private void setupListeners() {
        btnCreateAssignment.setOnClickListener(v -> {
            // TODO: 跳转到作业发布页面
            Toast.makeText(this, "作业发布功能开发中...", Toast.LENGTH_SHORT).show();
        });
        
        btnRefresh.setOnClickListener(v -> loadTeacherCourses());
        
        btnLogout.setOnClickListener(v -> showLogoutConfirmation());
    }

    private void loadTeacherCourses() {
        String teacherId = sessionManager.getUserId();
        if (teacherId == null) {
            Toast.makeText(this, "获取教师信息失败", Toast.LENGTH_SHORT).show();
            return;
        }

        RetrofitClient.getApiService().getCoursesByTeacher(teacherId).enqueue(new Callback<ApiResponse<List<Course>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Course>>> call, Response<ApiResponse<List<Course>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Course> courses = response.body().getData();
                    if (courses != null && !courses.isEmpty()) {
                        adapter = new CourseAdapter(courses);
                        rvCourses.setAdapter(adapter);
                    } else {
                        Toast.makeText(TeacherDashboardActivity.this, "暂无课程", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    // 如果获取教师课程失败，尝试获取所有课程
                    loadAllCourses();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Course>>> call, Throwable t) {
                Toast.makeText(TeacherDashboardActivity.this, "加载失败: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                // 尝试加载所有课程作为备用
                loadAllCourses();
            }
        });
    }

    private void loadAllCourses() {
        RetrofitClient.getApiService().getAllCourses().enqueue(new Callback<ApiResponse<List<Course>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Course>>> call, Response<ApiResponse<List<Course>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Course> courses = response.body().getData();
                    if (courses != null) {
                        adapter = new CourseAdapter(courses);
                        rvCourses.setAdapter(adapter);
                    }
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Course>>> call, Throwable t) {
                Toast.makeText(TeacherDashboardActivity.this, "网络错误: " + t.getMessage(), Toast.LENGTH_SHORT).show();
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
