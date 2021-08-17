const leftReducer = (accum, cur) => {
  return accum + (cur.left ? 1 : 0);
};

const rightReducer = (accum, cur) => {
  return accum + (cur.right ? 1 : 0);
};

export enum FileType {
  New,
  Removed,
  Edited,
}

export const newOrDeletedFile = (lines) => {
  // Counts the total number of lines on the left side vs the right side
  // And if the left is completely empty then its a new file
  // If Right side is completely empty then the file has been deleted
  // Otherwise it was edited

  if (lines.reduce(leftReducer, 0) === 0) {
    return FileType.New;
  } else if (lines.reduce(rightReducer, 0) === 0) {
    return FileType.Removed;
  }
  return FileType.Edited;
};
