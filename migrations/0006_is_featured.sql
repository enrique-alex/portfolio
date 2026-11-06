ALTER TABLE projects ADD COLUMN is_featured INTEGER NOT NULL DEFAULT 0;

UPDATE projects SET is_featured = 1 WHERE id IN (
  'controle-hydraulique',
  'cellule-robotique',
  'toyota-prius-bond-graph',
  'vehicule-electrique-rem',
  'iot-network-infra',
  'filtre-tchebychev',
  'lyngk'
);
