import SettingsMigration from '../models/SettingsMigration';
import UserSettings from '../models/UserSettings';

const migrations = [
  {
    version: 1,
    description: 'Add accessibility settings',
    up: async () => {
      await UserSettings.updateMany(
        {},
        {
          $set: {
            'accessibility.highContrast': false,
            'accessibility.reducedMotion': false,
            'accessibility.fontSize': 'medium',
            'accessibility.screenReader': false,
          }
        }
      );
    }
  },
  {
    version: 2,
    description: 'Add keyboard shortcuts settings',
    up: async () => {
      await UserSettings.updateMany(
        {},
        {
          $set: {
            'keyboard.enabled': true,
            'keyboard.shortcuts': {},
          }
        }
      );
    }
  }
];

export const runMigrations = async () => {
  try {
    const lastMigration = await SettingsMigration.findOne().sort('-version');
    const currentVersion = lastMigration?.version || 0;

    const pendingMigrations = migrations.filter(m => m.version > currentVersion);
    
    for (const migration of pendingMigrations) {
      console.log(`Running migration ${migration.version}: ${migration.description}`);
      await migration.up();
      await SettingsMigration.create({
        version: migration.version,
        description: migration.description,
      });
    }

    console.log('Settings migrations completed successfully');
  } catch (error) {
    console.error('Failed to run settings migrations:', error);
    throw error;
  }
};