# AADI Machine-Learning Service

This directory will contain the reproducible research pipeline and model API
for AgriGrow AI.

Planned structure:

```text
ml/
|-- data/
|   |-- raw/            # downloaded source data; ignored by Git
|   `-- processed/      # validated model tables; ignored by Git
|-- artifacts/          # trained pipelines and metadata; ignored by Git
|-- reports/            # generated metrics and figures
|-- src/aadi/
|   |-- data.py
|   |-- features.py
|   |-- train.py
|   |-- evaluate.py
|   |-- explain.py
|   `-- api.py
`-- tests/
```

The implementation will be added phase by phase. The research contract is in
`docs/research-model-spec.md`.
