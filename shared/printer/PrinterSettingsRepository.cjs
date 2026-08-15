const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class PrinterSettingsRepository {
  constructor() {
    this.filePath = path.join(
      app.getPath('userData'),
      'printers.json'
    );
  }

  

  readAll() {
    if (!fs.existsSync(this.filePath)) {
      return [];
    }

    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error(
        'Failed to read printers.json',
        e
      );
      return [];
    }
  }

  getConfig(role) {
    return this.readAll().find(
      (p) => p.role === role
    );
  }

  saveConfig(config) {
    const all = this.readAll().filter(
      (p) => p.role !== config.role
    );

    all.push(config);

    fs.mkdirSync(path.dirname(this.filePath), {
  recursive: true,
});

    fs.writeFileSync(
      this.filePath,
      JSON.stringify(all, null, 2),
      'utf8'
    );
  }

 // =====================================================
  // SAVE ALL PRINTER SETTINGS AT ONCE
  // =====================================================
  saveAll(configs) {
    fs.mkdirSync(path.dirname(this.filePath), {
      recursive: true,
    });

    fs.writeFileSync(
      this.filePath,
      JSON.stringify(configs, null, 2),
      'utf8'
    );

    return configs;
  }


}




module.exports = {
  PrinterSettingsRepository,
};