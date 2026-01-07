package com.course.android.util;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Session Manager - 管理用户登录状态和会话信息
 * 使用 SharedPreferences 持久化存储
 */
public class SessionManager {
    private static final String PREF_NAME = "CourseSystemSession";
    private static final String KEY_TOKEN = "token";
    private static final String KEY_USER_ID = "userId";
    private static final String KEY_USERNAME = "username";
    private static final String KEY_ROLE = "role";
    private static final String KEY_REAL_NAME = "realName";
    private static final String KEY_PHONE = "phoneNumber";
    private static final String KEY_IS_LOGGED_IN = "isLoggedIn";

    private SharedPreferences prefs;
    private SharedPreferences.Editor editor;
    private static SessionManager instance;

    private SessionManager(Context context) {
        prefs = context.getApplicationContext().getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
    }

    /**
     * 获取单例实例
     */
    public static synchronized SessionManager getInstance(Context context) {
        if (instance == null) {
            instance = new SessionManager(context);
        }
        return instance;
    }

    /**
     * 保存登录会话
     */
    public void saveLoginSession(String userId, String username, String role, String token) {
        editor.putString(KEY_USER_ID, userId);
        editor.putString(KEY_USERNAME, username);
        editor.putString(KEY_ROLE, role);
        editor.putString(KEY_TOKEN, token);
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.apply();
    }

    /**
     * 保存扩展用户信息
     */
    public void saveUserDetails(String realName, String phoneNumber) {
        editor.putString(KEY_REAL_NAME, realName);
        editor.putString(KEY_PHONE, phoneNumber);
        editor.apply();
    }

    /**
     * 获取 JWT Token
     */
    public String getToken() {
        return prefs.getString(KEY_TOKEN, null);
    }

    /**
     * 获取用户 ID
     */
    public String getUserId() {
        return prefs.getString(KEY_USER_ID, null);
    }

    /**
     * 获取用户名
     */
    public String getUsername() {
        return prefs.getString(KEY_USERNAME, null);
    }

    /**
     * 获取用户角色 (student / teacher / officer)
     */
    public String getRole() {
        return prefs.getString(KEY_ROLE, null);
    }

    /**
     * 获取真实姓名
     */
    public String getRealName() {
        return prefs.getString(KEY_REAL_NAME, null);
    }

    /**
     * 检查是否已登录
     */
    public boolean isLoggedIn() {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false);
    }

    /**
     * 清除会话 - 登出时调用
     */
    public void clearSession() {
        editor.clear();
        editor.apply();
    }
}
