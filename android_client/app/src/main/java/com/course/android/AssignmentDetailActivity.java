package com.course.android;

import android.os.Bundle;
import android.content.Intent;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.course.android.model.ApiResponse;
import com.course.android.network.RetrofitClient;
import com.course.android.util.SessionManager;
import java.util.HashMap;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

/**
 * 作业详情页面 - 查看作业内容并提交答案
 */
public class AssignmentDetailActivity extends AppCompatActivity {

    private TextView tvTitle, tvContent;
    private EditText etAnswer;
    private Button btnSubmit, btnQA;
    private String assignmentId;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_assignment_detail);

        sessionManager = SessionManager.getInstance(this);
        
        // 检查登录状态
        if (!sessionManager.isLoggedIn()) {
            Toast.makeText(this, "请先登录", Toast.LENGTH_SHORT).show();
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        assignmentId = getIntent().getStringExtra("ASSIGNMENT_ID");
        String title = getIntent().getStringExtra("ASSIGNMENT_TITLE");
        String content = getIntent().getStringExtra("ASSIGNMENT_CONTENT");

        initViews();
        
        tvTitle.setText(title);
        tvContent.setText(content);

        setupListeners();
    }

    private void initViews() {
        tvTitle = findViewById(R.id.tvDetailAssignmentTitle);
        tvContent = findViewById(R.id.tvDetailAssignmentContent);
        etAnswer = findViewById(R.id.etAnswerContent);
        btnSubmit = findViewById(R.id.btnSubmitAnswer);
        btnQA = findViewById(R.id.btnViewQA);
    }

    private void setupListeners() {
        btnSubmit.setOnClickListener(v -> submitAnswer());
        
        btnQA.setOnClickListener(v -> {
            Intent intent = new Intent(this, FeedbackActivity.class);
            intent.putExtra("ASSIGNMENT_ID", assignmentId);
            startActivity(intent);
        });
    }

    private void submitAnswer() {
        String answerContent = etAnswer.getText().toString().trim();
        if (answerContent.isEmpty()) {
            Toast.makeText(this, "请输入您的答案", Toast.LENGTH_SHORT).show();
            return;
        }

        // 从 SessionManager 获取当前用户 ID
        String studentId = sessionManager.getUserId();
        if (studentId == null) {
            Toast.makeText(this, "用户信息获取失败，请重新登录", Toast.LENGTH_SHORT).show();
            return;
        }

        // 禁用按钮防止重复提交
        btnSubmit.setEnabled(false);
        btnSubmit.setText("提交中...");

        Map<String, Object> submission = new HashMap<>();
        submission.put("assignmentId", assignmentId);
        submission.put("studentId", studentId);
        submission.put("answerContent", answerContent);

        RetrofitClient.getApiService().submitAnswer(submission).enqueue(new Callback<ApiResponse<Object>>() {
            @Override
            public void onResponse(Call<ApiResponse<Object>> call, Response<ApiResponse<Object>> response) {
                btnSubmit.setEnabled(true);
                btnSubmit.setText("提交答案");
                
                if (response.isSuccessful() && response.body() != null && response.body().getCode() == 200) {
                    Toast.makeText(AssignmentDetailActivity.this, "提交成功！", Toast.LENGTH_LONG).show();
                    finish();
                } else {
                    Toast.makeText(AssignmentDetailActivity.this, "提交失败，请重试", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Object>> call, Throwable t) {
                btnSubmit.setEnabled(true);
                btnSubmit.setText("提交答案");
                Toast.makeText(AssignmentDetailActivity.this, "网络错误: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}

