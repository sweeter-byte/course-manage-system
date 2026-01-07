package com.course.android;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.course.android.adapter.AssignmentAdapter;
import com.course.android.model.ApiResponse;
import com.course.android.model.Assignment;
import com.course.android.network.RetrofitClient;
import com.course.android.util.SessionManager;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * 课程详情页面 - 展示课程的作业列表
 */
public class CourseDetailActivity extends AppCompatActivity {

    private RecyclerView rvAssignments;
    private TextView tvCourseName;
    private AssignmentAdapter adapter;
    private String courseId;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_course_detail);

        sessionManager = SessionManager.getInstance(this);
        
        // 检查登录状态
        if (!sessionManager.isLoggedIn()) {
            Toast.makeText(this, "请先登录", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        courseId = getIntent().getStringExtra("COURSE_ID");
        String courseName = getIntent().getStringExtra("COURSE_NAME");

        initViews();
        
        tvCourseName.setText(courseName != null ? courseName : "课程详情");

        loadAssignments();
    }

    private void initViews() {
        tvCourseName = findViewById(R.id.tvDetailCourseName);
        rvAssignments = findViewById(R.id.rvAssignments);
        rvAssignments.setLayoutManager(new LinearLayoutManager(this));
    }

    private void loadAssignments() {
        RetrofitClient.getApiService().getAssignments(courseId).enqueue(new Callback<ApiResponse<List<Assignment>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Assignment>>> call, Response<ApiResponse<List<Assignment>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Assignment> assignments = response.body().getData();
                    if (assignments != null && !assignments.isEmpty()) {
                        adapter = new AssignmentAdapter(assignments);
                        rvAssignments.setAdapter(adapter);
                    } else {
                        Toast.makeText(CourseDetailActivity.this, "暂无作业", Toast.LENGTH_SHORT).show();
                    }
                } else {
                    Toast.makeText(CourseDetailActivity.this, "加载作业失败", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<Assignment>>> call, Throwable t) {
                Toast.makeText(CourseDetailActivity.this, "网络错误: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}

