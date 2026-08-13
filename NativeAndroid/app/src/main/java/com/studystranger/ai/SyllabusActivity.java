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
import java.util.Map;

public class SyllabusActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_syllabus);

        RecyclerView rv = findViewById(R.id.rvSyllabus);
        rv.setLayoutManager(new LinearLayoutManager(this));
        rv.setAdapter(new SyllabusAdapter(SyllabusData.getSyllabus()));
    }

    static class SyllabusAdapter extends RecyclerView.Adapter<SyllabusAdapter.VH> {
        private final List<Map.Entry<String, List<String[]>>> items;

        SyllabusAdapter(Map<String, List<String[]>> data) {
            items = new java.util.ArrayList<>(data.entrySet());
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_syllabus, parent, false);
            return new VH(v);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            Map.Entry<String, List<String[]>> entry = items.get(position);
            holder.tvCategory.setText(entry.getKey());

            StringBuilder sb = new StringBuilder();
            for (String[] item : entry.getValue()) {
                sb.append("• ").append(item[0]).append("\n")
                        .append("  ").append(item[1]).append("\n\n");
            }
            holder.tvItems.setText(sb.toString().trim());
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        static class VH extends RecyclerView.ViewHolder {
            final TextView tvCategory;
            final TextView tvItems;

            VH(View itemView) {
                super(itemView);
                tvCategory = itemView.findViewById(R.id.tvCategory);
                tvItems = itemView.findViewById(R.id.tvItems);
            }
        }
    }
}
