package com.studystranger.ai;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class ResultActivity extends AppCompatActivity {

    public static final String EXTRA_SCORE = "score";
    public static final String EXTRA_TOTAL = "total";
    public static final String EXTRA_SUBJECT = "subject";
    public static final String EXTRA_ANSWERS = "answers";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_result);

        int score = getIntent().getIntExtra(EXTRA_SCORE, 0);
        int total = getIntent().getIntExtra(EXTRA_TOTAL, 0);
        String subject = getIntent().getStringExtra(EXTRA_SUBJECT);
        int[] answers = getIntent().getIntArrayExtra(EXTRA_ANSWERS);

        TextView tvScore = findViewById(R.id.tvScore);
        TextView tvPercentage = findViewById(R.id.tvPercentage);
        TextView tvMessage = findViewById(R.id.tvMessage);
        TextView tvSubject = findViewById(R.id.tvSubject);

        tvSubject.setText(subject + " · Semester 3");
        tvScore.setText(score + " / " + total);

        int percent = total == 0 ? 0 : Math.round(100f * score / total);
        tvPercentage.setText(percent + "%");

        if (percent >= 80) {
            tvMessage.setText("Excellent! Keep going! 🎉");
            tvMessage.setTextColor(getResources().getColor(android.R.color.holo_green_light));
        } else if (percent >= 50) {
            tvMessage.setText("Good attempt! Review your mistakes. 💪");
            tvMessage.setTextColor(getResources().getColor(android.R.color.holo_orange_light));
        } else {
            tvMessage.setText("Keep practicing, you will improve! 📚");
            tvMessage.setTextColor(getResources().getColor(android.R.color.holo_red_light));
        }

        findViewById(R.id.btnReview).setOnClickListener(v -> {
            Intent intent = new Intent(this, ReviewActivity.class);
            intent.putExtra(ReviewActivity.EXTRA_SUBJECT, subject);
            intent.putExtra(ReviewActivity.EXTRA_ANSWERS, answers);
            startActivity(intent);
        });

        findViewById(R.id.btnHome).setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
            finish();
        });
    }
}
