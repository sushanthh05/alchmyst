export interface DiffResult {
  added: string[];
  removed: string[];
  changed: string[];
}

export function diffObjects(previous: any, current: any, path: string = ''): DiffResult {
  const result: DiffResult = { added: [], removed: [], changed: [] };

  if (previous === current) {
    return result;
  }

  if (typeof previous !== 'object' || previous === null || typeof current !== 'object' || current === null) {
    if (previous !== current) {
      if (previous === undefined) {
        result.added.push(path);
      } else if (current === undefined) {
        result.removed.push(path);
      } else {
        result.changed.push(path);
      }
    }
    return result;
  }

  if (Array.isArray(previous) && Array.isArray(current)) {
    if (previous.length !== current.length) {
      result.changed.push(path);
      return result;
    }
    
    let isDifferent = false;
    for (let i = 0; i < previous.length; i++) {
      // Basic array element comparison, doesn't deep diff arrays perfectly but works for simple cases
      // For complex objects, array diffing gets very heavy. We'll mark the whole array as changed
      // if any element differs, or just do deep diff on indices.
      const elDiff = diffObjects(previous[i], current[i], path ? `${path}[${i}]` : `[${i}]`);
      if (elDiff.added.length > 0 || elDiff.removed.length > 0 || elDiff.changed.length > 0) {
        result.changed.push(path ? `${path}[${i}]` : `[${i}]`);
        isDifferent = true;
      }
    }
    if (isDifferent) {
      // Could also mark the entire array as changed
    }
    return result;
  }

  const prevKeys = new Set(Object.keys(previous));
  const currKeys = new Set(Object.keys(current));

  for (const key of currKeys) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!prevKeys.has(key)) {
      result.added.push(currentPath);
    } else {
      const childDiff = diffObjects(previous[key], current[key], currentPath);
      result.added.push(...childDiff.added);
      result.removed.push(...childDiff.removed);
      result.changed.push(...childDiff.changed);
    }
  }

  for (const key of prevKeys) {
    if (!currKeys.has(key)) {
      const currentPath = path ? `${path}.${key}` : key;
      result.removed.push(currentPath);
    }
  }

  return result;
}
