import cron from 'node-cron';
import { env } from '../lib/env.js';
import { syncWorkshopItems } from './syncWorkshop.js';
import { syncCollections } from './syncCollections.js';
import { monitorServers } from './monitorServers.js';

export function startSchedulers() {
  if (!env.cronEnabled) {
    console.log('Cron disabled');
    return;
  }

  // Run immediately on boot
  void syncWorkshopItems();
  void syncCollections();
  void monitorServers();

  cron.schedule('*/10 * * * *', () => {
    void syncWorkshopItems();
    void syncCollections();
  });

  cron.schedule('*/2 * * * *', () => {
    void monitorServers();
  });
}
