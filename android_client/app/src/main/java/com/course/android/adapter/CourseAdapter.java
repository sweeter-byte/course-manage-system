package com.course.android.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.content.Intent;
import com.course.android.CourseDetailActivity;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.course.android.R;
import com.course.android.model.Course;
import java.util.List;

public class CourseAdapter extends RecyclerView.Adapter<CourseAdapter.CourseViewHolder> {

    private List<Course> courseList;

    public CourseAdapter(List<Course> courseList) {
        this.courseList = courseList;
    }

    @NonNull
    @Override
    public CourseViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_course, parent, false);
        return new CourseViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CourseViewHolder holder, int position) {
        Course course = courseList.get(position);
        holder.tvCourseName.setText(course.getCourseName());
        holder.tvCourseDescription.setText(course.getCourseDescription());
        holder.tvStatus.setText(course.getCourseStatus());
        // In real app, fetch teacher name by ID or have it in model
        holder.tvTeacherName.setText("Teacher: " + course.getTeacherId());
        
        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(v.getContext(), CourseDetailActivity.class);
            intent.putExtra("COURSE_ID", course.getCourseId());
            intent.putExtra("COURSE_NAME", course.getCourseName());
            v.getContext().startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return courseList != null ? courseList.size() : 0;
    }

    static class CourseViewHolder extends RecyclerView.ViewHolder {
        TextView tvCourseName, tvCourseDescription, tvStatus, tvTeacherName;

        CourseViewHolder(View itemView) {
            super(itemView);
            tvCourseName = itemView.findViewById(R.id.tvCourseName);
            tvCourseDescription = itemView.findViewById(R.id.tvCourseDescription);
            tvStatus = itemView.findViewById(R.id.tvStatus);
            tvTeacherName = itemView.findViewById(R.id.tvTeacherName);
        }
    }
}
