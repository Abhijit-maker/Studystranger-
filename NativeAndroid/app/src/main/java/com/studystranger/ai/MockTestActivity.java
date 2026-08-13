package com.studystranger.ai;

import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import java.util.ArrayList;
import java.util.List;

public class MockTestActivity extends AppCompatActivity {

    public static final String EXTRA_SUBJECT = "subject";

    private List<Question> questions;
    private int currentIndex = 0;
    private int score = 0;
    private final List<Integer> userAnswers = new ArrayList<>();
    private boolean answered = false;

    private TextView tvCounter;
    private TextView tvScore;
    private TextView tvQuestion;
    private TextView tvFeedback;
    private LinearLayout layoutOptions;
    private TextView btnNext;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mocktest);

        String subject = getIntent().getStringExtra(EXTRA_SUBJECT);
        if (subject == null) subject = "Biology";
        setTitle(subject + " Mock Test");

        questions = QuestionBank.getQuestions(subject);

        tvCounter = findViewById(R.id.tvQuestionCounter);
        tvScore = findViewById(R.id.tvScore);
        tvQuestion = findViewById(R.id.tvQuestion);
        tvFeedback = findViewById(R.id.tvFeedback);
        layoutOptions = findViewById(R.id.layoutOptions);
        btnNext = findViewById(R.id.btnNext);

        btnNext.setOnClickListener(v -> onNext());

        showQuestion();
    }

    private void showQuestion() {
        answered = false;
        Question q = questions.get(currentIndex);
        tvCounter.setText("Question " + (currentIndex + 1) + " / " + questions.size());
        tvScore.setText("Score: " + score);
        tvQuestion.setText(q.questionEn + "\n\n" + q.questionBn);
        tvFeedback.setVisibility(View.GONE);

        layoutOptions.removeAllViews();
        List<String> options = q.optionsEn;
        for (int i = 0; i < options.size(); i++) {
            final int optionIndex = i;
            TextView opt = new TextView(this);
            opt.setText(("ABCDEF".charAt(i)) + ". " + options.get(i));
            opt.setTextSize(15f);
            opt.setTextColor(Color.parseColor("#F1F5F9"));
            opt.setGravity(Gravity.CENTER_VERTICAL);
            opt.setPadding(dp(20), dp(16), dp(20), dp(16));
            opt.setBackground(makeRounded("#334155", 12));
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT);
            lp.setMargins(0, 0, 0, dp(12));
            opt.setLayoutParams(lp);
            opt.setOnClickListener(v -> selectOption(optionIndex));
            layoutOptions.addView(opt);
        }

        if (currentIndex == questions.size() - 1) {
            btnNext.setText("Submit Test");
        } else {
            btnNext.setText("Next Question");
        }
    }

    private void selectOption(int optionIndex) {
        if (answered) return;
        answered = true;

        Question q = questions.get(currentIndex);
        boolean correct = (optionIndex == q.correctIndex);
        if (correct) score++;

        int childCount = layoutOptions.getChildCount();
        for (int i = 0; i < childCount; i++) {
            TextView opt = (TextView) layoutOptions.getChildAt(i);
            if (i == q.correctIndex) {
                opt.setBackground(makeRounded("#22C55E", 12));
            } else if (i == optionIndex) {
                opt.setBackground(makeRounded("#EF4444", 12));
            } else {
                opt.setBackground(makeRounded("#1E293B", 12));
            }
            opt.setClickable(false);
        }

        userAnswers.add(optionIndex);

        tvFeedback.setVisibility(View.VISIBLE);
        if (correct) {
            tvFeedback.setText("Correct! ✓\n" + q.explanationEn + "\n\n" + q.explanationBn);
            tvFeedback.setTextColor(Color.parseColor("#4ADE80"));
        } else {
            tvFeedback.setText("Wrong. Correct answer: " + q.optionsEn.get(q.correctIndex) + "\n" + q.explanationEn + "\n\n" + q.explanationBn);
            tvFeedback.setTextColor(Color.parseColor("#F87171"));
        }

        tvScore.setText("Score: " + score);
    }

    private void onNext() {
        if (!answered) {
            Toast.makeText(this, "Please select an answer first", Toast.LENGTH_SHORT).show();
            return;
        }
        if (currentIndex < questions.size() - 1) {
            currentIndex++;
            showQuestion();
        } else {
            Intent intent = new Intent(this, ResultActivity.class);
            intent.putExtra(ResultActivity.EXTRA_SCORE, score);
            intent.putExtra(ResultActivity.EXTRA_TOTAL, questions.size());
            intent.putExtra(ResultActivity.EXTRA_SUBJECT, getIntent().getStringExtra(EXTRA_SUBJECT));
            intent.putExtra(ResultActivity.EXTRA_ANSWERS, toIntArray(userAnswers));
            startActivity(intent);
            finish();
        }
    }

    private int[] toIntArray(List<Integer> list) {
        int[] arr = new int[list.size()];
        for (int i = 0; i < list.size(); i++) arr[i] = list.get(i);
        return arr;
    }

    private GradientDrawable makeRounded(String colorHex, int radiusDp) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(Color.parseColor(colorHex));
        d.setCornerRadius(dp(radiusDp));
        return d;
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density);
    }
}
