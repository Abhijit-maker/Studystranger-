package com.studystranger.ai;

import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class RevisionCardsActivity extends AppCompatActivity {

    private static final String[][] CARDS = {
            {"Human Sperm Cell Parts", "Head (Acrosome), Midpiece (Mitochondria), Tail."},
            {"Ectopic Implantation", "Implantation outside the uterus (e.g. fallopian tubes)."},
            {"LH Surge", "Occurs on the 14th day of the 28-day menstrual cycle; triggers ovulation."},
            {"DNA Base Pairing", "A=T (2 hydrogen bonds), G≡C (3 hydrogen bonds)."},
            {"Fertilization Receptor", "ZP3 on the zona pellucida is the species-specific sperm receptor."},
            {"Syphilis Pathogen", "Treponema pallidum (spirochete bacterium)."},
            {"'The Bet' Wager", "2 million rubles for 15 years of solitary confinement."},
            {"Adarini (Elephant) Price", "Jayram Mokhtar bought Adarini for 2000 rupees."},
            {"'Ulysses' Famous Line", "'To strive, to seek, to find, and not to yield.'"},
            {"Oparin-Haldane Theory", "Primitive Earth atmosphere was reducing (no free O2)."},
            {"Java Man Species", "Fossil of Homo erectus (discovered 1891)."},
            {"Geitonogamy", "Pollen transfer between two flowers of the SAME plant."},
            {"KCL Conservation", "Kirchhoff's Current Law is based on conservation of charge."},
            {"adj(A) Property", "For n×n matrix A: |adj(A)| = |A|^(n-1)."},
            {"Phoneme Definition", "Smallest unit of sound distinguishing word meanings."}
    };

    private TextView tvCounter;
    private TextView tvCard;
    private int index = 0;
    private boolean flipped = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_revision);

        tvCounter = findViewById(R.id.tvCardCounter);
        tvCard = findViewById(R.id.tvCard);
        findViewById(R.id.btnPrev).setOnClickListener(v -> { index = (index - 1 + CARDS.length) % CARDS.length; flipped = false; render(); });
        findViewById(R.id.btnNext).setOnClickListener(v -> { index = (index + 1) % CARDS.length; flipped = false; render(); });
        tvCard.setOnClickListener(v -> { flipped = !flipped; render(); });
        findViewById(R.id.btnFlip).setOnClickListener(v -> { flipped = !flipped; render(); });

        render();
    }

    private void render() {
        tvCounter.setText("Card " + (index + 1) + " / " + CARDS.length + " · Tap card to flip");
        if (flipped) {
            tvCard.setText(CARDS[index][1]);
            tvCard.setTextColor(Color.parseColor("#FDE68A"));
            tvCard.setBackground(rounded("#334155", 16));
        } else {
            tvCard.setText(CARDS[index][0]);
            tvCard.setTextColor(Color.parseColor("#F1F5F9"));
            tvCard.setBackground(rounded("#4F46E5", 16));
        }
    }

    private GradientDrawable rounded(String hex, int radiusDp) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(Color.parseColor(hex));
        d.setCornerRadius(radiusDp * getResources().getDisplayMetrics().density);
        return d;
    }
}
