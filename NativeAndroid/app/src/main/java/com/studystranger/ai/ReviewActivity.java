package com.studystranger.ai;

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

public class ReviewActivity extends AppCompatActivity {

    public static final String EXTRA_SUBJECT = "subject";
    public static final String EXTRA_ANSWERS = "answers";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_review);

        String subject = getIntent().getStringExtra(EXTRA_SUBJECT);
        int[] answers = getIntent().getIntArrayExtra(EXTRA_ANSWERS);
        List<Question> questions = QuestionBank.getQuestions(subject);

        RecyclerView rv = findViewById(R.id.rvReview);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(new ReviewAdapter(questions, answers));
    }

    static class ReviewAdapter extends RecyclerView.Adapter<ReviewAdapter.VH> {
        private final List<Question> questions;
        private final int[] answers;

        ReviewAdapter(List<Question> questions, int[] answers) {
            this.questions = questions;
            this.answers = answers;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_review, parent, false);
            return new VH(v);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            Question q = questions.get(position);
            holder.tvQHeader.setText("Q" + (position + 1) + " · " + q.difficulty);
            holder.tvQ.setText(q.questionEn);

            boolean answered = answers != null && position < answers.length;
            if (answered) {
                int userAnswer = answers[position];
                boolean correct = userAnswer == q.correctIndex;
                holder.tvYourAnswer.setText("Your answer: " + q.optionsEn.get(userAnswer));
                holder.tvYourAnswer.setTextColor(holder.itemView.getContext()
                        .getColor(correct ? android.R.color.holo_green_light : android.R.color.holo_red_light));
            } else {
                holder.tvYourAnswer.setText("Your answer: Not answered");
            }

            holder.tvCorrectAnswer.setText("Correct answer: " + q.optionsEn.get(q.correctIndex));
            holder.tvExplanation.setText("Explanation: " + q.explanationEn);
        }

        @Override
        public int getItemCount() {
            return questions.size();
        }

        static class VH extends RecyclerView.ViewHolder {
            final TextView tvQHeader;
            final TextView tvQ;
            final TextView tvYourAnswer;
            final TextView tvCorrectAnswer;
            final TextView tvExplanation;

            VH(View itemView) {
                super(itemView);
                tvQHeader = itemView.findViewById(R.id.tvQHeader);
                tvQ = itemView.findViewById(R.id.tvQ);
                tvYourAnswer = itemView.findViewById(R.id.tvYourAnswer);
                tvCorrectAnswer = itemView.findViewById(R.id.tvCorrectAnswer);
                tvExplanation = itemView.findViewById(R.id.tvExplanation);
            }
        }
    }
}
