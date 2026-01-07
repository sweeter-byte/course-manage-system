package com.course.android.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.course.android.R;
import com.course.android.model.Feedback;
import java.util.List;

public class FeedbackAdapter extends RecyclerView.Adapter<FeedbackAdapter.FeedbackViewHolder> {

    private List<Feedback> feedbackList;

    public FeedbackAdapter(List<Feedback> feedbackList) {
        this.feedbackList = feedbackList;
    }

    @NonNull
    @Override
    public FeedbackViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_feedback, parent, false);
        return new FeedbackViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull FeedbackViewHolder holder, int position) {
        Feedback feedback = feedbackList.get(position);
        holder.tvContent.setText(feedback.getFeedbackContent());
        holder.tvStudent.setText("Student: " + feedback.getStudentId());
    }

    @Override
    public int getItemCount() {
        return feedbackList != null ? feedbackList.size() : 0;
    }

    static class FeedbackViewHolder extends RecyclerView.ViewHolder {
        TextView tvContent, tvStudent;

        FeedbackViewHolder(View itemView) {
            super(itemView);
            tvContent = itemView.findViewById(R.id.tvFeedbackContent);
            tvStudent = itemView.findViewById(R.id.tvFeedbackStudent);
        }
    }
}
