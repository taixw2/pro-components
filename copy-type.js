const fs = require('fs');
const { join, dirname, basename } = require('path');
const fg = require('fast-glob');
const slash = require('slash');
const cpy = require('cpy');

const pkgList = fs.readdirSync(join(__dirname, 'packages')).filter((pkg) => pkg.charAt(0) !== '.');

(async () => {
  for (let index = 0; index < pkgList.length; index++) {
    const element = pkgList[index];
    const packagePath = slash(join(__dirname, 'packages', element));

    const files = await fg(`${packagePath}/lib/**/*.d.ts`, {
      ignore: ['**/demos/**'],
      deep: 10,
    });

    for (let idx = 0; idx < files.length; idx++) {
      const filePath = files[idx];
      const dir = dirname(filePath);

      const outputDir = dir.substr(join(packagePath, 'lib').length);
      const od = join(packagePath, 'dist', outputDir);
      try {
        await cpy(filePath, od, { overwrite: true });
      } catch (error) {}
    }

    for (let idx = 0; idx < files.length; idx++) {
      const filePath = files[idx];
      const dir = dirname(filePath);
      const filename = basename(filePath);

      const outputDir = dir.substr(join(packagePath, 'lib').length);
      const od = join(packagePath, 'dist', outputDir, filename);

      const content = await fs.promises.readFile(od, { encoding: 'utf-8' });
      await fs.promises.writeFile(od, content.replace(/import.*?\.less.*?;/g, ''), {
        encoding: 'utf-8',
      });
    }
  }
})();
