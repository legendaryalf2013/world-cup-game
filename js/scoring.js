const STAGE_POINTS = {
  "GROUP_STAGE": 1,
  "LAST_32": 2,
  "LAST_16": 4,
  "QUARTER_FINALS": 8,
  "SEMI_FINALS": 16,
  "FINAL": 32,
  "THIRD_PLACE": 12
};

function getStagePoints(stage) {
  return STAGE_POINTS[stage] || 0;
}
