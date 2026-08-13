package com.studystranger.ai;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        RecyclerView rvSubjects = findViewById(R.id.rvSubjects);
        rvSubjects.setLayoutManager(new LinearLayoutManager(this));
        String[] subjects = QuestionBank.getSubjects();
        rvSubjects.setAdapter(new SubjectAdapter(subjects));

        findViewById(R.id.btnSyllabus).setOnClickListener(v ->
                startActivity(new Intent(this, SyllabusActivity.class)));
        findViewById(R.id.btnRevision).setOnClickListener(v ->
                startActivity(new Intent(this, RevisionCardsActivity.class)));
    }

    static class SubjectAdapter extends RecyclerView.Adapter<SubjectAdapter.VH> {
        private final String[] subjects;

        SubjectAdapter(String[] subjects) {
            this.subjects = subjects;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_subject, parent, false);
            return new VH(v);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            String subject = subjects[position];
            int count = QuestionBank.getQuestions(subject).size();
            holder.tvName.setText(subject);
            holder.tvCount.setText(count + " questions");
            holder.itemView.setOnClickListener(v -> {
                Intent intent = new Intent(v.getContext(), MockTestActivity.class);
                intent.putExtra(MockTestActivity.EXTRA_SUBJECT, subject);
                v.getContext().startActivity(intent);
            });
        }

        @Override
        public int getItemCount() {
            return subjects.length;
        }

        static class VH extends RecyclerView.ViewHolder {
            final TextView tvName;
            final TextView tvCount;

            VH(View itemView) {
                super(itemView);
                tvName = itemView.findViewById(R.id.tvSubjectName);
                tvCount = itemView.findViewById(R.id.tvSubjectCount);
            }
        }
    }
}
