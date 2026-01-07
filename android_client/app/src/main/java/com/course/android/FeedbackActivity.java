package com.course.android;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.course.android.adapter.FeedbackAdapter;
import com.course.android.model.ApiResponse;
import com.course.android.model.Feedback;
import com.course.android.network.RetrofitClient;
import com.course.android.util.SessionManager;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * 反馈/问答页面 - 学生提问，查看问答列表
 */
public class FeedbackActivity extends AppCompatActivity {

    private RecyclerView rvFeedbacks;
    private EditText etQuestion;
    private Button btnPost;
    private String assignmentId;
    private FeedbackAdapter adapter;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_feedback);

        sessionManager = SessionManager.getInstance(this);
        
        // 检查登录状态
        if (!sessionManager.isLoggedIn()) {
            Toast.makeText(this, "请先登录", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        assignmentId = getIntent().getStringExtra("ASSIGNMENT_ID");

        initViews();
        setupListeners();
        loadFeedbacks();
    }

    private void initViews() {
        rvFeedbacks = findViewById(R.id.rvFeedbacks);
        etQuestion = findViewById(R.id.etNewQuestion);
        btnPost = findViewById(R.id.btnPostQuestion);
        rvFeedbacks.setLayoutManager(new LinearLayoutManager(this));
    }

    private void setupListeners() {
        btnPost.setOnClickListener(v -> postFeedback());
    }

    private void loadFeedbacks() {
        if (assignmentId == null) return;
        
        RetrofitClient.getApiService().getFeedbacks(assignmentId).enqueue(new Callback<ApiResponse<List<Feedback>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<Feedback>>> call, Response<ApiResponse<List<Feedback>>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Feedback> list = response.body().getData();
                    adapter = new FeedbackAdapter(list);
                    rvFeedbacks.setAdapter(adapter);
                }
            }
            
            @Override 
            public void onFailure(Call<ApiResponse<List<Feedback>>> call, Throwable t) {
                Toast.makeText(FeedbackActivity.this, "加载失败: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void postFeedback() {
        String content = etQuestion.getText().toString().trim();
        if (content.isEmpty()) {
            Toast.makeText(this, "请输入问题内容", Toast.LENGTH_SHORT).show();
            return;
        }

        // 从 SessionManager 获取当前用户 ID
        String studentId = sessionManager.getUserId();
        if (studentId == null) {
            Toast.makeText(this, "用户信息获取失败，请重新登录", Toast.LENGTH_SHORT).show();
            return;
        }

        // 禁用按钮防止重复提交
        btnPost.setEnabled(false);

        Map<String, Object> body = new HashMap<>();
        body.put("assignmentId", assignmentId);
        body.put("studentId", studentId);
        body.put("feedbackContent", content);

        RetrofitClient.getApiService().createFeedback(body).enqueue(new Callback<ApiResponse<Feedback>>() {
            @Override
            public void onResponse(Call<ApiResponse<Feedback>> call, Response<ApiResponse<Feedback>> response) {
                btnPost.setEnabled(true);
                
                if (response.isSuccessful() && response.body() != null && response.body().getCode() == 200) {
                    etQuestion.setText("");
                    loadFeedbacks();
                    Toast.makeText(FeedbackActivity.this, "发布成功！", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(FeedbackActivity.this, "发布失败", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override 
            public void onFailure(Call<ApiResponse<Feedback>> call, Throwable t) {
                btnPost.setEnabled(true);
                Toast.makeText(FeedbackActivity.this, "网络错误: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}

