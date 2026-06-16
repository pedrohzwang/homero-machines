import db from './init';
import type { Machine, Part } from '../types';

type MachineRow = {
  id: number;
  name: string;
  description: string | null;
  photos: string;
  parts: string;
  tags: string;
  created_at: string;
  updated_at: string;
};

function rowToMachine(row: MachineRow): Machine {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    photos: JSON.parse(row.photos) as string[],
    parts: JSON.parse(row.parts) as Part[],
    tags: row.tags ? (JSON.parse(row.tags) as string[]) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllMachines(): Machine[] {
  const rows = db.getAllSync<MachineRow>(
    'SELECT * FROM machines ORDER BY updated_at DESC'
  );
  return rows.map(rowToMachine);
}

export function getMachineById(id: number): Machine | null {
  const row = db.getFirstSync<MachineRow>(
    'SELECT * FROM machines WHERE id = ?',
    [id]
  );
  return row ? rowToMachine(row) : null;
}

export function insertMachine(data: {
  name: string;
  description?: string;
  photos?: string[];
  parts?: Part[];
  tags?: string[];
}): number {
  const result = db.runSync(
    `INSERT INTO machines (name, description, photos, parts, tags)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.name,
      data.description ?? null,
      JSON.stringify(data.photos ?? []),
      JSON.stringify(data.parts ?? []),
      JSON.stringify(data.tags ?? []),
    ]
  );
  return result.lastInsertRowId;
}

export function updateMachine(
  id: number,
  data: {
    name?: string;
    description?: string;
    photos?: string[];
    parts?: Part[];
    tags?: string[];
  }
): void {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.photos !== undefined) {
    fields.push('photos = ?');
    values.push(JSON.stringify(data.photos));
  }
  if (data.parts !== undefined) {
    fields.push('parts = ?');
    values.push(JSON.stringify(data.parts));
  }
  if (data.tags !== undefined) {
    fields.push('tags = ?');
    values.push(JSON.stringify(data.tags));
  }

  if (fields.length === 0) return;

  fields.push("updated_at = datetime('now')");

  db.runSync(
    `UPDATE machines SET ${fields.join(', ')} WHERE id = ?`,
    [...values, id]
  );
}

export function deleteMachine(id: number): void {
  db.runSync('DELETE FROM machines WHERE id = ?', [id]);
}
