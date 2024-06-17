import sqlite3 from "sqlite3";
import path from "path";
import { ClipboardRecord } from "@/types/clipboard";
import { app } from "electron";

const dbPath = path.join(app.getPath("appData"), "database.sqlite");
console.log(dbPath);
const db = new sqlite3.Database(dbPath);

export function initializeDatabase() {
  db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            timestamp DATETIME NOT NULL
          );
        `);
  });
}

export function addRecordContent(
  content: string,
  timestamp: string
): Promise<number> {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(
      "INSERT INTO records (content, timestamp) VALUES (?, ?)"
    );
    stmt.run(content, timestamp, function (err: Error | null) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
    stmt.finalize();
  });
}

export function getClipboardContents(
  page: number,
  pageSize: number
): Promise<ClipboardRecord[]> {
  return new Promise((resolve, reject) => {
    const offset = (page - 1) * pageSize;
    db.all(
      "SELECT * FROM records ORDER BY timestamp DESC LIMIT ? OFFSET ?",
      [pageSize, offset],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as ClipboardRecord[]);
        }
      }
    );
  });
}

export function getTotalRecordCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) AS count FROM records", (err, row) => {
      if (err) {
        reject(err);
      } else {
        const count = (row as { count: number }).count;
        resolve(count);
      }
    });
  });
}
