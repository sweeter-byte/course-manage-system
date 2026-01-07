package com.course.android.network;

import android.content.Context;
import com.course.android.util.SessionManager;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

/**
 * Retrofit 单例客户端
 * 避免重复创建 Retrofit 实例，统一管理网络配置
 */
public class RetrofitClient {
    // Android 模拟器访问本机 localhost 使用 10.0.2.2
    private static final String BASE_URL = "http://10.0.2.2:8080/";
    
    private static Retrofit retrofit = null;
    private static ApiService apiService = null;
    private static Context appContext = null;

    private RetrofitClient() {
        // 私有构造函数，防止外部实例化
    }

    /**
     * 初始化 RetrofitClient，应在 Application 类中调用
     */
    public static void init(Context context) {
        appContext = context.getApplicationContext();
    }

    /**
     * 获取 Retrofit 实例
     */
    public static synchronized Retrofit getInstance() {
        if (retrofit == null) {
            OkHttpClient.Builder httpClient = new OkHttpClient.Builder();
            
            // 添加拦截器，自动附加 JWT Token 到请求头
            httpClient.addInterceptor(chain -> {
                Request original = chain.request();
                Request.Builder requestBuilder = original.newBuilder();
                
                // 如果已登录，添加 Authorization 头
                if (appContext != null) {
                    SessionManager session = SessionManager.getInstance(appContext);
                    String token = session.getToken();
                    if (token != null && !token.isEmpty()) {
                        requestBuilder.header("Authorization", "Bearer " + token);
                    }
                }
                
                requestBuilder.header("Content-Type", "application/json");
                Request request = requestBuilder.build();
                return chain.proceed(request);
            });

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .client(httpClient.build())
                    .build();
        }
        return retrofit;
    }

    /**
     * 获取 ApiService 实例
     */
    public static synchronized ApiService getApiService() {
        if (apiService == null) {
            apiService = getInstance().create(ApiService.class);
        }
        return apiService;
    }

    /**
     * 获取 Base URL (用于调试)
     */
    public static String getBaseUrl() {
        return BASE_URL;
    }
}
