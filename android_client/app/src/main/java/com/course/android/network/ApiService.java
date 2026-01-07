package com.course.android.network;

import com.course.android.model.Assignment;
import com.course.android.model.Course;
import com.course.android.model.Feedback;
import com.course.android.model.User;
import com.course.android.model.ApiResponse;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

/**
 * API 服务接口定义
 */
public interface ApiService {

    // ==================== 用户相关 ====================
    
    @POST("api/users/login")
    Call<ApiResponse<User>> login(@Body Map<String, String> loginData);
    
    @POST("api/users/register")
    Call<ApiResponse<Object>> register(@Body User user);
    
    @POST("api/users/logout")
    Call<ApiResponse<Object>> logout();

    // ==================== 课程相关 ====================
    
    @GET("api/courses")
    Call<ApiResponse<List<Course>>> getAllCourses();
    
    @GET("api/courses/teacher/{teacherId}")
    Call<ApiResponse<List<Course>>> getCoursesByTeacher(@retrofit2.http.Path("teacherId") String teacherId);

    // ==================== 作业相关 ====================
    
    @GET("api/assignments")
    Call<ApiResponse<List<Assignment>>> getAssignments(@Query("courseId") String courseId);

    @POST("api/answers/submit")
    Call<ApiResponse<Object>> submitAnswer(@Body Map<String, Object> submission);

    // ==================== 反馈相关 ====================
    
    @GET("api/feedbacks")
    Call<ApiResponse<List<Feedback>>> getFeedbacks(@Query("assignmentId") String assignmentId);

    @POST("api/feedbacks")
    Call<ApiResponse<Feedback>> createFeedback(@Body Map<String, Object> feedback);
}
