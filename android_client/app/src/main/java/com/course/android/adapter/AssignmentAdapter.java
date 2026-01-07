package com.course.android.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.content.Intent;
import com.course.android.AssignmentDetailActivity;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.course.android.R;
import com.course.android.model.Assignment;
import java.util.List;

public class AssignmentAdapter extends RecyclerView.Adapter<AssignmentAdapter.AssignmentViewHolder> {

    private List<Assignment> assignmentList;

    public AssignmentAdapter(List<Assignment> assignmentList) {
        this.assignmentList = assignmentList;
    }

    @NonNull
    @Override
    public AssignmentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_assignment, parent, false);
        return new AssignmentViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull AssignmentViewHolder holder, int position) {
        Assignment assignment = assignmentList.get(position);
        holder.tvTitle.setText(assignment.getAssignmentTitle());
        holder.tvContent.setText(assignment.getAssignmentContent());
        holder.tvStatus.setText(assignment.getAssignmentStatus());
        
        holder.itemView.setOnClickListener(v -> {
            Intent intent = new Intent(v.getContext(), AssignmentDetailActivity.class);
            intent.putExtra("ASSIGNMENT_ID", assignment.getAssignmentId());
            intent.putExtra("ASSIGNMENT_TITLE", assignment.getAssignmentTitle());
            intent.putExtra("ASSIGNMENT_CONTENT", assignment.getAssignmentContent());
            v.getContext().startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return assignmentList != null ? assignmentList.size() : 0;
    }

    static class AssignmentViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvContent, tvStatus;

        AssignmentViewHolder(View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tvAssignmentTitle);
            tvContent = itemView.findViewById(R.id.tvAssignmentContent);
            tvStatus = itemView.findViewById(R.id.tvStatus);
        }
    }
}
