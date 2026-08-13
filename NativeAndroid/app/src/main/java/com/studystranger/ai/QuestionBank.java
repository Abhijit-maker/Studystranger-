package com.studystranger.ai;

import java.util.ArrayList;
import java.util.List;

public class QuestionBank {

    public static List<Question> getQuestions(String subject) {
        List<Question> q = new ArrayList<>();
        switch (subject) {
            case "Biology":
                q.add(new Question("bio_fb_1",
                        "Which receptor on the zona pellucida is responsible for species-specific sperm binding during fertilization?",
                        "নিষেক প্রক্রিয়াকালে প্রজাতির নির্দিষ্ট শুক্রাণু বাঁধনের জন্য জোনা পেলুসিডার কোন গ্রাহক বা রিসেপ্টরটি দায়ী?",
                        listOf("ZP1 Receptor", "ZP2 Receptor", "ZP3 Receptor", "ZP4 Receptor"),
                        listOf("ZP1 রিসেপ্টর", "ZP2 রিসেপ্টর", "ZP3 রিসেপ্টর", "ZP4 রিসেপ্টর"),
                        2,
                        "ZP3 (Zona Pellucida Glycoprotein 3) functions as the primary sperm receptor that mediates species-specific sperm binding and acrosome reaction.",
                        "ZP3 জোনা পেলুসিডা গ্লাইকোপ্রোটিন ৩ হল প্রধান শুক্রাণু রিসেপ্টর যা প্রজাতির নির্দিষ্ট শুক্রাণু আবদ্ধকরণ এবং অ্যাক্রোসোম বিক্রিয়া নিয়ন্ত্রণ করে।",
                        "medium"));
                q.add(new Question("bio_fb_2",
                        "The LH surge during the human menstrual cycle typically triggers ovulation on which day of a standard 28-day cycle?",
                        "মানুষের ঋতুচক্রে LH সার্জ (Surge) সাধারণত ২৮ দিনের চক্রের কততম দিনে ডিম্বপাত (Ovulation) ঘটায়?",
                        listOf("Day 7", "Day 10", "Day 14", "Day 21"),
                        listOf("৭ম দিন", "১০ম দিন", "১৪তম দিন", "২১তম দিন"),
                        2,
                        "LH surge reaches its peak around mid-cycle (Day 14), inducing rupture of the Graafian follicle and release of the secondary oocyte.",
                        "ঋতুচক্রের মাঝামাঝি অর্থাৎ ১৪তম দিনে LH হরমোনের ক্ষরণ সর্বোচ্চ শিখরে পৌঁছায় (LH Surge), যা গ্রাফিয়ান ফলিকল বিদীর্ণ করে ডিম্বাণু নির্গমন ঘটায়।",
                        "easy"));
                q.add(new Question("bio_fb_3",
                        "What is the causative pathogen of Syphilis, a sexually transmitted infection (STI)?",
                        "সিফিলিস (Syphilis) নামক যৌনবাহিত রোগের সৃষ্টিকারী জীবাণু বা প্যাথোজেন কোনটি?",
                        listOf("Neisseria gonorrhoeae", "Treponema pallidum", "Chlamydia trachomatis", "Trichomonas vaginalis"),
                        listOf("নাইসেরিয়া গনোরি", "ট্রেপোনেমা প্যালিডাম", "ক্ল্যামাইডিয়া ট্র্যাকোমেটিস", "ট্রাইকোমোনাস ভ্যাজাইনালিস"),
                        1,
                        "Syphilis is caused by the spirochete bacterium Treponema pallidum.",
                        "সিফিলিস হলো একটি ব্যাকটেরিয়াঘটিত যৌনরোগ যা 'ট্রেপোনেমা প্যালিডাম' (Treponema pallidum) নামক স্পাইরোকিট ব্যাকটেরিয়া দ্বারা সংক্রমিত হয়।",
                        "medium"));
                q.add(new Question("bio_fb_4",
                        "In DNA structure, how many hydrogen bonds link Adenine (A) and Thymine (T)?",
                        "ডিএনএ-র (DNA) গঠনে অ্যাডেনিন (A) এবং থাইমিন (T)-এর মধ্যে কয়টি হাইড্রোজেন বন্ড গঠিত হয়?",
                        listOf("1 Hydrogen Bond", "2 Hydrogen Bonds", "3 Hydrogen Bonds", "4 Hydrogen Bonds"),
                        listOf("১টি হাইড্রোজেন বন্ড", "২টি হাইড্রোজেন বন্ড", "৩টি হাইড্রোজেন বন্ড", "৪টি হাইড্রোজেন বন্ড"),
                        1,
                        "Adenine pairs with Thymine via 2 hydrogen bonds (A=T), whereas Guanine pairs with Cytosine via 3 hydrogen bonds (G≡C).",
                        "অ্যাডেনিন এবং থাইমিনের মধ্যে ২টি হাইড্রোজেন বন্ড (A=T) থাকে, যেখানে গুয়ানিন ও সাইটোসিনের মধ্যে ৩টি হাইড্রোজেন বন্ড (G≡C) থাকে।",
                        "easy"));
                q.add(new Question("bio_fb_5",
                        "Which protein prevents the re-annealing of single strands during DNA replication?",
                        "ডিএনএ রেপ্লিকেশনের সময় একক তন্ত্রী ডিএনএকে পুনরায় জোড়া লাগা থেকে রোধ করে কোন প্রোটিন?",
                        listOf("DNA Helicase", "Single-Stranded Binding Protein (SSB)", "DNA Ligase", "RNA Polymerase"),
                        listOf("ডিএনএ হেলিকোজ", "সিঙ্গেল-স্ট্র্যান্ডেড বাইন্ডিং প্রোটিন (SSB)", "ডিএনএ লাইগেজ", "আরএনএ পলিমারেজ"),
                        1,
                        "SSB (Single-Stranded Binding) proteins bind to single-stranded DNA to stabilize them and prevent unwound DNA from re-forming a double helix.",
                        "SSB প্রোটিন একক ডিএনএ তন্তুর সাথে যুক্ত হয়ে সেটিকে স্থিতিশীল রাখে এবং পুনরায় দ্বিতন্ত্রী হওয়ার হাত থেকে রক্ষা করে।",
                        "medium"));
                q.add(new Question("bio_fb_6",
                        "Transfer of pollen grains from the anther to the stigma of another flower of the SAME plant is known as:",
                        "একই উদ্ভিদের একটি ফুলের পরাগরেণু অন্য একটি ফুলের গর্ভমুণ্ডে স্থানান্তরিত হওয়াকে কী বলা হয়?",
                        listOf("Autogamy", "Geitonogamy", "Xenogamy", "Cleistogamy"),
                        listOf("অটোগ্যামি", "গেইটোনোগ্যামি (Geitonogamy)", "জেনোগ্যামি", "ক্লিস্টোগ্যামি"),
                        1,
                        "Geitonogamy is functional cross-pollination involving a pollinating agent, but genetically it is similar to autogamy since pollen comes from the same plant.",
                        "গেইটোনোগ্যামি হলো একই গাছের দুটি ভিন্ন ফুলের মধ্যে পরাগযোগ। এটি কার্যগতভাবে ইতর-পরাগযোগ হলেও জিনগতভাবে স্ব-পরাগযোগের সমান।",
                        "medium"));
                q.add(new Question("bio_fb_7",
                        "In transcription, the promoter region in eukaryotes commonly contains a consensus sequence known as the:",
                        "ইউক্যারিওটে ট্রান্সক্রিপশনের সময় প্রোমোটার অঞ্চলে অবস্থিত বিশেষ কনসেনসাস সিকোয়েন্সটিকে কী বলা হয়?",
                        listOf("Pribnow Box", "TATA Box (Hogness Box)", "CAAT Box", "Shine-Dalgarno Sequence"),
                        listOf("প্রিবনো বক্স", "টাটা বক্স (TATA Box)", "ক্যাট বক্স", "শাইন-ডালগার্নো সিকোয়েন্স"),
                        1,
                        "The TATA box (Hogness box) is a DNA sequence found in the promoter region of genes in eukaryotes and archaea.",
                        "ইউক্যারিওটিক প্রোমোটার অঞ্চলে 'TATA box' (টাটা বক্স) অবস্থিত, যেখানে আরএনএ পলিমারেজ এনজাইম যুক্ত হয়ে ট্রান্সক্রিপশন শুরু করে।",
                        "medium"));
                q.add(new Question("bio_fb_8",
                        "According to Oparin-Haldane theory, the primitive atmosphere of Earth was:",
                        "ওপারিন-হ্যালডেন তত্ত্ব অনুসারে আদি পৃথিবীর বায়ুমণ্ডল কেমন ছিল?",
                        listOf("Highly Oxidizing", "Reducing (absence of free O2)", "Neutral", "Rich in Ozone (O3)"),
                        listOf("উচ্চমাত্রায় জারক", "বিজারক (মুক্ত O2 অনুপস্থিত)", "নিরপেক্ষ", "ওজোন সমৃদ্ধ"),
                        1,
                        "Primitive Earth's atmosphere was reducing, lacking free molecular oxygen, containing CH4, NH3, H2, and water vapor.",
                        "আদি পৃথিবীর বায়ুমণ্ডল ছিল বিজারক প্রকৃতির, যেখানে মুক্ত অক্সিজেন অনুপস্থিত ছিল এবং মিথেন, অ্যামোনিয়া ও জলীয় বাষ্প প্রাচুর্যময় ছিল।",
                        "medium"));
                q.add(new Question("bio_fb_9",
                        "Implantation of the fertilized blastocyst outside the uterine cavity is termed:",
                        "জরায়ু গহ্বরের বাইরে ভ্রূণের রোপণ বা ইমপ্লান্টেশন হওয়াকে কী বলা হয়?",
                        listOf("Normal Implantation", "Ectopic Pregnancy", "Molar Pregnancy", "Tubal Sterilization"),
                        listOf("স্বাভাবিক রোপণ", "একটোপিক প্রেগন্যান্সি (Ectopic Implantation)", "মোলার প্রেগন্যান্সি", "টিউবাল স্টেরিলাইজেশন"),
                        1,
                        "Ectopic pregnancy occurs when a blastocyst implants outside the uterus, most commonly in the Fallopian tubes.",
                        "জরায়ুর বাইরে (যেমন ফ্যালোপিয়ান নালীতে) ভ্রূণের রোপণ ঘটলে তাকে একটোপিক প্রেগন্যান্সি বা একটোপিক ইমপ্লান্টেশন বলা হয়।",
                        "easy"));
                q.add(new Question("bio_fb_10",
                        "Fossil evidence of 'Java Man' belongs to which human ancestor species?",
                        "'জাভা মানব' (Java Man)-এর জীবাশ্ম মানুষের কোন পূর্বপুরুষ প্রজাতির অন্তর্গত?",
                        listOf("Australopithecus afarensis", "Homo habilis", "Homo erectus", "Homo neanderthalensis"),
                        listOf("অস্ট্রালোপিথেকাস", "হোমো হ্যাবিলিস", "হোমো ইরেক্টাস (Homo erectus)", "হোমো নিয়ানডারথালেনসিস"),
                        2,
                        "Java Man fossils discovered in 1891 belong to Homo erectus.",
                        "১৮৯১ সালে জাভায় আবিষ্কৃত জীবাশ্ম 'জাভা মানব' সরাসরি 'হোমো ইরেক্টাস' (Homo erectus) প্রজাতির অন্তর্ভুক্ত।",
                        "medium"));
                break;
            case "Bengali":
                q.add(new Question("bn_fb_1",
                        "In the story 'Adarini' by Prabhat Kumar Mukhopadhyay, what was the purchase price of the elephant Adarini?",
                        "প্রভাত কুমার মুখোপাধ্যায়ের 'আদিরিনী' গল্পে জয়রাম মুখোপাধ্যায়ের কেনা হস্তিনী 'আদিরিনী'র ক্রয়মূল্য কত ছিল?",
                        listOf("1000 Rupees", "1500 Rupees", "2000 Rupees", "3000 Rupees"),
                        listOf("১০০০ টাকা", "১৫০০ টাকা", "২০০০ টাকা", "৩০০০ টাকা"),
                        2,
                        "Jayram Mokhtar purchased the elephant Adarini for 2000 rupees.",
                        "জয়রাম মোক্তার আদিরিনী হাতিটিকে ২০০০ টাকায় কিনেছিলেন।",
                        "easy"));
                q.add(new Question("bn_fb_2",
                        "In 'Bangala Bhasha', Swami Vivekananda emphasized which form of language for general mass education?",
                        "'বাঙ্গালা ভাষা' প্রবন্ধে স্বামী বিবেকানন্দ জনসাধারণের শিক্ষার জন্য কোন ভাষার ওপর জোর দিয়েছেন?",
                        listOf("High Sanskritized Bengali", "Spoken/Colloquial Language", "English Language", "Persian Dialect"),
                        listOf("সাধু ভাষা", "মুখের চলিত ভাষা", "ইংরেজি ভাষা", "ফারসি ভাষা"),
                        1,
                        "Swami Vivekananda strongly advocated using the living spoken language of the masses for national education and literature.",
                        "স্বামী বিবেকানন্দ মনে করতেন সাধারণ মানুষের মুখের জীবন্ত ভাষা সাহিত্য ও শিক্ষার আসল মাধ্যম হওয়া উচিত।",
                        "easy"));
                q.add(new Question("bn_fb_3",
                        "Who wrote the poignant Bengali poem 'Dharma' included in WBCHSE Class 12 Semester 3?",
                        "উচ্চমাধ্যমিক দ্বাদশ শ্রেণির সেমিস্টার ৩-এর অন্তর্গত 'ধর্ম' কবিতাটির রচিয়তা কে?",
                        listOf("Shankha Ghosh", "Srijato", "Joy Goswami", "Subhash Mukhopadhyay"),
                        listOf("শঙ্খ ঘোষ", "শ্রীজাত", "জয় গোস্বামী", "সুভাষ মুখোপাধ্যায়"),
                        1,
                        "The poem 'Dharma' is written by contemporary Bengali poet Srijato.",
                        "'ধর্ম' কবিতাটি আধুনিক কবি শ্রীজাত রচনা করেছেন, যেখানে প্রাতিষ্ঠানিক ধর্মের উর্ধ্বে মানুষের ধর্মের কথা বলা হয়েছে।",
                        "easy"));
                q.add(new Question("bn_fb_4",
                        "Who translated Pablo Neruda's poem 'Tar Sange' into Bengali?",
                        "পাবলো নেরুদার কবিতা 'তার সঙ্গে' বাংলায় অনুবাদ করেন কোন বিশিষ্ট বাঙালি কবি?",
                        listOf("Shakti Chattopadhyay", "Buddhadeb Basu", "Bishnu Dey", "Sankha Ghosh"),
                        listOf("শক্তি চট্টোপাধ্যায়", "বুদ্ধদেব বসু", "বিষ্ণু দে", "শঙ্খ ঘোষ"),
                        0,
                        "The poem 'Tar Sange' (With Her) by Pablo Neruda was translated into Bengali by poet Shakti Chattopadhyay.",
                        "পাবলো নেরুদার অনুবাদিত কবিতা 'তার সঙ্গে' বাংলায় রূপান্তর করেন প্রখ্যাত কবি শক্তি চট্টোপাধ্যায়।",
                        "medium"));
                q.add(new Question("bn_fb_5",
                        "The minimal unit of sound that distinguishes meaning between words in linguistics is called:",
                        "ভাষাবিজ্ঞানে শব্দের অর্থগত পার্থক্য সৃষ্টিকারী ক্ষুদ্রতম ধ্বনিমূলক একককে কী বলা হয়?",
                        listOf("Morpheme", "Phoneme", "Allophone", "Syllable"),
                        listOf("রূপমূল", "ধ্বনিমূল (Phoneme)", "উপধ্বনি", "অক্ষর"),
                        1,
                        "A phoneme is the smallest unit of sound in a language that can distinguish one word from another.",
                        "ধ্বনিমূল হলো ভাষার ক্ষুদ্রতম ধ্বনিগত একক যা একটি শব্দের অর্থকে অপর শব্দ থেকে আলাদা করে।",
                        "medium"));
                break;
            case "English":
                q.add(new Question("en_fb_1",
                        "In Ruskin Bond's 'The Night Train at Deoli', where does the narrator encounter the young girl selling cane baskets?",
                        "রাসকিন বন্ডের 'The Night Train at Deoli' গল্পে কথক বাঁশের ঝুড়ি বিক্রেতা মেয়েটির সাথে কোথায় দেখা করেন?",
                        listOf("Ambala Station", "Deoli Station Platform", "Dehradun Station", "Delhi Junction"),
                        listOf("আম্বালা স্টেশন", "দেওলি স্টেশনের প্ল্যাটফর্ম", "দেহরাদুন স্টেশন", "দিল্লি জংশন"),
                        1,
                        "The narrator met the basket seller girl at the lonely Deoli station platform during his train journey to Dehra.",
                        "কথক দেহরাদুন যাওয়ার পথে নির্জন দেওলি স্টেশনের প্ল্যাটফর্মে মেয়েটিকে ঝুড়ি বিক্রি করতে দেখে তার প্রতি আকর্ষণ অনুভব করেন।",
                        "easy"));
                q.add(new Question("en_fb_2",
                        "In APJ Abdul Kalam's 'Strong Roots', what was his father Jainulabdeen's attitude towards formal education?",
                        "এপিজে আবদুল কালামের 'Strong Roots'-এ তাঁর পিতা জয়নুল আবেদীনের আনুষ্ঠানিক শিক্ষা সম্পর্কে ভূমিকা কী ছিল?",
                        listOf("He held high university degrees", "He had neither much formal education nor much wealth", "He was a Sanskrit professor", "He was an English magistrate"),
                        listOf("তাঁর উচ্চতর ডিগ্রি ছিল", "তাঁর আনুষ্ঠানিক শিক্ষা বা ধনসম্পদ বেশি ছিল না", "তিনি একজন সংস্কৃত অধ্যাপক ছিলেন", "তিনি একজন ম্যাজিস্ট্রেট ছিলেন"),
                        1,
                        "Jainulabdeen possessed neither much formal education nor much wealth, yet he possessed great innate wisdom and a true generosity of spirit.",
                        "কালামের পিতা জয়নুল আবেদীনের প্রাতিষ্ঠানিক শিক্ষা বা প্রচুর সম্পদ ছিল না, কিন্তু তাঁর ছিল সহজাত প্রজ্ঞা ও উদারতা।",
                        "easy"));
                q.add(new Question("en_fb_3",
                        "In Anton Chekhov's 'The Bet', what was the amount of money agreed upon for 15 years of voluntary solitary confinement?",
                        "অ্যান্টন চেকভের 'The Bet' গল্পে ১৫ বছরের নির্জন কারাবাসের বাজি হিসেবে কত অর্থ নির্ধারণ করা হয়েছিল?",
                        listOf("1 Million Rubles", "2 Million Rubles", "5 Million Rubles", "500,000 Rubles"),
                        listOf("১ মিলিয়ন রুবেল", "২ মিলিয়ন রুবেল (2 Million Rubles)", "৫ মিলিয়ন রুবেল", "৫ লাখ রুবেল"),
                        1,
                        "The banker and the young lawyer made a bet of 2 million rubles for 15 years of solitary confinement.",
                        "ব্যাংকার এবং তরুণ আইনজীবীর মধ্যে ১৫ বছর নির্জনবাসের জন্য ২০ লাখ (২ মিলিয়ন) রুবেলের বাজি হয়েছিল।",
                        "easy"));
                q.add(new Question("en_fb_4",
                        "Which iconic line concludes Lord Tennyson's dramatic monologue 'Ulysses'?",
                        "লর্ড টেনিসনের 'Ulysses' কবিতার সমাপ্তিতে কোন বিখ্যাত উক্তিটি রয়েছে?",
                        listOf("To live, to love, to suffer and to die.", "To strive, to seek, to find, and not to yield.", "To be or not to be, that is the question.", "The woods are lovely, dark and deep."),
                        listOf("To live, to love, to suffer and to die.", "To strive, to seek, to find, and not to yield.", "To be or not to be...", "The woods are lovely..."),
                        1,
                        "The final line of 'Ulysses' is 'To strive, to seek, to find, and not to yield', summarizing heroic determination.",
                        "ইউলিসিস কবিতার শেষ লাইন হলো 'To strive, to seek, to find, and not to yield', যা বীরত্বপূর্ণ অধ্যাবসায়ের প্রতীক।",
                        "easy"));
                q.add(new Question("en_fb_5",
                        "In Toru Dutt's 'Our Casuarina Tree', why is the Casuarina tree dear to the poet's soul?",
                        "তোরু দত্তের 'Our Casuarina Tree' কবিতায় ক্যাসুয়ারিনা গাছটি কবির কাছে কেন এত প্রিয়?",
                        listOf("Because of its commercial timber value", "Because happy memories of her childhood and lost siblings are blended with it", "Because it is sacred in Hindu scriptures", "Because birds nest in it"),
                        listOf("কাঠের মূল্যের জন্য", "শৈশবের স্মৃতি ও প্রয়াত ভাই-বোনদের স্মৃতির সাথে জড়িত থাকার কারণে", "ধর্মীয় পবিত্রতার জন্য", "পাখিদের বাসার জন্য"),
                        1,
                        "The tree is dear to Toru Dutt not for its magnificent form, but because beneath it she played with her beloved, now-deceased siblings (Abju and Aru).",
                        "গাছটি প্রিয় কারণ এর ছায়ায় কবি তাঁর শৈশবে প্রয়াত ভাই ও বোনের সাথে খেলাধুলো করেছিলেন।",
                        "medium"));
                break;
            case "Physics":
                q.add(new Question("phy_fb_1",
                        "What is the electric potential (V) at a point inside a uniformly charged hollow spherical conducting shell of radius R and total charge Q?",
                        "R ব্যাসার্ধ এবং Q মোট আধানযুক্ত একটি ফাঁপা পরিবাহী গোলকের অভ্যন্তরে যেকোনো বিন্দুতে তড়িৎ বিভব (V) কত হয়?",
                        listOf("0", "1/(4πε0) × Q/R", "1/(4πε0) × Q/r", "∞"),
                        listOf("0", "1/(4πε0) × Q/R", "1/(4πε0) × Q/r", "∞"),
                        1,
                        "Inside a conductor, the electric field is zero, so electric potential is constant and equal to its surface potential: V = 1/(4πε0) × Q/R.",
                        "পরিবাহীর অভ্যন্তরে তড়িৎক্ষেত্র শূন্য হওয়ায় সমস্ত অভ্যন্তরে বিভব ধ্রুবক থাকে এবং তা গোলকের পৃষ্ঠের বিভবের সমান (V = 1/(4πε0) × Q/R)।",
                        "medium"));
                q.add(new Question("phy_fb_2",
                        "According to Kirchhoff's Current Law (KCL), the algebraic sum of currents meeting at any junction in a circuit is based on conservation of:",
                        "কার্শফের প্রবাহ সূত্র (KCL) অনুযায়ী কোনো জংশনে তড়িৎপ্রবাহের বীজগণিতীয় যোগফল শূন্য হয়। এটি কিসের সংরক্ষণ নীতির ওপর প্রতিষ্ঠিত?",
                        listOf("Energy", "Charge", "Momentum", "Mass"),
                        listOf("শক্তি", "আধান (Charge)", "ভরবেগ", "ভর"),
                        1,
                        "Kirchhoff's First Law (KCL) expresses the principle of Conservation of Electric Charge.",
                        "কার্শফের প্রথম সূত্র বা KCL সরাসরি আধান সংরক্ষণ নীতি (Conservation of Charge)-এর ওপর প্রতিষ্ঠিত।",
                        "easy"));
                break;
            case "Math":
                q.add(new Question("math_fb_1",
                        "If a matrix A is of order 3x3 and |A| = 5, then what is the value of |adj(A)|?",
                        "যদি একটি 3x3 ক্রমের ম্যাট্রিক্স A-এর ক্ষেত্রে |A| = 5 হয়, তবে |adj(A)|-এর মান কত?",
                        listOf("5", "25", "125", "1/5"),
                        listOf("5", "25", "125", "1/5"),
                        1,
                        "For an n x n matrix, |adj(A)| = |A|^(n-1). Here n=3, so |adj(A)| = 5^(3-1) = 5^2 = 25.",
                        "n x n ম্যাট্রিক্সের ক্ষেত্রে |adj(A)| = |A|^(n-1)। এখানে n=3, ফলে 5^(3-1) = 5^2 = 25।",
                        "medium"));
                q.add(new Question("math_fb_2",
                        "The derivative of sin^-1(x) with respect to x is given by:",
                        "x-এর সাপেক্ষে sin^-1(x)-এর অবকলজ বা ডেরিভেটিভ কোনটি?",
                        listOf("1/√(1-x²)", "-1/√(1-x²)", "1/(1+x²)", "1/(x√(x²-1))"),
                        listOf("1/√(1-x²)", "-1/√(1-x²)", "1/(1+x²)", "1/(x√(x²-1))"),
                        0,
                        "The standard derivative formula for inverse sine is d/dx[sin^-1(x)] = 1/√(1-x²) for |x| < 1.",
                        "sin^-1(x)-এর প্রমাণ ডেরিভেটিভ হলো 1/√(1-x²)।",
                        "easy"));
                break;
            case "Chemistry":
                q.add(new Question("chem_fb_1",
                        "Which electrode potential equation relates the EMF of a cell to the concentration of reactants and products?",
                        "কোন সমীকরণটি কোষের ইএমএফ (EMF) এবং বিক্রিয়ক ও উৎপাদের ঘনমাত্রার সম্পর্ক নির্দেশ করে?",
                        listOf("Arrhenius Equation", "Nernst Equation", "Gibbs-Helmholtz Equation", "Van 't Hoff Equation"),
                        listOf("আরহেনিয়াস সমীকরণ", "নার্নস্ট সমীকরণ (Nernst Equation)", "গিবস-হেলমহোল্টজ সমীকরণ", "ভ্যান্ট হফ সমীকরণ"),
                        1,
                        "The Nernst equation E = E° - (RT/nF) ln Q relates reduction potential to concentration.",
                        "নার্নস্ট সমীকরণ কোষের তড়িৎচালক বল ও আয়নের ঘনমাত্রার সম্পর্ক প্রকাশ করে।",
                        "easy"));
                break;
            case "Computer App":
                q.add(new Question("ca_fb_1",
                        "Which logic component selects one of several digital input signals and forwards the selected input into a single line?",
                        "কোন ডিজিটাল লজিক সার্কিট একাধিক ইনপুট সিগন্যালের মধ্য থেকে একটি বেছে নিয়ে একক আউটপুট লাইনে পাঠায়?",
                        listOf("Decoder", "Encoder", "Multiplexer (MUX)", "Demultiplexer"),
                        listOf("ডিকোডার", "এনকোডার", "মাল্টিপ্লেক্সার (MUX)", "ডিমাল্টিপ্লেক্সার"),
                        2,
                        "A Multiplexer (MUX) is a combinational circuit that selects one of many input signals and outputs it to a single line.",
                        "মাল্টিপ্লেক্সার (MUX) হলো একটি সমবায় লজিক সার্কিট যা একাধিক ইনপুটের মধ্যে যেকোনো একটি বেছে নিয়ে একটি লাইনে প্রকাশ করে।",
                        "easy"));
                break;
            default:
                break;
        }
        return q;
    }

    public static String[] getSubjects() {
        return new String[]{"Biology", "Bengali", "English", "Physics", "Math", "Chemistry", "Computer App"};
    }

    private static List<String> listOf(String... items) {
        List<String> list = new ArrayList<>();
        for (String s : items) list.add(s);
        return list;
    }
}
