package com.studystranger.ai;

import java.util.List;

public class Question {
    public final String id;
    public final String questionEn;
    public final String questionBn;
    public final List<String> optionsEn;
    public final List<String> optionsBn;
    public final int correctIndex;
    public final String explanationEn;
    public final String explanationBn;
    public final String difficulty;

    public Question(String id, String questionEn, String questionBn,
                    List<String> optionsEn, List<String> optionsBn,
                    int correctIndex, String explanationEn, String explanationBn,
                    String difficulty) {
        this.id = id;
        this.questionEn = questionEn;
        this.questionBn = questionBn;
        this.optionsEn = optionsEn;
        this.optionsBn = optionsBn;
        this.correctIndex = correctIndex;
        this.explanationEn = explanationEn;
        this.explanationBn = explanationBn;
        this.difficulty = difficulty;
    }
}
