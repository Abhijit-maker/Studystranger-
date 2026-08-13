package com.studystranger.ai;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class SyllabusData {

    public static Map<String, List<String[]>> getSyllabus() {
        Map<String, List<String[]>> map = new LinkedHashMap<>();

        map.put("Bengali A (Sem 3)", listOf(
                new String[]{"Adarini", "Galpo - Prabhat Kumar Mukhopadhyay"},
                new String[]{"Dharma", "Kabita - Srijato"},
                new String[]{"Digbijayer Rupkatha", "Kabita - Nabaneeta Dev Sen"},
                new String[]{"Bangala Bhasha", "Prabandha - Swami Vivekananda"},
                new String[]{"Potraj", "Bharatiya Galpo - Shankar Rao Kharat"},
                new String[]{"Tar Sange", "Antarjatik Kabita - Pablo Neruda"},
                new String[]{"Bhashabigyan / Dhwanitattwa", "Bhasha"}
        ));

        map.put("English B (Sem 3)", listOf(
                new String[]{"The Night Train at Deoli", "Prose - Ruskin Bond"},
                new String[]{"Strong Roots", "Prose - A.P.J. Abdul Kalam"},
                new String[]{"The Bet", "Prose - Anton Chekhov"},
                new String[]{"Our Casuarina Tree", "Verse - Toru Dutt"},
                new String[]{"Ulysses", "Verse - Alfred Lord Tennyson"},
                new String[]{"Riders to the Sea", "Drama - J.M. Synge"}
        ));

        map.put("Physics (Sem 3)", listOf(
                new String[]{"Electrostatics", "Unit 1 - Charges, Potential, Capacitance"},
                new String[]{"Current Electricity", "Unit 2 - Ohm's Law, Kirchhoff's, Potentiometer"},
                new String[]{"Magnetic Effects & Magnetism", "Unit 3 - Biot-Savart, Ampere, Matter"},
                new String[]{"EMI & Alternating Current", "Unit 4 - Faraday, Lenz, AC Circuits"},
                new String[]{"Electromagnetic Waves", "Unit 5 - EM Spectrum"}
        ));

        map.put("Chemistry (Sem 3)", listOf(
                new String[]{"Liquid State (Solutions)", "Unit 1 - Raoult's Law, Colligative, Colloids"},
                new String[]{"p-Block Elements", "Unit 2 - Groups 15, 16, 17, 18"},
                new String[]{"Haloalkanes & Haloarenes", "Unit 3 - Substitution, R/S, D/L"},
                new String[]{"Alcohols, Phenols & Ethers", "Unit 4 - Preparation & Properties"},
                new String[]{"Biomolecules", "Unit 5 - Carbohydrates, Proteins, DNA/RNA"},
                new String[]{"Polymers", "Unit 6 - Natural & Synthetic"}
        ));

        map.put("Mathematics (Sem 3)", listOf(
                new String[]{"Relations and Functions", "Unit 1 - Types, Inverse Trig"},
                new String[]{"Algebra (Matrices/Det)", "Unit 2 - Operations, Inverse, Solutions"},
                new String[]{"Calculus (Continuity/Diff)", "Unit 3 - Chain Rule, Parametric, 2nd Order"},
                new String[]{"Application of Derivatives", "Unit 3 - Maxima/Minima, Tangents"},
                new String[]{"Probability", "Unit 4 - Bayes' Theorem, Random Variable"}
        ));

        map.put("Computer App (Sem 3)", listOf(
                new String[]{"Python Programming", "Unit 1 - Basics, Control, Strings, Lists"},
                new String[]{"Python Modules & Functions", "Unit 1 - Math, Random, Stats, Scopes"},
                new String[]{"E-Commerce", "Unit 2 - Types, Payments, Marketing"}
        ));

        return map;
    }

    private static List<String[]> listOf(String[]... items) {
        List<String[]> list = new ArrayList<>();
        for (String[] s : items) list.add(s);
        return list;
    }
}
