package com.course.android.model;

public class ApiResponse<T> {
    private int code;
    private String message;
    private T data;
    private T user; // For login response structure variation

    public int getCode() { return code; }
    public String getMessage() { return message; }
    public T getData() { 
        if (data != null) return data;
        return user;
    }
}
