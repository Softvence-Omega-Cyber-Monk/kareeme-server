// src/core/pipe/parse-form-data-json.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseFormDataJsonPipe implements PipeTransform {
  transform(value: any) {
    // Log the raw incoming body (very useful for debugging)
    console.log('[ParseFormDataJsonPipe] RAW incoming form data:', JSON.stringify(value, null, 2));

    const result = this.parseValue(value);

    // Log the final parsed result
    console.log('[ParseFormDataJsonPipe] FINAL PARSED result:', JSON.stringify(result, null, 2));

    // Extra debug info for common problem fields
    console.log(
      '[ParseFormDataJsonPipe] releaseArtists type:',
      Array.isArray(result.releaseArtists) ? 'array' : typeof result.releaseArtists,
      result.releaseArtists ? `length: ${result.releaseArtists.length}` : '',
    );
    console.log(
      '[ParseFormDataJsonPipe] tracks type:',
      Array.isArray(result.tracks) ? 'array' : typeof result.tracks,
    );
    console.log(
      '[ParseFormDataJsonPipe] isExplicitContent type:',
      typeof result.isExplicitContent,
      'value:',
      result.isExplicitContent,
    );

    return result;
  }

  private parseValue(value: any): any {
    // Null or undefined → keep as is
    if (value === null || value === undefined) {
      return value;
    }

    // Handle strings (most common in multipart/form-data)
    if (typeof value === 'string') {
      const trimmed = value.trim();
      const lower = trimmed.toLowerCase();

      // Boolean detection (very permissive)
      if (['true', 'yes', '1', 'on'].includes(lower)) return true;
      if (['false', 'no', '0', 'off'].includes(lower)) return false;

      // Number detection
      if (trimmed !== '' && !isNaN(Number(trimmed))) {
        return Number(trimmed);
      }

      // Try to parse as JSON (objects or arrays)
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          // Recursively process the parsed result
          return this.parseValue(parsed);
        } catch (error) {
          // If it looked like JSON but failed → log warning
          console.warn(
            `[ParseFormDataJsonPipe] JSON parse failed on string: "${trimmed.slice(0, 120)}..." →`,
            error.message,
          );

          // Return safe default instead of crashing
          if (trimmed.startsWith('[')) return [];
          if (trimmed.startsWith('{')) return {};
          return trimmed;
        }
      }

      // Just a normal trimmed string
      return trimmed;
    }

    // Array → map over each item recursively
    if (Array.isArray(value)) {
      return value.map(item => this.parseValue(item));
    }

    // Object → recurse over each property
    if (typeof value === 'object' && value !== null) {
      const result: Record<string, any> = {};
      for (const key in value) {
        result[key] = this.parseValue(value[key]);
      }
      return result;
    }

    // Anything else (boolean, number, etc.) → keep as is
    return value;
  }
}