import fs from 'node:fs';
import path from 'node:path';
import type { BrickColor } from '@lego-wargame-terrain-studio/api';

export interface ColorService {
  loadColors(filePath?: string): Promise<void>;
  listColors(): BrickColor[];
  getColorById(id: number): BrickColor | undefined;
  getColorByName(name: string): BrickColor | undefined;
  isValidColorId(id: number): boolean;
}

export class DefaultColorService implements ColorService {
  private colorsById: Map<number, BrickColor> = new Map();
  private colorsByName: Map<string, BrickColor> = new Map();
  private colorsList: BrickColor[] = [];
  private isLoaded = false;

  async loadColors(filePath?: string): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    let resolvedPath = filePath ? path.resolve(filePath) : '';
    if (!resolvedPath) {
      const candidates = [
        path.resolve(process.cwd(), 'specs/domain/colors.csv'),
        path.resolve(process.cwd(), '../../specs/domain/colors.csv'),
        path.resolve(process.cwd(), '../specs/domain/colors.csv')
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          resolvedPath = candidate;
          break;
        }
      }
      if (!resolvedPath) {
        resolvedPath = candidates[0];
      }
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Color catalog CSV not found at: ${resolvedPath}`);
    }

    const content = fs.readFileSync(resolvedPath, 'utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length < 2) {
      throw new Error('Color catalog CSV is empty or missing headers');
    }

    const [header, ...rows] = lines;
    if (header.trim() !== 'id,name,hex') {
      throw new Error(`Invalid color catalog CSV header: "${header}". Expected "id,name,hex"`);
    }

    this.colorsById.clear();
    this.colorsByName.clear();
    this.colorsList = [];

    for (const row of rows) {
      const parts = row.split(',');
      if (parts.length !== 3) {
        throw new Error(`Invalid row in color catalog CSV: "${row}"`);
      }
      const [idStr, name, hex] = parts;
      const id = parseInt(idStr.trim(), 10);
      if (isNaN(id)) {
        throw new Error(`Invalid color ID "${idStr}" in row "${row}"`);
      }
      const trimmedName = name.trim();
      const trimmedHex = hex.trim();

      if (!/^#[0-9A-Fa-f]{6}$/.test(trimmedHex)) {
        throw new Error(`Invalid hex code "${trimmedHex}" in row "${row}"`);
      }

      const color: BrickColor = {
        id,
        name: trimmedName,
        hex: trimmedHex
      };

      this.colorsById.set(id, color);
      this.colorsByName.set(trimmedName.toLowerCase(), color);
      this.colorsList.push(color);
    }

    if (this.colorsList.length !== 41) {
      throw new Error(`Expected exactly 41 official brick colors, found ${this.colorsList.length}`);
    }

    this.isLoaded = true;
  }

  listColors(): BrickColor[] {
    this.ensureLoaded();
    return [...this.colorsList];
  }

  getColorById(id: number): BrickColor | undefined {
    this.ensureLoaded();
    return this.colorsById.get(id);
  }

  getColorByName(name: string): BrickColor | undefined {
    this.ensureLoaded();
    return this.colorsByName.get(name.trim().toLowerCase());
  }

  isValidColorId(id: number): boolean {
    this.ensureLoaded();
    return this.colorsById.has(id);
  }

  private ensureLoaded(): void {
    if (!this.isLoaded) {
      throw new Error('ColorService must be loaded before accessing colors');
    }
  }
}
