# AgriGrow AADI Research Model Specification

## 1. Objective

Build a reproducible machine-learning system that predicts crop yield in
kilograms per hectare and explains each prediction. The numerical prediction
must come from trained regression models, not from Gemini.

Gemini remains responsible for farmer-friendly explanations, Agri-Bot, and
disease-image analysis.

## 2. Prediction moment

The first model represents a pre-harvest forecast. Every model feature must be
information that could reasonably be known before harvest. Data created after
harvest cannot be used as input.

## 3. Target variable

The target is normalized crop yield:

```text
yield_kg_per_ha = production_kg / cultivated_area_ha
```

Rows with missing, zero, or negative area are invalid. Production is used only
to construct the training target and must never be supplied as a prediction
feature.

## 4. Initial model feature contract

### Required research features

- `state`: Indian state or union territory.
- `district`: agricultural district.
- `crop`: normalized crop name.
- `season`: normalized agricultural season.
- `crop_year`: four-digit crop year.
- `cultivated_area_ha`: planned or known cultivated area in hectares.
- `rainfall_mm`: rainfall aggregated for the crop season.
- `mean_temperature_c`: mean temperature for the crop season.

### Optional features, admitted only when training data supports them

- `mean_humidity_pct`
- `soil_ph`
- `nitrogen_kg_ha`
- `phosphorus_kg_ha`
- `potassium_kg_ha`
- `irrigation_pct`

The application must not send an optional feature to the model merely because
the UI can collect it. A feature becomes active only after it is present and
validated in the training pipeline.

## 5. Models

Train and compare the following independent pipelines:

1. Linear Regression: transparent baseline.
2. Random Forest Regressor: nonlinear bagging model.
3. XGBoost Regressor: nonlinear boosting model.
4. Weighted Ensemble: validation-derived weighted average of the three models.

Weights must be learned from validation performance and recorded in model
metadata. They must not be manually selected to improve the final test score.

## 6. Preprocessing

- Normalize crop, state, district, and season labels.
- Convert all units to hectares, kilograms, millimetres, and degrees Celsius.
- Impute missing numerical values using training-fold statistics only.
- One-hot encode categorical features.
- Scale numerical features for Linear Regression.
- Fit preprocessing inside each cross-validation fold to prevent leakage.
- Preserve the fitted preprocessing pipeline with the trained models.

## 7. Validation strategy

### Development validation

Use grouped cross-validation with `district` as the group. A district must not
appear in both the training and validation partitions of a fold.

### Final test

Reserve a geographically isolated test set before model selection. It is used
once for the final report.

### Metrics

- R-squared (R2): variance explained by the model.
- RMSE: error magnitude with a larger penalty for large errors.
- MAE: average absolute prediction error.
- SMAPE: relative error that is more stable near zero.

Report fold mean and standard deviation. Never describe an R2 value as an
accuracy percentage.

## 8. Explainability

- Use model coefficients for the Linear Regression baseline.
- Use SHAP for the tree models and the selected ensemble explanation strategy.
- Return the top positive and negative feature contributions.
- Keep the numerical prediction and SHAP values unchanged when asking Gemini to
  produce a farmer-friendly explanation.

## 9. Prediction response contract

The future model API will return a response shaped like:

```json
{
  "modelVersion": "aadi-1.0.0",
  "predictedYieldKgPerHa": 4200.0,
  "predictedProductionKg": 8400.0,
  "modelPredictions": {
    "linearRegression": 4100.0,
    "randomForest": 4300.0,
    "xgboost": 4250.0
  },
  "ensembleWeights": {
    "linearRegression": 0.3,
    "randomForest": 0.3,
    "xgboost": 0.4
  },
  "topFactors": [
    {"feature": "rainfall_mm", "value": 620, "contribution": 240.0}
  ],
  "warnings": []
}
```

## 10. Reproducibility requirements

- Pin Python dependencies.
- Seed every randomized operation.
- Version raw-data checksums and processed-data schemas.
- Save model, preprocessing pipeline, feature list, metrics, weights, and
  training timestamp together.
- Generate evaluation tables and plots from code, not by manual editing.
- Keep raw datasets and large model binaries out of Git.

## 11. Phase 1 acceptance criteria

- The target and prediction moment are unambiguous.
- Production and post-harvest fields are forbidden as model inputs.
- Features have names, units, and availability rules.
- Baselines, ensemble, grouped validation, metrics, and SHAP are specified.
- The model and Gemini have separate responsibilities.
