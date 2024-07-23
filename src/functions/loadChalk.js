let chalk;

async function loadChalk() {
  if (!chalk) {
    chalk = (await import('chalk')).default;
  }
  return chalk;
}

module.exports = loadChalk;